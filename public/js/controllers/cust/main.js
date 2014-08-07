/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 6/6/13
 * Time: 9:04 PM
 * To change this template use File | Settings | File Templates.
 */
'use strict';
var cust = {
    send: function (textchat, typeRe) {
        var data = {id: cust.id, nick: cust.nick, channelId: cust.channelId, text: textchat, type: typeRe};
        socketJsonSend(data);
    }
};
var chatStore = [];

custApp.controller('main', function ($scope, $location, $http, $cookies) {
    socketConnected(function (result) {
    });
    if(typeof $cookies.cust !== "undefined" && typeof $cookies.currentPath !== "undefined"){
        $.extend(cust, $.parseJSON($cookies.cust));
        socket.on('connect', function () {
            socket.emit('custReconnect', {custId: cust.id, channelId: cust.channelId});
        });
        socket.on('custReconnect', function(data){
            if(typeof data.chatStore != "undefined")
                chatStore = data.chatStore;
            $location.path($cookies.currentPath).replace();
            $scope.$apply();
        });
        socket.on('custReconnectFail', function (data) {
            delete $cookies.cust;
            delete $cookies.currentPath;
            $scope.$apply();
            setInterval(function () {
                location.reload();
            }, 1000);
        });
    }
    else{
        socketOn('message', function (data) {
           if (data.type == 'saleStatus') {
                if (data.saleStatus == "NO_SALE_AVAILABLE" || data.saleStatus == "SALE_AVAILABLE") {
                    if (typeof cust.id == "undefined" && $location.path() != '/on1' && $location.path() != '/on2') {
                        $location.path('/on1').replace();
                        $scope.$apply();
                    }
                }
                else if (data.saleStatus == "NO_SALE_ONLINE") {
                    if(typeof cust.id == "undefined" && $location.path() != '/off'){
                        $location.path('/off').replace();
                        $scope.$apply();
                    }
                }
           }
        });
        socket.on('reconnect', function(){
          if(typeof cust != 'undefined')
            socket.emit('custReconnect', {custId: cust.id, channelId: cust.channelId});
            //video tool reconnect to media server again 
            videoChat.reconnectServerCust();
        });
    }
});
custApp.controller('offline', function ($scope, $location, $http, $cookies) {
    $(document).bind('mousemove', function () {
        if(typeof $('video').get(0) != 'undefined')
            $('video').get(0).play();
        $(this).unbind('mousemove');
    });
    $scope.master = {};
    $scope.update = function (cust) {
        $scope.master = angular.copy(cust);
    };
    $scope.reset = function () {
        $scope.cust = angular.copy($scope.master);
    };
    $scope.reset();
    $scope.submitCallBackForm = function(){
        socketEmit('callbackInfoGuest', $scope.cust);
        $location.path('/cb_thank').replace();
    };
});
custApp.controller('online', function($scope, $http, $location, $cookies){
    $scope.isDisabled = false;
    $(document).bind('mousemove', function () {
        if (typeof $('video').get(0) != 'undefined')
            $('video').get(0).play();
        $(this).unbind('mousemove');
    });
    $scope.joinWaiting = function(){
        if($scope.isDisabled == false){
            $scope.isDisabled = true;
            var dt = {nick: 'Guest', timestamp: new Date().getTime()};
            socketEmit("customerLogin", dt);
        }
    };
    socket.once('login', function(data){
        if(typeof data.error == 'undefined'){
            jQuery.extend(cust,data.customer)
            cust.publicId = data.channel.id;
            cust.publicName = data.channel.name;
            cust.channelId = cust.publicId;
            cust.channelName = cust.publicName;
            var resourceInfo = data.resource;
            cust.resourcePublic = resourceInfo.streamName;
            cust.resourceURL = resourceInfo.streamUrl;
            $cookies.cust = JSON.stringify(cust);
            $location.path('/wait').replace();
            $scope.$apply();
        }
        else{
            $scope.isDisabled = false;
        }
    });
    /*socketOn('message', function (data) {
        if (data.type == 'queue') {
            cust.queue = data.queue;
            if(cust.channelId == cust.publicId){
                $location.path('/wait').replace();
                $scope.$apply();
            }
        }
    });*/
});

