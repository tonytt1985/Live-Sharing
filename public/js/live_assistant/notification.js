/*
	Name: objNotification
	Description: 
		Create a object notification
		Update content, timer.
		This object will be saved to log file.
	Access type: public
*/

var objNoti = (function(){
	return function(name, content, timer){
		var _name, _content, _timing, html;
		_name = name;
		_content = content;
		_timing = timing;
		_htmlNoti = null;
		this.setName = function(name){
			_name = name;
			return true;
		};
		this.getName = function(){
			return _name;
		};
		this.setContent = function(content){
			_content = content;
			return true;
		};
		this.getContent = function(){
			return _content;
		};
		this.setTiming = function(timing){
			_timing = timing;
			return true;
		};
		this.getTiming = function(){
			return _timing;
		};
		this.setHtmlNoti = function(){
			var div = $('<div></div>');
			var time = Math.floor(parseInt(new Date().getTime()) - parseInt(this.timing));
			if(time < 60000)
				_html = div.append('<span class="log-name">'+this.getName()+'</span><span> '+this.getContent() +'</span><span class="log-timing">'+textDisplay.justNow+'</span>');
			else
				_html = div.append('<span class="log-name">'+this.getName()+'</span><span> '+this.getContent() +'</span><span class="log-timing"> '+Math.floor(time/60000) +' '+ textDisplay.minsAgo+'</span>');
			return true;
		};
		this.getHtmlNoti = function(){
			return _html;
		};
	}
});
var sysNoti = {
	listNoti: [],
	wrapSysNoti: null,
	loadingBar: null,
	loadingContent: null,
	viewSysNoti: function(){
		sysNoti.wrapSysNoti.empty();
		var index = sysNoti.listNoti.length - global_config.maxNotiShow;
		if(index > 0){
			for(var i in sysNoti.listNoti)
				sysNoti.wrapSysNoti.append(sysNoti.listNoti[i].getHtmlNoti());
		}else{
			for(var i = index - 1; i < sysNoti.listNoti.length; i++)
				sysNoti.wrapSysNoti.append(sysNoti.listNoti[i].getHtmlNoti());
		}
	},
	updateSysNoti: function(){
		for(var i in sysNoti.listNoti){
			sysNoti.listNoti[i].setHtmlNoti();
		}
		sysNoti.viewSysNoti();
	}
};