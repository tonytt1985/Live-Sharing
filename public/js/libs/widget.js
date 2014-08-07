/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 5/29/13
 * Time: 11:49 AM
 * To change this template use File | Settings | File Templates.
 */


/**
 * Customer widget
 * @param {json} _config Configuration of customer widget.
 * @constructor
 */
function widget(_config) {

    this.config = _config;
    /**
     * Global jQuery object of customer widget
     * @type {object}
     */
    this.jQuery = null;
    /**
     * URL of customer widget content
     * @type {string}
     */
    this.url = "/public/";
};
/**
 * Init customer widget
 */
widget.prototype.init = function(){
    //Implement Roboto Condensed font for customer widget.
    var css_link_font = document.createElement('link');
    css_link_font.setAttribute("rel", "stylesheet");
    css_link_font.setAttribute("type", "text/css");
    css_link_font.setAttribute("href", "//fonts.googleapis.com/css?family=Roboto+Condensed:300,700&apos");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(css_link_font);
    //Init javascript library.
    this.initJsLibs();
};
/**
 * Init javascript library.
 */
widget.prototype.initJsLibs = function(){
    var _this = this;
    //Create script tag to append.
    var script_tag = document.createElement('script');
    //Load jQuery version 1.9.1 for customer widget
    if(window.jQuery === undefined || window.jQuery.fn.jquery !== '1.9.1'){ // If jQuery 1.9.1 hasn't loaded.
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src","//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js");
        if(script_tag.readyState){
            script_tag.onreadystatechange = function(){   // For old versions of IE
                if(this.readyState == 'complete' || this.readyState == 'loaded'){
                    _this.scriptLoadHandler();
                }
            };
        }
        else{ // Other browsers
            script_tag.onload = function(){
                _this.scriptLoadHandler();
            };
        }
    } else {//If jQuery 1.9.1 has loaded.
        jQuery.getScript(this.url + 'js/libs/jquery.cookie.js', function () {
            _this.jQuery = window.jQuery;
            _this.createWidgetContent();
        });

    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
};

widget.prototype.initCss = function(){
    var _this = this;
    var css_link = _this.jQuery("<link>", {
        rel: "stylesheet",
        type: "text/css",
        href: _this.url + "css/cust_widget_collapse.css"
    });
    css_link.appendTo('head');
};
/**
 * Restore $ and window.jQuery to their previous values and store the
 * new jQuery in our local jQuery variable and create widget content.
 */
widget.prototype.scriptLoadHandler = function(){
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    var _this = this;
    jQuery.getScript(this.url + 'js/libs/jquery.cookie.js', function(){
        _this.jQuery = window.jQuery.noConflict(true);
        //Create widget content
        _this.createWidgetContent();
    });

};
/**
 * Create widget content
 */
widget.prototype.createWidgetContent = function(){
    var _this = this;
    this.initCss();
    var container = _this.jQuery('<div id="'+_this.config.containerId+'" class="widget-collapse widget-collapse-normal"></div>');
    var btnCollapse = _this.jQuery('<a id="collapse-widget-btn" href="#"></a>').append(' <span class="fs18 fw600">live chat </span><span>with experts </span>');
    var btnExpand = _this.jQuery('<a id="expand-widget-btn" href="#"></a>').append('<img width="55" height="20" src="'+_this.url+'images/cust-widget/close_btn.png"/>');
    var content = _this.jQuery('<div id="noivado-widget-content"></div>');
    var frame = _this.jQuery('<iframe src="'+_this.url+'cust-widget.html" width="360" scrolling="no" frameBorder="no" id="frame-widget"></iframe>');
    frame.load(function () {
        _this.jQuery('#frame-widget').contents().find('body').bind('DOMSubtreeModified', function () {
            _this.jQuery('#frame-widget').attr('height', _this.jQuery('#frame-widget').contents().find('body').height());
        });
        if (_this.jQuery.cookie('collapse') !== undefined) {
            btnCollapse.click();
        }
        _this.jQuery('#frame-widget').contents().load(function(){
            if (_this.jQuery.cookie('collapse') !== undefined) {
                btnExpand.click();
            }
        });
    });
    if(this.config.locationRight)
        container.css({'top': this.config.posY, 'right': this.config.posX});
    else
        container.css({'bottom': this.config.posY, 'right': this.config.posX});
    container.append(btnCollapse).append(btnExpand).append(content.append(frame));
    btnCollapse.bind('click', function(){
        _this.jQuery('#noivado-widget-content, #expand-widget-btn').css('display', 'block');
        _this.jQuery(this).css('display', 'none');
        _this.jQuery('#noivado-widget-container').removeClass('widget-collapse')
            .addClass('widget-expand');
        _this.jQuery('#noivado-widget-container').removeClass('widget-collapse-normal');
        _this.jQuery('#frame-widget').attr('height',_this.jQuery('#frame-widget').contents(_this.jQuery('body')).height());
        _this.jQuery.cookie('collapse', 'false');
    });

    btnExpand.bind('click', function(){
        _this.jQuery('#collapse-widget-btn').css('display', 'block');
        _this.jQuery(this).css('display', 'none');
        _this.jQuery('#noivado-widget-content').css('display', 'none');
        _this.jQuery('#noivado-widget-container').removeClass('widget-expand')
            .addClass('widget-collapse');
        _this.jQuery.removeCookie('collapse');
    });
    container.hover(function () {
        if (_this.jQuery(this).hasClass('widget-collapse'))
            _this.jQuery(this).removeClass('widget-collapse-normal');
    }, function () {
        if (_this.jQuery(this).hasClass('widget-collapse'))
            _this.jQuery(this).addClass('widget-collapse-normal');

    });
    _this.jQuery('body').append(container);
};
