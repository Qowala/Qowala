describe("mainSidebar", function(){

  describe("_chooseCompletion", function(){
    beforeAll(function() {
      var firstLi = document.createElement('li');
      var secondLi = document.createElement('li');
      var thirdLi = document.createElement('li');
      firstLi.textContent = 'AdeleName @Adele';
      secondLi.textContent = 'AdrianName @Adriana';

      var suggestionPanel = document.createElement('div');
      suggestionPanel.id = "suggestionPanel";
      suggestionPanel.appendChild(firstLi);
      suggestionPanel.appendChild(secondLi);
      suggestionPanel.appendChild(thirdLi);

      document.body.appendChild(suggestionPanel);

      var messageTextarea = document.createElement('textarea');
      messageTextarea.id = "messageTextarea";
      messageTextarea.value = "Hey @Ad where are you?";

      document.body.appendChild(messageTextarea);

      var numberCharactersLeft = document.createElement('span');
      numberCharactersLeft.id = "numberCharactersLeft";
      numberCharactersLeft.value = "0";

      document.body.appendChild(numberCharactersLeft);

      var sendTweetButton = document.createElement('button');
      sendTweetButton.id = "sendTweetButton";

      document.body.appendChild(sendTweetButton);

      socket = {emit: function(){}};
    });

    afterAll(function() {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it("should block selection down when limit reached", function(){
      // Triggered event
      var e = {
        keyCode: 40, // Key Down
        preventDefault: function(){}
      };
      var suggestions = document.getElementById('suggestionPanel')
        .getElementsByTagName('li');

      _chooseCompletion(e);
      _chooseCompletion(e);
      _chooseCompletion(e);

      expect(suggestions[0].style.backgroundColor).toEqual('');
      expect(suggestions[1].style.backgroundColor).toEqual('');
      expect(suggestions[2].style.backgroundColor).toEqual('rgb(245, 245, 220)');
    });

    it("should block selection up when limit reached", function(){
      // Triggered event
      var e = {
        keyCode: 38, // Key Up
        preventDefault: function(){}
      };
      var suggestions = document.getElementById('suggestionPanel')
        .getElementsByTagName('li');

      suggestions[1].style.backgroundColor = 'rgb(245, 245, 220)';

      _chooseCompletion(e);
      _chooseCompletion(e);
      _chooseCompletion(e);

      expect(suggestions[0].style.backgroundColor).toEqual('rgb(245, 245, 220)');
      expect(suggestions[1].style.backgroundColor).toEqual('');
      expect(suggestions[2].style.backgroundColor).toEqual('');
    });

    it("should add the chosen username", function(){
      // Triggered event
      var e = {
        keyCode: 9, // Key tab
        preventDefault: function(){}
      };
      var suggestions = document.getElementById('suggestionPanel')
        .getElementsByTagName('li');
      var messageTextarea = document.getElementById('messageTextarea');

      var numberCharactersLeft = document.getElementById('numberCharactersLeft');

      var sendTweetButton = document.getElementById('sendTweetButton');

      suggestions[1].style.backgroundColor = 'rgb(245, 245, 220)';

      _setCursor(messageTextarea, 7);

      _chooseCompletion(e);

      expect(messageTextarea.value).toEqual('Hey @Adriana where are you?');
    });
  });

});

describe("mainSidebar", function(){

  describe("updateNameSuggestion", function(){

    beforeEach(function() {
      var suggestionPanel = document.createElement('div');
      suggestionPanel.id = "suggestionPanel";

      document.body.appendChild(suggestionPanel);

      var messageTextarea = document.createElement('textarea');
      messageTextarea.id = "messageTextarea";
      messageTextarea.value = "Hey @Jo where are you?";

      document.body.appendChild(messageTextarea);

      socket = {
        emit: function(){
        }
      };

      spyOn(socket, 'emit');
    });

    it("should emit searchUser if user begins to write a username", function(){
      var messageTextarea = document.getElementById('messageTextarea');

      _setCursor(messageTextarea, 7);

      _updateNameSuggestion();

      expect(socket.emit).toHaveBeenCalled()
    });

    it("should close panel if user doesn't write a username", function(){
      var suggestionPanel = document.getElementById('suggestionPanel');
      suggestionPanel.style.display = "block";

      var messageTextarea = document.getElementById('messageTextarea');

      _setCursor(messageTextarea, 1);

      _updateNameSuggestion();

      expect(socket.emit).not.toHaveBeenCalled()
      expect(suggestionPanel.style.display).toEqual("none");
    });

    it("should close panel if cursor after a username", function(){
      var messageTextarea = document.getElementById('messageTextarea');

      _setCursor(messageTextarea, 8);

      _updateNameSuggestion();

      expect(socket.emit).not.toHaveBeenCalled()
      expect(suggestionPanel.style.display).toEqual("none");
    });
  });

});
