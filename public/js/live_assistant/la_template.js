/*	
	Name: tmpl_status
	Description: 
		Status configuration of Live Assistant Interface.
		guest:	Before Live Assistant log-in.
		private_sale: After a Sale person is assigned to Customer.
		_statusName_: Name of status.
			
	Attributes: 
		_statusName_: {
			status(boolean): Determine that status is active or not.
			objects(array): List objects will be displayed on each status.
		}
*/
var tmpl_status = {
	general: {
		status: true,
		objects : ['header', 'main-notification'],
		queue: 1
	},
	guest: {
		status: true,
		objects : ['lobby-content','footer'],
		queue: 2
	},
	private_sale: {
		status: false,
		objects : ['content', 'communication', 'workspace', 'help-guide', 'support-info', 'basic-info', 'geoip-info', 'footer','top-nav'],
		queue: 3
	}
};
/*
	Name: tmpl_object
	Description: List objects template will be display on : Live Assistant Interface.
		_objName_: Name of a Template Object
	Attributes: 
		_objName_: {
			id(string): Id of a Template Object, it will be replaced to default Id of HTML Source.
			parent(string): A selector(id or class) of Parent Node which HTML source of template object will be appended.
			js(array): List javascript paths which javascript files will loaded for template object.
			css(array): List css paths which css file will be loaded for template object.
			path(string): HTML source path which HTML source will be loaded for tamplate object.
			directive(json): Mark places which will be updated or replaced data for HTML source.
			active(boolean): Determine that a template object will be display or not
		}
*/
var tmpl_object = {
	'header': {
		id: '#header',
		parent: '#container',
		js: [],
		css: [],
		path: global_config.la_pathTmpl + 'head/header.html',
		directive: {},
		active: true,
		count: 0
	},
	'lobby-content': {
		id: '#lobby-content',
		parent: '#container',
		js: [{path: '', func: function(){
            //Call receive function of sale object when receive every data from server.
			socketOn('message', function( data ) {
				sale.receive(data);
			});
			//Hidden loading page
			loading.fistTimeLoading = false;
			loading.hiddenLoading();
		}, type: 'file'}],
		css: [],
		path: global_config.la_pathTmpl + 'login.html',
		directive: {},
		active: true,
		count: 5
	},
	'main-notification': {
		id: '#main-noti', 
		parent: '#container', 
		js: [{path: global_config.pathJSLibs + 'jquery_loadingdot.js', func: function(){
			//Active loadingDot plugin.
			$("#main-sys-loading").loadingDot({
				"speed": 400,
				word: "Reconnecting "
			});
		}, type: 'file'}], 
		css: [], 
		path: global_config.la_pathTmpl + 'main/main-notification.html',
		directive: {'#main-noti@class': 'show','#main-noti@class':'className', '.text-noti': 'text', '#main-sys-loading@class': 'loadingShow'}, 
		active: true,
		count: 10
	},
	'content': {
		id: '#content',
		parent: '#container',
		js: [],
		css: [],
		path: global_config.la_pathTmpl + 'main/content.html',
		directive: {'#link-ready@class': 'switch', '#count-cust-pub': 'count'},
		active: true,
		count: 15
	},
	'communication': {
		id: '#communication',
		parent: '#communication-area',
		js: [{path: global_config.pathJSLibs + 'jquery_loadingdot.js', func: null, type: 'file'},
		{path: global_config.pathJSLibs + 'voice_chat.js', func: function(){
			// send customer info to the video chat tool
			videoChat.sendAssistantInfo(sale.listResource.streamUrl);
		}, type: 'file'}],
		css: [],
		path: global_config.la_pathTmpl + 'main/communication.html',
		directive: {'#text-chat-content': 'textChatContent'},
		active: true,
		count: 20
	},
	'syslog': {
		id: '#syslog',
		parent: '#sharing-content-area',
		js: [{path: global_config.pathJSLibs + 'notification.js', func: function(){
				//Declare wrapper of system notification.
				sysLog.wrapSysLog = $('#wrap-syslog');
				//Bind event click for Log Button.
				$("#log-button").bind('click', function(){
					if(sysLog.wrapSysLog.hasClass('hd')){
						sysLog.viewSysLog();
						sysLog.wrapSysLog.removeClass('hd');
					}
					else
						sysLog.wrapSysLog.addClass('hd');
				});
			}, type: 'file'}
		],
		css: [],
		path: global_config.la_pathTmpl + 'main/notification.html',
		directive: {'#loading-name': 'loadingName', '#loading-content': 'loadingContent', '#sys-loading@class': 'show'},
		active: true,
		count: 21
	},
	'workspace': {
		id: '#workspace',
		parent: '#sharing-content-area',
		js: [	{path: global_config.la_pathJS + 'paging.js', func: function(){
				//Send request media data to server.
				socketEmit('getMedia', {});
                sale.engaged = false;
                sale.queue = new pager();
                sale.queueCurrentPage = 1;
                sale.queue.init(sale.listCust, '#paging-queue', '#queue-list-container');
			}, type: 'file'},
            {path: global_config.la_pathJS + 'customer_info.js', func: null, type: 'file'}
		],
		css: [],
		path: global_config.la_pathTmpl + 'main/workspace.html',
		directive: {'#product-share': 'productShare'},
		active: true,
		count: 25
	},
	'queue-list': {
		id: '#queue-list',
		parent: '#sharing-content-area',
		js: [],
		css: [],
		path: global_config.la_pathTmpl + 'main/queue-list.html',
		directive: {},
		active: true,
		count: 30
	},
	'help-guide': {
		id: '#help-guide',
		parent: '#sharing-content-area',
		js: [],
		css: [],
		path: global_config.la_pathTmpl + 'main/help_guide.html',
		directive: {},
		active: true,
		count: 35
	},
	'ticket-data': {
		id: '#ticket-data',
		parent: '#sharing-content-area',
		js: [{path: global_config.la_pathJS + 'customer_info.js', func: null, type: 'file'}],
		css: [],
		path: global_config.la_pathTmpl + 'main/ticket_data.html',
		directive: {},
		active: true,
		count: 40
	},
	'support-info': {
		id: '#cust-support-info',
		parent: '#support-info',
		js: [],
		css: [],
		path: global_config.la_pathTmpl + 'main/ticket_data/support_info.html',
		directive: {'.basic-info-incident-id': 'basicInfoIncidentId'},
		active: true,
		count: 45
	},
	'basic-info': {
		id: '#cust-basic-info',
		parent: '#support-info',
		js: [{path: global_config.pathJSLibs + 'jquery-ui-autocomplete.js', func: null, type: 'file'}, {path: global_config.pathJSLibs + 'jquery.select-to-autocomplete.min.js', func: function(){$('#country-selector').selectToAutocomplete();}, type: 'file'}],
		css: [],
		path: global_config.la_pathTmpl + 'main/ticket_data/basic_info.html',
		directive: {'.basic-info-name': 'basicInfoName','.basic-info-country-val': 'basicInfoCountryVal' ,'.ui-autocomplete-input': 'basicInfoCountry', '.basic-info-coutry-hide': 'basicInfoCountryHide'},
		active: true,
		count: 50
	},
	'geoip-info': {
		id: '#cust-geoip-info',
		parent: '#customer-info',
		js: [{path:'', func: function(){template_engine.tmpls['content'].updateHtmlSource({'switch': null, 'count': sale.listCust.length});}, type: 'file'}],
		css: [],
		path: global_config.la_pathTmpl + 'main/ticket_data/geoip_info.html',
		directive: {'#geoip-ip':'ip', '#geoip-country-name': 'countryName', '#geoip-country-code': 'countryCode', '#geoip-region-name': 'regionName', '#geoip-city': 'city', '#geoip-zip': 'zip'},
		active: true,
		count: 55
	},
	'footer': {
		id: '#footer',
		parent: '#container',
		js: [],
		css: [],
		path: global_config.la_pathTmpl + 'main/footer.html',
		directive: {},
		active: true,
		count: 60
	},
	'top-nav': {
		id: '#top-nav',
		parent: '#header',
		js: [{path:'', func: function(){template_engine.tmpls['top-nav'].updateHtmlSource({'show': null,'name':name, 'time': null, 'sessionText': textDisplay.sessionText.replace('_replace_', sale.nickName)});}, type: 'file'}],
		css: [],
		path: global_config.la_pathTmpl + 'main/top-nav.html',
		directive: {'#cust-time@class':'show', '#cust-name': 'name', '#cust-time-display': 'time', '#session-text': 'sessionText'},
		active: true,
		count: 65
	}
};
