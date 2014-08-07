
/*
    Name: SocketIo
    Description: manage Connection and Channels.
    Private Properties:
        none.
    Public Properties:
        @io[object]: socket.io object.
        @listChannels[json]: list of session
*/
var util = require('util');
var chCfg = new require("./../config").Config("CHANNEL");
function socketIo(){
};
module.exports = socketIo;
socketIo.prototype.io = require('socket.io');
/*
* Name: globalConfig
* Description: configure socket.io object
* Parameters:
* Returns:
* */
socketIo.prototype.globalConfig = function(){
	this.io.set('match origin protocol', true);
	this.io.set('log level', 2);
	this.io.set('transports', ['websocket','xhr-polling','htmlfile','jsonp-polling']);
	this.io.set('heartbeat timeout', 30);
	this.io.set('heartbeat interval', 10);
	this.io.enable('browser public minification');  // send minified public
	this.io.enable('browser public etag');         // apply etag caching logic based on version number
  this.io.enable('browser public gzip');
};

socketIo.prototype.operListener = {
    engage: function(data){
        //Get socket id of customer by customer id.
        var custSocketId = custMngt.getSocketIdById(data.custId);
        if(socketio.io.sockets.sockets[custSocketId] != undefined){
            var cust = socketio.io.sockets.sockets[custSocketId].cust;
            //Customer leave Puclic channel
            socketio.io.sockets.sockets[custSocketId].leave(channelNames[1]);
            channelMngt.addToChannel(data.saleId, data.custId);
            //Customer join Private channel (data.saleId)
            socketio.io.sockets.sockets[custSocketId].join(data.saleId);
            //Create session and assign session id to channel.
            sessionMngt.createSession({assistant_id: data.saleId}, cust.id);

        }else{
            this.emit('message', {type: 'engageFail'});
        }
    },
    message: function(data){
        var sessionId = channelMngt.listChannels[data.channelId].sessionId;
        var user = {id: data.id, nick: data.nick, role: 'sale', timestamp: (new Date()).getTime()};
        switch(data.type){
            case 'msg':
                var msg = {user: user,type: data.type, textchat: data.text};
                if(sessionMngt.list[sessionId] != undefined)
                    sessionMngt.list[sessionId].addChat({name: data.nick, msg: data.text, timestamp: (new Date()).getTime(), role: 'sale'});
                socketio.io.sockets.in(data.channelId).emit('message', msg);
                break;
            case 'editMsg':
                var msg = {user: user,type: data.type, textchat: data.text};
                var edit = JSON.parse(data.text);
                if (sessionMngt.list[sessionId] != undefined)
                    sessionMngt.list[sessionId].editChat(edit.id, edit.text);
                socketio.io.sockets.in(data.channelId).emit('message', msg);
                break;
            case 'endSession':
                var _this = this;
                var dt = JSON.parse(data.text);
                if (dt.custId) {
                    var cust = custMngt.getCustById(dt.custId);
                    if(cust != null){
                        cust.channelId = channelNames[0];
                        channelMngt.listChannels[data.channelId].removeUserId(data.custId);
                        if (socketio.io.sockets.sockets[cust.socketId] != undefined) {
                            socketio.io.sockets.sockets[cust.socketId].leave(data.channelId);
                            socketio.io.sockets.sockets[cust.socketId].emit('message', {type: 'endSession'});
                        }
                    }
                    var clientsInRoom = socketio.io.sockets.clients(data.channelId);
                    if(clientsInRoom.length > 1){
                        for(var i in clientsInRoom){
                            if(clientsInRoom[i].id != _this.id)
                                socketio.io.sockets.sockets[clientsInRoom[i].id].leave(data.channelId);
                        }
                    }
                    var sessionId = channelMngt.listChannels[data.channelId].sessionId;
                    sessionMngt.list[sessionId].saveChat(function(err, result){
                        if(err)
                            console.log(err);
                        else{
                            sessionMngt.list[sessionId].info.end_time = new Date();
                            sessionMngt.list[sessionId].updateInfo(function(err, result){
                                if (err)
                                    console.log(err);
                                else {
                                    var msg = {user: {id: cust.id, role: 'cus'}, type: 'quit', textchat: data.text};
                                    _this.emit('message', msg);
                                }
                            });
                        }
                    });
                }
                break;
            default:
                var msg = {user: user, type: data.type, textchat: data.text};
                this.broadcast.to(data.channelId).emit('message', msg);
                break;
        }
    },
    saveSession: function(data){
        var _this = this;
        var cust = custMngt.getCustById(data.custId);
        util._extend(cust.info, data.custInfo);
        cust.updateCustInfo(function(err, result){
            if(err)
                console.log(err);
            else
                _this.emit('message', {type: 'updateSession'});
        });
    },
    disconnect: function(data){
        var _this = this;
        var oper = operMngt.getLoById(this.oper.id);
        console.log(socketio.io.sockets.clients(this.oper.id).length);
        if(data == 'heartbeat timeout'){
            if(oper != null){
                _this.broadcast.to(oper.id).emit('message', {type: 'operDisconnected'});
                oper.timeoutDestroy(function (id) {
                    operMngt.operDisconnected(id);
                });
            }
        }
        else{
            if (oper != null){
               oper.sortTimeoutDestroy(function(id){
                   operMngt.operDisconnected(oper.id);
               });
            }
        }
    }
};

