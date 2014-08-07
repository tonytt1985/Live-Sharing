/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 5/10/13
 * Time: 9:55 AM
 * To change this template use File | Settings | File Templates.
 */

var util = require('util');
/*
* Name: cust
* Description: customer object.
* Inherit users object.
* */
function cust(info, geoip, socketId, timestamp){
    this.info = info;
    this.geoip = geoip;
    this.socketId = socketId;
    this.destroyTime = 0;
    this.clientTime = timestamp;
    this.status = "connected";
};
cust.prototype.feedback = ['', '', '', '','vaa','lookingFor'];
cust.prototype.timeoutDestroy = function (cb) {
    var _this = this;
    _this.status = "disconnected";
    this.destroyTime = setInterval(function () {
        clearInterval(_this.destroyTime);
        console.log("clear customer information");
        cb(_this.id);
    }, chCfg.session_timeout);
};
cust.prototype.clearTimeoutDestroy = function () {
    clearInterval(this.destroyTime);
    this.status = "connected"
};
cust.prototype.saveFeedback = function(data){
    for(var i in this.feedback){
        if(data.feedback[this.feedback[i]] != undefined){
            var query = "insert into session_feedback set ?";
            var dt = {session_id:  data.sessionId, question_id: i+1, value: data.feedback[this.feedback[i]], crdate: new Date()};
            db.executeQuery(query, dt, function(){});
        }
    }
};
cust.prototype.saveCallback = function(dt){
    var query = "insert into callback_info set ?";
    db.executeQuery(query, dt, function(){});
};
/**
 * Save customer information to DB
 * @param {function} cb The function will be executed after the query has been done
 */
cust.prototype.saveCustInfo = function (cb) {
    var query = "insert into session_customer set ?"
    db.executeQuery(query, this.info, cb);
};
/**
 * Update customer information.
 * @param {function} cb The function will be executed after the query has been done
 */
cust.prototype.updateCustInfo = function (cb) {
    var query = "update session_customer set ? where id = ?";
    db.executeQuery(query, [this.info, this.custId], cb);
};
/**
 * Save Customer geoip to DB
 * @param {function} cb The function will be executed after the query has been done
 */
cust.prototype.saveGeoip = function(cb){
    var query = "insert into session_geoip set ?"
    db.executeQuery(query, this.geoip, cb);
};

/*
* Name: Custs
* Description: contain and manage all of customers.
*
* */
function custMngt(){
};
custMngt.prototype.list = [];
/* *
 *   Name: deleteCust
 *   Description: delete customer from customer list.
 *   Parameters:
 *       id: customer's id.
 *   Return:
 *       true or false
 * */
/* Delete customer in list.
 * @param id
 * */
custMngt.prototype.deleteCust = function(id){

    for(var i in this.list){
        if(id === this.list[i].id){
            this.list.splice(i, 1);

            return true;
        }
    }
    return false;
};
/* *
 *   Name: getCustById
 *   Description: get customer from list by id.
 *   Parameters:
 *       id: customer's id.
 *   Return:
 *       cust object.
 * */
custMngt.prototype.getCustById = function(id){
    for(var i in this.list){
        if(this.list[i].id === id)
            return this.list[i];
    }
    return null;
};
/* *
 *   Name: addCust
 *   Description: add customer to list.
 *   Parameters:
 *       name: customer's name.
 *       socketid: customer's socket id.
 *   Return:
 *       _id: customer's id
 * */
custMngt.prototype.addNewCust = function(info, geoip, socketid, timestamp){
    var infoCust = {
        name: (info.name)? info.name: '',
        email: (info.email) ? info.email : '',
        company: (info.company) ? info.company : '',
        job_title: (info.job_title) ? info.job_title : '',
        telephone: (info.telephone) ? info.telephone : '',
        country: (info.country) ? info.country : '',
        crdate: new Date().toString()
    };
    console.log(geoip);
    var gip = {
        license_customer_id: 0,
        customer_id: 0,
        hostname: (geoip.hostname)? geoip.hostname: '',
        ip: (geoip.ip) ? geoip.ip : '',
        city: (geoip.city) ? geoip.city : '',
        region: (geoip.region) ? geoip.region : '',
        postal_code: (geoip.postal_code) ? geoip.postal_code : '',
        country: (geoip.country_name) ? geoip.country_name : '',
        calling_code: (geoip.calling_code) ? geoip.calling_code : ''
    };
    var ct = new cust(infoCust, gip, socketid, timestamp);
    ct.id  = this.createIncidentId();
    this.list.push(ct);
    return ct;
};
/* *
 *   Name: createId
 *   Description: create customer's id.
 *   Parameters:
 *       none
 *   Return:
 *       id: customer's id
 * */
custMngt.prototype.createIncidentId = function(){
    var checkId = 0;
    var id;
    while(checkId == 0){
        id = Math.floor((Math.random() + 1)*99999999);
        if(this.list.length > 0){
            for(var i in this.list){
                if(id !== this.list[i].id)
                    checkId = 1;
                else
                    checkId = 0;
            }
        }
        else
            checkId = 1;
    }
    return id.toString();
};
/* *
 *   Name: getCustsInList
 *   Description: Get list customer object from list of id.
 *   Parameters:
 *       list: list of id
 *   Return:
 *       listUser: list of customer object.
 * */
custMngt.prototype.getCustsInList = function(list){
    var listUser = [];
    for(var i in list){
        for(var j in this.list){
            if(list[i] == this.list[j].id)
                listUser.push({id: this.list[j].id, name: this.list[j].name, socketId: this.list[j].socketId});
        }
    }
    return listUser;
}
/* *
 *   Name: getIdBySocketId
 *   Description: Get customer's id by socketId.
 *   Parameters:
 *       socketId: customer's socket's id.
 *   Return:
 *       id: customer's id.
 * */
custMngt.prototype.getIdBySocketId = function(socketId){
    for(var i in this.list){
        if(socketId === this.list[i].socketId)
            return this.list[i].id;
    }
    return -1;
};
/*
* Name: updateCustSocketId
* Description: update new socket id to customer
* Parameters:
*   id: customer's id
*   socketId: new socket id
* Returns:
*   true or false.
* */
custMngt.prototype.updateCustSocketId = function(id, socketId){
    for (var i in this.list) {

        if (this.list[i].id === id){
            this.list[i].socketId = socketId;
            return true;
        }
    }
    return false;
};
/**
 * Get customer socket id by customer id.
 * @param id {string} customer id
 * @returns {string} Customer socket id
 */
custMngt.prototype.getSocketIdById = function(id){
    for (var i in this.list) {
        if (this.list[i].id === id) {
            return this.list[i].socketId;
        }
    }
};
/**
 * Get Customer in public channel.
 * @returns {Array}
 */
custMngt.prototype.getCustsInPubic = function(){
    var tmp = [];
    for (var i in this.list){
        if(this.list[i].channelId == channelNames[1]){
            var dt = {
                channelId: this.list[i].channelId,
                id: this.list[i].id,
                status: this.list[i].status,
                clientTime: this.list[i].clientTime,
                socketId: this.list[i].socketId,
                geoip: this.list[i].geoip,
                info: this.list[i].info
            };
            tmp.push(dt);
        }
    }
    return tmp;
};
custMngt.prototype.updateQueueToPublic = function(){
    var list = this.getCustsInPubic();
    for(var i in list){
        if (list[i].channelId == channelNames[1] && socketio.io.sockets.sockets[list[i].socketId] != undefined){
            socketio.io.sockets.sockets[list[i].socketId].emit('message', {type: "queue", queue: parseInt(i)+ 1});
        }
    }
};
module.exports = custMngt;
