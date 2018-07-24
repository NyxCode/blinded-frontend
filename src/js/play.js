import $ from "jquery";
import "../html/play.html"
import "../style/style.css"
import "../style/play.css"
import {PopupSize, SmallestViewportUnit} from "./ui.js";

$(window).on("window:resize", () => {
    let size = PopupSize + SmallestViewportUnit;
    let fontSize = 5 + SmallestViewportUnit;
    $("#get-started").css("width", size).css("height", size);
    $("#singleplayer-btn").css("font-size", fontSize);
    $("#multiplayer-btn").css("font-size", fontSize);
});