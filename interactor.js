/*
BSD 2-Clause License

Copyright (c) 2016, Benjamin Cordier
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(
    function () {
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
                interactor.endpoint = typeof (config.endpoint) == "string" ? config.endpoint : 'https://analytics.yuktamedia.com/api/cdp/v1/datasync';
                interactor.async = true;
                interactor.debug = false;
                interactor.apiKey = typeof (config.apiKey) == "string" ? config.apiKey : "";
                interactor.records = [];
                interactor.session = {};
                interactor.loadTime = new Date();

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
                                    interactor.__addInteraction__(e, "interaction");
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
                                    interactor.__addInteraction__(e, "conversion");
                                }
                            }
                        });
                    }
                }

                // Bind onbeforeunload Event
                window.addEventListener("beforeunload", function (event) {
                    interactor.__sendInteractions__();
                });

                return interactor;
            },

            // Add Interaction Object Triggered By Events to Records Array
            __addInteraction__: function (e, type) {

                var interactor = this,

                    // Interaction Object
                    interaction = {
                        type: type,
                        event: e.type,
                        targetTag: e.target.nodeName,
                        targetClasses: e.target.className,
                        content: e.target.innerText,
                        clientPosition: {
                            x: e.clientX,
                            y: e.clientY
                        },
                        screenPosition: {
                            x: e.screenX,
                            y: e.screenY
                        },
                        createdAt: new Date()
                    };


                // Insert into Records Array
                interactor.records.push(interaction);

                // Log Interaction if Debugging
                if (interactor.debug) {
                    // Close Session & Log to Console
                    interactor.__closeSession__();
                }

                return interactor;
            },

            // Generate Session Object & Assign to Session Property
            __initializeSession__: function () {
                var interactor = this;


                // Assign Session Property
                interactor.session = {
                    loadTime: interactor.loadTime,
                    unloadTime: new Date(),
                    token: interactor.apiKey,
                    language: window.navigator.language,
                    platform: window.navigator.platform,
                    port: window.location.port,
                    page_path: window.location.pathname,
                    page_url: window.location.href,
                    page_origin: window.location.origin,
                    page_title: document.title,
                    page_description: interactor.__getContentsOfMeta__("og:description"),
                    page_type: interactor.__getContentsOfMeta__("og:type"),
                    page_keywords: interactor.__getContentsOfMeta__("keywords"),
                    page_author: interactor.__getContentsOfMeta__("author"),
                    page_tag: interactor.__getContentsOfMeta__("article:tag"),
                    page_section: interactor.__getContentsOfMeta__("article:section"),
                    endpoint: interactor.endpoint
                };


                return interactor;
            },

            // Insert End of Session Values into Session Property
            __closeSession__: function () {

                var interactor = this;

                // Assign Session Properties
                interactor.session.unloadTime = new Date();
                interactor.session.event_type = 'page unload';
                interactor.session.token = interactor.apiKey;
                interactor.session.interactions = interactor.records;
                interactor.session.navigator_app_name = window.navigator.appVersion;
                interactor.session.navigator_innerWidth = window.innerWidth;
                interactor.session.navigator_innerHeight = window.innerHeight;
                interactor.session.navigator_outerWidth = window.outerWidth;
                interactor.session.navigator_outerHeight = window.outerHeight;

                return interactor;
            },


            // Gather Additional Data and Send Interaction(s) to Server
            __sendInteractions__: function () {

                var interactor = this,
                    // Initialize Cross Header Request
                    xhr = new XMLHttpRequest();

                // Close Session
                interactor.__closeSession__();


                // Post Session Data Serialized as JSON
                xhr.open('POST', interactor.endpoint, interactor.async);
                xhr.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
                xhr.withCredentials = true;
                xhr.send(JSON.stringify(interactor.session));

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
                        event_type: 'page load',
                        loadTime: new Date(),
                        token: interactor.apiKey,
                        language: window.navigator.language,
                        platform: window.navigator.platform,
                        port: window.location.port,
                        navigator_app_name: window.navigator.appVersion,
                        navigator_innerWidth: window.innerWidth,
                        navigator_innerHeight: window.innerHeight,
                        navigator_outerWidth: window.outerWidth,
                        navigator_outerHeight: window.outerHeight,
                        page_path: window.location.pathname,
                        page_url: window.location.href,
                        page_origin: window.location.origin,
                        page_title: document.title,
                        page_description: interactor.__getContentsOfMeta__("og:description"),
                        page_type: interactor.__getContentsOfMeta__("og:type"),
                        page_keywords: interactor.__getContentsOfMeta__("keywords"),
                        page_author: interactor.__getContentsOfMeta__("author"),
                        page_tag: interactor.__getContentsOfMeta__("article:tag"),
                        page_section: interactor.__getContentsOfMeta__("article:section")
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
        _yuyo.q.forEach(function(i) {
            var _tmpQElement = [].slice.call(i);
            _ConfigObject[_tmpQElement[0]] = _tmpQElement[1];
        });
        var _trackIntractions = false;
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
                conversions: _trackConversion,
                conversionElement: _conversionElementToTrack,
                conversionEvents: ["mouseup", "touchend"],
                endpoint: 'https://analytics.yuktamedia.com/api/cdp/v1/datasync',
                apiKey: _apiKey,
                async: true,
                debug: false
            });
        }
    }
)();

