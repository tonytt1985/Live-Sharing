/*
	Name: template_engine 
	Description: Base on configuration template file to load and display Interface.
	Access type: static
	Properties: 
		tmpls(json): Contain template objects.
	Functions:
		renderTemplate(tmpl, index): Create a template object and append to tmpls(json), load HTML source from template object path.
			Parameters: 
				tmpl(array): An array contain template object name will be loaded.
				index(int): Index of tmpl.
			returns: 
				true
		loadTemplate(index): Get active status (call getStatus function), remove template objects that are not in current status, and render template(call renderTemplate function).  
			Parameters:
				index(int): index of an array which contain name of template objects.
			return:
				none
		getStatus(): Get active status from configuration template file and add to a array.
			Parameters:
				none
			Returns:
				Array : An array which contain name of active status in tmpl_status variable(configuration template file).
		displayNotification(className, text): Display system notification to Interface.
			Parameters:
				className: Determine error, successful process, warning to display.
				text: content of notification.
			returns: 
				none
		initTemplate(): Init template with configuration template file.
			Parameters:
				none
			Return:
				none
*/
var template_engine = {
		listTmplStats: [],
		listTmpls: [],
		tmpls: {},
		renderTemplate: function(index){
			
			if(index < template_engine.listTmpls.length){
				template_engine.tmpls[template_engine.listTmpls[index]].appendHTML(index, function(i, flag){
					if(flag)
						i++;
					template_engine.renderTemplate(i);
				}, null);
			}
			else{
				if(!loading.fistTimeLoading)
					loading.hiddenLoading();
			}
		},
		displayNotification: function(className, text){
			//Check that notification template is available or not.
			if(template_engine.tmpls['main-notification'].getHtml() != ''){
				template_engine.tmpls['main-notification'].updateHtmlSource({'show': null,'className': null, 'text': null, 'loadingShow': '+hd'});
				template_engine.tmpls['main-notification'].updateHtmlSource({'show': '-hd','className': className, 'text': text, 'loadingShow': null});
			}
			else
				alert(text);
			var iv = setInterval(function(){
				template_engine.hiddenNotification();
				clearInterval(iv);
			}, 5000);
		},
		displayNotificationLoading: function(className, text){
			if(template_engine.tmpls['main-notification'].getHtml() != ''){
				template_engine.tmpls['main-notification'].updateHtmlSource({'show': '-hd','className': className, 'text': text, 'loadingShow': '-hd'});
			}
			else
				alert(text);
		},
		hiddenNotificationLoading: function(){
			if(template_engine.tmpls['main-notification'].getHtml() != '')
				template_engine.tmpls['main-notification'].updateHtmlSource({'show': '+hd','className': 'hd', 'text': null, 'loadingShow': '+hd'});
		},
		hiddenNotification: function(){
			if(template_engine.tmpls['main-notification'].getHtml() != '')
				template_engine.tmpls['main-notification'].updateHtmlSource({'show': '+hd','className': 'hd', 'text': null, 'loadingShow': null});
		},
		/*
			getStatus(): Get active status from configuration template file and add to a array.
			Parameters:
				none
			Returns:
				Array : An array which contain name of active status in tmpl_status variable(configuration template file).
			
		*/
		getStatus: function(){
			//Reset array which contain active status.
			template_engine.listTmplStats = [];
			//Browse template status configuration.
			$.each(tmpl_status, function(key, val){
				//If status == true, push name of status to an array.
				if(val.status){
					if(template_engine.listTmplStats.length >= 1){
						//Add and sort tmpl_status 
						if(tmpl_status[template_engine.listTmplStats[template_engine.listTmplStats.length - 1]].queue > val.queue){
							var temp = template_engine.listTmplStats.pop();
							template_engine.listTmplStats.push(key);
							template_engine.listTmplStats.push(temp);
						}
						else
							template_engine.listTmplStats.push(key);
					}
					else
						template_engine.listTmplStats.push(key);
				}
			});
		},
		loadTemplate: function(index, ob_index){
			//Remove template objects that aren't in current status.
			if(index === 0 && ob_index === 0){
				loading.displayLoading();
				loading.updateLoading("Load template files.", 0, 0);
				var listTmpl = [];
				for(var i =0; i < template_engine.listTmplStats.length; i++){
					listTmpl = listTmpl.concat([],tmpl_status[template_engine.listTmplStats[i]].objects);
				}
				var k = 0;
				$.each(template_engine.tmpls, function(key, value){
					var flag = false;
					for(var j = 0; j < listTmpl.length; j++){
						if(key === listTmpl[j]){
							k++
							flag = true;
						}
					}
					if(!flag){
						$(template_engine.tmpls[key].getName()).remove();
						delete template_engine.tmpls[key];
						for(var k = 0; k < template_engine.listTmpls.length; k++){
							if(template_engine.listTmpls[k] === key)
								template_engine.listTmpls.splice(k, 1);
						}
					}
				});
			}
			//Load or display template object in current status
			if(index < template_engine.listTmplStats.length){
				if(ob_index < tmpl_status[template_engine.listTmplStats[index]].objects.length){
					loading.updateLoading("Load template files of " + template_engine.listTmplStats[index] + ' :', tmpl_status[template_engine.listTmplStats[index]].objects.length, ob_index+1);
					//Check that template object had been loaded or not. If its done, the next template will be loaded 
					/*if(template_engine.renderTemplate(tmpl_status[template_engine.listTmplStats[index]].objects, 0)){
						index++;
						template_engine.loadTemplate(index);
					}*/
					//Create a template object
					var tmpl = tmpl_status[template_engine.listTmplStats[index]].objects;
					if(typeof(template_engine.tmpls[tmpl[ob_index]]) === 'undefined'){
						template_engine.tmpls[tmpl[ob_index]] = new template(tmpl_object[tmpl[ob_index]].id, tmpl_object[tmpl[ob_index]].path, tmpl_object[tmpl[ob_index]].parent, tmpl_object[tmpl[ob_index]].directive ,tmpl_object[tmpl[ob_index]].js,tmpl_object[tmpl[ob_index]].css, tmpl_object[tmpl[ob_index]].active, tmpl_object[tmpl[ob_index]].count);
						template_engine.listTmpls.push(tmpl[ob_index]);
						template_engine.tmpls[tmpl[ob_index]].loadTmpl(index, ob_index,function(i, o, flag){
							if(flag)
								o++;
							template_engine.loadTemplate(i, o);
						});
					}
					else{
						ob_index++;
						template_engine.loadTemplate(index, ob_index);
					}
				}
				else{
					index++;
					template_engine.loadTemplate(index, 0);
				}
			}
			else{
				//Sort template objects
				template_engine.sortTmpl();
				//Render template: append html, load js file and run the callback function on each template object. 
				template_engine.renderTemplate(0);
			}
		},
		//Sort list template object to make sure that templates will be displayed in order.
		sortTmpl: function(){
			if(template_engine.listTmpls.length > 1){
				for(var i = 0; i < template_engine.listTmpls.length ; i ++){
					for (var j = parseInt(i)+1; j < template_engine.listTmpls.length - 1; j++){
						if(template_engine.tmpls[template_engine.listTmpls[j]].getCount() > template_engine.tmpls[template_engine.listTmpls[j+ 1]].getCount()){
							var tmp = template_engine.listTmpls[j];
							template_engine.listTmpls[j] = template_engine.listTmpls[j+1]
							template_engine.listTmpls[j+1] = tmp;
						}

					}
				}
			}
		},
		loadingProcess: function(){
			if($('#loading-process').hasClass('hd'))
				$('#loading-process').removeClass('hd');
			else
				$('#loading-process').addClass('hd');
		},
		initTemplate: function(){
			//Get template active status.
			template_engine.getStatus();
			//Call the loadTemplate with the fist parameter is 0.(Recursive will be started)
			template_engine.loadTemplate(0, 0);
		}
};


