/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
        loadInAppBrowser()

        function loadInAppBrowser() {
            var inAppBrowserRef;
            function showHelp(url) {
                var target = "_blank";
                var options = "location=yes,hidden=yes";
                inAppBrowserRef = cordova.InAppBrowser.open(url, target, options);
                // inAppBrowserRef.addEventListener('loadstart', loadStartCallBack);
                // inAppBrowserRef.addEventListener('loadstop', loadStopCallBack);
                // inAppBrowserRef.addEventListener('loaderror', loadErrorCallBack);
            }
            function loadStartCallBack() {
                $('#status-message').text("loading please wait ...");
            }

            function loadStopCallBack() {
                if (inAppBrowserRef != undefined) {
                    inAppBrowserRef.insertCSS({ code: "body{font-size: 25px;" });
                    $('#status-message').text("");
                    inAppBrowserRef.show();
                }

            }

            function loadErrorCallBack(params) {
                $('#status-message').text("");
                var scriptErrorMesssage =
                    "alert('Sorry we cannot open that page. Message from the server is : "
                    + params.message + "');"
                inAppBrowserRef.executeScript({ code: scriptErrorMesssage }, executeScriptCallBack);
                inAppBrowserRef.close();
                inAppBrowserRef = undefined;
            }

            function executeScriptCallBack(params) {
                if (params[0] == null) {
                    $('#status-message').text(
                        "Sorry we couldn't open that page. Message from the server is : '"
                        + params.message + "'");
                }
            }
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        var networkState = checkConnection();
        /* load local files if there is not network connection */
        if (networkState == Connection.NONE) {
            navigator.notification.alert('This app requires an internet connection');
        } else {
            cordova.InAppBrowser.open("https://www.readyactionplan.com/login", "_blank", "toolbar=no,location=no")
            // window.location = "https://www.readyactionplan.com/login";
        }

        function checkConnection() {
            var networkState = navigator.network.connection.type;
            var states = {};
            states[Connection.UNKNOWN] = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI] = 'WiFi connection';
            states[Connection.CELL_2G] = 'Cell 2G connection';
            states[Connection.CELL_3G] = 'Cell 3G connection';
            states[Connection.CELL_4G] = 'Cell 4G connection';
            states[Connection.NONE] = 'No network connection';
            return networkState;
        }
    }
};

app.initialize();