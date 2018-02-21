var chatUser;

$(document).ready(function onLoadCliScript() {
    let userID = getCookie('userid');
    chatUser = { 
        userid: userID,
        };
});


function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
