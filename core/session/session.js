/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 7/1/13
 * Time: 9:40 AM
 * To change this template use File | Settings | File Templates.
 */
/** @constructor
 *
 * @param info  Session information
 */
function session(info){
    this.info = {
        assistant_id: (info.assistant_id) ? info.assistant_id : '',
        customer_id: (info.customer_id) ? info.customer_id : '',
        license_customer_id: (info.license_customer_id) ? info.license_customer_id : '',
        source: (info.source) ? info.source : '',
        campaign: (info.campaign) ? info.campaign : '',
        start_time: new Date(),
        end_time: new Date()
    };
    this.chat = [];
};
/**
 * Update session information to database.
 * @param {function} cb Function will executed after Update process has done.
 */
session.prototype.updateInfo = function(cb){
    var query = "update session set ? where id = ?";
    db.executeQuery(query, [this.info, this.id], cb);
};
/**
 * Save session information to database
 * @param {function} cb Function will executed after Insert process has done.
 */
session.prototype.saveInfo = function(cb){
    var query = "insert into session set ?";
    db.executeQuery(query, this.info, cb);
};
/**
 * Add chat content to session.chat which contain conversation in session.
 * @param {json} chatContent Chat content.
 */
session.prototype.addChat = function(chatContent){
    chatContent.chatId = (this.chat.length +1).toString() + chatContent.name.replace(/\s/g, "");
    this.chat.push(chatContent);
};
/**
 * Edit chat
 * @param {string} chatId Id of chat content.
 * @param {sting} content Chat content.
 */
session.prototype.editChat = function(chatId, content){
    for(var i in this.chat){
        if(this.chat[i].chatId == chatId){
            this.chat[i].msg = content;
            this.chat[i].edit = 'edit-icon';
        }
    }
};
/**
 * Save conversation in session to database
 * @param {function} cb Function will executed after Insert process has done.
 */
session.prototype.saveChat = function(cb){
    var query = "insert into session_chatlog set ?";
    var info = {session_id: this.id, content: JSON.stringify(this.chat), crdate: new Date()};
    db.executeQuery(query, info, cb);
};
/** @constructor
 * Session management.
 */
function sessionMngt(){};
sessionMngt.prototype.list = {};
/**
 * Create and store new session.
 * @param {json} info Session information.
 * @param {json} geoip Customer geoip.
 */
sessionMngt.prototype.createSession = function(info, custId){
    var _this = this;
    //Get customer object.
    var cust = custMngt.getCustById(custId);
    var oper = operMngt.getLoById(info.assistant_id);
    if(typeof cust.custId == "undefined"){
        //Save customer information
        cust.saveCustInfo(function (err, result) {
            if (typeof result.insertId != "undefined") {
                cust.geoip.customer_id = result.insertId;
                cust.custId = result.insertId;
                //Save customer geoip.
                cust.saveGeoip(function (err, result) {
                    if (err)
                        console.log(err);
                });
                info.customer_id = result.insertId;
                var ss = new session(info);
                //Save session information.
                ss.saveInfo(function (err, result) {
                    if (typeof result.insertId != "undefined" && channelMngt.listChannels[info.assistant_id] != undefined) {
                        channelMngt.listChannels[oper.id.toString()].sessionId = result.insertId;
                        _this.list[result.insertId] = ss;
                        _this.list[result.insertId].id = result.insertId;

                        //Emit custAssign event to Customer and Operator.
                        socketio.io.sockets.sockets[cust.socketId].emit('message', {
                            sale: {saleName: oper.name, channelId: oper.id},
                            resource: {Name: '', streamName: oper.stream_name, streamUrl: chCfg.default_stream_url},
                            type: "custAssigned"
                        });
                        cust.channelId = oper.id;
                        socketio.io.sockets.sockets[oper.socketId].emit('message', {
                            type: "custAssigned",
                            cust: {id: cust.id, nick: cust.info.name, customer_id: cust.id}
                        });
                        socketio.io.sockets.in(oper.id.toString()).emit('message', {type: 'saveSession', success: true, sessionId: result.insertId, cust: cust });
                        custMngt.updateQueueToPublic();
                        socketio.io.sockets.in(channelNames[2]).emit('message', { type: 'updateListCust', listCust: custMngt.getCustsInPubic() });
                    }
                    else
                        console.log(textError.error6);
                });
            }
            else
                console.log(textError.error5);
        });
    }


};
module.exports = sessionMngt;



