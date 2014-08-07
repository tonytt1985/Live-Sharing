(function($) {
    
    $.loadingDot = function(el, options) {
        
        var base = this;
        
        base.$el = $(el);
                
        base.$el.data("loadingDot", base);
        
        base.dotItUp = function($element, maxDots) {
            if (base.$dots.text().length == base.options.maxDots) {
                base.$dots.text("");
            } else {
                base.$dots.append(".");
            }
        };
        
        base.stopInterval = function() {    
            clearInterval(base.theInterval);
        };
        
        base.init = function() {
        
            if ( typeof( speed ) === "undefined" || speed === null ) speed = 300;
            if ( typeof( maxDots ) === "undefined" || maxDots === null ) maxDots = 3;
            
            base.speed = speed;
            base.maxDots = maxDots;
                                    
            base.options = $.extend({},$.loadingDot.defaultOptions, options);
                        
            base.$el.html("" + base.options.word + "<em></em>");
            
            base.$dots = base.$el.find("em");
            base.$loadingText = base.$el.find("span");
            
            base.$el.css("position", "relative");
                                    
            base.theInterval = setInterval(base.dotItUp, base.options.speed, base.$dots, base.options.maxDots);
            
        };
        
        base.init();
    
    };
    
    $.loadingDot.defaultOptions = {
        speed: 300,
        maxDots: 3,
        word: "Loading"
    };
    
    $.fn.loadingDot = function(options) {
        
        if (typeof(options) == "string") {
            var safeGuard = $(this).data('loadingDot');
			if (safeGuard) {
				safeGuard.stopInterval();
			}
        } else { 
            return this.each(function(){
                (new $.loadingDot(this, options));
            });
        } 
        
    };
    
})(jQuery);