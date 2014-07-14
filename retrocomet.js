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
  this.auth = null;

  /**
   * The port on which the express server will listen on
   */
  this.port = "8080";

  /**
   * Starts the express server
   */
  this.live = function() {
    _this.auth = new OAuth2Client(this.clientId, this.clientSecret, 'http://localhost:' + _this.port + '/token');
    server = app.listen(this.port);
  };

  /**
   * Closes the express server
   */
  this.die = function() {
    if (server) {
      server.close();
    }
  };

  app.use(bodyParser());
  app.set('views', __dirname + '/views');
  app.set('view options', {
    layout: false
  });
  app.set('view engine', 'jade');

  /**
   * Entry point for getting the access token.
   */
  app.get('/login', function(req, res) {
    // generate consent page url
    var url = _this.auth.generateAuthUrl({
      access_type: 'offline', // will return a refresh token
      scope: 'https://www.googleapis.com/auth/gmail.readonly'
    });

    res.redirect(url);
  });

  app.get('/token', function(req, res) {
    code = req.query.code;
    // request access token
    _this.auth.getToken(code, function(err, tokens) {
      // set tokens to the client
      _this.auth.credentials = tokens;
      res.redirect('/profile');
    });
  });

  app.get('/profile', function(req, res) {
    googleapis
      .discover('gmail', 'v1')
      .withAuthClient(_this.auth)
      .execute(function(err, client) {
        if (err) {
          console.log('Problem during the client discovery (1).', err);
          return;
        }

        //Params and var for querying raw list of emails
        //@todo: only 1 page here. NEED MOAR, see getMails.js for nextPageToken
        var params = {
          userId: 'me',
          includeSpamTrash: false,
          maxResults: 300
        }
        var listMailsUrl = client.gmail.users.messages.list(params);

        listMailsUrl.execute(function(err, response) {
          if (err) {
            console.log('Error while getting list of mails.', err);
            return;
          }

          //Results stored in response. Just need to iterate through them.
          for (var i = 0; i < response.messages.length; i++) {
            //Params and var for querying big dump of emails with tons of data keys.
            //@todo: something with that data.
            var mailParams = {
              userId: 'me',
              id: response.messages[i].id
            }
            var getMails = client.gmail.users.messages.get(mailParams);

            getMails.execute(function(err, data) {
              if (err) {
                console.log('Error while getting individual mails.', err);
                return;
              }
              console.log('MAILS', data); //here you go.
            })
          }
        });
      });
  });

}

module.exports = RetroComet;
