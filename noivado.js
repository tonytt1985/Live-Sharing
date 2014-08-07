//Require js and url module
var fs = require('fs');
var util = require('util');
//Declare lang.
var lang = require("./core/lang/default.js");
global.ntf = lang.ntf;
global.textError = lang.error;

//Declare database handler
global.db = new (require("./core/db_handler.js"))();

//Declare handler.
var handler = require("./core/connection/handler.js").handler;

//Declare custs
global.custMngt = new (require("./core/user/cust.js"))();
global.operMngt = new (require("./core/user/oper.js"))();
global.channelMngt = new (require("./core/session/channel.js"))();
global.sessionMngt = new (require("./core/session/session.js"))();

var svCfg = require("./core/config").Config("SERVER"),
    debugCfg = new require("./core/config").Config("DEBUG");
global.chCfg = new require("./core/config").Config("CHANNEL");
//SSL option.
var options = {
  key: fs.readFileSync('./static/key.pem'),
  cert: fs.readFileSync('./static/cert.pem')
};

//Create server.
var servlet = new (require('./core/connection/static-servlet.js'))();
var http = new (require('./core/connection/server.js'))({'GET': servlet.handleRequest.bind(servlet), 'HEAD': servlet.handleRequest.bind(servlet)});
var https = new (require('./core/connection/server.js'))({'GET': servlet.handleRequest.bind(servlet), 'HEAD': servlet.handleRequest.bind(servlet)}, options);

// Create socketio object.
global.socketio = new (require('./core/connection/socket-io.js'))();
//Socket io listen server.
//Server start
https.start(443);
http.start(80);
http.server.setMaxListeners(0);
https.server.setMaxListeners(0);
socketio.io = socketio.io.listen(https.server) ;
socketio.io.setMaxListeners(0);

//Configure socket.io
socketio.globalConfig();
var appFunc = {};
//Declare global session
global.channelNames = ['-1', '-2', '-3'];
//Create lobby session which contain all of users access web app.
channelMngt.createChannel("public", channelNames[0]);
//Create public session which contain all of customer after they have logged in.
channelMngt.createChannel("lobby", channelNames[1]);
//Create lo session which contain all of live operator after they have logged in.
channelMngt.createChannel("operChannel", channelNames[2]);
var geoip = require('geoip');