custApp.controller('waiting', function ($scope, $location, $cookies) {
    $('#video-content').empty();
    $cookies.currentPath = '/wait';
    $cookies.cust = JSON.stringify(cust);
    $scope.queueNumber = cust.queue;
    socketOn('message', function (data) {
        switch(data.type){
            case 'queue':
                $scope.queueNumber = cust.queue = data.queue;
                $scope.$apply();
                break;
            case 'saveSession':
                cust.sessionId = data.sessionId;
                $location.path('/chat').replace();
                $scope.$apply();
                break;
            case typeReceive.custAssign:
                var saleInfo = data.sale;
                var saleResource = data.resource;
                cust.channelId = saleInfo.channelId;
                cust.channelName = saleInfo.saleName;
                cust.resourcePrivate = saleResource.streamName;
                $cookies.cust = JSON.stringify(cust);
                break;
            case typeReceive.message:
                if (data.user.role != cust.role) {
                    var c = {name: data.user.nick, msg: data.textchat, timestamp: data.user.timestamp, role: data.user.role};
                    chatStore.push(c);
                }
                break;
            default:
                break;
        }
    });
    $scope.submitCallBackForm = function () {
        socketEmit('callbackInfo', {callbackInfo: $scope.cust});
        socket.emit('socketDisconnect', {disconnect: true});
        $location.path('/cb_thank').replace();
    };
    socketOn('message', function (data) {
        if (data.type === typeReceive.join || data.type === typeReceive.quit) {
            if (data.type === typeReceive.quit && data.user.role === typeUser.sale) {
                delete $cookies.cust;
                socket.emit('socketDisconnect', {disconnect: true});
                $location.path('/feedback').replace();
                $scope.$apply();
            }
        }
    });
});

