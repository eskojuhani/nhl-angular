const path = require('path');
const express = require('express');
const app = express();

let env = process.env.NODE_ENV || 'development';

let forceSSL = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

if (env === 'production') {
  app.use(forceSSL);
}

// Serve static files
app.use(express.static('./dist/nhl-angular'));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '/dist/nhl-angular/index.html'));
});

// default Heroku port
app.listen(process.env.PORT || 5000);
