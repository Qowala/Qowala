var users = require('./../users.js');
var expect = require('chai').expect;

describe("Users", function(){
  describe(".addUser()", function(){
    it("should create single arrays with default values", function(){
      // First try to add a user
      var userId = 2;
      var result = users.addUser(userId);

      expect(result.id).to.equal(2);
      expect(result.usersArray).to.have.a.property(2);

      // Second try to add another user
      var userId = 1;
      var secondResult = users.addUser(userId);

      expect(secondResult.id).to.equal(1);
      expect(secondResult.usersArray).to.have.a.property(1);

      // Third add first user again to verify that it overwrites the first action
      var userId = 2;
      var thirdResult = users.addUser(userId);

      // At the end this is expected
      var expected = [,
        {socket:null, pause:false},
        {socket:null, pause:false}
      ];

      expect(thirdResult.id).to.equal(2);
      expect(thirdResult.usersArray).to.have.a.property(2);
      expect(thirdResult.usersArray).to.deep.equal(expected);


    });
  });

  describe(".setSocket()", function(){
    it("should store users socket if he exist", function(){

      // First test that the socket is assigned to the user
      var userId = 2;
      var socket = {data: "dump data"};
      result = users.setSocket(userId, socket);

      // Second test that the socket throws an error when the user doesn't exist
      var userId = 3;
      expect(users.setSocket.bind(users.setSocket, userId, socket)).to.throw(Error);

      // Third test that the users socket is been overwritten
      var userId = 2;
      var socket = {data: "Another kind of data"};
      secondResult = users.setSocket(userId, socket);

      var expected = [,
        {socket:null, pause:false},
        {socket:{data: "Another kind of data"}, pause:false}
      ];

      expect(secondResult).to.deep.equal(expected);
    });
  });

  describe(".broadcast()", function(){
    it("should broadcast the user following the hashtag", function(){
      var tweet = {tweet: "dump data"};
      var updatedTags = {tweet: "dump data"};
      var tagsStats = {tweet: "dump data"};

      // First test that function throws an error if user doesn't exist
      var userId = 4;
      expect(users.broadcast.bind(users.broadcast, userId, tweet, updatedTags, tagsStats)).to.throw(Error, 'User doesn\'t exist. Impossible to broadcast');

      // Second test that function throws an error if the user's socket hasn't been set
      users.addUser(userId);
      expect(users.broadcast.bind(users.broadcast, userId, tweet, updatedTags, tagsStats)).to.throw(Error, 'User\'s socket doesn\'t exist. Impossible to broadcast');

      // Third test that the function uses the socket emit function when all is ok
      users.setSocket(userId, {
        emit: function(tweetString, Object){
                throw 'Socket being emitted';
        }
      });
      expect(users.broadcast.bind(users.broadcast, userId, tweet, updatedTags, tagsStats)).to.throw('Socket being emitted');

      // Fourth test that the function doesn't fire when the user has put pause
      users.togglePause(userId);
      expect(users.broadcast.bind(users.broadcast, userId, tweet, updatedTags, tagsStats)).not.to.throw('Socket being emitted');
    });
  });
});
