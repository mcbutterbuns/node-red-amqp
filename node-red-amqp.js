module.exports = function(RED){

  'use strict';

  var amqp = require('amqp');
  var that = this;

  function sendMessage(node, message) {
    var msg = {};
    console.log(node);
    msg.payload = message;
    node.send(msg);
  }

  function AMQP(n){
    RED.nodes.createNode(this,n);

    var that = this;

    var connectionOptions = {
      host: n.host,
      port: n.port,
      login: n.username,
      password: n.password,
      vhost: n.vhost
    };


    var connection = amqp.createConnection(connectionOptions);

    connection.on('ready', function(){

      console.info('Connection open');

      connection.exchange(n.ex, {durable: true}, function(exchange){

        console.info('Exchange open');

        connection.queue(n.queue, {durable: n.queue_durable}, function(q){

          console.info('Queue declared');

          q.bind(exchange, n.queue_routing_key, function(){

            console.info('Queue bound');

            q.subscribe(function(message, headers, deliveryInfo, messageObject){

              console.log('message received');
              sendMessage(that, message);

            });

          });

        });
      });

    });

    this.on('close', function(){
      connection.disconnect();
    });

  }


  RED.nodes.registerType('amqp', AMQP);

};
