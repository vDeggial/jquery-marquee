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
                $this = $(this),
                $marqueeWrapper, containerWidth, containerHeight, animationCss, verticalDir, elWidth, elHeight,
                loopCount = 3,
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
                    $this.timer = setTimeout(animate, o.delayBeforeStart);
                },

                // Public methods
                methods = {
                    pause: function() {
                        if (css3AnimationIsSupported && o.allowCss3Support) {
                            $marqueeWrapper.css(playState, "paused");
                        } else {
                            // pause using pause plugin
                            if ($.fn.pause) {
                                $marqueeWrapper.pause();
                            }
                        }
                        // save the status
                        $this.data("runningStatus", "paused");
                        // fire event
                        $this.trigger("paused");
                    },

                    resume: function() {
                        // resume using css3
                        if (css3AnimationIsSupported && o.allowCss3Support) {
                            $marqueeWrapper.css(playState, "running");
                        } else {
                            // resume using pause plugin
                            if ($.fn.resume) {
                                $marqueeWrapper.resume();
                            }
                        }
                        // save the status
                        $this.data("runningStatus", "resumed");
                        // fire event
                        $this.trigger("resumed");
                    },

                    toggle: function() {u
                        methods[$this.data("runningStatus") === "resumed" ? "pause" : "resume"]();
                    },

                    destroy: function() {
                        // Clear timer
                        clearTimeout($this.timer);
                        // Unbind all events
                        $this.find("*").addBack().off();
                        // Just unwrap the elements that has been added using this plugin
                        $this.html($this.find(".js-marquee:first").html());
                    }
                };
                
                var totalWidth = 0;
                $this.children().each(function(){
                    totalWidth += $(this).outerWidth( true );
                });

            // Check for methods
            if (typeof options === "string") {
                if ($.isFunction(methods[options])) {
                    // Following two IF statements to support public methods
                    if (!$marqueeWrapper) {
                        $marqueeWrapper = $this.find(".js-marquee-wrapper");
                    }
                    if ($this.data("css3AnimationIsSupported") === true) {
                        css3AnimationIsSupported = true;
                    }
                    methods[options]();
                }
                return;
            }

            /* Check if element has data attributes. They have top priority
               For details https://twitter.com/aamirafridi/status/403848044069679104 - Can't find a better solution :/
               jQuery 1.3.2 doesn't support $.data().KEY hence writting the following */
            var dataAttributes = {},
            attr;
            $.each(o, function(key) {
                // Check if element has this data attribute
                attr = $this.attr("data-" + key);
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
                o.duration = parseInt($this.width(), 10) / o.speed * 1000;
            }

            // Shortcut to see if direction is upward or downward
            verticalDir = o.direction === "up" || o.direction === "down";

            // no gap if not duplicated
            o.gap = o.duplicated ? parseInt(o.gap) : 0;

            // wrap inner content into a div
            $this.wrapInner("<div class='js-marquee'></div>");

            // Make copy of the element
            var $el = $this.find(".js-marquee").css({
                "margin-right": o.gap,
                "float": "left"
            });
            
            totalWidth += ($this.width() + 1000);

            if (o.duplicated) {
                $el.clone(true).appendTo($this);
                totalWidth *= 2;
            }

            // wrap both inner elements into one div
            $this.wrapInner("<div style='width:" + totalWidth + "px' class='js-marquee-wrapper'></div>");

            // Save the reference of the wrapper
            $marqueeWrapper = $this.find(".js-marquee-wrapper");

            // If direction is up or down, get the height of main element
            
            switch (verticalDir)
            {
                //Vertical Direction
                case true:
                    containerHeight = $this.height();
                    $marqueeWrapper.removeAttr("style");
                    $this.height(containerHeight);
                    
                    // Change the CSS for js-marquee element
                    $this.find(".js-marquee").css({
                        "float": "none",
                        "margin-bottom": o.gap,
                        "margin-right": 0
                    });
                    
                    // Remove bottom margin from 2nd element if duplicated
                    switch(o.duplicated)
                    {
                        case true:
            		        $this.find(".js-marquee:last").css({"margin-bottom": 0});
            		        break;
                    }
                    
                    elHeight = $this.find(".js-marquee:first").height() + o.gap;
                    
                    // adjust the animation duration according to the text length
                    switch(o.startVisible && !o.duplicated)
                    {
                        case true:
                            // Compute the complete animation duration and save it for later reference
                            // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
                            o._completeDuration = ((parseInt(elHeight, 10) + parseInt(containerHeight, 10)) / parseInt(containerHeight, 10)) * o.duration;
        
                            // formula is to: (Height of the text node / height of the main container) * duration
                            o.duration = (parseInt(elHeight, 10) / parseInt(containerHeight, 10)) * o.duration;
                            break;
                            
                        case false:
                            // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
                            o.duration = ((parseInt(elHeight, 10) + parseInt(containerHeight, 10)) / parseInt(containerHeight, 10)) * o.duration;
                            break;
                    }
                    
                    break;
                    
                //Horizontal Direction
                case false:
                    // Save the width of the each element so we can use it in animation
                    elWidth = $this.find(".js-marquee:first").width() + o.gap;
                    
                    // container width
                    containerWidth = $this.width();
    
                    // adjust the animation duration according to the text length
                    switch(o.startVisible && !o.duplicated)
                    {
                        case true:
                            // Compute the complete animation duration and save it for later reference
                            // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
                            o._completeDuration = ((parseInt(elWidth, 10) + parseInt(containerWidth, 10)) / parseInt(containerWidth, 10)) * o.duration;
        
                            // (Width of the text node / width of the main container) * duration
                            o.duration = (parseInt(elWidth, 10) / parseInt(containerWidth, 10)) * o.duration;
                            break;
                            
                        case false:
                            // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
                            o.duration = ((parseInt(elWidth, 10) + parseInt(containerWidth, 10)) / parseInt(containerWidth, 10)) * o.duration;
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
                    animationCss3Str = "",
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
                    animationCss3Str = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s infinite " + o.css3easing;
                    $this.data("css3AnimationIsSupported", true);
                }
            }
            
            var _generateCssData = function(property,value,prefix,suffix)
            {
                prefix = prefix || "";
                suffix = suffix || "";
                var data = {"property" : "", "value" : ""};
                data["property"] = property;
                value = prefix.concat(value,suffix);
                data["value"] = value;
                return data;
            };
            
            var _generateAnimationCss = function(value, vertical)
            {
                vertical = vertical || false;
                var data = css3AnimationIsSupported ? (vertical ? _generateCssData("transform", value, "translateY(", ")") : _generateCssData("transform", value, "translateX(", ")")) : (vertical ? _generateCssData("margin-top", value) : _generateCssData("margin-left", value));
                var property = data["property"];
                value = data["value"];
                var obj = {};
                obj[property] = value;
                return obj;
            };
            
            var _setElementCss = function(element, value, vertical)
            {
                vertical = vertical || false;
                var data = css3AnimationIsSupported ? (vertical ? _generateCssData("transform", value, "translateY(" , ")") : _generateCssData("transform", value, "translateX(" , ")")) : (vertical ? _generateCssData("margin-top", value) : _generateCssData("margin-left", value));
                element.css(data["property"], data["value"]);
            };

            var _rePositionVertically = function() {
                _setElementCss($marqueeWrapper, (o.direction === "up" ? containerHeight + "px" : "-" + elHeight + "px"), true);
            },
            _rePositionHorizontally = function() {
                _setElementCss($marqueeWrapper, (o.direction === "left" ? containerWidth + "px" : "-" + elWidth + "px"));
            };
            
            switch (true)
            {
                case o.duplicated:
                    // if duplicated option is set to true than position the wrapper
                    var data;
                    var value;
                    switch(verticalDir)
                    {
                        case true:
                            o.startVisible ? _setElementCss($marqueeWrapper, 0, true) : _setElementCss($marqueeWrapper, (o.direction === "up" ? containerHeight + "px" : "-" + ((elHeight * 2) - o.gap) + "px"), true);
                            break;
                            
                        default:
                            o.startVisible ? _setElementCss($marqueeWrapper, 0) : _setElementCss($marqueeWrapper, (o.direction === "left" ? containerWidth + "px" : "-" + ((elWidth * 2) - o.gap) + "px"));
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
                    verticalDir ? _rePositionVertically() : _rePositionHorizontally();
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
                            if (verticalDir)
                            {
                                o.duration = o.direction === "up" ? o.duration + (containerHeight / ((elHeight) / o.duration)) : o.duration * 2;
                            }
                            else
                            {
                                o.duration = o.direction === "left" ? o.duration + (containerWidth / ((elWidth) / o.duration)) : o.duration * 2;
                            }
                            // Adjust the css3 animation as well
                            if (animationCss3Str) {
                                animationCss3Str = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
                            }
                            loopCount++;
                        }
                        // On 2nd loop things back to normal, normal duration for the rest of animations
                        else if (loopCount === 2)
                        {
                            o.duration = o._originalDuration;
                            // Adjust the css3 animation as well
                            if (animationCss3Str) {
                                animationName = animationName + "0";
                                keyframeString = $.trim(keyframeString) + "0 ";
                                animationCss3Str = animationName + " " + o.duration / 1000 + "s 0s infinite " + o.css3easing;
                            }
                            loopCount++;
                        }
                        break;
                }
                
                switch(verticalDir)
                {
                    //Vertical Direction
                    case true:
                        switch(true)
                        {
                            case o.duplicated:
                                // Adjust the starting point of animation only when first loops finishes
                                if (loopCount > 2) {
                                    _setElementCss($marqueeWrapper, (o.direction === "up" ? 0 : "-" + elHeight + "px"), true);
                                }
                                
                                animationCss = _generateAnimationCss((o.direction === "up" ? "-" + elHeight + "px" : 0), true);
                                break;
                                
                            case o.startVisible:
                                
                                switch(loopCount)
                                {
                                    // This loop moves the marquee out of the container
                                    case 2:
                                        // Adjust the css3 animation as well
                                        if (animationCss3Str) {
                                            animationCss3Str = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
                                        }
                                        
                                        animationCss = _generateAnimationCss((o.direction === "up" ? "-" + elHeight + "px" : containerHeight + "px"), true);
                                        loopCount++;
                                        break;
                                        
                                    case 3:
                                        // Set the duration for the animation that will run forever
                                        o.duration = o._completeDuration;
                                        // Adjust the css3 animation as well
                                        if (animationCss3Str) {
                                                animationName = animationName + "0";
                                                keyframeString = $.trim(keyframeString) + "0 ";
                                                animationCss3Str = animationName + " " + o.duration / 1000 + "s 0s infinite " + o.css3easing;
                                        }
                                        _rePositionVertically();
                                        break;
                                }
                                break;
                                
                            default:
                                _rePositionVertically();
                                animationCss = _generateAnimationCss((o.direction === "up" ? "-" + ($marqueeWrapper.height()) + "px" : containerHeight + "px"), true);
                        }
                        break;
                        
                    //Horizontal Direction
                    default:
                        switch(true)
                        {
                            case o.duplicated:
                                // Adjust the starting point of animation only when first loops finishes
                                if (loopCount > 2) {
                                    _setElementCss($marqueeWrapper, (o.direction === "left" ? 0 : "-" + elWidth + "px"));
                                }
        
                                animationCss = _generateAnimationCss((o.direction === "left" ? "-" + elWidth + "px" : 0));
                                break;
                                
                            case o.startVisible:
                                
                                switch(loopCount)
                                {
                                    // This loop moves the marquee out of the container
                                    case 2:
                                        // Adjust the css3 animation as well
                                        if (animationCss3Str) {
                                            animationCss3Str = animationName + " " + o.duration / 1000 + "s " + o.delayBeforeStart / 1000 + "s " + o.css3easing;
                                        }
                                        
                                        animationCss = _generateAnimationCss((o.direction === "left" ? "-" + elWidth + "px" : containerWidth + "px"));
                                        loopCount++;
                                        break;
                                        
                                    case 3:
                                        // Set the duration for the animation that will run forever
                                        o.duration = o._completeDuration;
                                        // Adjust the css3 animation as well
                                        if (animationCss3Str) {
                                            animationName = animationName + "0";
                                            keyframeString = $.trim(keyframeString) + "0 ";
                                            animationCss3Str = animationName + " " + o.duration / 1000 + "s 0s infinite " + o.css3easing;
                                        }
                                        _rePositionHorizontally();
                                        break;
                                }
                                break;
                                
                            default:
                                _rePositionHorizontally();
                                animationCss = _generateAnimationCss((o.direction === "left" ? "-" + elWidth + "px" : containerWidth + "px"));
                                break;
                        }
                        break;
                }

                // fire event
                $this.trigger("beforeStarting");

                // If css3 support is available than do it with css3, otherwise use jQuery as fallback
                switch(css3AnimationIsSupported)
                {
                    case true:
                        // Add css3 animation to the element
                        $marqueeWrapper.css(animationString, animationCss3Str);
                        var keyframeCss = keyframeString + " { 100%  " + _objToString(animationCss) + "}",
                             $styles = $marqueeWrapper.find("style");
    
                        // Now add the keyframe animation to the marquee element
                        if ($styles.length !== 0) {
                            // Bug fixed for jQuery 1.3.x - Instead of using .last(), use following
                            $styles.filter(":last").html(keyframeCss);
                        } else {
                            $("head").append("<style>" + keyframeCss + "</style>");
                        }
    
                        // Animation iteration event
                        _prefixedEvent($marqueeWrapper[0], "AnimationIteration", function() {
                            $this.trigger("finished");
                        });
                        // Animation stopped
                        _prefixedEvent($marqueeWrapper[0], "AnimationEnd", function() {
                            animate();
                            $this.trigger("finished");
                        });
                        break;
                        
                    default:
                        // Start animating
                        $marqueeWrapper.animate(animationCss, o.duration, o.easing, function() {
                            // fire event
                            $this.trigger("finished");
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
                $this.data("runningStatus", "resumed");
            };

            // bind pause and resume events
            $this.on("pause", methods.pause);
            $this.on("resume", methods.resume);

            if (o.pauseOnHover) {
                $this.on("mouseenter", methods.pause);
                $this.on("mouseleave", methods.resume);
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
