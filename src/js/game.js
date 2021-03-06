import $ from "jquery";
import io from 'socket.io-client';
import MobileDetect from "mobile-detect";
import {PopupSize, CellSize, SmallestViewportUnit, BodyHeight, BodyWidth} from "./ui.js";
import "../style/style.sass"
import "../style/game.sass"
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
    let matrixSize = PopupSize + unit;
    let symbolSize = CellSize + unit;
    $('#ttt-matrix').width(matrixSize).height(matrixSize);
    //$('#your-turn').css("font-size", 3 + SmallestViewportUnit);
    //$('#your-turn > div').css("width", PopupSize + SmallestViewportUnit);
    $('.ttt-symbol').each(function (i, obj) {
        $(obj).css('width', symbolSize).css('height', symbolSize)
    });
    $("#invite-player-popup")
        .width(PopupSize + SmallestViewportUnit)
        .height(PopupSize + SmallestViewportUnit);
    $("#invite-id").css("font-size", 9 + SmallestViewportUnit);

    let descriptionSize = (BodyHeight / BodyWidth >= 1.7) ? 7.5 : 4.5;
    $("#invite-desc").css("font-size", descriptionSize + SmallestViewportUnit);
});

function createShareButton(gameID) {
    let onMobile = new MobileDetect(window.navigator.userAgent).mobile();
    console.log("mobile: ", onMobile);

    if (onMobile) {
        let target = encodeURIComponent("{{ links.base_url }}/{{ links.game }}?mode=multiplayer&id=" + gameID);
        let link = "https://wa.me/?text=" + encodeURI("Hey! Are you ready for a game? Try to beat me at ") + target;
        $("#invite-id").click(() => window.open(link));
    }
}

function main() {
    establishConnection((socket) => {
        logIntoGame(socket, (game, thisPlayerID, otherPlayerID) => {
            $("#ttt-matrix").css("display", "grid");
            updateNextTurn(game, thisPlayerID);

            socket.on("error", handleError);
            socket.on("enemy_turn", data => handleEnemyTurn(data, thisPlayerID, game));
            socket.on("disqualified", data => handleDisqualification(data, thisPlayerID, otherPlayerID));
            socket.on("game_completed", data => handleGameCompletion(data, thisPlayerID, otherPlayerID));

            forEachCell((x, y, cell) =>
                cell.cell.click(() => cellClicked(x, y, game, socket, thisPlayerID, otherPlayerID))
            );
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

function establishConnection(callback) {
    let socket = io("{{ links.socket_io_url }}");
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
                    window.location.replace("{{ links.multiplayer }}");
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
        }, createdGame => {
            if (createdGame.isError) {
                handleError(createdGame.description, true);
            } else {
                callback(createdGame, createdGame.player2, createdGame.player1);
            }
        });
    }

    let params = new URL(window.location.href).searchParams;
    let mode = params.get("mode");
    let gameID = params.get("id");

    switch (mode) {
        case "singleplayer":
            createWithBot(socket, callback);
            break;

        case "multiplayer":
            if (gameID) {
                join(socket, gameID, callback);
            } else {
                create(socket, callback);
            }
            break;

        default:
            handleError("The current URL is invalid", true);
            break;
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
function handleError(errorMessage, exit) {
    alert("An error occurred:\n" + errorMessage);
    if (exit) {
        window.location.replace("/");
    }
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
        window.location.href = "{{ links.result }}?result=" + result
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

        setTimeout(() => {
            if (gameRunning) {
                Cells[x][y].player = null;
            }
        }, 2000);
    });
}
