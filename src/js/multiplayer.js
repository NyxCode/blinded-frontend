import $ from "jquery";
import {PopupSize, SmallestViewportUnit} from "./ui.js";
import "../style/style.sass"
import "../style/multiplayer.sass"
import "../html/multiplayer.html"

$(window).on("window:resize", () => {
    let size = PopupSize + SmallestViewportUnit;
    $("#multiplayer").css("width", size).css("height", size);
    $("#create-btn").css("font-size", 5 + SmallestViewportUnit);
    $("#join-btn").css("font-size", 5 + SmallestViewportUnit);
});