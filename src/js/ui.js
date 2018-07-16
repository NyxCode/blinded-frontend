import $ from "jquery";
import "../css/style.css"

let POPUP_SIZE = 0;
let CELLSIZE = 0;
let BodyHeight = 0;
let BodyWidth = 0;
let SmallestViewportUnit = "vh";

export {POPUP_SIZE, CELLSIZE, BodyHeight, BodyWidth, SmallestViewportUnit};

$(window).on("load", main);

$(window).resize(function () {
    $(window).trigger("window:resize:pre");
});

function main() {
    $(window).on("window:resize:pre", () => {
        let body = $("body");
        BodyWidth = body.width();
        BodyHeight = body.height();
        POPUP_SIZE = getPopupSize(BodyWidth);
        CELLSIZE = POPUP_SIZE / 3;
        SmallestViewportUnit = BodyHeight < BodyWidth ? 'vh' : 'vw';
        console.log(SmallestViewportUnit);
        $(window).trigger("window:resize");
    });

    // Disable image dragging
    $('img').on('dragstart', function (event) {
        event.preventDefault();
    });

    $(window).trigger("window:resize:pre");
    document.getElementById("hideAll").style.display = "none";
}

function getPopupSize(width) {
    let minIn = 400;
    let maxIn = 800;
    let maxOut = 50;
    let minOut = 80;
    let value = Math.min(Math.max(width, minIn), maxIn);
    return (value - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
}