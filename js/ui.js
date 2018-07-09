$(window).on("load", main);
$(window).resize(function () {
    $(window).trigger("window:resize:pre");
});

const CELLSIZE = 17;
const POPUP_SIZE = 3 * CELLSIZE;

let SmallestViewportUnit = "vh";

function main() {
    $(window).on("window:resize:pre", () => {
        let body = $("body");
        SmallestViewportUnit = body.height() < body.width() ? 'vh' : 'vw';
        $(window).trigger("window:resize");
        document.getElementById("hideAll").style.display = "none";
    });

    // Disable image dragging
    $('img').on('dragstart', function (event) {
        event.preventDefault();
    });

    $(window).trigger("window:resize:pre");
}
