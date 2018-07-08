$(window).on("load", main);

const CELLSIZE = 17;
const POPUP_SIZE = 3 * CELLSIZE;

let SmallestViewportUnit = "vh";

function main() {
  $(window).resize(function() {
    $(window).trigger("window:resize");
  });

  $(window).on("window:resize", function (e) {
    SmallestViewportUnit = $("body").height() < $("body").width() ? 'vh' : 'vw';
  })

  // Disable image dragging
  $('img').on('dragstart', function(event) {
    event.preventDefault();
  });

  $(window).trigger("window:resize");

  setInterval(function() {
    $(window).trigger("window:resize");
  }, 1000);
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
