var express = require('express');
var app = express();
var port = 8080;

app.get('/', function(req, res) {
 res.send('Hello, Newman');	
});

app.listen(process.env.PORT || port, function() {
 console.log('listening on port ' + port);
});