/*
	Name: template
	Description:
		Init template object with properties.
		Load HTML resource, js file, css file and store to properties.
		Update data and properties for template object.
	Access type: public
	Properties:
		name (string) : Name of object(only get: getName()).
		path (array), : Path of HTML file which we load HTML source (only get: getPath()).
		parent(string): Parent name of object which HTML source will be appended.
		directive (json) : Mark tag name, selector name which it will be updated or replaced data. 
			note: directive = {key: value} => key: selector(tag name, id or class), value: name of data will be updated or replaced.
		js(array)	  : An array contain js path which Javascript source will be load for object template. 
		css(array)	  :	An array contain css path which css source will be load for object template.
		active(boolean): Determine that HTML source will be append or not. Display or remove HTML source if HTML source had been loaded.
		html (string) : Which contain HTML source after it had been loaded.
	Functions:
		constructor(name, path, parent, direct, js, css, active): create a new template object and init properties of template object.
		loadTmpl(): Load HTML source, js, css and append HTML source to HTML document if active property is true.
			Parameters: 
				none
			Returns: 
				none
		updateHtmlSource(data): update data to places which has been marked by directive property.
			Parameters:
				data(json): Contain places(as values of directive property) and values will be updated or replaced to selector which had been marked by directive.
			Returns: 
				none
		loadCss(data):Load css file for HTML source.
			Parameters:
				data(array): Contain list css path
			Returns: 
				none
		loadJs(data):Load js file for HTML source.
			Parameters: 
				data(array): Contain list js path 
			Returns:
				None
*/

