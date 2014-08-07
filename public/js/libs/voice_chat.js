var videoChat = {
	// variable for loading flash status
	loadingVoiceFlash:'',
	//loadingAsistantVoiceFlash:'',
	/*
		Function: finishLoadingFlash
		Check and save status when finish loading the Flash Voice Chat.
		Parameters: 
			none
		Returns:
			none
	*/
	finishLoadingFlash: function(){
		videoChat.loadingVoiceFlash = 'done';
		videoChat.sendValueToAs("setJsReady","true");
	},
	/*
		Function: getFlashMovieObject
		Get a flash object.
		Parameters: 
			movieName
		Returns:
			object
	*/
	getFlashMovieObject: function(movieName){
		if (window.document[movieName]) 
		{
		     return window.document[movieName];
		}
		if (navigator.appName.indexOf("Microsoft Internet")==-1)
		{
		    if (document.embeds && document.embeds[movieName])
				return document.embeds[movieName]; 
		}
		else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
		{
		    return document.getElementById(movieName);
		}
		
	},
	
	/*
		Function: sendValueToAs
		Send a string value to Flash Actionscript.
		Parameters: 
			value - String
		Returns:
			none
	*/
	sendValueToAs: function(valueType,value){
		var flashMovie = videoChat.getFlashMovieObject('videoVoiceChat');
		//var v = flashMovie.PercentLoaded();
		var flashInterval = setInterval(function(){
			if(videoChat.loadingVoiceFlash == 'done'){
				flashMovie.sendValueToAs(valueType,value);
				window.clearInterval(flashInterval);
			}
			else
			{
				window.clearInterval(flashInterval);
				videoChat.sendValueToAs(valueType,value);
			}
		}, 2000);
	},
	/*
		Function: sendCustomerInfo
		Send customer info to Flash Actionscript.
		Parameters: 
			none
		Returns:
			none
	*/
	sendCustomerInfo: function(streamUrl){
		// Send StreamURL to Flash Voicechat 
		videoChat.sendValueToAs("streamUrl",streamUrl);
	},
	/*
		Function: sendCustId
		Send cust id to Flash Actionscript.
		Parameters: 
			none
		Returns:
			none
	*/
	sendCustId: function(custId){
		videoChat.sendValueToAs("custId",custId);
	},
	/*
		Function: sendAssistantInfo
		Send assistant info to Flash Actionscript.
		Parameters: 
			none
		Returns:
			none
	*/
	sendAssistantInfo: function(streamUrl){
		// Send StreamURL to Flash Voicechat 
		videoChat.sendValueToAs("streamUrl",streamUrl);
		// Send client ID to Flash Voicechat 
		//videoChat.sendValueToAs("saleId",voiceSaleName);
	},
	/*
		Function: sendCustId
		Send cust id to Flash Actionscript.
		Parameters: 
			none
		Returns:
			none
	*/
	sendAssistantId: function(saleId){
		// Send sale ID to Flash Voicechat 
		videoChat.sendValueToAs("saleId",saleId);
	},
	/*
		Function: sendVoiceSaleName
		Send voice sale name to Flash Actionscript.
		Parameters: 
			none
		Returns:
			none
	*/
	sendVoiceOperName: function(voiceOperName){
		videoChat.sendValueToAs("voiceOperName",voiceOperName);
	},
	/*
		Function: sendVideoSaleName
		Send video sale name to Flash Actionscript.
		Parameters: 
			none
		Returns:
			none
	*/
	sendVideoOperName: function(videoOperName){
		videoChat.sendValueToAs("videoOperName",videoOperName);
	},
	/*
		Function: stopPlayingCust
		Stop playing video and voice from customer side.
		Parameters: 
			none
		Returns:
			none
	*/
	stopPlayingCust: function(){
		videoChat.sendValueToAs("custStopPlaying","true");
	},
  /*
		Function: reconnectServerCust
		cust function to reconnect to media server again.
		Parameters: 
			none
		Returns:
			none
	*/
	reconnectServerCust: function(){
		videoChat.sendValueToAs("custReconnectServer","true");
	},
	/*
		Function: stopPublishingSale
		Stop publishing video and voice from sale side
		Parameters: 
			none
		Returns:
			none
	*/
	stopPublishingSale: function(){
		videoChat.sendValueToAs("saleStopPublishing","true");
	},
  	/*
		Function: stopGoLiveSale
		Stop golive when in private
		Parameters: 
			none
		Returns:
			none
	*/
	stopGoLiveSale: function(){
		videoChat.sendValueToAs("saleStopGoLive","true");
	},
  /*
		Function: stopPublishingCust
		Stop publishing  voice from cust side
		Parameters: 
			none
		Returns:
			none
	*/
	stopPublishingCust: function(){
		videoChat.sendValueToAs("custStopPublishing","true");
	},
	/*
		Function: closeCommunicationSetting
		Close Communication Setting Div.
		Parameters: 
			none
		Returns:
			none
	*/
	closeCommunicationSetting: function(){
		$('#communication-setting').addClass('hd');
	},
	/*
		Function: stopNotificationSound
		 stop playing notification sound when user active mouse
		Parameters: 
			none
		Returns:
			none
	*/
	stopNotificationSound: function(){
		videoChat.sendValueToAs("stopNotificationSound","true");
		//document.getElementById("turnoffsound").style.display = "none";
	},
	/*
		Function: playEngageSound
		 play sound when customer join
		Parameters: 
			none
		Returns:
			none
	*/
	playEngageSound: function(){
		videoChat.sendValueToAs("playEngageSound","true");
	},
	/*
		Function: playExitSound
		 play sound when customer exit
		Parameters: 
			none
		Returns:
			none
	*/
	playExitSound: function(){
		videoChat.sendValueToAs("playExitSound","true");
	},
	/*
		Function: displayConnectError
		Display error message when can not connect to media server 
		Parameters: 
			none
		Returns:
			none
	*/
	displayConnectError: function(){
		template_engine.displayNotification(error.className, error.cantConnectMediaServer);
	}
	
};