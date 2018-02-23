var chatUser;

function toggleRight() {
    console.log("Animating...");
    $("#right_content").animate({
        right: ($("#right_content").css("right").replace("px", "") === "0" ? "-100%" : "0")
    }, 1000, function() {
        setTimeout(function() {
            console.log("Animating....");
            $("#right_content").animate({
                right: ($("#right_content").css("right").replace("px", "") === "0" ? "-100%" : "0")
            },1000);
        }, 2000);
    });
}

$(document).ready(function onLoadCliScript() {

    let userID = getCookie('userid');
    chatUser = { 
        userid: userID,
        };

    $("#left_content img").click(function() {
            toggleRight();
        });
});


function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
