// Global path
var globalPath = ('https:' == document.location.protocol ? 'https://' : 'http://') + window.location.host + '/public';

//Global variable and global function
var global_config = {
	//Hostname or ip of which place node.js server.
	host: globalPath,
	//Port which use to connect to node.js server.
	port: 8001,
	// Version
	version: 'SECUDE AG &copy; 2013',
	//Config cache
	cache: true,
	//Function return full url which use to send a request to node.js server. 
	formatUrl: function(url){
		var jsonCallback = '?jp=?';
		var nodePath = global_config.host + ':' + global_config.port.toString();
		return nodePath + url + jsonCallback;
	},
	//Config global parameter of ajax request.
	configAjax: function(){
		$.ajaxSetup({
			type: 'GET',
			dataType: 'json',
			cache: false,
			timeout: 60000
		});
	},
	//Get parameters from url.
	getUrlVars : function(){
		var vars = [], hash;
		var href = window.location.href;
		var hashes = href.slice(href.indexOf('?') + 1).split('&amp;');
		for(var i=0; i<hashes.length; i++){
			hash = hashes[i].split("=");
			vars.push(hash[0]);
			vars[hash[0]]= hash[1];
		}
		return vars;
	},
	//Get value of parameters from URL.
	getUrlVar: function(name){
		return global_config.getUrlVars()[name];
	},
	//Scroll down text chat.
	scrollDown: function(classOrId){
		$(classOrId).scrollTop($(classOrId)[0].scrollHeight);
	},
	//Path connect to PHP folder.
	pathPhp: globalPath + '/php/',
	//Path connect to JS folder of live assistant.
	la_pathJS: 'js/live_assistant/',
	//Path connect to JS folder of customer.
	cust_pathJS: 'js/customer/',
	//Path connect to libs JS
	pathJSLibs : 'js/libs/',
	//Path connect to images folder.
	pathImages: globalPath + '/images/',
	//Path connect to live assistant template folder.
	la_pathTmpl: globalPath + '/template/live_assistant/',
	//Path connect to Customer template folder.
	cust_pathTmpl:globalPath + '/template/customer/',
	//Configure socket.io
	reconnect: -1,
	idleTime: 60000,
	closeTimeout: 156000,
	maxNotiShow: 5,
	loadTimeout: 10000,
	cbError:'',
	//Title default.
	titleDefault: '',
	onFocus: true,
	//Display title timeout when window is blur.
	titleTimeout: -1
};
//Init library javascript for Customer
var listCustLibJs = [
	{groupJs: [{path: global_config.pathJSLibs + 'json2.js', func: null},
	{path: global_config.pathJSLibs + 'template_engine.js', func: null},
	{path: global_config.cust_pathJS + 'cust_template.js', func: null},
	{path: global_config.cust_pathJS + 'lang_en.js', func: null},
	{path: global_config.pathJSLibs + 'shortcut.js', func: null}],type: 'group'},
	{path: global_config.pathJSLibs + 'socket.js', func: function(){
		socketConnected(function(result){ 
			if(!result){
				global_config.cbError = "Cannot connect to server, please make sure that you have openned port "+ global_config.port;
			}
			else{
				socketOnDisconnect( function() {
					if(global_config.reconnect === -1){
						template_engine.displayNotificationLoading(error.className, error.disconnected);
						global_config.reconnect = setInterval(function(){location.reload();}, global_config.closeTimeout);
					}
				} );

				socketOnReconnecting( function(count) {} );

				socketOnReconnected( function() {
					//cleart the timeout of reload
					clearInterval(global_config.reconnect);
					global_config.reconnect = -1;
					template_engine.displayNotification(success.className, textDisplay.reconnect);
				} );
			}
		});
	}, type: 'file'},
	{path: global_config.cust_pathJS + 'cust.js', func: function(){
		template_engine.initTemplate();
		var i = 0;
		window.onbeforeunload = function(){socketDisconnect();};
		window.onblur = function(){global_config.onFocus = false;return;};
		$(window).bind('mousemove', function(){
			global_config.onFocus = true;return;
		});
	}, type: 'file'},
	{path: global_config.pathJSLibs + 'edit_chat.js', func: function(){if(customer) customer.editChat = new EditChat('edit-chat', 'chat-text');}, type:'file'}
];

