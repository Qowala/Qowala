var fbUsers = {};
var fbThreads = {};

exports.getUserInfo = function(api, userID) {
  return new Promise(function (resolve, reject) {
    if (fbUsers[userID]) return resolve(fbUsers[userID])
    api.getUserInfo(userID, function(err, ret) {
      if(err) return console.error(err);
      // Browse the ret array
      for(var prop in ret) {
        fbUsers[prop] = ret[prop].name;
        resolve(fbUsers[prop]);
      }
    });
  });
}

exports.getThreadInfo = function(api, threadID) {
  return new Promise(function (resolve, reject) {
    if (fbThreads[threadID]) resolve(fbThreads[threadID])
    api.getThreadInfo(threadID, function(err, ret) {
      if(err) return console.error(err);
      fbThreads[threadID] = ret.name;
      resolve(fbThreads[threadID]);
    });
  });
}
