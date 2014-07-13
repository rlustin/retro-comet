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
      access_type: 'offline', // will return a refresh token
      scope: 'https://www.googleapis.com/auth/plus.me'
    });

    res.redirect(url);
  });

  /**
   * Renders the page for when a user has been authenticated by Google
   */
  app.get('/token', function(req, res){
    res.render("auth");
  });

  /**
   * Since the Google code is only available in the browser URL fragment,
   * it is not available server-side so we need to post it to the server from the browser.
   * This is the entry point for persisting that token
   */
  app.post('/token', function(req, res){
    var hash = req.body.hash;
    var codeField = "code=";
    var code = hash.substring(hash.indexOf(codeField) + codeField.length);

    // request access token
    _this.client.getToken(code, function(err, tokens) {
      // set tokens to the client
      _this.client.setCredentials(tokens);
    });

    res.json({
      redirect: '/profile'
    });
  });

  app.get('/profile', function(req, res){
    res.render("main");
  });

}

module.exports = RetroComet;