//Init library javascript for Live Operator
var listLaLibJs = [
	{groupJs: [{path: global_config.pathJSLibs + 'json2.js', func: null},
	{path: global_config.pathJSLibs + 'template_engine.js', func: null},
	{path: global_config.la_pathJS + 'la_template.js', func: null},
	{path: global_config.la_pathJS + 'lang_en.js', func: null},
	{path: global_config.pathJSLibs + 'shortcut.js', func: null}], type: 'group'},
	{path: global_config.pathJSLibs + 'socket.js', func: function(){
		socketConnected(function(result){ 
			if(!result){
				global_config.cbError = "Cannot connect to server, please make sure that you have openned port "+ global_config.port;
			}
			else{
				socketOnDisconnect( function() {
					if(global_config.reconnect === -1){
						template_engine.displayNotificationLoading(error.className, error.disconnected);
						global_config.reconnect = setInterval(function(){location.reload();}, global_config.closeTimeout);
					}
				} );

				socketOnReconnecting( function(count) {} );

				socketOnReconnected( function() {
					//cleart the timeout of reload
					clearInterval(global_config.reconnect);
					global_config.reconnect = -1;
					template_engine.displayNotification(success.className, textDisplay.reconnect);
				} );
			}
		});
	}, type: 'file'},
	{path: global_config.la_pathJS + 'la.js', func: function(){
		template_engine.initTemplate();
		window.onbeforeunload = function(){socketDisconnect();};
	}, type: 'file'},
	{path: global_config.pathJSLibs + 'edit_chat.js', func: function(){if(sale) sale.editChat = new EditChat('edit-chat', 'chat-text');}, type:'file'}
];
// Type of user
var typeUser = {
	mod: 'mod',
	sale: 'sale',
	cust: 'cus', 
	admin: 'admin',
	otherCust: 'other'
};

var typeReceive = {
	message: 'msg',
	join: 'join',
	quit: 'quit',
	login: 'login',
	custLogin: 'cusLogin',
	custQuit: 'cusQuit',
	custOnline: 'custOnline',
	saleLogin: 'saleLogin',
	saleQuit: 'saleQuit',
	listCust: 'listCus',
	listSale: 'listSale',
	online: 'Online',
	offline: 'Offline',
	modAssign: 'modAssign',
	custAssign: 'custAssigned',
	receiveImage: 'receiveImage',
	receiveVideo: 'receiveVideo',
	receiveVoiceName: 'receiveVoiceName'
};
//Scale image
var scaleImage = {	
	scaleSize : function(objImage, widthScale, heightScale) {
		if(!objImage)
			return false;
		else if (!widthScale || !heightScale)
			return objImage;
		
		if (heightScale < objImage.height) {
			objImage.width = heightScale/objImage.height*objImage.width;
			objImage.height = heightScale;
		}   
		if (widthScale < objImage.width) {
			objImage.height = widthScale/objImage.width*objImage.height;
			objImage.width = widthScale;
		} 
		//alert( width + " x " + height );	
		return objImage;
	}
};
//Store all of js file.
var libJs = [];
//Define CDN here
var config_CDN = ['', 'https://livesales.noivado.org/public/'];

//
function loadSingleFile(url, index_CDN, index_js, listUrl, callback, tmpl_index){
	if(index_CDN < config_CDN.length){
		if(url != ''){

			$.ajax({
				url: config_CDN[index_CDN] + url,
				dataType: "script",
				cache: global_config.cache,
				timeout: global_config.loadTimeout,
				error: function(){
					index_CDN ++;
					loadSingleFile(url, index_CDN, index_js, listUrl, callback, tmpl_index);
				},
				success: function(data, textStatus, xhr){
					libJs.push(url);
					for(var i in listUrl){
						if(listUrl[i].path && listUrl[i].path == url){
							if(listUrl[i].func != null){
								listUrl[i].func();
							}
						}
					}
					if(global_config.cbError === ''){
						index_js++;
						loadJs(listUrl, index_js, 0, tmpl_index, callback);
						loading.updateLoading("Load js library: ", listUrl.length, index_js);
					}
					else
						loading.displayErrorLoading(global_config.cbError);
				}
			});
		}
		else{
			if(listUrl[index_js].func != null){
				listUrl[index_js].func();
			}
			if(global_config.cbError === ''){
				index_js++;
				loadJs(listUrl, index_js, 0, tmpl_index, callback);
				loading.updateLoading("Load js library: ", listUrl.length, index_js);
			}
			else
				loading.displayErrorLoading(global_config.cbError);
		}
	}
	else
		loading.displayErrorLoading("System cannot load the required files, please press F5 or Ctrl-F5 to reload the page.");
}

