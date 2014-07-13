function getListOgLabels(userId, callback) {
  //idem getThreads
  //userId = ???
  var request = gapi.client.gmail.users.labels.list({
    "userId": userId
  });
}
