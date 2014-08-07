/*
	Name: sale
	Access type: Public Static
	Description:
		Control workflow of Live Operator on client side.
	Public static properties:
		@id[string]: Live Operator's Id.
		@nick[string]: Live Operator's Nick.
		@nickName[string]: Live Operator's nick name.
		@channelId[string]: channel id of Live Operator.
		@cus(t)Id[string]: Customer's id. (this name is wrong, must add t to (t) later)
		@cus(t)Name[string]: Customer's name. (this name is wrong, must add t to (t) later)
		@listResource[object]: no use.
		@intervalTime[int]: no use.
		@noti[string]: no use.
		@duration[string]: no use.
		@custInfo[object]: An object manage Customer Information(store, update, view customer information and send customer information to server.) 
		@loadTrackScript[boolean]: no use.
		@timetamp[int]: the time when Live Operator receive every data from server.
		@debug[json]: no use.
		@logchat[array]: store text chat object(manage text chat: store, view, update text chat and text chat information on Chat Box).
		@timeoutEndSession[int]: no use.
		@productsPage[object]: this object will paging and display lis products on toolbar, initialize when receive list products or media from server.
		@productShare[array]: store all of products that Live Operator share to Customer.
	Public static functions:
		send: send data to server(via socket.io).
		sendEmit: send data to server(via socket.io)
		receive: receive data from server and execute actions base on type of received.
		logout: log out system. 
*/
var sale = {
	id: '',
	nick: '',
	nickName: '',
	channelId: '',
	cusId: '',
	cusName: '',
	listResource: null,
	listCust: null,
	intervalTime: 0,
	noti : "",
	duration: '',
	custInfo: null,
	loadTrackScript: false,
	timestamp: '',
	// the diffirent time gap between operator computer and server
	timegap: '',
	debug: {},
	logChat: [],
	timeoutEndSession: 0,
	productsPager: null,
	productShare: [],
	countChat: 0,
	/*
		Name: send
		Parameters:
			@String parameter textchat: text will be sent to server.
			@string parameter typeRe: type of received.
		Returns:
			none.
	*/
	send: function(textchat, typeRe){
		//Format data.
		var data = {id: sale.id, nick: sale.nick, channelId: sale.channelId, text: textchat, type: typeRe};
		//Send data to server(socket.io).
		socketJsonSend(data);
	},
	/*
		Name: sendEmit
		Parameters:
			@String parameter textchat: text will be sent to server.
			@string parameter typeRe: type of received.
		Returns:
			none.
	*/
	sendEmit: function(textchat, typeRe){
		//Format data.
		var data = {id: sale.id, nick: sale.nick, channelId: sale.channelId, text: textchat, type: typeRe};
		//Send data to server(socket.io).
		socketEmit(data);
	},
	/*
		Name: receive
		Parameters:
			@Object parameter data: Data is returned from server.
		Returns:
			none.
	*/
	receive: function(data){
		if(data!= null){
			//Get data form data returned.
			var clientInfo =  data;
			//Get user information from data returned.
			var user = clientInfo.user;
			//Execute actions if Customer or Live Operator logged out.
			if(clientInfo.type === typeReceive.join || clientInfo.type === typeReceive.quit){
				//Reload page if User is Live Operator.
                if(clientInfo.type === typeReceive.quit && user.id === sale.id)
					location.reload();
				//Reset data and interface if Customer logged out.
				else if(clientInfo.type === typeReceive.quit && user.id === sale.cusId)
				{
					//Reset chat box.
					template_engine.tmpls['communication'].updateHtmlSource({'textChatContent': sale.indicatorContent});
					sale.resetIndicator();
					template_engine.tmpls['workspace'].updateHtmlSource({'productShare': ''});
					//Stop publishing video and voice
					videoChat.stopPublishingSale();
					sale.showIndicator(false);
					// Enable all engage button in queue list

                    sale.engaged = false;
					//Reset Customer's Time
					sale.clearCustTime();
					sale.addChat('', typeUser.admin, '<span class="chat-name">'+sale.cusName+'</span>' + textDisplay.leaved, sale.timestamp);
				}
			}
			//Execute actions when Customer is assigned to Live Operator.
			else if(clientInfo.type === typeReceive.custAssign){
				var cusInfo = clientInfo.cust;
				//Assign customer's id and name.
				sale.cusId = cusInfo.id;
				sale.cusName = cusInfo.nick;
                sale.customer_id = cusInfo.customer_id
               	//Init indicator: add name to indicator text.
				template_engine.tmpls['communication'].updateHtmlSource({'textChatContent': sale.indicatorContent});
				sale.resetIndicator();
				//Init indicator: add name to indicator text.
				sale.initIndicator(sale.cusName);
				// Disable all engage button in queue list
                sale.engaged = true;
				sale.addChat('', typeUser.admin, '<span class="chat-name">'+cusInfo.nick+'</span>' + textDisplay.joined, sale.timestamp);
				if(typeof(sale.countChat) != 'undefined') sale.countChat = 0;

				//Change status of ready button to hold-on.
				template_engine.tmpls['content'].updateHtmlSource({'switch': '-hd', 'count': null});
				//update status to server side.
				socketEmit('changeStatus', {id: sale.id, status: 'Online'});
				//Active share function.
				//sale.productsPager.createPage();
				// send sale id to the video chat tool for sale stream name
				videoChat.sendAssistantId(sale.id);
				// Get the incident id until sale.sessionId is not null
				var incidentTimeId = setInterval(function(){
					socketEmit('getIncidentId');
					if((typeof(sale.sessionId) !== "undefined") || (sale.sessionId!=="")){
						clearInterval(incidentTimeId);
					}
				},5000);
				
			}
			//Execute actions when receive text chat.
			else if(clientInfo.type === typeReceive.message){
				//UPdate timestamp.
				sale.timestamp = user.timestamp;
				//Save text chat and append to chat box if customer send message.
				if(user.id !== sale.id){
					sale.addChat(user.nick, user.role, clientInfo.textchat, sale.timestamp);
					global_config.scrollDown('#text-chat-content');
					sale.showIndicator(false);
				}
			}
			else if(clientInfo.type === 'editMsg'){
				var ct = $.parseJSON(clientInfo.textchat);
				sale.editChat.editChatContent(ct.id, ct.text);
			}
			//Handle when receive list waiting customer
			else if(clientInfo.type === "listCust"){
				sale.listCust = clientInfo.listCust;
			}
            else if(clientInfo.type === "updateListCust"){
				if(clientInfo.listCust.length > sale.listCust.length){
					videoChat.playEngageSound();
				}
				else{
					videoChat.playExitSound();
				}
                sale.listCust = clientInfo.listCust;
                sale.queue.init(sale.listCust, '#paging-queue', '#queue-list-container');
            }
			//Execute actions when receive product share.
			else if(clientInfo.type === "receiveGall"){
				var pro = $.parseJSON(clientInfo.textchat).cust.pro;
				//Update log notification.
				var dn = pro.name;
				if(dn.length > 20){
					dn = dn.substring(0, 20) + ' ...';
				}
			}
			else if(clientInfo.type === "receiveCustVoiceName"){
				videoChat.sendValueToAs("voiceCustName",clientInfo.textchat);
			}
			//when customer is disconnected, customer id will be updated new by socket id, update customer id to sale
			else if(clientInfo.type === "updateCustId")
				sale.cusId = clientInfo.textchat;
			//Receive incident id after Live Operator has been assigned to Customer.
			else if(clientInfo.type === "saveSession"){
				sale.sessionId = clientInfo.sessionId;
                var cust = clientInfo.cust;
                sale.custInfo = new custInfo(null, null, null);
                sale.custInfo.setBasicInfo(cust.info);
                sale.custInfo.filterBasicInfo();
                if(sale.custInfo.setGeoipInfo(cust.geoip)){
                    template_engine.tmpls['geoip-info'].updateHtmlSource({'ip': cust.geoip.ip, 'countryName': cust.geoip.country, 'countryCode': cust.geoip.country_code, 'regionName': cust.geoip.region, 'city': cust.geoip.city, 'zip': cust.geoip.zip});
                    template_engine.tmpls['basic-info'].updateHtmlSource({'basicInfoName': cust.info.name +' '+ sale.sessionId, 'basicInfoCountryVal': (cust.info.country === '') ? dt.countryName : cust.info.country, 'basicInfoCountry': (cust.info.country === '') ? dt.countryName : cust.info.country, 'basicInfoCountryHide': (cust.info.country === '') ? dt.countryName : cust.info.country});
                }
				//View incident id on ticket data interface.
				template_engine.tmpls['support-info'].updateHtmlSource({'basicInfoIncidentId': sale.sessionId});
                //Add welcome text
                sale.addChat(sale.nickName, typeUser.sale, textDisplay.welcomePrivateChannel.replace('_replace_', sale.nickName), sale.timestamp);
                sale.send(textDisplay.welcomePrivateChannel.replace('_replace_', sale.nickName), 'msg');
                //Display Customer's time
                sale.displayCustTime(cust.clientTime);
            }
			//Receive incident id after Live Operator has been assigned to Customer.
			else if(clientInfo.type === "getIncidentId"){
				sale.sessionId = clientInfo.incidentId;
				//View incident id on ticket data interface.
				template_engine.tmpls['support-info'].updateHtmlSource({'basicInfoIncidentId': sale.sessionId});
			}
			//Receive notification after has been saved ticket data.
			else if(clientInfo.type === "updateSession")
				template_engine.displayNotification(success.className, textDisplay.saveSessionSuccess);
			//Receive notification when customer focus out text chat input.
			else if(clientInfo.type === "chatFocusOut")
				sale.showIndicator(false);
			//Receive notification when customer focus in text chat input.
			else if(clientInfo.type === "chatFocus")
			{
				sale.showIndicator(true);
				global_config.scrollDown('#text-chat-content');
			}
			//Receive notification when customer disconnected.
			else if(clientInfo.type === "userDisconnected"){
                if(sale.channelId !== ''){
                    template_engine.displayNotificationLoading(error.className, textDisplay.userDisconnected.replace("_replace_", sale.cusName).replace("_replace_", sale.cusName));
                    //Create notification to tell Live Operator that how long Session will end.
                    sale.waitEndSession = $('<p>' + textDisplay.sessionEndIn + '</p>');
                    var i = 0;
                    var tss = $('<span></span>').append((global_config.closeTimeout / 1000 - i).toString() + '(s)');
                    sale.waitEndSession.append(tss);
                    $(template_engine.tmpls['main-notification'].getName()).append(sale.waitEndSession);
                    //Start count down.
                    sale.timeoutEndSession = setInterval(function () {
                        if (i < (global_config.closeTimeout / 1000)) {
                            i++;
                            tss.html((global_config.closeTimeout / 1000 - i).toString() + '(s)');
                        }
                        //Clear timeout after 156s.
                        else {
                            clearInterval(sale.timeoutEndSession);
                            sale.waitEndSession.remove();
                            template_engine.hiddenNotificationLoading();
                        }
                    }, 1000);
                    //Video tool stop go live when in private 
                    videoChat.stopGoLiveSale();
                }
			}
			//Receive notification when customer reconnected.
			else if(clientInfo.type === "userReconnected"){
                if (sale.channelId !== '') {
				clearInterval(sale.timeoutEndSession);
                if(typeof sale.waitEndSession != 'undefined')
				    sale.waitEndSession.remove();
				template_engine.displayNotification(success.className, textDisplay.userReconnected.replace("_replace_", sale.cusName));
                }
            }
			//Receive media data.
			else if(clientInfo.type === "media"){
				//Save list media on client side.
				productShare.products = clientInfo.media;
				//Update status of ready button.
				template_engine.tmpls['content'].updateHtmlSource({'switch': 'ready', 'count': null});
			}
		}
	},
	/*
		Name: login
		Parameters:
			@String parameter username: Live Operater's username.
			@String parameter password: Live Operater's password.
		Returns:
			None
	*/
	login: function(username, password){
		var data = {nick: username, password: password};
		//Send username and password to server.
		socketEmit('adminLogin', data);
		//Receive data returned from server after process login have been done.
		socket.on('login', function(data) {
			//Display error if process login is fail
			if(data.error){
				template_engine.displayNotification(error.className, data.error);
			}
			//Process login is successful.
			else{
				var admin = null;
                admin = data.sale;
				var channel = data.channel;
				//Assign Live Operator information and resource to sale object.
				$.extend(sale, admin);
				sale.channelId = channel.id;
                sale.nickName = admin.nickname;
                sale.nick = admin.nickname;
				sale.listResource = data.resource;
				//calculate the time gap
				sale.timegap = parseInt(new Date().getTime()) - parseInt(data.sale.timestamp);
				//Update interface.
				tmpl_status.guest.status = false;
				tmpl_status.private_sale.status = true;
				template_engine.initTemplate();

				shortcut.add("F5",function() {
					if(confirm("Are you sure"))
						sale.logout();
					else
						return false;
				});
                socket.on('reconnect', function(){
                    socket.emit('operReconnect', {operId: sale.channelId, channelId: sale.channelId});
                });
			}
		});
	},
	/*
		Name: saveSession
		Parameters:
			none
		Returns:
			none
	*/
	saveSession: function(){
		var data = {sessionId: sale.sessionId, saleId: sale.id, custId: sale.customer_id, custInfo: sale.custInfo.getBasicInfo(), type: 'saveSession'};
		socketEmit('saveSession',data);
	},
	/*
		Name: logout
		Parameters:
			none
		Returns:
			none
	*/
	logout: function(){
		socketDisconnect();
		location.reload();
	},
	custTime: 0,
	/*
		Name : displayCustTime
		Parameters:
			time: miliseconds of Customer's time.
		Return:
			none
	*/
	displayCustTime: function(time){
		//Define function that calculate day, hours, minutes to display
		function displayTime(d){
			//Get day of Date object.
			var day;
			switch(d.getDay()){
				case 0: day = 'Sun'; break;
				case 1: day = 'Mon'; break;				
				case 2: day = 'Tue'; break;
				case 3: day = 'Wed'; break;
				case 4: day = 'Thu'; break;
				case 5: day = 'Fri'; break;
				case 6: day = 'Sat'; break;
				default: break;
			}
			var year= d.getFullYear(), month = d.getMonth(), date = d.getDate();
			switch(month){
				case 0: month = 'Jan'; break;
				case 1: month = 'Feb'; break;
				case 2: month = 'Mar'; break;
				case 3: month = 'Apr'; break;
				case 4: month = 'May'; break;
				case 5: month = 'Jun'; break;
				case 6: month = 'Jul'; break;
				case 7: month = 'Aug'; break;
				case 8: month = 'Sep'; break;
				case 9: month = 'Oct'; break;
				case 10: month = 'Nov'; break;
				case 11: month = 'Dec'; break;
				default: break;
			}
			//Get 'AM' or 'PM' and hour of Date object
			var timer = ((d.getHours()/12) > 1) ? 'PM': 'AM', hour = d.getHours(), min = d.getMinutes();
			hour = (hour <= 12)? hour : hour%12;
			if(hour < 10) hour = '0' + hour;
			if(min < 10) min = '0' + min;
			//alert(day + ': '+ hour+ ': '+ d.getMinutes()+ ': '+ timer);
			//Update Customer's time.
			var geoip = sale.custInfo.getGeoipInfo();
			var name = textDisplay.inSession.replace('_replace_',sale.cusName + ' ' + sale.sessionId)+ '<span class="fc_000"> | </span>' + ((geoip.countryName)? ' '+textDisplay.headCountryName.replace('_replace_',geoip.countryName) +'<span class="fc_000"> | </span>': '');
			var time = hour +':'+ min + ' '+ timer + ' - '+ day + ', '+ month+ ' '+ date+ ', '+ year;
			template_engine.tmpls['top-nav'].updateHtmlSource({'show': '-hd','name':name, 'time': textDisplay.headTime.replace('_replace_', time), 'sessionText': null});
		}
		//Create new date object.
		var dt = new Date(time);
		displayTime(dt);
		//Each a minute, above code will be executed.
		sale.custTime = setInterval(function(){
			dt = new Date(dt.getTime() + 60000);
			//Create date object. 
			displayTime(dt);
		}, 60000);
	},
	/*
		Name: clearCustTime
		Parameters:
			none
		Returns:
			none
	*/
	clearCustTime: function(){
		//Update Customer's time.
		template_engine.tmpls['top-nav'].updateHtmlSource({'show': '+hd','day':'', 'hour':'', 'minute': '', 'timer':'','sessionText': null});
		//Clear interval
		clearInterval(sale.custTime);
	}
};