/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 6/13/13
 * Time: 3:47 PM
 * To change this template use File | Settings | File Templates.
 */
custApp.controller('videoTool', function ($scope, $location) {
	
	// send media server url to video tool
	videoChat.sendCustomerInfo(cust.resourceURL);
		
	socketOn('message', function (data) {
        switch(data.type){
            case 'receiveOperVideoName':
                var interval = setInterval(function(){
					if(videoChat.loadingVoiceFlash == 'done'){
						videoChat.sendVideoOperName(data.textchat);
						clearInterval(interval);
					}
				},2000);
                break;
            case 'receiveOperVoiceName':
                var interval = setInterval(function(){
					if(videoChat.loadingVoiceFlash == 'done'){
						videoChat.sendVoiceOperName(data.textchat);
						clearInterval(interval);
					}
				},2000);
                break;
            default: break;
        };
    });
});