/**
 * Copyright 2015 Cisco Systems Inc..
 *
 **/
/**
 * Copyright 2013,2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    function ProviderNode(n) {
        RED.nodes.createNode(this,n);

        // Configuration options passed by Node Red
        this.provider = n.provider;
        this.port = n.port;
        this.usetls = n.usetls;

        // Config node state
        this.providerurl = "";
        this.connected = false;
        this.connecting = false;
        this.options = {};

        if (this.credentials) {
            this.username = this.credentials.user;
            this.password = this.credentials.password;
        }

        // If the config node is missing certain options (it was probably deployed prior to an update to the node code),
        // select/generate sensible options for the new fields
        if (typeof this.usetls === 'undefined'){
            this.usetls = false;
        }

        // Create the URL to pass in to the http.js library
        if (this.providerurl == "") {
            if (this.usetls) {
                this.providerurl="https://";
            } else {
                this.providerurl="hppt://";
            }
            if (this.provider != "") {
                this.providerurl = this.providerurl+this.provider+":"+this.port;
            } else {
                this.providerurl = this.providerurl+"localhost:8080";
            }
        }

        // Build options for passing to the http.js API
        this.options.username = this.username;
        this.options.password = this.password;

        this.connect = function () {
            if (!node.connected && !node.connecting) {
                node.connecting = true;
                node.client = {};
/*  GES make call to provider
                mqtt.connect(node.brokerurl ,node.options);
*/
                node.client.setMaxListeners(0);
                // Register successful connect or reconnect handler
                node.client.on('connect', function () {
                    node.connecting = false;
                    node.connected = true;
                    node.log(RED._("provider.state.connected",{provider:node.providerurl}));
                    for (var id in node.users) {
                        if (node.users.hasOwnProperty(id)) {
                            node.users[id].status({fill:"green",shape:"dot",text:"common.status.connected"});
                        }
                    }
                    // Remove any existing listeners before resubscribing to avoid duplicates in the event of a re-connection
                    node.client.removeAllListeners('message');
                });

                // Register disconnect handlers
                node.client.on('close', function () {
                    if (node.connected) {
                        node.connected = false;
                        node.log(RED._("provider.state.disconnected",{provider:node.providerurl}));
                        for (var id in node.users) {
                            if (node.users.hasOwnProperty(id)) {
                                node.users[id].status({fill:"red",shape:"ring",text:"common.status.disconnected"});
                            }
                        }
                    } else if (node.connecting) {
                        node.log(RED._("provider.state.connect-failed",{provider:node.providerurl}));
                    }
                });

                // Register connect error handler
                node.client.on('error', function (error) {
                    if (node.connecting) {
                        node.client.end();
                        node.connecting = false;
                    }
                });
            }
        };

        this.on('close', function(done) {
            if (this.connected) {
                this.client.on('close', function() {
                    done();
                });
                this.client.end();
            } else {
                done();
            }
        });

    }

    RED.nodes.registerType("provider",ProviderNode,{
        credentials: {
            user: {type:"text"},
            password: {type: "password"}
        }
    });
};
