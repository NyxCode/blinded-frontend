import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import {POPUP_SIZE, SmallestViewportUnit} from "./ui.js";
import "../css/style.css"
import "../css/join-game.css"
import "../html/join-game.html"

$(document).ready(() => $("confirm-button").click(() => {
    let id = $("#game-id-field").val();
    window.location.href = "game.html?mode=multiplayer&id=" + id;
}));

$(window).on("window:resize", () => {
    $("#multiplayer")
        .width(POPUP_SIZE + SmallestViewportUnit)
        .height(POPUP_SIZE + SmallestViewportUnit);
    $("#create-btn").css("font-size", 5 + SmallestViewportUnit);
    $("#join-btn").css("font-size", 5 + SmallestViewportUnit);
});