/*
	Description:
		Load a file from other CDN if it cannot be load from first CDN.
	Parameter:
		@url string parameter: url of file will be loaded.
		@index_CDN int parameter: index of CDN.
		@index_js int parameter: index of file will be loaded.
		@listJs array parameter: list files, this parameter will use to check loaded file list after a file have been loaded.
		@listUrl array parameter: list url are being loaded.
	Returns:
		None.
*/
function loadSingleFileAsyn(url, index_CDN, index_js, listJs, listUrl, callback, tmpl_index){
	if(index_CDN < config_CDN.length){
		$.ajax({
			url: config_CDN[index_CDN] + url,
			dataType: "script",
			timeout: global_config.loadTimeout,
			cache: global_config.cache,
			error: function(){
				index_CDN ++;
				loadSingleFileAsyn(url, index_CDN, index_js, listJs, listUrl, callback, tmpl_index);
			},
			success: function(data, textStatus, xhr){
				libJs.push(url);
				//Check file loaded list.
				var check = true;
				for(var i in listUrl){
					if(!checkLoaded(listUrl[i].path, libJs))
							check = false;
					if(listUrl[i].path && listUrl[i].path == url){
						if(listUrl[i].func != null)
							listUrl[i].func();
					}
				}
				//Next loading if all of files in list have been loaded.
				if(check){
					if(global_config.cbError === ''){
						index_js ++;
						loadJs(listJs, index_js, 0, tmpl_index, callback);
						loading.updateLoading("Load js library: ", listJs.length, index_js);
					}
					else
						loading.displayErrorLoading(global_config.cbError);		
				}
			}
		});
	}
	else
		loading.displayErrorLoading("System cannot load the required files, please press F5 or Ctrl-F5 to reload the page.");
}

/*
	Parameters:
		@listUrl array parameter : array contain list url will be loaded.
		@index_CDN int parameter: index of CDN.
		@index_js int parameter: index of list javascript.
		@listJs array parameter: array contain list file will be loaded.
	Returns:
		None.
*/
function loadMultiFiles(listUrl, index_CDN, index_js, listJs, callback, tmpl_index){
	if(index_CDN < config_CDN.length){
		//Load a list file.
		for(var i in listUrl){
			$.ajax({
				url: config_CDN[index_CDN] + listUrl[i].path,
				dataType: "script",
				timeout: global_config.loadTimeout,
				cache: global_config.cache,
				error: function(jqXHR, textStatus, errorThrown){
					var new_url = "";
					//Change CDN if cannot load from first CDN. 
					for(var j in listUrl){
						if(this.url.indexOf(listUrl[j].path)!= -1){
							new_url = listUrl[j].path;
							loadSingleFileAsyn(new_url, 1, index_js, listJs, listUrl, callback, tmpl_index);
						}
					}
					
				},
				success: function(data, textStatus, xhr){
					//Check data loading, if cannot come in error function.
					//Change CDN if cannot load from first CDN. 
					var url = "";
					for(var k in listUrl){
						if(this.url.indexOf(listUrl[k].path)!= -1)
							url = listUrl[k].path
					}
					libJs.push(url);
					//alert(libJs.length);
					//Check list js loaded
					var check = true;
					for(var j in listUrl){
						if(!checkLoaded(listUrl[j].path, libJs))
							check = false;
						if(listUrl[j].path && listUrl[j].path == url){
							if(listUrl[j].func != null)
								listUrl[j].func();
						}
					}
					if(check){
						if(global_config.cbError === ''){
							index_js ++;
							loadJs(listJs, index_js, 0, tmpl_index, callback);
							loading.updateLoading("Load js library: ", listJs.length, index_js);
						}
						else
							loading.displayErrorLoading(global_config.cbError);
					}
				}
			});
		}
	}
}

