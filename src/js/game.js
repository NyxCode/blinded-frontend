import $ from "jquery";
import io from 'socket.io-client';
import MobileDetect from "mobile-detect";
import {POPUP_SIZE, CELLSIZE, SmallestViewportUnit, BodyHeight, BodyWidth} from "./ui.js";
import "../css/style.css"
import "../css/game.css"
import "../html/game.html"
import BlankImage from "../img/blank.gif";
import CircleAnimation from "../img/circle.gif";
import CircleImage from "../img/circle.png";
import CrossAnimation from "../img/cross.gif";
import CrossImage from "../img/cross.png";
import PencilSound1 from "../audio/pencil1.mp3"
import PencilSound2 from "../audio/pencil2.mp3"

class Player {
    constructor(symbol, animation, sound) {
        this.symbol = symbol;
        this.animation = animation;
        this.sound = sound;
    }
}

class Cell {
    constructor(x, y) {
        this.cell = $("#ttt-cell-" + y + "-" + x);
        this.image = $("#s-" + y + "-" + x);
        this.player = null;
    }

    get player() {
        return this._player;
    }

    playSoundEffect() {
        if (this.player != null && this.player.sound != null) {
            new Audio(this.player.sound).play();
        }
    }

    set player(player) {
        this._player = player;
        let image = this.image;
        if (player != null) {
            image.attr("src", player.animation);
            setTimeout(function () {
                image.attr("src", player.symbol);
            }, 500);
            this.playSoundEffect();
        } else {
            image.attr("src", BlankImage);
        }
    }
}

const Cells = [
    [new Cell(0, 0), new Cell(0, 1), new Cell(0, 2)],
    [new Cell(1, 0), new Cell(1, 1), new Cell(1, 2)],
    [new Cell(2, 0), new Cell(2, 1), new Cell(2, 2)]
];

const thisPlayer = new Player(CircleImage, CircleAnimation, PencilSound1); // #7986cb
const otherPlayer = new Player(CrossImage, CrossAnimation, PencilSound2); // #e57373

let gameRunning = true;

$(document).ready(main);

$(window).on("window:resize", () => {
    let unit = SmallestViewportUnit;
    let matrixSize = POPUP_SIZE + unit;
    let symbolSize = CELLSIZE + unit;
    $('#ttt-matrix').width(matrixSize).height(matrixSize);
    //$('#your-turn').css("font-size", 3 + SmallestViewportUnit);
    //$('#your-turn > div').css("width", POPUP_SIZE + SmallestViewportUnit);
    $('.ttt-symbol').each(function (i, obj) {
        $(obj).css('width', symbolSize).css('height', symbolSize)
    });
    $("#invite-player-popup")
        .width(POPUP_SIZE + SmallestViewportUnit)
        .height(POPUP_SIZE + SmallestViewportUnit);
    $("#invite-id").css("font-size", 9 + SmallestViewportUnit);
    $("#invite-desc").css("font-size", getDescSize() + SmallestViewportUnit);
});

function getDescSize() {
    let ratio = BodyHeight / BodyWidth;
    if (ratio >= 1.7) {
        return 7.5;
    } else {
        return 4.5;
    }
}

function createShareButton(gameID) {
    let onMobile = new MobileDetect(window.navigator.userAgent).mobile();
    console.log("mobile: ", onMobile);

    if (onMobile) {
        let link = encodeURIComponent("http://blinded.nyxcode.com/game.html?mode=multiplayer&id=" + gameID);
        let msg = "Hey! Are you ready for a game? Try to beat me at ";
        $("#invite-id").click(() => {
            window.open("https://wa.me/?text=" + encodeURI(msg) + link);
        });
    }
}

function main() {
    establishConnection("blinded.nyxcode.com", 9999, (socket) => {
        logIntoGame(socket, (game, thisPlayerID, otherPlayerID) => {
            $("#ttt-matrix").css("display", "grid");
            updateNextTurn(game, thisPlayerID);

            socket.on("error", handleError);
            socket.on("enemy_turn",
                (data) => handleEnemyTurn(data, thisPlayerID, game));
            socket.on("disqualified",
                (data) => handleDisqualification(data, thisPlayerID, otherPlayerID));
            socket.on("game_completed",
                (data) => handleGameCompletion(data, thisPlayerID, otherPlayerID));

            forEachCell((x, y, cell) => {
                cell.cell.click(() => cellClicked(
                    x, y, game, socket, thisPlayerID, otherPlayerID));
            });
        });
    });
}

function updateNextTurn(game, thisPlayerID) {
    if (game.nextTurn === thisPlayerID) {
        $("#your-turn > div").css("display", "block");
    } else {
        $("#your-turn > div").css("display", "none");
    }
}

function forEachCell(callback) {
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            callback(x, y, Cells[x][y]);
        }
    }
}

// Establishes a connection to host:port.
// callback(socket)
function establishConnection(host, port, callback) {
    let socket = io("http://" + host + ":" + port);
    socket.on("connect", () => callback(socket));
}

