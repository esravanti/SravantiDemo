module.exports = function(RED) {
    function StopNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.exitCode = config.exitCode;

        this.on('input', function(msg) {
//          var p = global.get('process');
          if (msg.exitCode) {
            RED.log.info(this.name+"["+msg.exitCode+"]")
            RED.nodes.stopFlows().then(function(){
              process.exit(msg.exitCode);
            });
          }
          else {
            RED.log.info(this.name+"["+this.exitCode+"]")
            RED.nodes.stopFlows().then(function(){
              process.exit(this.exitCode);
            });
          }
        });
    }
    RED.nodes.registerType("stop",StopNode);
}
