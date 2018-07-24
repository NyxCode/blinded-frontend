import $ from "jquery";
import {PopupSize, SmallestViewportUnit} from "./ui.js";
import "../css/style.css"
import "../css/join-game.css"
import "../html/join-game.html"

$(document).ready(() => $("#confirm-button").click(() => {
    let id = $("#game-id-field").val();
    window.location.href = "{{ links.game }}?mode=multiplayer&id=" + id;
}));

$(window).on("window:resize", () => {
    let size = PopupSize + SmallestViewportUnit;
    $("#multiplayer").css("width", size).css("height", size);
    $("#create-btn").css("font-size", 5 + SmallestViewportUnit);
    $("#join-btn").css("font-size", 5 + SmallestViewportUnit);
});