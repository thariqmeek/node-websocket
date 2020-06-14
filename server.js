'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
var kafka = require('kafka-node');
var HighLevelConsumer = kafka.Consumer;
var Client = kafka.KafkaClient;
var client = new Client('localhost:2181');
var topics = [{
  topic: 'readings'
}];
var decodedMessage;
var options = {
    autoCommit: true,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    encoding: 'buffer'
  };
  var consumer = new HighLevelConsumer(client, topics, options);
  consumer.on('message', function(message) {
    var buf = new Buffer(message.value, 'binary'); // Read string into a buffer.
    decodedMessage = buf.toString(); // Skip prefix.
    console.log(decodedMessage);
  });
  
  consumer.on('error', function(err) {
    console.log('error', err);
  });
  
  process.on('SIGINT', function() {
    consumer.close(true, function() {
      process.exit();
    });
  });
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
   
    client.send(decodedMessage);
  });
}, 1000);
