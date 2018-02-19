
$(document).ready(function onLoad(){
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
            socket.emit("msg send", event.target.innerText);
            event.target.innerHTML = "";
            $("#chat").scrollTop($("#chat>table").outerHeight());
            return false;
        }
    });
});

function addMessage(msg) {
    let table = $("#chat>table");
    let chat = $("#chat");
    let scroll = (chat[0].scrollHeight - chat.scrollTop() - chat.outerHeight()) <= 0;
    //table.append("<tr><td>" + msg.replace(/\n/g, "<br>") + "</td></tr>");
    table.append($("<tr>")
            .append($("<td>")
                .text(msg)
             )
          );
    if(scroll) {
        chat.scrollTop(table.outerHeight());
    }
}
