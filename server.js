var express = require('express');
var app = express();
var port = 8080;
var MongoClient = require('mongodb').MongoClient;
var testDb = 'mongodb://localhost:27017/test';
var thisUrl = 'http://www.shorturl.com/';
var urlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i

MongoClient.connect(testDb, function(err, db) {
 if (err) {
  throw err;
 } else { 
  console.log('connected to db: ' + testDb);
  //connect to root of site, will display instructions
  app.get('/', function(req, res) {
   res.send('Enter a valid url as a request parameter to recieve a shortened url, or enter the shortened url to be redirected');
  });
  //takes any parameter sent to site in url
  app.get('/:url*', function(req, res) {
   var obj = {"original_url": "", "short_url": thisUrl};
   //look for short url for redirect
   db.collection('urls').findOne({short_url: req.params.url}, function(err, doc) {
    if (err) {
     throw err; 
    } else {
     if (doc) {
      res.redirect(doc.original_url);
     } else {
      //look to see if requrested url to be shortened already has shortcut in database
      db.collection('urls').findOne({original_url: req.params.url + req.params[0]}, function(err, doc) {
       if (err) {
        throw err;
       } else {
        if (doc) {
         obj.short_url += doc.short_url;
         obj.original_url += doc.original_url;
         res.send(obj);
        } else {
         //get length of current database to determine short url number
         db.collection('urls').find().toArray(function(err, items) {
          if (err) {
           throw err;
          } else { 
           //if short url or original url wasn't found, create new record if it is a valid url
           if (urlRegex.test(req.params.url + req.params[0])) {
            console.log('valid url');
            db.collection('urls').insertOne({"original_url": req.params.url + req.params[0], "short_url": String(items.length)}, function(err, result) {
             if (err) {
              throw err;
             } else {
              obj.short_url += result.ops[0].short_url;
              obj.original_url += result.ops[0].original_url;
              res.send(obj);
              console.log('Inserted document.');
             }
            });
           } else {
            res.send('Invalid url. Enter a valid url as a request parameter to recieve a shortened url, or enter the shortened url to be redirected.');
           } 
          }
         }); 
        }
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
