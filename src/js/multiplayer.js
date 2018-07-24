import $ from "jquery";
import {PopupSize, SmallestViewportUnit} from "./ui.js";
import "../css/style.css"
import "../css/multiplayer.css"
import "../html/multiplayer.html"

$(window).on("window:resize", () => {
    let size = PopupSize + SmallestViewportUnit;
    $("#multiplayer").css("width", size).css("height", size);
    $("#create-btn").css("font-size", 5 + SmallestViewportUnit);
    $("#join-btn").css("font-size", 5 + SmallestViewportUnit);
});