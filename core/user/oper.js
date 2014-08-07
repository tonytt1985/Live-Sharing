/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 5/10/13
 * Time: 9:59 AM
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');
/*
 * Name: lo
 * Description: live operator object.
 * Inherit users object.
 * */
function oper(info, socketId){
   util._extend(this, info);
    this.socketId = socketId;
    this.loginTime = new Date();
    this.destroyTime = 0;
    this.status = "connected";
    this.sortDestroyTime = 0;
    this.sortDestroyTimeout = 15000;
};
oper.prototype.timeoutDestroy = function (cb) {
    var _this = this;
    _this.status = "disconnected";
    this.destroyTime = setInterval(function () {
        clearInterval(_this.destroyTime);
        console.log("clear operator information");
        cb(_this.id);
    }, chCfg.session_timeout);
};
oper.prototype.sortTimeoutDestroy = function (cb) {
    var _this = this;
    _this.status = "disconnected";
    this.sortDestroyTime = setInterval(function () {
        clearInterval(_this.sortDestroyTime);
        console.log("clear operator information");
        cb(_this.id);
    }, this.sortDestroyTimeout);
};
oper.prototype.clearSortTimeoutDestroy = function () {
    clearInterval(this.sortDestroyTime);
    this.status = "connected";
};
oper.prototype.clearTimeoutDestroy = function () {
    clearInterval(this.destroyTime);
    this.status = "connected";
};
oper.prototype.updateLogoutTime = function () {
};
/*
 * Name: los
 * Description: contain and manage all of live operator.
 * */
function operMngt(){
};
operMngt.prototype.list = [];
/* *
 *   Name: auth
 *   Description: auth username and password
 *   Parameters:
 *      username: lo's username
 *      password: lo's password
 *   Return:
 *       lo's id
 * */
operMngt.prototype.auth = function(username, password, cb){
    var _this = this;
    db.executeQuery("SELECT * FROM assistant WHERE username=? AND password=? AND role='sale' AND deleted=0", [username, password], cb);
};
/* *
 *   Name: addLo
 *   Description: Create and add new live operator to list.
 *   Parameters:
 *      username: lo's username
 *      password: lo's password
 *   Return:
 *       lo's id
 * */
operMngt.prototype.addOper = function(info, socketId){
    try{
        var newLo = new oper(info, socketId);
        this.list.push(newLo);
    }catch(err){
        console.log(err);
    }
};
/* *
 *   Name: getLoById
 *   Description: get live operator from list by id.
 *   Parameters:
 *       id: lo's id.
 *   Return:
 *       lo object.
 * */
operMngt.prototype.getLoById = function(id){
    var list = this.list;
    for(var i in list){
        if(this.list[i].id == id)
            return this.list[i];
    }
    return null;
};
/* *
 *   Name: getIdBySocketId
 *   Description: Get lo's id by socketId.
 *   Parameters:
 *       socketId: socket id.
 *   Return:
 *       id: lo's id.
 * */
operMngt.prototype.getIdBySocketId = function(socketId){
    for(var i in this.list){
        if(this.list[i].socketId === socketId)
            return this.list[i].id;
    }
    return null;
};
/*
 * Name: checkIdInList
 * Description: check that id has been in list or not.
 * Parameter:
 *   id: lo's id
 * returns:
 *   true or false
 * */
operMngt.prototype.checkIdInList = function(id){
    var list = this.list;
    for(var i in this.list){
        if(id === this.list[i].id)
            return true;
    }
    return false;
}
/* *
 *   Name: deleteLo
 *   Description: delete live operator from customer list.
 *   Parameters:
 *       id: live operator's id.
 *   Return:
 *       true: successful
 *       false: failure
 * */
operMngt.prototype.deleteOper = function(id){
    for(var i in this.list){
        if(id === this.list[i].id){
            this.list.splice(i, 1);
            return true;
        }
    }
    return false;
};
operMngt.prototype.operDisconnected = function (id){
    var _this = this;
    var listCustId = channelMngt.listChannels[id].getListUserIds();
    var sessionId = channelMngt.listChannels[id].sessionId;
    if (listCustId.length > 0) {
        for (var i in listCustId) {
            var cust = custMngt.getCustById(listCustId[i]);
            cust.channelId = channelNames[0];
            if (socketio.io.sockets.sockets[cust.socketId] != undefined) {
                socketio.io.sockets.sockets[cust.socketId].leave(id);
                socketio.io.sockets.sockets[cust.socketId].join(channelNames[0]);
                socketio.io.sockets.sockets[cust.socketId].emit('message', {type: 'endSession'});
            }
        }
    }
    if (typeof sessionId != 'undefined') {
        sessionMngt.list[sessionId].saveChat(function (err, result) {
            if (err)
                console.log(err);
            else {
                sessionMngt.list[sessionId].info.end_time = new Date();
                sessionMngt.list[sessionId].updateInfo(function (err, result) {
                    if (err)
                        console.log(err);
                    else {
                        if (_this.deleteOper(id)) {
                            delete sessionMngt.list[sessionId];
                            delete channelMngt.listChannels[id];
                        }
                    }
                });
            }
        });
    }
    else {
        if (_this.deleteOper(id)) {
            delete sessionMngt.list[sessionId];
            delete channelMngt.listChannels[id];
        }
    }
};
module.exports = operMngt;
