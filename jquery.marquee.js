/**
 * jQuery.marquee - scrolling text like old marquee element
 * @author Original: Aamir Afridi - aamirafridi(at)gmail(dot)com | Current: Deggial
 */

(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(jQuery);
  }
}
(function($) {
    $.fn.marquee = function(options) {
        return this.each(function() {
            // Extend the options if any provided
            var o = $.extend({}, $.fn.marquee.defaults, options),
                data = 
                {
                    marquee:
                    {
                        container:{element:null, width:0, height:0},
                        outerWrapper:{element:null, width:0, height:0, animationCss: ""},
                        innerWrapper:{element:null, width:0, height:0},
                        animation: {css:"", loopCounter:3, cssPlayState:"animation-play-state", cssAnimationSupport:false, cssAnimationName:"", cssAnimationString:"animation", cssKeyframeString:""},
                        isVertical:false
                        
                    }
                    
                };
			var marquee = data.marquee;
			marquee.container.element = $(this);
                
                

                // Private methods
                var _prefixedEvent = function(element, type, callback) {
                    var pfx = ["webkit", "moz", "MS", "o", ""];
                    for (var p = 0; p < pfx.length; p++) {
                        if (!pfx[p]) type = type.toLowerCase();
                        element.addEventListener(pfx[p] + type, callback, false);
                    }
                };

                var _objToString = function(obj) {
                    var tabjson = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            tabjson.push(p + ":" + obj[p]);
                        }
                    }
                    tabjson.push();
                    return "{" + tabjson.join(",") + "}";
                };

                var _startAnimationWithDelay = function() {
                    marquee.container.element.timer = setTimeout(animate, o.delayBeforeStart);
                };

                // Public methods
                var methods = {
                    pause: function() {
                        if (marquee.animation.cssAnimationSupport && o.allowCss3Support) {
                            marquee.outerWrapper.element.css(marquee.animation.cssPlayState, "paused");
                        } else {
                            // pause using pause plugin
                            if ($.fn.pause) {
                                marquee.outerWrapper.element.pause();
                            }
                        }
                        // save the status
                        marquee.container.element.data("runningStatus", "paused");
                        // fire event
                        marquee.container.element.trigger("paused");
                    },

                    resume: function() {
                        // resume using css3
                        if (marquee.animation.cssAnimationSupport && o.allowCss3Support) {
                            marquee.outerWrapper.element.css(marquee.animation.cssPlayState, "running");
                        } else {
                            // resume using pause plugin
                            if ($.fn.resume) {
                                marquee.outerWrapper.element.resume();
                            }
                        }
                        // save the status
                        marquee.container.element.data("runningStatus", "resumed");
                        // fire event
                        marquee.container.element.trigger("resumed");
                    },

                    toggle: function() {
                        methods[marquee.container.element.data("runningStatus") === "resumed" ? "pause" : "resume"]();
                    },

                    destroy: function() {
                        // Clear timer
                        clearTimeout(marquee.container.element.timer);
                        // Unbind all events
                        marquee.container.element.find("*").addBack().off();
                        // Just unwrap the elements that has been added using this plugin
                        marquee.container.element.html(marquee.container.element.find(".js-marquee:first").html());
                    }
                };
            
            var _processDataAttributes = function()
            {
                 /* Check if element has data attributes. They have top priority
                   For details https://twitter.com/aamirafridi/status/403848044069679104 - Can't find a better solution :/
                   jQuery 1.3.2 doesn't support $.data().KEY hence writting the following */
                var attr;
                $.each(o, function(key) {
                    // Check if element has this data attribute
                    attr = marquee.container.element.attr("data-" + key);
                    if (typeof attr !== "undefined") {
                        // Now check if value is boolean or not
                        switch (attr) {
                            case "true":
                                attr = true;
                                break;
                            case "false":
                                attr = false;
                                break;
                        }
                        o[key] = attr;
                    }
                });
            };
            
            var _initVertical = function()
            {
                marquee.container.height = marquee.container.element.height();
                marquee.outerWrapper.element.removeAttr("style");
                marquee.container.element.height(marquee.container.height);
                    
                // Change the CSS for js-marquee element
                marquee.container.element.find(".js-marquee").css({
                        "float": "none",
                        "margin-bottom": o.gap,
                        "margin-right": 0
                });
                    
                // Remove bottom margin from 2nd element if duplicated
                switch(o.duplicated)
                {
                    case true:
                        marquee.container.element.find(".js-marquee:last").css({"margin-bottom": 0});
                        break;
                }
                    
                marquee.innerWrapper.height = marquee.container.element.find(".js-marquee:first").height() + o.gap;
                    
                // adjust the animation duration according to the text length
                switch(o.startVisible && !o.duplicated)
                {
                    case true:
                        // Compute the complete animation duration and save it for later reference
                        // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
                        o._completeDuration = ((parseInt(marquee.innerWrapper.height, 10) + parseInt(marquee.container.height, 10)) / parseInt(marquee.container.height, 10)) * o.duration;
        
                        // formula is to: (Height of the text node / height of the main container) * duration
                        o.duration = (parseInt(marquee.innerWrapper.height, 10) / parseInt(marquee.container.height, 10)) * o.duration;
                        break;
                            
                    case false:
                        // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
                        o.duration = ((parseInt(marquee.innerWrapper.height, 10) + parseInt(marquee.container.height, 10)) / parseInt(marquee.container.height, 10)) * o.duration;
                        break;
                }
            };
            
            var _initHorizontal = function()
            {
                // Save the width of the each element so we can use it in animation
                marquee.innerWrapper.width = marquee.container.element.find(".js-marquee:first").width() + o.gap;
                    
                // container width
                marquee.container.width = marquee.container.element.width();
    
                // adjust the animation duration according to the text length
                switch(o.startVisible && !o.duplicated)
                {
                    case true:
                        // Compute the complete animation duration and save it for later reference
                        // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
                        o._completeDuration = ((parseInt(marquee.innerWrapper.width, 10) + parseInt(marquee.container.width, 10)) / parseInt(marquee.container.width, 10)) * o.duration;
        
                        // (Width of the text node / width of the main container) * duration
                        o.duration = (parseInt(marquee.innerWrapper.width, 10) / parseInt(marquee.container.width, 10)) * o.duration;
                        break;
                            
                    case false:
                        // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
                        o.duration = ((parseInt(marquee.innerWrapper.width, 10) + parseInt(marquee.container.width, 10)) / parseInt(marquee.container.width, 10)) * o.duration;
                        break;
                }
            };
            
            var _initCss3Support = function()
            {
                if (o.allowCss3Support) {
                    var elm = document.body || document.createElement("div");
                        marquee.animation.cssAnimationName = "marqueeAnimation-" + Math.floor(Math.random() * 1e7);
                        var domPrefixes = "Webkit Moz O ms Khtml".split(" ");
    
                    // Check css3 support
                    if (typeof elm.style.animation !== "undefined") {
                        marquee.animation.cssKeyframeString = "@keyframes " + marquee.animation.cssAnimationName + " ";
                        marquee.animation.cssAnimationSupport = true;
                    }
    
                    if (marquee.animation.cssAnimationSupport === false) {
                        for (var i = 0; i < domPrefixes.length; i++) {
                            if (typeof elm.style[domPrefixes[i] + "marquee.animation.cssAnimationName"] !== "undefined") {
                                var prefix = "-" + domPrefixes[i].toLowerCase() + "-";
                                marquee.animation.cssAnimationString = prefix + marquee.animation.cssAnimationString;
                                marquee.animation.cssPlayState = prefix + marquee.animation.cssPlayState;
                                marquee.animation.cssKeyframeString = "@" + prefix + "keyframes " + marquee.animation.cssAnimationName + " ";
                                marquee.animation.cssAnimationSupport = true;
                                break;
                            }
                        }
                    }
    
                    if (marquee.animation.cssAnimationSupport) {
                        marquee.animation.css = marquee.animation.cssAnimationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s infinite " + o.css3easing;
                        marquee.container.element.data("css3AnimationIsSupported", true);
                    }
                }
            };
            
            var _generateCssData = function(property,value,prefix,suffix)
            {
                prefix = prefix || "";
                suffix = suffix || "";
                var data = {"property" : "", "value" : ""};
                data.property = property;
                value = prefix.concat(value,suffix);
                data.value = value;
                return data;
            };
            
            var _generateAnimationCss = function(value, vertical)
            {
                vertical = vertical || false;
                var data = marquee.animation.cssAnimationSupport ? (vertical ? _generateCssData("transform", value, "translateY(", ")") : _generateCssData("transform", value, "translateX(", ")")) : (vertical ? _generateCssData("margin-top", value) : _generateCssData("margin-left", value));
                var property = data.property;
                value = data.value;
                var obj = {};
                obj[property] = value;
                return obj;
            };
            
            var _setElementCss = function(element, value, vertical)
            {
                vertical = vertical || false;
                var data = marquee.animation.cssAnimationSupport ? (vertical ? _generateCssData("transform", value, "translateY(" , ")") : _generateCssData("transform", value, "translateX(" , ")")) : (vertical ? _generateCssData("margin-top", value) : _generateCssData("margin-left", value));
                element.css(data.property, data.value);
            };
            
            var _adjustAnimation = function()
            {
                if (marquee.animation.css)
                {
                    marquee.animation.cssAnimationName = marquee.animation.cssAnimationName + "0";
                    marquee.animation.cssKeyframeString = $.trim(marquee.animation.cssKeyframeString) + "0 ";
                    marquee.animation.css = marquee.animation.cssAnimationName + " " + o.duration / 1000 + "s 0s infinite " + o.css3easing;
                }
                
            };
            
            var _adjustAnimationDelay = function()
            {
                if (marquee.animation.css) {
                    marquee.animation.css = marquee.animation.cssAnimationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
                }  
            };
            
            var _setInfiniteAnimation = function()
            {
                // Set the duration for the animation that will run forever
                o.duration = o._completeDuration;
                // Adjust the css3 animation as well
                _adjustAnimation();  
            };
            
            var _resetAnimation = function()
            {
                o.duration = o._originalDuration;
                // Adjust the css3 animation as well
                _adjustAnimation();  
            };
            

            var _rePositionVertically = function() {
                _setElementCss(marquee.outerWrapper.element, (o.direction === "up" ? marquee.container.height + "px" : "-" + marquee.innerWrapper.height + "px"), true);
            },
            _rePositionHorizontally = function() {
                _setElementCss(marquee.outerWrapper.element, (o.direction === "left" ? marquee.container.width + "px" : "-" + marquee.innerWrapper.width + "px"));
            };
            
            var _prepareAnimateDuplicated = function()
            {
                switch(o.duplicated)
                {
                    case true:
                        // When duplicated, the first loop will be scroll longer so double the duration
                        if (marquee.animation.loopCounter === 1)
                        {
                            o._originalDuration = o.duration;
                            if (marquee.isVertical)
                            {
                                o.duration = o.direction === "up" ? o.duration + (marquee.container.height / ((marquee.innerWrapper.height) / o.duration)) : o.duration * 2;
                            }
                            else
                            {
                                o.duration = o.direction === "left" ? o.duration + (marquee.container.width / ((marquee.innerWrapper.width) / o.duration)) : o.duration * 2;
                            }
                            // Adjust the css3 animation as well
                            if (marquee.animation.css) {
                                marquee.animation.css = marquee.animation.cssAnimationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
                            }
                            marquee.animation.loopCounter++;
                        }
                        // On 2nd loop things back to normal, normal duration for the rest of animations
                        else if (marquee.animation.loopCounter === 2)
                        {
                            _resetAnimation();
                            marquee.animation.loopCounter++;
                        }
                        break;
                }
            };
            
            var _prepareAnimateVertical = function()
            {
                switch(true)
                {
                    case o.duplicated:
                        // Adjust the starting point of animation only when first loops finishes
                        if (marquee.animation.loopCounter > 2) {
                            _setElementCss(marquee.outerWrapper.element, (o.direction === "up" ? 0 : "-" + marquee.innerWrapper.height + "px"), true);
                        }
                                
                        marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "up" ? "-" + marquee.innerWrapper.height + "px" : 0), true);
                        break;
                                
                    case o.startVisible:
                                
                        switch(marquee.animation.loopCounter)
                        {
                            // This loop moves the marquee out of the container
                            case 2:
                                // Adjust the css3 animation as well
                                _adjustAnimationDelay();
                                        
                                marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "up" ? "-" + marquee.innerWrapper.height + "px" : marquee.container.height + "px"), true);
                                marquee.animation.loopCounter++;
                                break;
                                        
                            case 3:
                                // Set the duration for the animation that will run forever
                                _setInfiniteAnimation();
                                _rePositionVertically();
                                break;
                        }
                        break;
                                
                    default:
                        _rePositionVertically();
                        marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "up" ? "-" + (marquee.outerWrapper.element.height()) + "px" : marquee.container.height + "px"), true);
                }
            };
            
            var _prepareAnimateHorizontal = function()
            {
                switch(true)
                {
                    case o.duplicated:
                        // Adjust the starting point of animation only when first loops finishes
                        if (marquee.animation.loopCounter > 2) {
                            _setElementCss(marquee.outerWrapper.element, (o.direction === "left" ? 0 : "-" + marquee.innerWrapper.width + "px"));
                        }
        
                        marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "left" ? "-" + marquee.innerWrapper.width + "px" : 0));
                        break;
                                
                    case o.startVisible:
                        o.duration = o._originalDuration;
                        switch(marquee.animation.loopCounter)
                        {
                            // This loop moves the marquee out of the container
                            case 2:
                                // Adjust the css3 animation as well
                                _adjustAnimationDelay();
                                        
                                marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "left" ? "-" + marquee.innerWrapper.width + "px" : marquee.container.width + "px"));
                                marquee.animation.loopCounter++;
                                break;
                                        
                            case 3:
                                // Set the duration for the animation that will run forever
                                _setInfiniteAnimation();
                                _rePositionHorizontally();
                                break;
                        }
                        break;
                                
                    default:
                        _rePositionHorizontally();
                        marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "left" ? "-" + marquee.innerWrapper.width + "px" : marquee.container.width + "px"));
                        break;
                }
            };
            
            var _prepareAnimate = function()
            {
                _prepareAnimateDuplicated();
                
                switch(marquee.isVertical)
                {
                    //Vertical Direction
                    case true:
                        _prepareAnimateVertical();
                        break;
                        
                    //Horizontal Direction
                    default:
                        _prepareAnimateHorizontal();
                        break;
                }
            };
            
            var _doAnimate = function()
            {
                // If css3 support is available than do it with css3, otherwise use jQuery as fallback
                switch(marquee.animation.cssAnimationSupport)
                {
                    case true:
                        // Add css3 animation to the element
                        marquee.outerWrapper.element.css(marquee.animation.cssAnimationString, marquee.animation.css);
                        var keyframeCss = marquee.animation.cssKeyframeString + " { 100%  " + _objToString(marquee.outerWrapper.animationCss) + "}",
                             $styles = marquee.outerWrapper.element.find("style");
    
                        // Now add the keyframe animation to the marquee element
                        if ($styles.length !== 0) {
                            // Bug fixed for jQuery 1.3.x - Instead of using .last(), use following
                            $styles.filter(":last").html(keyframeCss);
                        } else {
                            $("head").append("<style>" + keyframeCss + "</style>");
                        }
    
                        // Animation iteration event
                        _prefixedEvent(marquee.outerWrapper.element[0], "AnimationIteration", function() {
                            marquee.container.element.trigger("finished");
                        });
                        // Animation stopped
                        _prefixedEvent(marquee.outerWrapper.element[0], "AnimationEnd", function() {
                            animate();
                            marquee.container.element.trigger("finished");
                        });
                        break;
                        
                    default:
                        // Start animating
                        marquee.outerWrapper.element.animate(marquee.outerWrapper.animationCss, o.duration, o.easing, function() {
                            // fire event
                            marquee.container.element.trigger("finished");
                            // animate again
                            if (o.pauseOnCycle) {
                                _startAnimationWithDelay();
                            } else {
                                animate();
                            }
                        });
                        break;
                }
            };

            // Animate recursive method
            var animate = function() {
                
                _prepareAnimate();

                // fire event
                marquee.container.element.trigger("beforeStarting");

                _doAnimate();
                
                // save the status
                marquee.container.element.data("runningStatus", "resumed");
            };
            
            var _init = function()
            {
                var totalWidth = 0;
                marquee.container.element.children().each(function(){
                    totalWidth += marquee.container.element.outerWidth( true );
                });

                _processDataAttributes();
    
                // Reintroduce speed as an option. It calculates duration as a factor of the container width
                // measured in pixels per second.
                if (o.speed) {
                    o.duration = parseInt(marquee.container.element.width(), 10) / o.speed * 1000;
                }
    
                // Shortcut to see if direction is upward or downward
                marquee.isVertical = o.direction === "up" || o.direction === "down";
    
                // no gap if not duplicated
                o.gap = o.duplicated ? parseInt(o.gap, 10) : 0;
    
                // wrap inner content into a div
                marquee.container.element.wrapInner("<div class='js-marquee'></div>");
    
                // Make copy of the element
                var $el = marquee.container.element.find(".js-marquee").css({
                    "margin-right": o.gap,
                    "float": "left"
                });
                
                totalWidth += (marquee.container.element.width() + 1000);
    
                if (o.duplicated) {
                    $el.clone(true).appendTo(marquee.container.element);
                    totalWidth *= 2;
                }
    
                // wrap both inner elements into one div
                marquee.container.element.wrapInner("<div style='width:" + totalWidth + "px' class='js-marquee-wrapper'></div>");
    
                // Save the reference of the wrapper
                marquee.outerWrapper.element = marquee.container.element.find(".js-marquee-wrapper");
                
                marquee.outerWrapper.element.css("will-change", "transform");
    
                // If direction is up or down, get the height of main element
                
                switch (marquee.isVertical)
                {
                    //Vertical Direction
                    case true:
                        _initVertical();
                        
                        break;
                        
                    //Horizontal Direction
                    case false:
                        _initHorizontal();
                        break;
                }
    
                // if duplicated then reduce the duration
                if (o.duplicated) {
                    o.duration = o.duration / 2;
                }
    
                _initCss3Support();
                
                switch (true)
                {
                    case o.duplicated:
                        // if duplicated option is set to true than position the wrapper
                        switch(marquee.isVertical)
                        {
                            case true:
                                o.startVisible ? _setElementCss(marquee.outerWrapper.element, 0, true) : _setElementCss(marquee.outerWrapper.element, (o.direction === "up" ? marquee.container.height + "px" : "-" + ((marquee.innerWrapper.height * 2) - o.gap) + "px"), true);
                                break;
                                
                            default:
                                o.startVisible ? _setElementCss(marquee.outerWrapper.element, 0) : _setElementCss(marquee.outerWrapper.element, (o.direction === "left" ? marquee.container.width + "px" : "-" + ((marquee.innerWrapper.width * 2) - o.gap) + "px"));
                                break;
                        }
        
                        // If the text starts out visible we can skip the two initial loops
                        marquee.animation.loopCounter = o.startVisible ? marquee.animation.loopCounter : 1;
                        break;
                        
                    case o.startVisible:
                        // We only have two different loops if marquee is duplicated and starts visible
                        marquee.animation.loopCounter = 2;
                        break;
                        
                    default:
                        marquee.isVertical ? _rePositionVertically() : _rePositionHorizontally();
                        break;
                }
            };
            
            // Check for methods
            if (typeof options === "string") {
                if ($.isFunction(methods[options])) {
                    // Following two IF statements to support public methods
                    if (!marquee.outerWrapper.element) {
                        marquee.outerWrapper.element = marquee.container.element.find(".js-marquee-wrapper");
                    }
                    if (marquee.container.element.data("css3AnimationIsSupported") === true) {
                        marquee.animation.cssAnimationSupport = true;
                    }
                    methods[options]();
                }
                return;
            }
            
            _init();

            // bind pause and resume events
            marquee.container.element.on("pause", methods.pause);
            marquee.container.element.on("resume", methods.resume);

            if (o.pauseOnHover) {
                marquee.container.element.on("mouseenter", methods.pause);
                marquee.container.element.on("mouseleave", methods.resume);
            }

            // If css3 animation is supported than call animate method at once
            if (marquee.animation.cssAnimationSupport && o.allowCss3Support) {
                animate();
            } else {
                // Starts the recursive method
                _startAnimationWithDelay();
            }

        });
    }; // End of Plugin
    // Public: plugin defaults options
    $.fn.marquee.defaults = {
        // If you wish to always animate using jQuery
        allowCss3Support: true,
        // works when allowCss3Support is set to true - for full list see http://www.w3.org/TR/2013/WD-css3-transitions-20131119/#transition-timing-function
        css3easing: "linear",
        // requires jQuery easing plugin. Default is "linear"
        easing: "linear",
        // pause time before the next animation turn in milliseconds
        delayBeforeStart: 1000,
        // "left", "right", "up" or "down"
        direction: "left",
        // true or false - should the marquee be duplicated to show an effect of continues flow
        duplicated: false,
        // duration in milliseconds of the marquee in milliseconds
        duration: 5000,
        // Speed allows you to set a relatively constant marquee speed regardless of the width of the containing element. Speed is measured in pixels per second.
        speed: 0,
        // gap in pixels between the tickers
        gap: 20,
        // on cycle pause the marquee
        pauseOnCycle: false,
        // on hover pause the marquee - using jQuery plugin https://github.com/tobia/Pause
        pauseOnHover: false,
        // the marquee is visible initially positioned next to the border towards it will be moving
        startVisible: false
    };
}));
