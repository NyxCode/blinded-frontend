import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import {POPUP_SIZE, SmallestViewportUnit} from "./ui.js";
import "../css/style.css"
import "../css/multiplayer.css"
import "../html/multiplayer.html"

$(window).on("window:resize", () => {
    $("#multiplayer")
        .width(POPUP_SIZE + SmallestViewportUnit)
        .height(POPUP_SIZE + SmallestViewportUnit);
    $("#create-btn").css("font-size", 5 + SmallestViewportUnit);
    $("#join-btn").css("font-size", 5 + SmallestViewportUnit);
});