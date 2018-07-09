$(window).on("load", main);
$(window).resize(function() {
  $(window).trigger("window:resize:pre");
});

const CELLSIZE = 17;
const POPUP_SIZE = 3 * CELLSIZE;

let SmallestViewportUnit = "vh";

function main() {
  $(window).on("window:resize:pre", function (e) {
    SmallestViewportUnit = $("body").height() < $("body").width() ? 'vh' : 'vw';
    $(window).trigger("window:resize");
    document.getElementById("hideAll").style.display = "none";
  });

  // Disable image dragging
  $('img').on('dragstart', function(event) {
    event.preventDefault();
  });

  $(window).trigger("window:resize:pre");
}

function resizeGameboard() {
  let body = $("body");
  let unit = body.height() < body.width() ? 'vh' : 'vw';
  let size = (CELLSIZE * 3) + unit;
  let cellSize = CELLSIZE + unit;


  $(".popup").each(function(i, obj) {
    $(obj).width(size).height(size);
  });

  $(".popup-heading").css("font-size", 6 + unit);
}
