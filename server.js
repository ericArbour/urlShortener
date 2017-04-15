var express = require('express');
var app = express();
var port = 8080;
var MongoClient = require('mongodb').MongoClient;
var testDb = 'mongodb://localhost:27017/test';
var thisUrl = 'http://www.some-heroku-thing.com/';

MongoClient.connect(testDb, function(err, db) {
 if (err) {
  throw err;
 } else { 
  console.log('connected to db: ' + testDb);
  app.get('/', function(req, res) {
   res.send('Hey, you either want a url shortened or redirected to a rul, right?');
  });
  app.get('/:url', function(req, res) {
   var cursor = db.collection('urls').findOne({short_url: req.params.url}, function(err, doc) {
    if (err) {
     throw err; 
    } else {
     if (doc) {
      var obj = {"original_url": "", "short_url": thisUrl};
      obj.short_url += doc.short_url;
      obj.original_url += doc.original_url;
      res.send(obj);
     } else {
      db.collection('urls').find().toArray(function(err, items) {
       if (err) {
        throw err;
       } else { 
        db.collection('urls').insertOne({"original_url": req.params.url, "short_url": String(items.length - 1)}, function(err, result) {
         if (err) {
          throw err;
         } else {
         console.log('Inserted document.');
         }
        }); 
       }
      }); 
     }
    }
   }); 
  }); 	
 }
});

app.listen(process.env.PORT || port, function() {
 console.log('listening on port ' + port);
});