/*
	Parameters: 
		@listJs array parameter: contain list file need to load.
		@index_js int parameter: index of loading.
		@index_CDN int parameter: index of CDN.
	Returns:
		None
*/
function loadJs(listJs, index_js, index_CDN, tmpl_index, callback){
	if(index_js < listJs.length){
		//Load single file.
		if(listJs[index_js].type === 'file'){
			loadSingleFile(listJs[index_js].path, 0, index_js, listJs, callback, tmpl_index);
		}
		//load multi files.
		else if(listJs[index_js].type === 'group'){
			var listUrl = listJs[index_js].groupJs;
			loadMultiFiles(listUrl, index_CDN, index_js, listJs, callback, tmpl_index);
		}
	}else{
		if(tmpl_index >= 0){
			callback(tmpl_index, true);
		}
	}
}

function checkLoaded (e, list){
	for (var i in list){
		if(e == list[i])
			return true;
	}
	return false;
}

function displayRunningTitle(textNew, textOld){
    var space = '';
    for(var i in textNew){
        if(i < textNew.length)
            space += '_';
    }
	var text1 = textrun = textNew+ space;
    var text2 = space + textNew;
    var flag = true
	var it = setInterval(function(){
		if(!global_config.onFocus){
            if(textrun.length == textNew.length && flag){
                textrun = text2;
                flag = false;
            }
            else if(textrun.length == textNew.length && !flag){
                textrun = text1;
                flag = true;
            }
            textrun = textrun.substring(1, textrun.length);
			document.title = textrun;
		}
		else{
			clearInterval(it);
			document.title = textOld;
			$(document).unbind('mousemove');
		}
	}, 500);
}

/*
	Name: loading
	Access type: public static
	Description:
		Manage loading page.
	Public static Properties:
		@id[string]: id of loading page.
		@content[string]: id of place contain loading content.
		@loadingText[string]: id of place display loading text.
		@loadingProcess[string]: id of place display loading process.
		@errorLoading[string]: id of place display loading error.
		@fistTimeLoading[boolean][string]: fistTimeLoading = true if it is the first time load library javascript.
	Public static function: 
		displayLoading: diplay loading page.
		hiddenLoaing: hidden loading page.
		displayCustomizeLoading: display loadding page with width, height.
		displayErrorLoading: display loading page with loading error.
		updateLoading: update loading content.
*/
var loading = {
	id: '#display-loading',
	content: "#content-loading",
	loadingText: '#loading-process-text',
	loadingProcess: '#loading-process',
	errorLoading:'#error-loading',
	fistTimeLoading: true,
	/*
		Name: displayLoading
		Parematers:
			none
		Returns:
			none
	*/
	displayLoading: function(){
		$(loading.id).removeClass('hd');
	},
	/*
		Name: updateLoading
		Parematers:
			@String parameter t - text display on loading page.
			@Int parameter total - total of list loading files.
			@Int parameter cur - index of current loading file.
		Returns:
			none
	*/
	updateLoading: function(t, total, cur){
		$(loading.loadingProcess).html(cur+"/"+total);
		if(t!== '')
			$(loading.loadingText).html(t);
		// text display: [content] current files/ total.
	},
	/*
		Name: hiddenLoading
		Parematers:
			none
		Returns:
			none
	*/
	hiddenLoading: function(){$(loading.id).addClass('hd');},
	displayCustomizeLoading: function(obj,total, cur){
		$(loading.id).css({
			width: $(obj).outerWidth(true) + "px",
			height: $(obj).outerHeight(true) + "px"
		});
		$(loading.content).css({
			top: '50%',
			left: '50%',
			marginLeft: -($(obj).outerWidth(true)/2) +'px',
			marginTop: -($(obj).outerHeight(true)/2) +'px'
		});
		$(loading.loadingProcess).html(cur+"/"+total);
		$(loading.id).removeClass('hd');
	},
	/*
		Name: displayErrorLoading
		Parematers:
			none
		Returns:
			none
	*/
	displayErrorLoading: function(text){
		$(loading.errorLoading).html(text);
	}
};
