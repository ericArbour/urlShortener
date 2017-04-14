var express = require('express');
var app = express();
var port = 8080;
var MongoClient = require('mongodb').MongoClient;
var testDb = 'mongodb://localhost:27017/test'

MongoClient.connect(testDb, function(err, db) {
 if (err) {
  throw err;
 } else { 
  console.log('connected to db: ' + testDb);
  app.get('/', function(req, res) {
   res.send('Hey, you either want a url shortened or redirected to a rul, right?');
  });
  app.get('/:url', function(req, res) {
   var cursor = db.collection('urls').find().toArray(function(err, items) {
    if (err) {
     throw err; 
    } else {
     items.forEach(function(item) {
      if (item.hasOwnProperty(req.params.url)) {
       console.log(item[req.params.url]);
      }
     });
    }
   }); 
   res.send(req.params.url);
  }); 	
 }
});

app.listen(process.env.PORT || port, function() {
 console.log('listening on port ' + port);
});
