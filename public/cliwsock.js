$(document).ready(function onLoadCliWSock(){
    var socket = io({query: "userid=" + chatUser.userid });

    socket
        .on('connect', function socketConnect() {
            socket.emit('get self', function eGetSelf(user) {
                $("#nickname").text(user.nickname);
                chatUser.nickname = user.nickname;
                if(chatUser.userid != user.userid) {
                    console.log("Changed userID!");
                    document.cookie = "userid=" + user.userid;
                    chatUser.userid = user.userid;
                }
            });

            socket.emit("get online", function(online) {
                console.log("Online users: ", online);
                setOnlineUsers(online);
            });
        })
        .on('msg send', function eMsgSend(msg) {
            addMessage(msg);
        })
        .on('msg edit', function eMsgEdit(msg) {
            console.log("Editing message:",msg);
            editMessage(msg);
        })
        .on('user join', function eUserJoin(user) {
            console.log("User joined: " + user.nickname);
            addOnlineUser(user);
        })
        .on('user leave', function eUserLeave(user) {
            console.log("User left: " + user.nickname);
            removeOnlineUser(user);
        });




    $("#input_div").keydown(function inputKeydown(event) {
        if(event.keyCode === 13 && !event.shiftKey) {
            if(event.target.innerHTML === "") return false;
            socket.emit("msg send", {msg: event.target.innerText, msgid: generateMsgId(chatUser.userid) }, function(response) {
                addMessage(response);
            });
            event.target.innerHTML = "";
            $("#chat").scrollTop($("#chat>ul").outerHeight());
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
            .attr("msgid", msg.msgid)
            .addClass("flexcontainer flexrow flexnowrap" + (msg.userid == chatUser.userid ? " selfmsg" : ""))
            .append($("<p>").text(timestring))
            .append($("<p>").text(msg.nickname).css('color', msg.nickcolor))
            .append($("<p>").text(msg.msg))
         );
    if(scroll) {
        chat.scrollTop(list.outerHeight());
    }
}

function editMessage(msg) {
    $("li[msgid='" + msg.msgid + "'] p:last").text(msg.msg);
}

function setOnlineUsers(users) {
    let list = $("#right_content>ol");
    list.empty();
    for(user of users) {
        addOnlineUser(user);
    }
}

function addOnlineUser(user) {
    if($("li[userid='" + user.userid + "']").length > 0) return;
    let list = $("#right_content>ol");
    let element = ($("<li>")
               .attr("userid", user.userid)
               .text(user.nickname)
           );
    let added = false;
    list.children().each(function() {
        if($(this).text() > $(element).text()) {
            $(this).before($(element));
            $("li[userid='" + user.userid + "']").css("color", user.nickcolor);
            added = true;
            return false;
        }
    });

    if(!added) {
        list.append($(element));
        $("li[userid='" + user.userid + "']").css("color", user.nickcolor);
    }
}

function removeOnlineUser(user) {
    $("li[userid='" + user.userid + "']").remove();
}
