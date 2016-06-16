/**
 * Copyright 2013, 2015 IBM Corp.
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
    var nodemailer = require("nodemailer");
    try {
        var globalkeys = RED.settings.smtp;
    } catch(err) {
    }

    function SmtpNode(n) {
        RED.nodes.createNode(this,n);
        this.topic = n.topic;
        this.name = n.name;
        this.outserver = n.server;
        this.outport = n.port;
        this.secure = n.secure;
        if (this.credentials && this.credentials.hasOwnProperty("userid") && this.credentials.hasOwnProperty("password")) {
            this.userid = this.credentials.userid;
            this.password = this.credentials.password;
        } else {
            if (globalkeys) {
                this.password = globalkeys.pass;
                this.userid = globalkeys.user;
                RED.nodes.addCredentials(n.id,{userid:this.userid, password:this.password, global:true});
            }
        }
        var node = this;

        var smtpTransport;
        if (node.userid) {
            smtpTransport = nodemailer.createTransport({
              host: node.outserver,
              port: node.outport,
              secure: node.secure,
              auth: {
                  user: node.userid,
                  pass: node.password
              }
          });
        } else {
            smtpTransport = nodemailer.createTransport({
              host: node.outserver,
              port: node.outport,
              secure: node.secure
          });
        }

        this.on("input", function(msg) {
            if (msg.hasOwnProperty("payload")) {
                if (smtpTransport) {
                    node.status({fill:"blue",shape:"dot",text:"email.status.sending"});
                    if (msg.to && node.name && (msg.to !== node.name)) {
                        node.warn(RED._("node-red:common.errors.nooverride"));
                    }
                    var sendopts = { from: node.userid };   // sender address
                    sendopts.to = node.name || msg.to; // comma separated list of addressees
                    sendopts.subject = msg.topic || msg.title || "Message"; // subject line
                    if (Buffer.isBuffer(msg.payload)) { // if it's a buffer in the payload then auto create an attachment instead
                        if (!msg.filename) {
                            var fe = "bin";
                            if ((msg.payload[0] === 0xFF)&&(msg.payload[1] === 0xD8)) { fe = "jpg"; }
                            if ((msg.payload[0] === 0x47)&&(msg.payload[1] === 0x49)) { fe = "gif"; } //46
                            if ((msg.payload[0] === 0x42)&&(msg.payload[1] === 0x4D)) { fe = "bmp"; }
                            if ((msg.payload[0] === 0x89)&&(msg.payload[1] === 0x50)) { fe = "png"; } //4E
                            msg.filename = "attachment."+fe;
                        }
                        sendopts.attachments = [ { content: msg.payload, filename:(msg.filename.replace(/^.*[\\\/]/, '') || "file.bin") } ];
                        if (msg.hasOwnProperty("headers") && msg.headers.hasOwnProperty("content-type")) {
                            sendopts.attachments[0].contentType = msg.headers["content-type"];
                        }
                        // Create some body text..
                        sendopts.text = RED._("smtp.default-message",{filename:(msg.filename.replace(/^.*[\\\/]/, '') || "file.bin"),description:(msg.hasOwnProperty("description") ? "\n\n"+msg.description : "")});
                    }
                    else {
                        var payload = RED.util.ensureString(msg.payload);
                        sendopts.text = payload; // plaintext body
                        if (/<[a-z][\s\S]*>/i.test(payload)) { sendopts.html = payload; } // html body
                        if (msg.attachments) { sendopts.attachments = msg.attachments; } // add attachments
                    }
                    smtpTransport.sendMail(sendopts, function(error, info) {
                        if (error) {
                            node.error(error,msg);
                            node.status({fill:"red",shape:"ring",text:"smtp.status.sendfail"});
                        } else {
                            node.log(RED._("smtp.status.messagesent",{response:info.response}));
                            node.status({});
                        }
                    });
                }
                else { node.warn(RED._("smtp.errors.nocredentials")); }
            }
            else { node.warn(RED._("smtp.errors.nopayload")); }
        });
    }
    RED.nodes.registerType("smtp",SmtpNode,{
        credentials: {
            userid: {type:"text"},
            password: {type: "password"},
            global: { type:"boolean"}
        }
    });
};