var template = (function(){
	return function (name, path, parent, directive, js, css, active, count){
		var _name, _path, _parent, _directive, _html, _js, _active, _count;
		_name = name;
		_path = path;
		_parent = parent;
		_directive = directive;
		_js = js;
		_css = css
		_active = active;
		_html = '';
		_count = count;
		//Get name property.
		this.getName = function(){
			return _name;
		};

		//Get path property.
		this.getPath = function(){
			return _path;
		};

		//Set and get parent property.
		this.setParent = function(dt){
			_parent = dt;
			return this;
		};
		this.getParent = function(){
			return _parent;
		};

		//Set and get directive property.
		this.getDirective = function(){
			return _directive;
		};
		this.setDirective = function(dt){
			_directive = dt;
			return this;
		};
		//Get js property.
		this.getJs = function(){
			return _js;
		};

		//Get css property
		this.getCss = function(){
			return _css;
		};

		//Set and get html property.
		this.getHtml = function(){
			return _html;
		};
		this.setHtml = function(dt){
			_html = dt;
			return this;
		};

		this.getCount = function(){
			return _count;
		};
		this.setCount = function(dt){
			_count = dt;
			return this;
		};

		//Set and get active property
		this.getActive = function(){
			return _active;
		}
		this.setActive = function(dt){
			_active = dt;
			return this;
		}

		this.loadTmpl = function(i, o, callback){
			//Load HTML resource.
			var _this = this;
			$.ajax({
				url: _this.getPath(),
				context: document.body,
				cache: global_config.cache,
				error: function(data){
					template_engine.displayNotification(error.className, error.cannotLoadTemplate);
					callback(i, o, false);
				},
				success:function(data){
					_this.setHtml(data);
					callback(i, o, true);
				}
			});
		};
		this.loadJs = function(index, tmpl_index, callback){
			var _this = this;
			dt = this.getJs();
			loadJs(dt, 0, 0, tmpl_index, callback);
		};
		this.loadCss = function(){
			if(this.getCss().length > 0){
				for(var i in this.getCss()){
					$('head').append('<link>');
					css = $('head').children(':last');
					css.attr({
						rel: 'stylesheet',
						type: 'text/css',
						href: this.getCss()[i]
					});
				}
			}
			return true;
		};
		//Update HTML source via directive property.
		this.updateHtmlSource = function(dt){
			if(this.getDirective() != null){
				var _this = this;
				$.each(this.getDirective(),function(key, val){
					if(dt[val]!= null){
						var index = key.search(/@/);
						if(index != -1){
							if(key.search(/#/) != -1 || key.search(/./) != -1){
								var n = key.substring(0, index);
								if(n.replace('#', '') == _this.getName().replace('#', '') || $(_this.getName()).hasClass(n)){
									if(dt[val].charAt(0) == '+' && key.substring(index +1, key.length) == 'class')
										$(_this.getName()).addClass(dt[val].replace(dt[val].charAt(0), ''));
									else if(dt[val].charAt(0) == '-' && key.substring(index +1, key.length) == 'class')
										$(_this.getName()).removeClass(dt[val].replace(dt[val].charAt(0), ''));
									else 
										$(_this.getName()).attr(key.substring(index +1, key.length), dt[val]);
								}
								else{
									if(dt[val].charAt(0) == '+' && key.substring(index +1, key.length) == 'class')
										$(_this.getName()).find(n).addClass(dt[val].replace(dt[val].charAt(0), ''));
									else if(dt[val].charAt(0) == '-' && key.substring(index +1, key.length) == 'class'){
										$(_this.getName()).find(n).removeClass(dt[val].replace(dt[val].charAt(0), ''));
									}
									else
										$(_this.getName()).find(n).attr(key.substring(index +1, key.length), dt[val]);
								}

							}
							else{
								var n = key.substring(0, index);
								if(key.substring(index +1, key.length) == 'class'){
									if(dt[val].charAt(0) == '+')
										$(_this.getName()).find(n).addClass(dt[val].replace(dt[val].charAt(0), ''));
									else if(dt[val].charAt(0) == '-')
										$(_this.getName()).find(n).removeClass(dt[val].replace(dt[val].charAt(0), ''));
								}
								else if (key.substring(index +1, key.length) == 'val'){
									$(_this.getName()).find(n).val(dt[val]);
								}
								else
									$(_this.getName()).find(n).attr(key.substring(index +1, key.length), dt[val]);
							}
						}
						else{
							if($(_this.getName()).find(key).prop("tagName") !== 'INPUT'){
								$(_this.getName()).find(key).empty();
								$(_this.getName()).find(key).append(dt[val]);
							}else
								$(_this.getName()).find(key).val(dt[val]);
						}
					}
				});
			}
		};
		/*
			appendHTML(listTmpl): Append HTML source to parent element, and show/hidden template objects in list template that they are passed as a parameter .
			Parameters: 
			listTmpl(array): [{
				'type': '', // Type of list template, it must be ?all, parent, tmpl?
				'name': '', // It is an element class or id if type is ?parent? or ?tmpl?, null if type is ?all?
				'action': '' // show or hidden
			}]
			Returns:
			None
		*/
		this.appendHTML = function(index, callback, listObjTmpl){
			if(this.getActive()){
				$(this.getParent()).append(this.getHtml());
				this.setActive(false);
				if(this.getCss().length > 0){
					this.loadCss();
					if(this.getJs().length > 0)
						this.loadJs(0,index, callback);
					else
						callback(index, true);
				}
				else{
					if(this.getJs().length > 0)
						this.loadJs(0,index, callback);
					else
						callback(index, true);
				}
			}
			else
				callback(index, true);
			this.toggleTmpl(listObjTmpl);
		};
		/*
			removeHTML(listTmpl):  remove a template object and its HTML source on Interface , and show/hidden template objects in list template that they are passed as a parameter .
			Parameters: 
			listTmpl(array): [{
				'type': '', // Type of list template, it must be ?all, parent, tmpl?
				'name': '', // It is an element class or id if type is ?parent? or ?tmpl?, null if type is ?all?
				'action': '' // show or hidden
			}]
			Returns:
			None
		*/
		this.removeHTML = function(listObjTmpl){
			$(this.getName()).remove();
			delete this;
			this.toggleTmpl(listObjTmpl);
		};
		this.toggleTmpl = function(listObjTmpl){
			if(arguments.length >= 1 && listObjTmpl !== null && listObjTmpl.length >= 0)
			{
				for(var i in listObjTmpl){
					if(listObjTmpl[i].type === 'all'){
						var _this = this;
						$.each(template_engine.tmpls, function(key, val){
							if(template_engine.tmpls[key].getParent() === _this.getParent()){
								if(listObjTmpl[i].action ==='hidden')
									$(template_engine.tmpls[key].getName()).addClass('hd');
								else if(listObjTmpl[i].action ==='display')
									$(template_engine.tmpls[key].getName()).removeClass('hd');
							}
						});
					}
					else if (listObjTmpl[i].type ==='parent'){
						$.each(template_engine.tmpls, function(key, val){
							if(template_engine.tmpls[key].getParent() === listObjTmpl[i].name){
								if(listObjTmpl[i].action ==='hidden')
									$(template_engine.tmpls[key].getName()).addClass('hd');
								else if(listObjTmpl[i].action ==='display')
									$(template_engine.tmpls[key].getName()).removeClass('hd');
							}
						});
					}
					else if (listObjTmpl[i].type ==='tmpl'){
						$.each(template_engine.tmpls, function(key, val){
							if(template_engine.tmpls[key].getName() === listObjTmpl[i].name){
								if(listObjTmpl[i].action === 'hidden')
									$(template_engine.tmpls[key].getName()).addClass('hd');
								else if(listObjTmpl[i].action === 'display')
									$(template_engine.tmpls[key].getName()).removeClass('hd');
							}
						});
					}
				}
			}
		};
	};
})();