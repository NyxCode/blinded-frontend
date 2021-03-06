import $ from "jquery";
import io from 'socket.io-client';
import "./ui.js";
import "../style/style.sass"
import "../style/index.sass"
import "../html/index.html"

$(document).ready(() => {
    let socket = io("{{ links.socket_io_url }}");
    socket.on("connect", () => {
        socket.emit("request-statistics", {}, statistics => {
            console.log("Loaded statistics:", statistics);
            $("#statistics-playing-now").text(statistics.runningGames);
            $("#statistics-played-today").text(statistics.gamesToday);
            setTimeout(() => socket.disconnect(), 1000);
        })
    });
});
