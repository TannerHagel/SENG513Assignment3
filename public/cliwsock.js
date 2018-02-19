$(document).ready(function onLoadCliWSock(){
    var socket = io();

    socket
        .on('connect', function socketConnect() {
            console.log("Connected to server!");
        })
        .on('msg send', function eMsgSend(msg) {
            addMessage(msg);
        });

    $("#input_div").keydown(function inputKeydown(event) {
        if(event.keyCode === 13 && !event.shiftKey) {
            if(event.target.innerHTML === "") return false;
            socket.emit("msg send", {nickname: getCookie("nickname"), msg: event.target.innerText});
            event.target.innerHTML = "";
            $("#chat").scrollTop($("#chat>table").outerHeight());
            return false;
        }
    });
});

function addMessage(msg) {
    let list = $("#chat>ul");
    let chat = $("#chat");
    let scroll = (chat[0].scrollHeight - chat.scrollTop() - chat.outerHeight()) <= 0;
    let date = new Date(msg.timestamp);
    let timestring = date.getHours() % 12 + ":" +
                     (date.getMinutes() < 10 ? '0' : '' ) + date.getMinutes() + " " +
                     (date.getHours() > 12 ? "PM" : "AM");
    list.append($("<li>")
            .addClass("flexcontainer flexrow flexnowrap")
            .append($("<p>").text(timestring))
            .append($("<p>").text(msg.nickname))
            .append($("<p>").text(msg.msg))
         );
    if(scroll) {
        chat.scrollTop(list.outerHeight());
    }
}
