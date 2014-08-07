/*
	Name: objLog
	Access type: public
	Description: 
		Create a object Log
		Update content, timer.
		This object will be saved to log file.
	Private properties:
		@name: log name
		@content: log content
		@timing: log time.
		@htmlLog: show log with html.
	Private functions:
		setName: set log name
		getName: get log name
		setContent: set log content
		getContent: get log content
		setTiming: set log time
		getTiming: get log time
		setHtmlLog: create log content by html
		getHtmlLog: get html log
*/
var objLog = (function(){
	return function(name, content, timing){
		var _name, _content, _timing, _htmlLog;
		_name = name;
		_content = content;
		_timing = timing;
		_htmlLog = null;
		/*
			Parameters:
				@string parameter name: log name
			Return
				true
		*/
		this.setName = function(name){
			_name = name;
			return true;
		};
		/*
			Parameters:
				none
			Returns:
				name
		*/
		this.getName = function(){
			return _name;
		};
		/*
			Parameters:
				@string parameter content: log content
			Return
				true
		*/
		this.setContent = function(content){
			_content = content;
			return true;
		};
		/*
			Parameters:
				none
			Returns:
				content
		*/
		this.getContent = function(){
			return _content;
		};
		/*
			Parameters:
				@Int parameter timing: log time
			Returns:
				true
		*/
		this.setTiming = function(timing){
			_timing = timing;
			return true;
		};
		/*
			Parameters:
				none
			Returns:
				timing
		*/
		this.getTiming = function(){
			return _timing;
		};
		/*
			Parameters:
				none
			Returns:
				true
		*/
		this.setHtmlLog = function(){
			var div = $('<div></div>');
			//Format time
			var time = Math.floor(parseInt(new Date().getTime()) - parseInt(this.getTiming()));
			if(time < 60000)
				_htmlLog = div.append('<span>'+this.getName()+'</span><span> '+this.getContent() +'</span><span class="log-timing">'+textDisplay.justNow+'</span>');
			else
				_htmlLog = div.append('<span>'+this.getName()+'</span><span> '+this.getContent() +'</span><span class="log-timing"> '+Math.floor(time/60000) +' '+ textDisplay.minsAgo+'</span>');
			return true;
		};
		/*
			Parameters:
				none
			Returns:
				htmlLog
		*/
		this.getHtmlLog = function(){
			return _htmlLog;
		};
	};
})();

/*
	Name: sysLog
	Access type: Public Static
	Description:
		Store, view, update log system.
	Public static properties:
		@listLog[array]: contain log object
		@wrapSysLog[string]: id of place contain log.
	Public static functions:
		viewSysLog: view list log on interface
		updateSysLog: upadte list log on interface.
*/
var sysLog = {
	listLog: [],
	wrapSysLog: null,
    loading: null,
	/*
		Parameters:
			None
		Returns:
			None
	*/
	viewSysLog: function(){
		//Empty log container.
		sysLog.wrapSysLog.empty();
		var index = sysLog.listLog.length - global_config.maxNotiShow;
		//Append list log(html) to log container.
		if(index < 1){
			for(var i = sysLog.listLog.length - 1; i >= 0; i-- ){
				sysLog.listLog[i].setHtmlLog();
				sysLog.wrapSysLog.append(sysLog.listLog[i].getHtmlLog());
			}
		}else{
			for(var i = sysLog.listLog.length - 1; i >= index; i--){
				sysLog.listLog[i].setHtmlLog();
				sysLog.wrapSysLog.append(sysLog.listLog[i].getHtmlLog());
			}
		}
	},
	/*
		Parameter:
			None
		Returns:
			None
	*/
	updateSysLog: function(){
		for(var i in sysLog.listLog){
			//Update log html content.(time)
			sysLog.listLog[i].setHtmlLog();
		}
	} ,
    showLoading: function(){
        sysLog.loading.removeClass('hd');
    },
    hiddenLoading: function(){
        sysLog.loading.addClass('hd');
    }
};