custApp.controller('private', function ($scope, $cookies, $location) {
    videoChat.sendCustId(cust.id);
    $cookies.currentPath = '/chat';
    $cookies.cust = JSON.stringify(cust);
    var editChat = false;
    var editChatIndex = -1;
    $scope.typing = cust.channelName;
    $scope.indicator = 'hd';
    $scope.operConnectionNoti = 'hd';
    $scope.chatContent = [];
    if(chatStore.length >0){
        for(var i in chatStore){
            $scope.chatContent.push(formatChatContent(chatStore[i]));
        }
    }
    $('#text-chat-input').keyup(function(e){
        if(e.keyCode == 38 && $scope.chatContent.length > 0){
            var c = getChatEdit();
            if(c != -1){
                editChat = true;
                $scope.textChat = $scope.chatContent[c].msg;
                editChatIndex = c;
                $scope.$apply();
            }
        }
    });
    cust.flag = false;
    $('#text-chat-input').focus(function(){
        if(!cust.flag){
            cust.send("", 'chatFocus');
            cust.flag = true;
        }
    });
    $('#text-chat-input').focusout(function () {
        if(cust.flag && $('#text-chat-input').val() == ''){
            cust.send("", 'chatFocusOut');
            cust.flag = false;
        }
    });
    /**
     * Get chat content which will be edited.
     * @returns {json} null or last chat content of customer.
     */
    function getChatEdit(){
        for(var i = $scope.chatContent.length - 1; i >=0; i--){
            if($scope.chatContent[i].role == cust.role)
                return  i;
        }
        return -1;
    };
    function getChatEditIndexById(ci) {
        for (var i = $scope.chatContent.length - 1; i >= 0; i--) {
            if ($scope.chatContent[i].chatId == ci)
                return i;
        }
        return null;
    };
    /**
     * Format a row of chat content before apply to chatContent model
     * @param c
     * @returns {json} a row of chat content
     */
    function formatChatContent(c){
        var h = new Date(c.timestamp).getHours(), m = new Date(c.timestamp).getMinutes();
        var tm = ((h / 12) > 1) ? 'PM' : 'AM';
        h = (h <= 12) ? h : h % 12;
        m = (m < 10) ? ('0' + m) : m;
        h = (h < 10) ? ('0' + h) : h;
        c.chatTime = h + ':' + m + ' ' + tm;
        c.chatRole = (cust.role == c.role)? 'chat-name-self' : 'chat-name-other';
        if($scope.chatContent.length > 0){
            if (c.role == $scope.chatContent[$scope.chatContent.length - 1].role)
                c.showName = 'hd';
            else
                c.showName = '';
        }
        if(typeof c.edit == 'undefined')
            c.edit = "";
        if(typeof c.chatId == 'undefined')
            c.chatId = ($scope.chatContent.length +1) + c.name.replace(/\s/g, "");
        return c;
    };
    /**
     * Format text chat, apply link format inside text chat .
     * @param text
     * @returns {string}
     */
    function formatText(text){
        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, function (url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
    };
    $scope.addChat = function(){
        if(!editChat){
            if ($scope.textChat.length > 0) {
                cust.send($scope.textChat, 'msg');
                var c = {name: cust.nick, msg: $scope.textChat, timestamp: new Date().getTime(), role: cust.role};
                $scope.chatContent.push(formatChatContent(c));
                $scope.textChat = '';
                var i = setInterval(function(){
                    $('#text-chat-content').scrollTop($('#text-chat-content')[0].scrollHeight);
                    $scope.$apply();
                    clearInterval(i);
                }, 100);
            }
        }else{
            $scope.chatContent[editChatIndex].msg = $scope.textChat;
            $scope.chatContent[editChatIndex].edit = 'edit-icon';
            editChat = false;
            cust.send(JSON.stringify({text: $scope.textChat, id: $scope.chatContent[editChatIndex].chatId}), 'editMsg');
            $scope.textChat = '';
            $('#text-chat-content').scrollTop($('#text-chat-content')[0].scrollHeight);
        }
        $('#text-chat-input').focus();
        cust.send("", 'chatFocus');
    };
    socketOn('message', function (data) {
        switch(data.type){
            case typeReceive.message:
                if(data.user.role != cust.role){
                    var c = {name: data.user.nick, msg: data.textchat, timestamp: data.user.timestamp, role: data.user.role};
                    if($scope.chatContent.length > 0){
                        if (c.timestamp !== $scope.chatContent[$scope.chatContent.length - 1].timestamp) {
                            $scope.chatContent.push(formatChatContent(c));
                            $scope.$apply();
                            $('#text-chat-content').scrollTop($('#text-chat-content')[0].scrollHeight);
                        }
                    }
                    else{
                        $scope.chatContent.push(formatChatContent(c));
                        $scope.$apply();
                        $('#text-chat-content').scrollTop($('#text-chat-content')[0].scrollHeight);
                    }
                }
                break;
            case 'chatFocusOut':
                $scope.indicator = "hd";
                $scope.$apply();
                break;
            case 'chatFocus':
                $scope.indicator = "";
                $scope.$apply();
                $('#text-chat-content').scrollTop($('#text-chat-content')[0].scrollHeight);
                break;
            case 'editMsg':
                var ct = $.parseJSON(data.textchat);
                var index = getChatEditIndexById(ct.id);
                $scope.chatContent[index].msg = ct.text;
                $scope.chatContent[index].edit = 'edit-icon';
                $scope.$apply();
                break;
            case 'endSession':
                delete $cookies.cust;
                $location.path('/feedback').replace();
                $scope.$apply();
                break;
            case typeReceive.quit:
                if (data.type === typeReceive.quit && data.user.role === typeUser.sale) {
                    delete $cookies.cust;
                    socket.emit('socketDisconnect', {disconnect: true});
                    $location.path('/feedback').replace();
                    $scope.$apply();
                }
                break;
            case 'operDisconnected':
                $scope.indicator = 'hd';
                $scope.operConnectionNoti = '';
                $scope.$apply();
                break;
            case 'operReconnected':
                $scope.operConnectionNoti = 'hd';
                $scope.$apply();
                break;
            default: break;
        };
    });

});

custApp.controller('feedback', function ($scope, $cookies, $location) {
    $scope.master = {vaa: 'Good', lookingFor: 'no'};
    $scope.reset = function () {
        $scope.fb = angular.copy($scope.master);
    };
    $scope.reset();
    $scope.sendFeedback = function(){
        socketEmit('feedback', {sessionId: cust.sessionId, feedback: $scope.fb});
        $location.path('/feedback_thank').replace();
        delete $cookies.currentPath;
    };
    $scope.reload = function(){
        delete $cookies.cust;
        delete $cookies.collapse;
        $location.path('/loading').replace();
        setInterval(function(){
            location.reload();
        }, 1000);
    };
});

custApp.controller('callbackThank', function ($scope, $cookies, $location) {
    $scope.reload = function () {
        $location.path('/loading').replace();
        delete $cookies.currentPath;
        delete $cookies.cust;
        delete $cookies.collapse;
        setInterval(function () {
            location.reload();
        }, 1000);
    };
});