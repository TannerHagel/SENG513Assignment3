var chatUser;

$(document).ready(function onLoadCliScript() {
    let nick = getCookie('nickname');
    let userID = getCookie('userid');
    $("#nickname").text(nick);
    chatUser = { 
        nickname: nick,
        userid: userID,
        };
});


function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
