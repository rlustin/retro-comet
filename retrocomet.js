var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;

/**
 * Initializes a new instance of the RetroComet class
 */
function RetroComet() {
  /**
   * The current express server associated with this bot
   */
  var app = express();
  var _this = this;
  var server = null;

  // Client ID and client secret are available at
  // https://code.google.com/apis/console
  this.clientId = null;
  this.clientSecret = null;

  // OAuth2Client
  this.client = null;

  /**
   * The port on which the express server will listen on
   */
  this.port = "8080";

  /**
   * Starts the express server
   */
  this.live = function() {
    this.client = new OAuth2Client(this.clientId, this.clientSecret, 'http://localhost:' + _this.port + '/token');
    server = app.listen(this.port);
  };

  /**
   * Closes the express server
   */
  this.die = function(){
    if (server) {
      server.close();
    }
  };

  app.use(bodyParser());
  app.set('views', __dirname + '/views');
  app.set('view options', { layout: false });
  app.set('view engine', 'jade');

  /**
   * Entry point for getting the access token.
   */
  app.get('/login', function(req, res){
    // generate consent page url
    var url = _this.client.generateAuthUrl({
      access_type: 'offline'
      scope: {'https://www.googleapis.com/auth/plus.me',
             'https://mail.google.com/',
             'https://www.googleapis.com/auth/gmail.modify',
             'https://www.googleapis.com/auth/gmail.readonly'}
    });

    res.redirect(url);
  });

  app.get('/token', function(req, res){
    code = req.query.code;
    // request access token
    _this.client.getToken(code, function(err, tokens) {
      // set tokens to the client
      _this.client.setCredentials(tokens);
    });

    res.redirect('/profile');
  });

  app.get('/profile', function(req, res){
    res.render("main");
  });

}

module.exports = RetroComet;
