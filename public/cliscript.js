var chatUser;

function toggleRight() {
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

function toggleMenu() {
    //$("#rooms").animate({
    //    display: ($("#rooms").css("display") === "none" ? "block" : "none")
    //}, 500);
    $("#rooms").toggle();
}

$(document).ready(function onLoadCliScript() {

    let userID = getCookie('userid');
    chatUser = { 
        userid: userID,
        };

    $("#mobile_online_icon").click(function() {
        toggleRight();
    });

    $("#mobile_menu_icon").click(function() {
        toggleMenu();
    });
});


function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}
