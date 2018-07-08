$(document).ready(main);

let msg = getResult();

$(window).on("window:resize", function(e) {
  $("#message")
    .width(POPUP_SIZE + SmallestViewportUnit)
    .height(POPUP_SIZE + SmallestViewportUnit);
  $("#play-again-btn").css("font-size", 5 + SmallestViewportUnit);
  $("#result").css("font-size", msg.size + SmallestViewportUnit);
});

function main() {


  $("#result").append(msg.msg);
}

function getResult() {
  let url = new URL(window.location.href);

  switch (url.searchParams.get("result")) {
    case "won":
      return {
        msg: "Yay, you won!</br>Congratulations!",
        size: 5
      };
    case "lost":
      return {
        msg: "Oups, you lost!</br>Don't give up!",
        size: 5
      };
    case "disqualified":
      return {
        msg: "Sorry,</br>you are disqualified!",
        size: 4
      };
    case "draw":
      return {
        msg: "Hm,</br>Nobody won this time!",
        size: 4
      };
    default:
      return {
        msg: "Oups!</br>Something went wrong!",
        size: 4
      };
  };
}
