var kafka = require('kafka-node');
var HighLevelConsumer = kafka.Consumer;
var Client = kafka.KafkaClient;
var client = new Client('localhost:2181');
var topics = [{
  topic: 'readings'
}];
var options = {
    autoCommit: true,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    encoding: 'buffer'
  };
  var consumer = new HighLevelConsumer(client, topics, options);
  
  consumer.on('message', function(message) {
    var buf = new Buffer(message.value, 'binary'); // Read string into a buffer.
    var decodedMessage = buf.toString(); // Skip prefix.
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