// Uses a open connection to join or create a game.
// callback(createdGameInfo, thisPlayerID, otherPlayerID)
function logIntoGame(socket, callback) {
    function create(socket, callback) {
        socket.emit("create_game", {}, (createdGame) => {
            console.log("Logged into game ", createdGame.id);
            $("#invite-player-popup").css("display", "initial");
            $("#invite-id").text(createdGame.id);
            createShareButton(createdGame.id);
            socket.on("player_joined", (playerJoined) => {
                if (playerJoined.gameID !== createdGame.id) {
                    console.warn("Player joined, but wrong game.");
                    return;
                }
                $("#invite-player-popup").css("display", "none");
                callback(createdGame, createdGame.player1, playerJoined.player);
            });
        });
    }

    function createWithBot(socket, callback) {
        socket.emit("create_game", {}, (createdGame) => {
            console.log("Logged into game ", createdGame.id);
            socket.emit("request_bot", {
                id: createdGame.id
            }, (botPlayer) => {
                if (botPlayer.gameID !== createdGame.id) {
                    handleError("No bot could join your game - please try it again later");
                    window.location.replace("/multiplayer.html");
                    return;
                }
                console.log("received bot: " + JSON.stringify(botPlayer));
                if (botPlayer.isError) {
                    handleError(botPlayer.description);
                } else {
                    callback(createdGame, createdGame.player1, botPlayer.player);
                }
            });
        });
    }

    function join(socket, gameID, callback) {
        socket.emit("join_game", {
            id: gameID
        }, (createdGame) => {
            console.log(JSON.stringify(createdGame));
            if (createdGame.isError) {
                handleError(createdGame.description);
                window.location.replace("/");
            } else {
                callback(createdGame, createdGame.player2, createdGame.player1);
            }
        });
    }

    let url = new URL(window.location.href);
    let mode = url.searchParams.get("mode");
    let gameID = url.searchParams.get("id");
    if (mode === "singleplayer") {
        createWithBot(socket, callback);
    } else if (gameID == null) {
        create(socket, callback);
    } else {
        join(socket, gameID, callback);
    }
}

// Handles a turn of the enemy player and sets nextTurn of the given game to
// the ID of the local player.
function handleEnemyTurn(turnData, thisPlayerID, game) {
    let cell = Cells[turnData.x][turnData.y];
    cell.player = otherPlayer;
    setTimeout(() => {
        cell.player = null;
        game.nextTurn = thisPlayerID;
        updateNextTurn(game, thisPlayerID);
    }, 2000);
}

// Handles a error
function handleError(errorMessage) {
    alert("An error occurred:\n" + errorMessage);
}

// Shows the full board and ends the game by redirecting to the result page.
function endGame(result, game, thisPlayerID, otherPlayerID) {
    let gameBoard = game.board;
    gameRunning = false;

    // Show the game board
    forEachCell((x, y, cell) => {
        cell.playSoundEffect = () => {
        };
        otherPlayer.sound = null;
        if (gameBoard[x][y] === thisPlayerID) {
            cell.player = thisPlayer;
        } else if (gameBoard[x][y] === otherPlayerID) {
            cell.player = otherPlayer;
        }
    });

    // Redirect to result page
    setTimeout(() => {
        window.location.href = "result.html?result=" + result
    }, 2500);
}

// Handles a disqualification of the local player
function handleDisqualification(disqualifiedData, thisPlayerID, otherPlayerID) {
    endGame("disqualified", disqualifiedData.game, thisPlayerID, otherPlayerID);
}

// Handles the end of the game
function handleGameCompletion(completionData, thisPlayerID, otherPlayerID) {
    let game = completionData.game;
    let winner = game.info.winner;
    if (winner === thisPlayerID) {
        endGame("won", game, thisPlayerID, otherPlayerID);
    } else if (winner === otherPlayerID) {
        endGame("lost", game, thisPlayerID, otherPlayerID);
    } else {
        endGame("draw", game, thisPlayerID, otherPlayerID);
    }
}

function cellClicked(x, y, game, socket, thisPlayerID, otherPlayerID) {
    if (game == null) {
        console.warn("Player cliked before game initialization!");
        return;
    } else if (game.nextTurn !== thisPlayerID || !gameRunning) {
        return;
    }

    let payload = {
        player: thisPlayerID,
        gameID: game.id,
        x: x,
        y: y
    };

    socket.emit("do_turn", payload, (doTurnData) => {
        if (doTurnData === undefined) {
            return;
        }

        if (doTurnData.isError) {
            handleError(doTurnData.description);
            return;
        }

        game.nextTurn = otherPlayerID;
        Cells[x][y].player = thisPlayer;

        updateNextTurn(game, thisPlayerID);

        setTimeout(function () {
            if (gameRunning) {
                Cells[x][y].player = null;
            }
        }, 2000);
    });
}