var city = new geoip.City('./static/GeoLiteCity.dat');
socketio.io.sockets.on('connection', function(socket){
	socket.join(channelNames[0]);
    //Detect Operator online to send "sale status" to client.
    var countOper  = socketio.io.sockets.clients(channelNames[2]).length;
    if(countOper > 0){
        socket.emit('message',{type: "saleStatus", saleStatus: ntf.ntf2});
    }else{
        socket.emit('message',{type: "saleStatus", saleStatus: ntf.ntf3});
    }
    socket.on('adminLogin', function(data){
        operMngt.auth(data.nick, data.password, function (error, results) {
            if (!error) {
                if (results.length > 0) {
                    if (!operMngt.checkIdInList(results[0].id)){
                        operMngt.addOper(results[0], socket.id);
                        socket.leave(channelNames[0]);
                        socket.join(channelNames[2]);
                        socket.oper = results[0];
                        channelMngt.createChannel(results[0].name, results[0].id);
                        socket.join(results[0].id);
                        //Get list customers (later)
                        socketio.io.sockets.in(channelNames[0]).emit('message', {type: "saleStatus", saleStatus: ntf.ntf2});
                        socket.emit('login',{
                            sale: {id: results[0].id, nick: results[0].username, nickname: results[0].name, role: results[0].role, timestamp: new Date().getTime()},
                            channel: {id: results[0].id, name: results[0].name},
                            resource: {stream: results[0].stream_name, streamUrl: chCfg.default_stream_url}
                        });
                        socket.emit('message', { type: 'listCust', listCust: custMngt.getCustsInPubic() });
                        util._extend(socket._events, socketio.operListener);
                    }
                    else{
                        socket.emit("login", {error: textError.error2});
                        console.log({error: textError.error2});
                    }

                } else{
                    socket.emit("login", {error: textError.error1});
                    console.log({error: textError.error1});
                }
            }
            else{
                socket.emit("login", {error: textError.error3});
                console.log(error);
            }
        });
    });
    socket.on('customerLogin', function(data){

        var ip = city.lookupSync(socket.handshake.address.address);
        if(ip != null)
            ip.ip = socket.handshake.address.address;
        var cust = custMngt.addNewCust({name: data.nick, country: (ip != null)? ip.country_name: ''}, (ip != null)?ip:{}, socket.id, data.timestamp);
        cust.channelId = channelNames[1];
        socket.cust = cust;
        socket.leave(channelNames[0]);
        socket.join(channelNames[1]);
        socket.emit('login', { customer: { id: cust.id, nick: cust.info.name, role: 'cus', timestamp: cust.info.crdate, queue: socketio.io.sockets.clients(channelNames[1]).length},
            channel: { id: channelNames[1], name: channelMngt.listChannels[channelNames[1]].getName() }, resource: { streamName: chCfg.default_stream_name, streamUrl: chCfg.default_stream_url}});
        socketio.io.sockets.in(channelNames[2]).emit('message', { type: 'updateListCust', listCust: custMngt.getCustsInPubic() });
        util._extend(socket._events, socketio.custListener);
    });
    socket.on('custReconnect', function(data){
        var cust = custMngt.getCustById(data.custId);
        if(cust !== null){
            var oldSocketId = cust.socketId;
            cust.socketId = socket.id;
            cust.status = "connected";
            cust.clearTimeoutDestroy();
            if (cust.channelId != channelNames[0]) {
                socket.leave(channelNames[0]);
                socket.join(data.channelId);
                socket.cust = cust;
                util._extend(socket._events, socketio.custListener);
                if (cust.channelId != channelNames[1]) {
                    var chatContent = sessionMngt.list[channelMngt.listChannels[data.channelId].sessionId].chat;
                    socket.emit('custReconnect', {chatStore: chatContent});
                    socket.broadcast.to(data.channelId).emit('message', {type: 'userReconnected'});
                } else {
                    socket.emit('custReconnect', {});
                    var list = custMngt.getCustsInPubic();
                    socketio.io.sockets.in(channelNames[2]).emit('message', { type: 'updateListCust', listCust: list });
                }
            } else {
                console.log(textError.error7 + data.custId);
                socket.emit('custReconnectFail', {});
            }

        }else{
            console.log(textError.error7 + data.custId);
            socket.emit('custReconnectFail', {});
        }
        //Detect that Oper end session or not yet.
        //
    });
    socket.on('operReconnect', function(data){
        var oper = operMngt.getLoById(data.operId);
        if(oper != null){
            var oldSocketId = oper.socketId;
            if(socketio.io.sockets.sockets[oldSocketId] != undefined){
                socketio.io.sockets.sockets[oldSocketId].leave(channelNames[2]);
                socketio.io.sockets.sockets[oldSocketId].leave(data.operId);
                socketio.io.sockets.sockets[oldSocketId].oper = {};
            }
            oper.socketId = socket.id;
            oper.clearTimeoutDestroy();
            oper.clearSortTimeoutDestroy();
            socket.leave(channelNames[0]);
            socket.oper = oper;
            socket.join(channelNames[2]);
            socket.join(socket.oper.id);
            util._extend(socket._events, socketio.operListener);
            socket.broadcast.to(socket.oper.id).emit('message', {type: 'operReconnected'});
        }
        else
            console.log(textError.error8);
    });
    socket.on('callbackInfoGuest', function (data) {
        var query = "insert into callback_info set ?";
        db.executeQuery(query, data, function () {
        });
    });
});
