/*
    Description: Contain and manage all of user in channel.
    Private Properties:
        @_listUserIds[array]: contain all of user's id in channel.
        @_maxUsers[int]: maximum user can be in channel.
        @_id[string]: channel's id.
        @_name[string]: channel's name.
    Public Static Properties:
        @listChannels[json]: contain all of channels.
        @chat[array]: contain chat content of channel
 */

function channel(name, id){
    this._id = id;
    this._name = name;
    this._listUserIds = [];
};
channel.prototype._maxUsers = 1000;
/* *
*   Name: getListUserIds
*   Description: return an array contain list users's id.
*   Parameters:
*       none.
*   Return:
*       _listUserIds.
* */
channel.prototype.getListUserIds = function(){
    return this._listUserIds;
};
/* *
 *   Name: setMaxUsers
 *   Description: set maximum users number in session.
 *   Parameters:
 *       num: maximum users number.
 *   Return:
 *       this.
 * */
channel.prototype.setMaxUsers = function(num){
    this._maxUsers = num;
    return this;
};
/* *
 *   Name: getMaxUsers
 *   Description: Get maximum users number in session.
 *   Parameters:
 *       none.
 *   Return:
 *       _maxUsers.
 * */
channel.prototype.getMaxUsers = function(){
    return this._maxUsers;
}
/* *
 *   Name: setId
 *   Description: set session's id.
 *   Parameters:
 *       id: session's id.
 *   Return:
 *       this.
 * */
channel.prototype.setId = function(id){
    this._id = id;
    return this;
};
/* *
 *   Name: getId
 *   Description: Get session's id.
 *   Parameters:
 *       none.
 *   Return:
 *       _id.
 * */
channel.prototype.getId = function(){
    return this._id;
};
/* *
 *   Name: setName
 *   Description: set Channel's name.
 *   Parameters:
 *       name: session's name.
 *   Return:
 *       this.
 * */
channel.prototype.setName = function(name){
    this._name = name;
    return this;
};
/* *
 *   Name: getName
 *   Description: Get session's name.
 *   Parameters:
 *       none.
 *   Return:
 *       name.
 * */
channel.prototype.getName = function(){
    return this._name;
};
/* *
 *   Name: addUserId
 *   Description: add user's id to list user ids.
 *   Parameters:
 *       id: users's id.
 *   Return:
 *       true or false
 * */
channel.prototype.addUserId = function(id){
    var userInChannel = this.getListUserIds().length;
    var maxUser = this.getMaxUsers();
    if(userInChannel < maxUser){
        this._listUserIds.push(id);
        return true;
    }
    return false;
};
/* *
 *   Name: getIdFromList
 *   Description: Get user's id from list users.
 *   Parameters:
 *       id: users's id.
 *   Return:
 *       -1: cannot find the id.
 *       id: users's id.
 * */
channel.prototype.getIdFromList = function(id){
    var listUser = this.getListUserIds();
    for(var i in listUser){
        if(id === listUser[i])
            return listUser[i];
    }
    return -1;
};
/* *
 *   Name: removeUserId
 *   Description: Remove users's id in list users.
 *   Parameters:
 *       id: users's id.
 *   Return:
 *       true or false
 * */
channel.prototype.removeUserId = function(id){
    var listUser = this.getListUserIds();
    var self = this;
    if(this.getIdFromList(id) !== -1){
        for(var i in listUser){
            if(id === listUser[i]){
                self._listUserIds.splice(i, 1);
                return true;
            }
        }
    }
    return false;
};

/* *
 *   Name: destroy
 *   Description: destroy session.
 *   Parameters:
 *       none
 *   Return:
 *       none
 * */
channel.prototype.destroy = function(){
    delete this;
};


/** @constructor
 * Manage all of session in app.
 */
function channelMngt(){};
/** @pram  listChannels
 *  Contain all of channels in app
 * @type {{json}}
 */
channelMngt.prototype.listChannels = {};
/*
 * Name: createChannel
 * Description: create and add session to list of session
 * Parameters:
 *   name: session's name
 *   id: session's id
 *   [socket]: socket object
 * Returns
 *   true or false.
 * */
channelMngt.prototype.createChannel = function (name, id, socket) {
    if ('undefined' === typeof this.listChannels[name]) {
        //var session = new session(name, id);
        this.listChannels[id] = new channel(name, id);
        if (socket)
            socket.join(id);
        return true;
    }
    console.log(textError.error4);
};
/*
 * Name: addToChannel
 * Description: add user to session
 * Parameters;
 *   channelName: session's name.
 *   id: user's id
 * Returns:
 *   true or false
 * */
channelMngt.prototype.addToChannel = function (channelName, id) {
    if ('undefined' !== typeof this.listChannels[channelName]) {
        return this.listChannels[channelName].addUserId(id)
    }
    return false;
};
module.exports = channelMngt;
