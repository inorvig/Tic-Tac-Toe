var express = require('express')
  , http    = require('http');
  
  var app = express();

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/public');
  app.use(express.static('public'));

  app.get('/', function(req, res) {
    res.sendfile(__dirname+'/public/tictac_html.html');
  });

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port') + '.');
  });
  