socketIo.prototype.custListener = {
    message: function (data) {
        var sessionId = channelMngt.listChannels[data.channelId].sessionId;
        var user = {id: data.id, nick: data.nick, role: 'cus', timestamp: (new Date()).getTime()};
        switch (data.type) {
            case 'msg':
                var msg = {user: user,type: data.type, textchat: data.text};
                if(sessionMngt.list[sessionId] != undefined)
                    sessionMngt.list[sessionId].addChat({name: data.nick, msg: data.text, timestamp: (new Date()).getTime(), role: 'cus'});
                socketio.io.sockets.in(data.channelId).emit('message', msg);
                break;
            case 'editMsg':
                var msg = {user: user,type: data.type, textchat: data.text};
                var edit = JSON.parse(data.text);
                if (sessionMngt.list[sessionId] != undefined)
                    sessionMngt.list[sessionId].editChat(edit.id, edit.text);
                socketio.io.sockets.in(data.channelId).emit('message', msg);
                break;
            case 'custInfoTracking':
                var custInfo = JSON.parse(data.text);
                custInfo.geoipInfo = this.cust.geoip;
                var msg = {user: user, type: data.type, textchat: JSON.stringify(custInfo)};
                socketio.io.sockets.sockets[operMngt.getLoById(data.channelId).socketId].emit('message', msg);
                break;
            default:
                var msg = {user: user, type: data.type, textchat: data.text};
                this.broadcast.to(data.channelId).emit('message', msg);
                break;
        }
    },
    feedback: function(data){
        this.cust.saveFeedback(data)
    },
    callbackInfo: function(data){
        this.cust.saveCallback(data.callbackInfo);
        this.leave(channelNames[1]);
        this.join(channelNames[0]);
        this.cust.channelId = channelNames[0];
        socketio.io.sockets.in(channelNames[2]).emit('message', { type: 'updateListCust', listCust: custMngt.getCustsInPubic() });
    },
    disconnect: function (data) {
        //type of disconnect : 'booted', 'socket end', heart beat timeout
        /*
        * [socket end]
        * In public channel:
        *   + Update customer status
        *   + Update customer status to all of Operator
        *   +
        *   note: Browser will clear cookies if close browser.
        * */
        this.cust.timeoutDestroy(function (id) {
            var cust = custMngt.getCustById(id);
            if(cust!= null){
                if(cust.channelId == channelNames[1]){
                    custMngt.deleteCust(id);
                    socketio.io.sockets.in(channelNames[2]).emit('message', { type: 'updateListCust', listCust: custMngt.getCustsInPubic() });
                    custMngt.updateQueueToPublic();
                }
                else{
                    var oper = operMngt.getLoById(cust.channelId);
                    if(oper != null)
                        socketio.io.sockets.sockets[oper.socketId].emit('message', {type: 'custQuit'});
                    cust.channelId = channelNames[0];
                }
            }
        });
        if (this.cust.channelId != channelNames[1]) {
            this.broadcast.to(this.cust.channelId).emit('message', {type: 'userDisconnected', textchat: data});
        } else {
            var listCust = custMngt.getCustsInPubic();
            socketio.io.sockets.in(channelNames[2]).emit('message', { type: 'updateListCust', listCust: listCust });
        }
    }
}


