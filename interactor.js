(
    function () {
        var ifvisible = (function () {
            var addEvent, customEvent, doc, fireEvent, hidden, idleStartedTime, idleTime, ie, ifvisible, init, initialized, status, trackIdleStatus, visibilityChange;
            ifvisible = {};
            doc = document;
            initialized = false;
            status = "active";
            idleTime = 60000;
            idleStartedTime = false;
            customEvent = (function () {
                var S4, addCustomEvent, cgid, fireCustomEvent, guid, listeners, removeCustomEvent;
                S4 = function () {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                guid = function () {
                    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
                };
                listeners = {};
                cgid = '__ceGUID';
                addCustomEvent = function (obj, event, callback) {
                    obj[cgid] = undefined;
                    if (!obj[cgid]) {
                        obj[cgid] = "ifvisible.object.event.identifier";
                    }
                    if (!listeners[obj[cgid]]) {
                        listeners[obj[cgid]] = {};
                    }
                    if (!listeners[obj[cgid]][event]) {
                        listeners[obj[cgid]][event] = [];
                    }
                    return listeners[obj[cgid]][event].push(callback);
                };
                fireCustomEvent = function (obj, event, memo) {
                    var ev, j, len, ref, results;
                    if (obj[cgid] && listeners[obj[cgid]] && listeners[obj[cgid]][event]) {
                        ref = listeners[obj[cgid]][event];
                        results = [];
                        for (j = 0, len = ref.length; j < len; j++) {
                            ev = ref[j];
                            results.push(ev(memo || {}));
                        }
                        return results;
                    }
                };
                removeCustomEvent = function (obj, event, callback) {
                    var cl, i, j, len, ref;
                    if (callback) {
                        if (obj[cgid] && listeners[obj[cgid]] && listeners[obj[cgid]][event]) {
                            ref = listeners[obj[cgid]][event];
                            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                                cl = ref[i];
                                if (cl === callback) {
                                    listeners[obj[cgid]][event].splice(i, 1);
                                    return cl;
                                }
                            }
                        }
                    } else {
                        if (obj[cgid] && listeners[obj[cgid]] && listeners[obj[cgid]][event]) {
                            return delete listeners[obj[cgid]][event];
                        }
                    }
                };
                return {
                    add: addCustomEvent,
                    remove: removeCustomEvent,
                    fire: fireCustomEvent
                };
            })();
            addEvent = (function () {
                var setListener;
                setListener = false;
                return function (el, ev, fn) {
                    if (!setListener) {
                        if (el.addEventListener) {
                            setListener = function (el, ev, fn) {
                                return el.addEventListener(ev, fn, false);
                            };
                        } else if (el.attachEvent) {
                            setListener = function (el, ev, fn) {
                                return el.attachEvent('on' + ev, fn, false);
                            };
                        } else {
                            setListener = function (el, ev, fn) {
                                return el['on' + ev] = fn;
                            };
                        }
                    }
                    return setListener(el, ev, fn);
                };
            })();
            fireEvent = function (element, event) {
                var evt;
                if (doc.createEventObject) {
                    return element.fireEvent('on' + event, evt);
                } else {
                    evt = doc.createEvent('HTMLEvents');
                    evt.initEvent(event, true, true);
                    return !element.dispatchEvent(evt);
                }
            };
            ie = (function () {
                var all, check, div, undef, v;
                undef = void 0;
                v = 3;
                div = doc.createElement("div");
                all = div.getElementsByTagName("i");
                check = function () {
                    return (div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->", all[0]);
                };
                while (check()) {
                    continue;
                }
                if (v > 4) {
                    return v;
                } else {
                    return undef;
                }
            })();
            hidden = false;
            visibilityChange = void 0;
            if (typeof doc.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof doc.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof doc.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof doc.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            trackIdleStatus = function () {
                var timer, wakeUp;
                timer = false;
                wakeUp = function () {
                    clearTimeout(timer);
                    if (status !== "active") {
                        ifvisible.wakeup();
                    }
                    idleStartedTime = +(new Date());
                    return timer = setTimeout(function () {
                        if (status === "active") {
                            return ifvisible.idle();
                        }
                    }, idleTime);
                };
                wakeUp();
                addEvent(doc, "mousemove", wakeUp);
                addEvent(doc, "keyup", wakeUp);
                addEvent(doc, "mousedown", wakeUp);
                addEvent(window, "scroll", wakeUp);
                addEvent(doc, "touchstart", wakeUp);
                addEvent(doc, "touchmove", wakeUp);
                addEvent(doc, "touchcancel", wakeUp);
                ifvisible.focus(wakeUp);
                return ifvisible.wakeup(wakeUp);
            };
            init = function () {
                var blur;
                if (initialized) {
                    return true;
                }
                if (hidden === false) {
                    blur = "blur";
                    if (ie < 9) {
                        blur = "focusout";
                    }
                    addEvent(window, blur, function () {
                        return ifvisible.blur();
                    });
                    addEvent(window, "focus", function () {
                        return ifvisible.focus();
                    });
                } else {
                    addEvent(doc, visibilityChange, function () {
                        if (doc[hidden]) {
                            return ifvisible.blur();
                        } else {
                            return ifvisible.focus();
                        }
                    }, false);
                }
                initialized = true;
                return trackIdleStatus();
            };
            ifvisible = {
                setIdleDuration: function (seconds) {
                    return idleTime = seconds * 1000;
                },
                getIdleDuration: function () {
                    return idleTime;
                },
                getIdleInfo: function () {
                    var now, res;
                    now = +(new Date());
                    res = {};
                    if (status === "idle") {
                        res.isIdle = true;
                        res.idleFor = now - idleStartedTime;
                        res.timeLeft = 0;
                        res.timeLeftPer = 100;
                    } else {
                        res.isIdle = false;
                        res.idleFor = now - idleStartedTime;
                        res.timeLeft = (idleStartedTime + idleTime) - now;
                        res.timeLeftPer = (100 - (res.timeLeft * 100 / idleTime)).toFixed(2);
                    }
                    return res;
                },
                focus: function (callback) {
                    if (typeof callback === "function") {
                        this.on("focus", callback);
                    } else {
                        status = "active";
                        customEvent.fire(this, "focus");
                        customEvent.fire(this, "wakeup");
                        customEvent.fire(this, "statusChanged", {
                            status: status
                        });
                    }
                    return this;
                },
                blur: function (callback) {
                    if (typeof callback === "function") {
                        this.on("blur", callback);
                    } else {
                        status = "hidden";
                        customEvent.fire(this, "blur");
                        customEvent.fire(this, "idle");
                        customEvent.fire(this, "statusChanged", {
                            status: status
                        });
                    }
                    return this;
                },
                idle: function (callback) {
                    if (typeof callback === "function") {
                        this.on("idle", callback);
                    } else {
                        status = "idle";
                        customEvent.fire(this, "idle");
                        customEvent.fire(this, "statusChanged", {
                            status: status
                        });
                    }
                    return this;
                },
                wakeup: function (callback) {
                    if (typeof callback === "function") {
                        this.on("wakeup", callback);
                    } else {
                        status = "active";
                        customEvent.fire(this, "wakeup");
                        customEvent.fire(this, "statusChanged", {
                            status: status
                        });
                    }
                    return this;
                },
                on: function (name, callback) {
                    init();
                    customEvent.add(this, name, callback);
                    return this;
                },
                off: function (name, callback) {
                    init();
                    customEvent.remove(this, name, callback);
                    return this;
                },
                onEvery: function (seconds, callback) {
                    var paused, t;
                    init();
                    paused = false;
                    if (callback) {
                        t = setInterval(function () {
                            if (status === "active" && paused === false) {
                                return callback();
                            }
                        }, seconds * 1000);
                    }
                    return {
                        stop: function () {
                            return clearInterval(t);
                        },
                        pause: function () {
                            return paused = true;
                        },
                        resume: function () {
                            return paused = false;
                        },
                        code: t,
                        callback: callback
                    };
                },
                now: function (check) {
                    init();
                    return status === (check || "active");
                }
            };
            return ifvisible;
        });
        var Interactor = function (config) {
            // Call Initialization on Interactor Call
            this.__init__(config);
        };

        Interactor.prototype = {

            // Initialization
            __init__: function (config) {

                var interactor = this;

                // Argument Assignment          // Type Checks                                                                          // Default Values
                interactor.interactions = typeof (config.interactions) == "boolean" ? config.interactions : true;
                interactor.interactionElement = Array.isArray(config.interactionElement) == true ? config.interactionElement : ['interaction'];
                interactor.interactionEvents = ['mouseup', 'touchend'];
                interactor.conversions = typeof (config.conversions) == "boolean" ? config.conversions : true;
                interactor.conversionElement = Array.isArray(config.conversionElement) == true ? config.conversionElement : ['conversion'];
                interactor.conversionEvents = ['mouseup', 'touchend'];
                interactor.trackAdditionalData = config.trackAdditionalData;
                interactor.endpoint = typeof (config.endpoint) == "string" ? config.endpoint : 'https://analytics.yuktamedia.com/api/cdp/v1/datasync';
                interactor.async = true;
                interactor.debug = false;
                interactor.libraryName = 'analytics-web';
                interactor.libraryVersion = '2.0.0'
                interactor.apiKey = typeof (config.apiKey) == "string" ? config.apiKey : "";
                interactor.records = [];
                interactor.session = {};
                interactor.setIdleDuration = typeof (config.setIdleDuration) == "number" ? config.setIdleDuration : 60;
                interactor.loadTime = new Date().toISOString();
                interactor.context = {
                    "client": {
                        "name": window.location.hostname,
                    },
                    "library": {
                        "name": interactor.libraryName,
                        "version": interactor.libraryVersion
                    },
                    "os": {
                        "name": window.navigator.platform,
                        "version": ""
                    },
                    "timezone": new window.Intl.DateTimeFormat().resolvedOptions().timeZone,
                    "screen": {
                        "density": "",
                        "width": window.screen.width,
                        "height": window.screen.height
                    },
                    "userAgent": navigator.userAgent,
                    "locale": window.navigator.language,
                };

                // Initialize Session
                interactor.__initializeSession__();
                // Call Event Binding Method
                interactor.__bindEvents__();

                // Send page load event
                interactor.__sendPageLoadEvent__();

                return interactor;
            },

            // Create Events to Track
            __bindEvents__: function () {

                var interactor = this;

                // Set Interaction Capture
                if (interactor.interactions === true) {
                    for (var i = 0; i < interactor.interactionEvents.length; i++) {
                        document.querySelector('body').addEventListener(interactor.interactionEvents[i], function (e) {
                            e.stopPropagation();
                            for (var j = 0; j < interactor.interactionElement.length; j++) {
                                if (e.target.classList.value === interactor.interactionElement[j]) {
                                    interactor.__sendUserAction__(e, "interaction");
                                }
                            }
                        });
                    }
                }


                // Set Conversion Capture
                if (interactor.conversions === true) {
                    for (var k = 0; k < interactor.conversionEvents.length; k++) {
                        document.querySelector('body').addEventListener(interactor.conversionEvents[k], function (e) {
                            e.stopPropagation();
                            for (var l = 0; l < interactor.conversionElement.length; l++) {
                                if (e.target.classList.value === interactor.conversionElement[l]) {
                                    interactor.__sendUserAction__(e, "conversion");
                                }
                            }
                        });
                    }
                }

                ifvisible.setIdleDuration(interactor.setIdleDuration);
                ifvisible.on('statusChanged', function(e){
                    interactor.__sendVisibilityEvent__(e);
                });

                // Bind onbeforeunload Event
                window.addEventListener("beforeunload", function (event) {
                    interactor.__sendPageUnload__();
                });

                return interactor;
            },

            // Add Interaction Object Triggered By Events to Records Array
            __sendUserAction__: function (e, type) {

                var interactor = this,
                    xhr = new XMLHttpRequest();

                // Post Session Data Serialized as JSON
                xhr.open('POST', interactor.endpoint, interactor.async);
                xhr.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
                xhr.withCredentials = true;
                xhr.send(JSON.stringify({
                    "channel": "web",
                    "type": type,
                    "timestamp": new Date().toISOString(),
                    "token": interactor.apiKey,
                    "name": e.type,
                    "context": interactor.context,
                    "properties": {
                        targetTag: e.target.nodeName,
                        targetClasses: e.target.className,
                        content: e.target.innerText,
                        createdAt: new Date().toISOString()
                    }
                }));

                return interactor;
            },

            __sendVisibilityEvent__: function(e) {
                var interactor = this;
                navigator.sendBeacon(interactor.endpoint, JSON.stringify({
                    "channel": "web",
                    "type": e.status,
                    "timestamp": new Date().toISOString(),
                    "token": interactor.apiKey,
                    "name": "Page " + e.status.charAt(0).toUpperCase() + e.status.slice(1),
                    "context": interactor.context,
                    "loadTime": new Date().toISOString(),
                    "unloadTime": new Date().toISOString()
                }));
            },

            // Generate Session Object & Assign to Session Property
            __initializeSession__: function () {
                var interactor = this;

                // Assign Session Property
                interactor.session = {
                    "channel": "web",
                    "type": "page_load",
                    "timestamp": new Date().toISOString(),
                    "context": interactor.context,
                    "token": interactor.apiKey,
                    "loadTime": interactor.loadTime,
                    "unloadTime": new Date().toISOString(),
                    "name": document.title,
                    "properties": {
                        page_path: window.location.pathname,
                        page_url: window.location.href,
                        page_origin: window.location.origin,
                        page_title: document.title,
                        page_referrer: document.referrer,
                        page_description: interactor.__getContentsOfMeta__("og:description"),
                        page_type: interactor.__getContentsOfMeta__("og:type"),
                        page_keywords: interactor.__getContentsOfMeta__("keywords"),
                        page_author: interactor.__getContentsOfMeta__("author"),
                        page_tag: interactor.__getContentsOfMeta__("article:tag"),
                        page_section: interactor.__getContentsOfMeta__("article:section"),
                        data: interactor.trackAdditionalData
                    }
                };

                return interactor;
            },

            // Insert End of Session Values into Session Property
            __closeSession__: function () {
                var interactor = this;
                // Assign Session Properties
                interactor.session.unloadTime = new Date().toISOString();
                interactor.session.type = 'page_unload';
                return interactor;
            },

            // Gather Additional Data and Send Interaction(s) to Server
            __sendPageUnload__: function () {

                var interactor = this;
                    // Initialize Cross Header Request

                // Close Session
                interactor.__closeSession__();

                navigator.sendBeacon(interactor.endpoint, JSON.stringify(interactor.session));
                // Post Session Data Serialized as JSON
                // xhr.open('POST', interactor.endpoint, interactor.async);
                // xhr.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
                // xhr.withCredentials = true;
                // xhr.send(JSON.stringify(interactor.session));

                return interactor;
            },

            // Send Page Load Information to Server
            __sendPageLoadEvent__: function () {
                var interactor = this;

                var xhr = new XMLHttpRequest();
                xhr.open('POST', interactor.endpoint, interactor.async);
                xhr.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
                xhr.withCredentials = true;
                xhr.send(
                    JSON.stringify({
                        "channel": "web",
                        "type": "page_load",
                        "timestamp": new Date().toISOString(),
                        "context": interactor.context,
                        "token": interactor.apiKey,
                        "name": "Page Loaded",
                        "properties": {
                            page_path: window.location.pathname,
                            page_url: window.location.href,
                            page_origin: window.location.origin,
                            page_title: document.title,
                            page_referrer: document.referrer,
                            page_description: interactor.__getContentsOfMeta__("og:description"),
                            page_type: interactor.__getContentsOfMeta__("og:type"),
                            page_keywords: interactor.__getContentsOfMeta__("keywords"),
                            page_author: interactor.__getContentsOfMeta__("author"),
                            page_tag: interactor.__getContentsOfMeta__("article:tag"),
                            page_section: interactor.__getContentsOfMeta__("article:section")
                        }
                    })
                );
                return interactor;
            },

            __getContentsOfMeta__: function (metaName) {
                var metas = document.getElementsByTagName('meta');
                var contents = [];
                for (var i = 0; i < metas.length; i++) {
                    if (metas[i].getAttribute('name') === metaName || metas[i].getAttribute('property') === metaName) {
                        contents.push(metas[i].getAttribute('content'));
                    }
                }
                return contents.length ? contents.join(',') : '';
            }
        };

        var _yoap = window['YuktaOneAnalyticsPixel'];
        var _yuyo = window[_yoap];
        var _ConfigObject = {};
        _yuyo.q.forEach(function (i) {
            var _tmpQElement = [].slice.call(i);
            _ConfigObject[_tmpQElement[0]] = _tmpQElement[1];
        });
        var _trackIntractions = false;
        var _trackData = null;
        var _trackIdleDuration;
        var _interactionElementToTrack = [];
        var _trackConversion = false;
        var _conversionElementToTrack = [];
        var _apiKey = "";
        Object.keys(_ConfigObject).forEach(function (key) {
            switch (key) {
                case "apiKey":
                    if (typeof _ConfigObject[key] === 'undefined' || _ConfigObject[key] === '') {
                        console.error('YuktaMedia Analytics Error -> API key is not provided or is invalid');
                        return;
                    } else {
                        _apiKey = _ConfigObject[key];
                    }
                    break;
                case "interactionElementsArray":
                    if (typeof _ConfigObject[key] === 'undefined' || !Array.isArray(_ConfigObject[key])) {
                        console.warn('YuktaMedia Analytics Warning -> interactionElementsArray should be provide as list of classes. Ignoring for given input');
                    } else if (Array.isArray(_ConfigObject[key]) && _ConfigObject[key].length) {
                        _interactionElementToTrack = _ConfigObject[key];
                        _trackIntractions = true;
                    }
                    break;
                case "conversionElementsArray":
                    if (typeof _ConfigObject[key] === 'undefined' || !Array.isArray(_ConfigObject[key])) {
                        console.warn('YuktaMedia Analytics Warning -> conversionElementsArray should be provide as list of classes. Ignoring for given input');
                    } else if (Array.isArray(_ConfigObject[key]) && _ConfigObject[key].length) {
                        _conversionElementToTrack = _ConfigObject[key];
                        _trackConversion = true;
                    }
                    break;
                case "setIdleDuration":
                    if (!typeof _ConfigObject[key] === 'undefined' || typeof _ConfigObject[key] === 'number') {
                        _trackIdleDuration = _ConfigObject[key];
                    }
                    break;
                case "setData":
                    if (!typeof _ConfigObject[key] === 'undefined' || typeof _ConfigObject[key] === 'object') {
                        _trackData = _ConfigObject[key];
                    }
                    break;
                default:
                    break;
            }
        });
        if (_apiKey === '') {
            console.error('YuktaMedia Analytics Error -> API key is not provided or is invalid');
            return;
        } else {
            var interactions = new Interactor({
                interactions: _trackIntractions,
                interactionElement: _interactionElementToTrack,
                interactionEvents: ["mouseup", "touchend"],
                trackAdditionalData: _trackData,
                conversions: _trackConversion,
                conversionElement: _conversionElementToTrack,
                setIdleDuration: _trackIdleDuration,
                conversionEvents: ["mouseup", "touchend"],
                endpoint: 'https://analytics.yuktamedia.com/api/cdp/v1/datasync',
                apiKey: _apiKey,
                async: true,
                debug: false
            });
        }
    }
)();

