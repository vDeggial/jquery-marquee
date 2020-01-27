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
                data = {marquee:{container:{element:null, width:0, height:0}, outerWrapper:{element:null, width:0, height:0, animationCss: ""}, innerWrapper:{element:null, width:0, height:0}, animation: {css:""}, isVertical:false}};
			data.marquee.container.element = $(this);
            var loopCount = 3,
                playState = "animation-play-state",
                css3AnimationIsSupported = false,

                // Private methods
                _prefixedEvent = function(element, type, callback) {
                    var pfx = ["webkit", "moz", "MS", "o", ""];
                    for (var p = 0; p < pfx.length; p++) {
                        if (!pfx[p]) type = type.toLowerCase();
                        element.addEventListener(pfx[p] + type, callback, false);
                    }
                },

                _objToString = function(obj) {
                    var tabjson = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            tabjson.push(p + ":" + obj[p]);
                        }
                    }
                    tabjson.push();
                    return "{" + tabjson.join(",") + "}";
                },

                _startAnimationWithDelay = function() {
                    data.marquee.container.element.timer = setTimeout(animate, o.delayBeforeStart);
                },

                // Public methods
                methods = {
                    pause: function() {
                        if (css3AnimationIsSupported && o.allowCss3Support) {
                            data.marquee.outerWrapper.element.css(playState, "paused");
                        } else {
                            // pause using pause plugin
                            if ($.fn.pause) {
                                data.marquee.outerWrapper.element.pause();
                            }
                        }
                        // save the status
                        data.marquee.container.element.data("runningStatus", "paused");
                        // fire event
                        data.marquee.container.element.trigger("paused");
                    },

                    resume: function() {
                        // resume using css3
                        if (css3AnimationIsSupported && o.allowCss3Support) {
                            data.marquee.outerWrapper.element.css(playState, "running");
                        } else {
                            // resume using pause plugin
                            if ($.fn.resume) {
                                data.marquee.outerWrapper.element.resume();
                            }
                        }
                        // save the status
                        data.marquee.container.element.data("runningStatus", "resumed");
                        // fire event
                        data.marquee.container.element.trigger("resumed");
                    },

                    toggle: function() {
                        methods[data.marquee.container.element.data("runningStatus") === "resumed" ? "pause" : "resume"]();
                    },

                    destroy: function() {
                        // Clear timer
                        clearTimeout(data.marquee.container.element.timer);
                        // Unbind all events
                        data.marquee.container.element.find("*").addBack().off();
                        // Just unwrap the elements that has been added using this plugin
                        data.marquee.container.element.html(data.marquee.container.element.find(".js-marquee:first").html());
                    }
                };
                
                var totalWidth = 0;
                data.marquee.container.element.children().each(function(){
                    totalWidth += $(this).outerWidth( true );
                });

            // Check for methods
            if (typeof options === "string") {
                if ($.isFunction(methods[options])) {
                    // Following two IF statements to support public methods
                    if (!data.marquee.outerWrapper.element) {
                        data.marquee.outerWrapper.element = data.marquee.container.element.find(".js-marquee-wrapper");
                    }
                    if (data.marquee.container.element.data("css3AnimationIsSupported") === true) {
                        css3AnimationIsSupported = true;
                    }
                    methods[options]();
                }
                return;
            }

            /* Check if element has data attributes. They have top priority
               For details https://twitter.com/aamirafridi/status/403848044069679104 - Can't find a better solution :/
               jQuery 1.3.2 doesn't support $.data().KEY hence writting the following */
            var attr;
            $.each(o, function(key) {
                // Check if element has this data attribute
                attr = data.marquee.container.element.attr("data-" + key);
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

            // Reintroduce speed as an option. It calculates duration as a factor of the container width
            // measured in pixels per second.
            if (o.speed) {
                o.duration = parseInt(data.marquee.container.element.width(), 10) / o.speed * 1000;
            }

            // Shortcut to see if direction is upward or downward
            data.marquee.isVertical = o.direction === "up" || o.direction === "down";

            // no gap if not duplicated
            o.gap = o.duplicated ? parseInt(o.gap, 10) : 0;

            // wrap inner content into a div
            data.marquee.container.element.wrapInner("<div class='js-marquee'></div>");

            // Make copy of the element
            var $el = data.marquee.container.element.find(".js-marquee").css({
                "margin-right": o.gap,
                "float": "left"
            });
            
            totalWidth += (data.marquee.container.element.width() + 1000);

            if (o.duplicated) {
                $el.clone(true).appendTo(data.marquee.container.element);
                totalWidth *= 2;
            }

            // wrap both inner elements into one div
            data.marquee.container.element.wrapInner("<div style='width:" + totalWidth + "px' class='js-marquee-wrapper'></div>");

            // Save the reference of the wrapper
            data.marquee.outerWrapper.element = data.marquee.container.element.find(".js-marquee-wrapper");
            
            data.marquee.outerWrapper.element.css("will-change", "transform");

            // If direction is up or down, get the height of main element
            
            switch (data.marquee.isVertical)
            {
                //Vertical Direction
                case true:
                    data.marquee.container.height = data.marquee.container.element.height();
                    data.marquee.outerWrapper.element.removeAttr("style");
                    data.marquee.container.element.height(data.marquee.container.height);
                    
                    // Change the CSS for js-marquee element
                    data.marquee.container.element.find(".js-marquee").css({
                        "float": "none",
                        "margin-bottom": o.gap,
                        "margin-right": 0
                    });
                    
                    // Remove bottom margin from 2nd element if duplicated
                    switch(o.duplicated)
                    {
                        case true:
            		        data.marquee.container.element.find(".js-marquee:last").css({"margin-bottom": 0});
            		        break;
                    }
                    
                    data.marquee.innerWrapper.height = data.marquee.container.element.find(".js-marquee:first").height() + o.gap;
                    
                    // adjust the animation duration according to the text length
                    switch(o.startVisible && !o.duplicated)
                    {
                        case true:
                            // Compute the complete animation duration and save it for later reference
                            // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
                            o._completeDuration = ((parseInt(data.marquee.innerWrapper.height, 10) + parseInt(data.marquee.container.height, 10)) / parseInt(data.marquee.container.height, 10)) * o.duration;
        
                            // formula is to: (Height of the text node / height of the main container) * duration
                            o.duration = (parseInt(data.marquee.innerWrapper.height, 10) / parseInt(data.marquee.container.height, 10)) * o.duration;
                            break;
                            
                        case false:
                            // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
                            o.duration = ((parseInt(data.marquee.innerWrapper.height, 10) + parseInt(data.marquee.container.height, 10)) / parseInt(data.marquee.container.height, 10)) * o.duration;
                            break;
                    }
                    
                    break;
                    
                //Horizontal Direction
                case false:
                    // Save the width of the each element so we can use it in animation
                    data.marquee.innerWrapper.width = data.marquee.container.element.find(".js-marquee:first").width() + o.gap;
                    
                    // container width
                    data.marquee.container.width = data.marquee.container.element.width();
    
                    // adjust the animation duration according to the text length
                    switch(o.startVisible && !o.duplicated)
                    {
                        case true:
                            // Compute the complete animation duration and save it for later reference
                            // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
                            o._completeDuration = ((parseInt(data.marquee.innerWrapper.width, 10) + parseInt(data.marquee.container.width, 10)) / parseInt(data.marquee.container.width, 10)) * o.duration;
        
                            // (Width of the text node / width of the main container) * duration
                            o.duration = (parseInt(data.marquee.innerWrapper.width, 10) / parseInt(data.marquee.container.width, 10)) * o.duration;
                            break;
                            
                        case false:
                            // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
                            o.duration = ((parseInt(data.marquee.innerWrapper.width, 10) + parseInt(data.marquee.container.width, 10)) / parseInt(data.marquee.container.width, 10)) * o.duration;
                            break;
                    }
                    break;
            }

            // if duplicated then reduce the duration
            if (o.duplicated) {
                o.duration = o.duration / 2;
            }

            if (o.allowCss3Support) {
                var elm = document.body || document.createElement("div"),
                    animationName = "marqueeAnimation-" + Math.floor(Math.random() * 1e7),
                    domPrefixes = "Webkit Moz O ms Khtml".split(" "),
                    animationString = "animation",
                    keyframeString = "";

                // Check css3 support
                if (typeof elm.style.animation !== "undefined") {
                    keyframeString = "@keyframes " + animationName + " ";
                    css3AnimationIsSupported = true;
                }

                if (css3AnimationIsSupported === false) {
                    for (var i = 0; i < domPrefixes.length; i++) {
                        if (typeof elm.style[domPrefixes[i] + "AnimationName"] !== "undefined") {
                            var prefix = "-" + domPrefixes[i].toLowerCase() + "-";
                            animationString = prefix + animationString;
                            playState = prefix + playState;
                            keyframeString = "@" + prefix + "keyframes " + animationName + " ";
                            css3AnimationIsSupported = true;
                            break;
                        }
                    }
                }

                if (css3AnimationIsSupported) {
                    data.marquee.animation.css = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s infinite " + o.css3easing;
                    data.marquee.container.element.data("css3AnimationIsSupported", true);
                }
            }
            
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
                var data = css3AnimationIsSupported ? (vertical ? _generateCssData("transform", value, "translateY(", ")") : _generateCssData("transform", value, "translateX(", ")")) : (vertical ? _generateCssData("margin-top", value) : _generateCssData("margin-left", value));
                var property = data.property;
                value = data.value;
                var obj = {};
                obj[property] = value;
                return obj;
            };
            
            var _setElementCss = function(element, value, vertical)
            {
                vertical = vertical || false;
                var data = css3AnimationIsSupported ? (vertical ? _generateCssData("transform", value, "translateY(" , ")") : _generateCssData("transform", value, "translateX(" , ")")) : (vertical ? _generateCssData("margin-top", value) : _generateCssData("margin-left", value));
                element.css(data.property, data.value);
            };
            
            var _adjustAnimation = function()
            {
                if (data.marquee.animation.css)
                {
                    animationName = animationName + "0";
                    keyframeString = $.trim(keyframeString) + "0 ";
                    data.marquee.animation.css = animationName + " " + o.duration / 1000 + "s 0s infinite " + o.css3easing;
                }
                
            };
            
            var _adjustAnimationDelay = function()
            {
                if (data.marquee.animation.css) {
                    data.marquee.animation.css = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
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
                _setElementCss(data.marquee.outerWrapper.element, (o.direction === "up" ? data.marquee.container.height + "px" : "-" + data.marquee.innerWrapper.height + "px"), true);
            },
            _rePositionHorizontally = function() {
                _setElementCss(data.marquee.outerWrapper.element, (o.direction === "left" ? data.marquee.container.width + "px" : "-" + data.marquee.innerWrapper.width + "px"));
            };
            
            switch (true)
            {
                case o.duplicated:
                    // if duplicated option is set to true than position the wrapper
                    switch(data.marquee.isVertical)
                    {
                        case true:
                            o.startVisible ? _setElementCss(data.marquee.outerWrapper.element, 0, true) : _setElementCss(data.marquee.outerWrapper.element, (o.direction === "up" ? data.marquee.container.height + "px" : "-" + ((data.marquee.innerWrapper.height * 2) - o.gap) + "px"), true);
                            break;
                            
                        default:
                            o.startVisible ? _setElementCss(data.marquee.outerWrapper.element, 0) : _setElementCss(data.marquee.outerWrapper.element, (o.direction === "left" ? data.marquee.container.width + "px" : "-" + ((data.marquee.innerWrapper.width * 2) - o.gap) + "px"));
                            break;
                    }
    
                    // If the text starts out visible we can skip the two initial loops
                    loopCount = o.startVisible ? loopCount : 1;
                    break;
                    
                case o.startVisible:
                    // We only have two different loops if marquee is duplicated and starts visible
                    loopCount = 2;
                    break;
                    
                default:
                    data.marquee.isVertical ? _rePositionVertically() : _rePositionHorizontally();
                    break;
            }

            // Animate recursive method
            var animate = function() {
                
                switch(o.duplicated)
                {
                    case true:
                        // When duplicated, the first loop will be scroll longer so double the duration
                        if (loopCount === 1)
                        {
                            o._originalDuration = o.duration;
                            if (data.marquee.isVertical)
                            {
                                o.duration = o.direction === "up" ? o.duration + (data.marquee.container.height / ((data.marquee.innerWrapper.height) / o.duration)) : o.duration * 2;
                            }
                            else
                            {
                                o.duration = o.direction === "left" ? o.duration + (data.marquee.container.width / ((data.marquee.innerWrapper.width) / o.duration)) : o.duration * 2;
                            }
                            // Adjust the css3 animation as well
                            if (data.marquee.animation.css) {
                                data.marquee.animation.css = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
                            }
                            loopCount++;
                        }
                        // On 2nd loop things back to normal, normal duration for the rest of animations
                        else if (loopCount === 2)
                        {
                            _resetAnimation();
                            loopCount++;
                        }
                        break;
                }
                
                switch(data.marquee.isVertical)
                {
                    //Vertical Direction
                    case true:
                        switch(true)
                        {
                            case o.duplicated:
                                // Adjust the starting point of animation only when first loops finishes
                                if (loopCount > 2) {
                                    _setElementCss(data.marquee.outerWrapper.element, (o.direction === "up" ? 0 : "-" + data.marquee.innerWrapper.height + "px"), true);
                                }
                                
                                data.marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "up" ? "-" + data.marquee.innerWrapper.height + "px" : 0), true);
                                break;
                                
                            case o.startVisible:
                                
                                switch(loopCount)
                                {
                                    // This loop moves the marquee out of the container
                                    case 2:
                                        // Adjust the css3 animation as well
                                        _adjustAnimationDelay();
                                        
                                        data.marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "up" ? "-" + data.marquee.innerWrapper.height + "px" : data.marquee.container.height + "px"), true);
                                        loopCount++;
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
                                data.marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "up" ? "-" + (data.marquee.outerWrapper.element.height()) + "px" : data.marquee.container.height + "px"), true);
                        }
                        break;
                        
                    //Horizontal Direction
                    default:
                        switch(true)
                        {
                            case o.duplicated:
                                // Adjust the starting point of animation only when first loops finishes
                                if (loopCount > 2) {
                                    _setElementCss(data.marquee.outerWrapper.element, (o.direction === "left" ? 0 : "-" + data.marquee.innerWrapper.width + "px"));
                                }
        
                                data.marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "left" ? "-" + data.marquee.innerWrapper.width + "px" : 0));
                                break;
                                
                            case o.startVisible:
                                o.duration = o._originalDuration;
                                switch(loopCount)
                                {
                                    // This loop moves the marquee out of the container
                                    case 2:
                                        // Adjust the css3 animation as well
                                        _adjustAnimationDelay();
                                        
                                        data.marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "left" ? "-" + data.marquee.innerWrapper.width + "px" : data.marquee.container.width + "px"));
                                        loopCount++;
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
                                data.marquee.outerWrapper.animationCss = _generateAnimationCss((o.direction === "left" ? "-" + data.marquee.innerWrapper.width + "px" : data.marquee.container.width + "px"));
                                break;
                        }
                        break;
                }

                // fire event
                data.marquee.container.element.trigger("beforeStarting");

                // If css3 support is available than do it with css3, otherwise use jQuery as fallback
                switch(css3AnimationIsSupported)
                {
                    case true:
                        // Add css3 animation to the element
                        data.marquee.outerWrapper.element.css(animationString, data.marquee.animation.css);
                        var keyframeCss = keyframeString + " { 100%  " + _objToString(data.marquee.outerWrapper.animationCss) + "}",
                             $styles = data.marquee.outerWrapper.element.find("style");
    
                        // Now add the keyframe animation to the marquee element
                        if ($styles.length !== 0) {
                            // Bug fixed for jQuery 1.3.x - Instead of using .last(), use following
                            $styles.filter(":last").html(keyframeCss);
                        } else {
                            $("head").append("<style>" + keyframeCss + "</style>");
                        }
    
                        // Animation iteration event
                        _prefixedEvent(data.marquee.outerWrapper.element[0], "AnimationIteration", function() {
                            data.marquee.container.element.trigger("finished");
                        });
                        // Animation stopped
                        _prefixedEvent(data.marquee.outerWrapper.element[0], "AnimationEnd", function() {
                            animate();
                            data.marquee.container.element.trigger("finished");
                        });
                        break;
                        
                    default:
                        // Start animating
                        data.marquee.outerWrapper.element.animate(data.marquee.outerWrapper.animationCss, o.duration, o.easing, function() {
                            // fire event
                            data.marquee.container.element.trigger("finished");
                            // animate again
                            if (o.pauseOnCycle) {
                                _startAnimationWithDelay();
                            } else {
                                animate();
                            }
                        });
                        break;
                }
                
                // save the status
                data.marquee.container.element.data("runningStatus", "resumed");
            };

            // bind pause and resume events
            data.marquee.container.element.on("pause", methods.pause);
            data.marquee.container.element.on("resume", methods.resume);

            if (o.pauseOnHover) {
                data.marquee.container.element.on("mouseenter", methods.pause);
                data.marquee.container.element.on("mouseleave", methods.resume);
            }

            // If css3 animation is supported than call animate method at once
            if (css3AnimationIsSupported && o.allowCss3Support) {
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
