var fbUsers = {};
var fbThreads = {};

function getUserInfo(api, userID) {
  return new Promise(function (resolve, reject) {
    if (fbUsers[userID]) return resolve(fbUsers[userID])
    api.getUserInfo(userID, function(err, ret) {
      if(err) return console.error(err);
      // Browse the ret array
      for(var prop in ret) {
        fbUsers[prop] = {
          id: userID,
          name: ret[prop].name,
          img: ret[prop].thumbSrc
        };
        resolve(fbUsers[prop]);
      }
    });
  });
}

exports.getUserInfo = getUserInfo;

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

exports.getThreadList = function(currentUserID, api, nbThreads) {
  return new Promise(function (resolve, reject) {
    api.getThreadList('0', nbThreads, function(err, arr) {
      if(err) return console.error(err);
      var userInfoPromises = [];
      // Populate threads with no name and no image
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].isCanonicalUser || arr[i].name === '') {
          for (var z = 0; z < arr[i].participants.length; z++) {
            // Don't put current user in thread's names and images
            if (arr[i].participants[z] !== currentUserID){
              userInfoPromises.push(getUserInfo(api, arr[i].participants[z]));
            }
          }
        }
      }
      // Get all user infos and then update the thread list
      Promise.all(userInfoPromises).then(function (userInfoArr) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].name === '') {
            for (var y = 0; y < userInfoArr.length; y++) {
              if (arr[i].participants.indexOf(userInfoArr[y].id) > -1){
                arr[i].imageSrc = userInfoArr[y].img;
                if (arr[i].name !== '') {
                  arr[i].name += ', ' + userInfoArr[y].name;
                }
                else {
                  arr[i].name = userInfoArr[y].name;
                }
              }
            }
          }
        }
        resolve(arr);
      });
    });
  });
}
