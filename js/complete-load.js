let already_triggered = false;

$(window).on("window:resize", function(e) {
  if(already_triggered) {
    return;
  }
  already_triggered = true;
  document.getElementById("hideAll").style.display = "none";
  console.log("Page is completely loaded now!");
});
