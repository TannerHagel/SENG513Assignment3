function room_manager() {
    let ret = {};

    let messages = [];

    let users = {};

    ret.addMsg = function roomMgrAddMsg(msg) {
        messages.push(msg);
        if(messages.length > 200) {
            messages.shift();
        }
    };

    ret.getMessages = function roomMgrGetMsg() {
        return messages;
    };

    ret.join = function roomMgrJoin(user) {
        if(users[user.userid]) return false;
        users[user.userid] = user;
        return true;
    };

    ret.leave = function roomMgrLeave(user) {
        delete users[user.userid];
    };

    ret.online = function roomMgrOnline() {
        let ret = [];
        let pos = 0;
        for(let user of Object.values(users)) {
            ret[pos++] = getOutboundUser(user);
        }
        return ret;
    };

    return ret;

}

function getOutboundUser(userVals) {
    return {nickname:userVals.nickname, userid:userVals.userid, nickcolor:userVals.nickcolor};
}


module.exports = (function() {
    let initialKeys = [];
    let ret = {};

    ret.newMgr = room_manager;
    
    ret.rooms = function roomMgrRooms() {
            return Object.keys(this).filter(function(val) {
                return !(initialKeys.includes(val));
            });
    };

    ret.exists = function roomMgrExists(room) {
            for(let key of ret.rooms()) {
                if(room.toLowerCase() === key.toLowerCase())
                    return key;
            }
            return false;
    };

    ret.makeRoom = function roomMgrMakeRoom(room) {
            if(ret.exists(room)) return false;
            ret[room] = ret.newMgr();
            return room;
    };

    initialKeys = Object.keys(ret);
    return ret;
})();
