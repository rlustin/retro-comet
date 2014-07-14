function listMails(userId, query, callback) {
  //As far as I understand, with this preliminary step,
  //we should get returned a list beyond the initial page
  //(200 or so emails by page).
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  //Adapted to work with retro-comet node code
  var initialRequest = client.gmail.users.messages.list({
    'userId': userId,
    //'q': query
  });
  getPageOfMessages(initialRequest, []);
}

var params = {
  userId = 'me',
  includeSpamTrash = false,
  maxResults = 300
}
var listMailsUrl = client.gmail.users.messages.list(params);

listMailsUrl.execute(function(err, response) {
  if (err) {
    console.log('Error while getting list of mails.', err);
    return;
  }
  console.log('LIST OF MAILS: ', response);
});
