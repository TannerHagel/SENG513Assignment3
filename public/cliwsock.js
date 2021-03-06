var socket;

$(document).ready(function onLoadCliWSock(){
    socket = io({query: "userid=" + (chatUser ? chatUser.userid : '') });

    socket
        .on('connect', function socketConnect() {
            let ready = {
                get_self: false,
                get_online: false,
                get_history: false,
                get_rooms: false,
                min_time: false,
                check: function() {
                    for(let val in this) {
                        if(this[val] === false) return;
                    }
                    $("#splashscreen").fadeOut(200);
                }
            };
            setTimeout(function() { ready.min_time = true; ready.check();}, 900);
            socket.emit('get self', function eGetSelf(user) {
                updateSelf(user);
                ready.get_self = true;
                ready.check();
            });

            socket.emit("get rooms", function(rooms) {
                setRooms(rooms);
                ready.get_rooms = true;
                ready.check();
            });

            socket.emit("join room", null, joinRoomResponse);

            socket.emit("get online", function(online) {
                setOnlineUsers(online);
                ready.get_online = true;
                ready.check();
            });

            socket.emit("get history", function(history) {
                addChat(history);     
                ready.get_history = true;
                ready.check();
            });

        })
        .on('msg send', function eMsgSend(msg) {
            addMessage(msg);
        })
        .on('msg edit', function eMsgEdit(msg) {
            editMessage(msg);
        })
        .on('user join', function eUserJoin(user) {
            addOnlineUser(user);
        })
        .on('user leave', function eUserLeave(user) {
            removeOnlineUser(user);
        })
        .on('user update', function eUserUpdate(user) {
            updateUser(user);
        })
        .on('self update', function eSelfUpdate(user) {
            updateSelf(user);
        })
        .on('notice', function eNotice(msg) {
            addNotice("Notice:", "#FFEE00", msg); 
        })
        .on('alert', function eAlert(msg) {
            addNotice("System Alert:", "#FF0000", msg); 
        });


    $("#input_area")
        .keydown(function inputKeydown(event) {
            if(event.keyCode === 13) {
                if(!event.shiftKey) {
                    if($(this).val() === "") return false;
                    socket.emit("msg send", {msg: $(this).val(), msgid: generateMsgId(chatUser.userid) }, function(response) {
                        if(response) {
                            addMessage(response);
                        }
                    });
                    $(this).val("");
                    setInputHeight($(this));
                    $("#chat").scrollTop($("#chat>ul").outerHeight());
                    return false;
                }
            }
    })
        .bind("input propertychange", function() {
            setInputHeight($(this));
    });

});

function joinRoomResponse(response) {
    if(response) {
        $("#rooms>li").each(function() {
	    if($(this).text() == response) {
                $(this).css('font-weight', 'bold');
            } else {
                $(this).css('font-weight', 'normal');
            }
	});
        $("#chat>ul").empty();
        socket.emit("get online", function(online) {
            setOnlineUsers(online);
        });
        socket.emit("get history", function(history) {
            addChat(history);
        });
    }
}


function addChat(history) {
    if(history) {
        for(let msg of history) {
            addMessage(msg);
        }
    }
}

function setRooms(rooms) {
    $("#rooms").empty();
    for(let room of rooms) {
        $("#rooms").append($("<li>")
                    .text(room)
                    .click(function() {
                        socket.emit("join room", room, joinRoomResponse);
                    })
                );
    }
}

function updateSelf(user) {
    $("#nickname").text(user.nickname).css('color', user.nickcolor);
    chatUser.nickcolor = user.nickcolor;
    if(chatUser.nickname != user.nickname) {
        chatUser.nickname = user.nickname;
    }
    if(chatUser.userid != user.userid) {
        console.log("Changed userID!");
        document.cookie = "userid=" + user.userid;
        chatUser.userid = user.userid;
    }
}

function updateUser(user) {
    removeOnlineUser(user);
    addOnlineUser(user);
}

function setInputHeight(element) {
    element.height((element.val().split("\n").length) * (parseFloat(element.css("line-height").replace("px", ""))));
}

function addMessage(msg) {
    let chat = document.getElementById("chat");
    let scroll = (msg.userid == chatUser.userid) || (chat.scrollHeight - chat.scrollTop === chat.clientHeight);
    $("#chat>ul").append($("<li>")
            .attr("msgid", msg.msgid)
            .addClass("flexcontainer flexrow flexwrap" + (msg.userid == chatUser.userid ? " selfmsg" : ""))
            .append($("<p>").text(formatTime(msg.timestamp)))
            .append($("<p>").text(msg.nickname).css('color', msg.nickcolor))
            .append($("<p>").text(msg.msg))
         );
    if(scroll) {
        $("#chat").scrollTop(chat.scrollHeight);
    }
}

function addNotice(from, color, msg) {
    $("#chat>ul").append($("<li>")
            .addClass("flexcontainer flexrow flexwrap")
            .append($("<p>").text(formatTime(Date.now())))
            .append($("<p>").text(from).css('color', color))
            .append($("<p>").text(msg))
         );
    let chat = document.getElementById("chat");
    $("#chat").scrollTop(chat.scrollHeight);
}

function formatTime(timestamp) {
    let date = new Date(timestamp);
    return date.getHours() % 12 + ":" +
          (date.getMinutes() < 10 ? '0' : '' ) + date.getMinutes() + " " +
          (date.getHours() > 12 ? "PM" : "AM");
}

function editMessage(msg) {
    $("#chat li[msgid='" + msg.msgid + "'] p:last").text(msg.msg);
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
        if($(this).text().toLowerCase() > $(element).text().toLowerCase()) {
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
