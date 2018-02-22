function room_manager() {
    let ret = {};

    let messages = [];

    ret.addMsg = function roomMgrAddMsg(msg) {
        messages.push(msg);
        if(messages.length > 200) {
            messages.shift();
        }
    };

    ret.getMessages = function rmmMgrGetMsg() {
        return messages;
    };

    return ret;

}

module.exports = {
    newMgr:room_manager
}
