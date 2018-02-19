$(document).ready(function onLoadCliScript() {
    let nick = getCookie('nickname');
    $("#nickname").text(nick);
});


function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
