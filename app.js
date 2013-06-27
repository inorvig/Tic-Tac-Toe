var express = require('express')
  , http    = require('http');
  
  var app = express();

  /* Express middleware */

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/public');
  app.use(express.static('public'));

  /* Our lone route */

  app.get('/', function(req, res) {
    res.render('tictac_html');
  });

  /* Let there be life! */

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port') + '.');
  });
  