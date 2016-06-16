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
    function ServiceNode(n) {
        RED.nodes.createNode(this,n);

        // Configuration options passed by Node Red
        this.name = n.name;
        this.image = n.image;
        this.alwayspull = n.alwayspull;
        this.ports = n.ports;

        // volumes parameters
        this.volumes = n.volumes;
        this.volumesfrom = n.volumesfrom;
        this.volumedriver = n.volumedriver;

        // Command parameters
        this.cmd = n.cmd;
        this.entrypoint = n.entrypoint;
        this.user = n.user;
        this.console = n.console;
        this.autorestart = n.autorestart;
        this.envvars = n.envvars;

        // Network parameters
        this.network = n.network;
        this.ip = n.ip;
        this.hostname = n.hostname;
        this.domain = n.domain;

        // Host parameters
        this.privileged = n.privileged;
        this.pidmode = n.pidmode;
        this.memlimit = n.memlimit;
        this.swaplimit = n.swaplimit;
        this.cpupin = n.cpupin;
        this.shares = n.shares;
        this.capadd = n.capadd;
        this.capdrop = n.capdrop;
        this.devices = n.devices;

        // labels parameters
        this.labels = n.labels;

        // If the config node is missing certain options (it was probably deployed prior to an update to the node code),
        // select/generate sensible options for the new fields
        if (typeof this.pidmode === 'undefined'){
            this.pidmode = false;
        }
        if (typeof this.privileged === 'undefined'){
            this.privileged = false;
        }
        if (typeof this.alwayspull === 'undefined'){
            this.alwayspull = false;
        }
        if (typeof this.console === 'undefined'){
            this.console = '-it';
        }
        if (typeof this.autorestart === 'undefined'){
            this.autorestart = 'never';
        }
        if (typeof this.capadd === 'undefined'){
            this.capadd = 'none';
        }
        if (typeof this.capdrop === 'undefined'){
            this.capdrop = 'none';
        }
    }

    RED.nodes.registerType("service",ServiceNode);
};
