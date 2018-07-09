$(document).ready(main);

$(window).on("window:resize", () => {
    $("#message")
        .width(POPUP_SIZE + SmallestViewportUnit)
        .height(POPUP_SIZE + SmallestViewportUnit);
    $("#play-again-btn").css("font-size", 5 + SmallestViewportUnit);
    $("#result").css("font-size", getFontSize(Math.min(BodyWidth, BodyHeight)) + SmallestViewportUnit);
});

function main() {
    $("#result").append(getResult());
}

function getResult() {
    let url = new URL(window.location.href);

    switch (url.searchParams.get("result")) {
        case "won":
            return "Yay, you won!</br>Congratulations!";
        case "lost":
            return "Oups, you lost!</br>Don't give up!";
        case "disqualified":
            return "Sorry,</br>you are disqualified!";
        case "draw":
            return "Hm,</br>Nobody won this time!";
        default:
            return "Oups! Something went wrong!";
    }
}

function getFontSize(s) {
    let minIn = 330;
    let maxIn = 900;
    let maxOut = 4;
    let minOut = 6.5;
    let value = Math.min(Math.max(s, minIn), maxIn);
    return(value - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
}