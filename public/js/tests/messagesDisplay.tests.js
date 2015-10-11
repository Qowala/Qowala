describe("messagesDisplay", function(){
  describe("updateListsToDisplay()", function(){
    beforeEach(function() {
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.twitterLists = [
        {id:'599583255113891841'},
        {id:'599583255113891842'},
        {id:'599583255113891843'}
      ];
      this.messagesDisplay.columnsLayout = [
        {type: 'home'},
        {type: 'list',
        listId: '599583255113891843'},
        {type: 'tag'},
        {type: 'tag'},
        {type: 'list',
        listId: '599583255113891841'}
      ];
      socket = {emit: function(){}};
    });

    it("should return lists to be requested", function(){

      var listsToRequest = this.messagesDisplay.updateListsToDisplay();

      expect(listsToRequest).toBeDefined();
      expect(listsToRequest).not.toBe(null);
      expect(listsToRequest).toEqual([
        {id:'599583255113891843'},
        {id:'599583255113891841'}
      ]);
    });
  });

  describe("useList()", function(){
    beforeEach(function() {
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.twitterLists = [
        {id:'599583255113891841', name: 'TestName'},
        {id:'599583255113891842'},
        {id:'599583255113891843'}
      ];
      this.messagesDisplay.columnsLayout = [
        {type: 'home',
        id: 1},
        {type: 'list',
        listId: '599583255113891843',
        id: 2},
        {type: 'tag',
        id: 4},
        {type: 'tag',
        id: 7}
      ];
      socket = {emit: function(){}};
    });

    it("should add to columnsLayout", function(){
      
      this.messagesDisplay.useList('599583255113891841', 6);

      expect(this.messagesDisplay.columnsLayout).toBeDefined();
      expect(this.messagesDisplay.columnsLayout).not.toBe(null);
      expect(this.messagesDisplay.columnsLayout).toEqual(jasmine.arrayContaining(
      [{
        id: 6,
        name: 'TestName',
        type: 'list',
        listId: '599583255113891841',
        hashtags: []
      }]));
    });

    it("should not add to columnsLayout if already exist", function(){
      this.messagesDisplay.columnsLayout = [
        {type: 'home',
        id: 1},
        {type: 'list',
        listId: '599583255113891843',
        id: 2},
        {type: 'tag',
        id: 4},
        {type: 'tag',
        id: 7},
        {
          id: 6,
          name: 'TestName',
          type: 'list',
          listId: '599583255113891841'
        }
      ];

      this.messagesDisplay.useList('599583255113891841', 6);

      expect(this.messagesDisplay.columnsLayout).toBeDefined();
      expect(this.messagesDisplay.columnsLayout).not.toBe(null);
      expect(this.messagesDisplay.columnsLayout).toEqual([
        {type: 'home',
        id: 1},
        {type: 'list',
        listId: '599583255113891843',
        id: 2},
        {type: 'tag',
        id: 4},
        {type: 'tag',
        id: 7},
        {
          id: 6,
          name: 'TestName',
          type: 'list', 
          listId: '599583255113891841',
          hashtags: []
        }
      ]);
    });
  });

  describe("updateColumnsTwitterLists()", function(){
    beforeEach(function(){
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.twitterLists = [
        {id:'599583255113891841'},
        {id:'599583255113891842'},
        {id:'599583255113891843'}
      ];
      this.messagesDisplay.columnsLayout = [
        {type: 'home',
        id: 1},
        {type: 'list',
        listId: '599583255113891843',
        id: 2},
        {type: 'tag',
        id: 4},
        {type: 'tag',
        id: 7}
      ];
      socket = {emit: function(){}};
    });

    it("should return the available lists", function(){
      
      var availableLists = this.messagesDisplay.updateColumnsTwitterLists();

      expect(availableLists).toBeDefined();
      expect(availableLists).not.toBe(null);
      expect(availableLists).toEqual([
        {id:'599583255113891841'},
        {id:'599583255113891842'}
      ]);
    });

  });

  describe("createUserColumn()", function(){
    beforeEach(function(){
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.messagesColumnsHTML = document.createElement('div');
      this.messagesDisplay.columnsLayout = [];

      MessagesColumn.prototype.updateTwitterLists = function(){
        console.log('Execute function updateTwitterLists()');
      }
      MessagesColumn.prototype.updateHashtagsList = function(){
        console.log('Execute function updateHashtagsList()');
      }
    });

    it("should create home timeline if does not exist", function(){
      var homeColumnSample = new MessagesColumn(
        'home',
        'Home',
        'home',
        this.messagesDisplay
      );
      var messagesColumnsHTMLSample = document.createElement('div');

      genHomeColumn = homeColumnSample.generateColumn();

      homeColumnSample.openSpinner();

      messagesColumnsHTMLSample.appendChild(genHomeColumn);

      this.messagesDisplay.createUserColumn()

      expect(this.messagesDisplay.columnsLayout).toBeDefined();
      expect(this.messagesDisplay.columnsLayout).not.toBe(null);
      expect(this.messagesDisplay.columnsLayout).toEqual([
        {
          id: 'home',
          name: 'Home',
          type: 'home'
        },
      ]);
      expect(this.messagesDisplay.messagesColumnsHTML).toEqual(messagesColumnsHTMLSample);
    });

    it("should only generate home timeline if its only registered", function(){
      this.messagesDisplay.columnsLayout = [
        {
          id: 'home',
          name: 'Home',
          type: 'home'
        },
      ];
      var homeColumnSample = new MessagesColumn(
        'home',
        'Home',
        'home',
        this.messagesDisplay
      );
      var messagesColumnsHTMLSample = document.createElement('div');

      genHomeColumn = homeColumnSample.generateColumn();

      homeColumnSample.openSpinner();

      messagesColumnsHTMLSample.appendChild(genHomeColumn);

      this.messagesDisplay.createUserColumn()

      expect(this.messagesDisplay.columnsLayout).toBeDefined();
      expect(this.messagesDisplay.columnsLayout).not.toBe(null);
      expect(this.messagesDisplay.columnsLayout).toEqual([
        {
          id: 'home',
          name: 'Home',
          type: 'home'
        },
      ]);
      expect(this.messagesDisplay.messagesColumnsHTML).toEqual(messagesColumnsHTMLSample);
    });
  });

  describe("addAllColumns()", function(){
    beforeEach(function(){
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.messagesColumnsHTML = document.createElement('div');
      this.messagesDisplay.columnsLayout = [
        {
          id: 1,
          name: "Home",
          type: "home"
        },
        {
          id: 2,
          name: "AnotherTestColumn",
          type: "list"
        },
        {
          id: 3,
          name: "AnotherTestColumn",
          hashtags: ['hashtag', 'anotherHashtag'],
          type: "tracking"
        },
      ];

      MessagesColumn.prototype.updateTwitterLists = function(){
        console.log('Execute function updateTwitterLists()');
      }
      MessagesColumn.prototype.updateHashtagsList = function(){
        console.log('Execute function updateHashtagsList()');
      }
    });

    it("should add all columns", function(){
      var homeColumn = new MessagesColumn(
        'home',
        'Home',
        'home',
        this.messagesDisplay
      );
      var columnTwo = new MessagesColumn(
        2,
        'AnotherTestColumn',
        'list',
        this.messagesDisplay
      );
      var columnThree = new MessagesColumn(
        3,
        'AnotherTestColumn',
        'tracking',
        this.messagesDisplay
      );
      var messagesColumnsHTMLSample = document.createElement('div');

      genHomeColumn = homeColumn.generateColumn();
      genColumnTwo = columnTwo.generateColumn();
      genColumnThree = columnThree.generateColumn();

      homeColumn.openSpinner();
      columnTwo.openSpinner();
      columnThree.openSpinner();

      messagesColumnsHTMLSample.appendChild(genHomeColumn);
      messagesColumnsHTMLSample.appendChild(genColumnTwo);
      messagesColumnsHTMLSample.appendChild(genColumnThree);

      this.messagesDisplay.addAllColumns();

      expect(this.messagesDisplay.messagesColumnsHTML).toBeDefined();
      expect(this.messagesDisplay.messagesColumnsHTML).not.toBe(null);
      expect(this.messagesDisplay.messagesColumnsHTML).toEqual(messagesColumnsHTMLSample);
    });
  });

  describe("removeHashtag()", function(){
    beforeEach(function(){
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.columnsLayout = [
        {
          id: 1,
          hashtags: ['hashtag', 'anotherHashtag']
        },
        {
          id: 2,
        },
      ];

      var column = new MessagesColumn(
        1,
        'testColumn',
        'tracking',
        this.messagesDisplay
      );
      this.messagesDisplay.messagesColumnsList.push(column);
      var columnTwo = new MessagesColumn(
        2,
        'AnotherTestColumn',
        'list', 
        this.messagesDisplay
      );
      this.messagesDisplay.messagesColumnsList.push(columnTwo);

      this.messagesDisplay.updateColumnsLayout = function(){
        console.log('Execute function updateColumnsLayout()');
      }
      this.messagesDisplay.updateTagsToDisplay = function(){
        console.log('Execute function updateTagsToDisplay()');
      }
    });

    it("should remove hashtag from columnsLayout", function(){
      this.messagesDisplay.removeHashtag(1, 'hashtag');

      expect(this.messagesDisplay.columnsLayout).toBeDefined();
      expect(this.messagesDisplay.columnsLayout).not.toBe(null);
      expect(this.messagesDisplay.columnsLayout).toEqual([
        {
          id: 1,
          hashtags: ['anotherHashtag']
        },
        {
          id: 2,
        },
      ]);

    });
  });

  describe("deleteMessage()", function(){
    beforeEach(function(){
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.messagesColumnsList = [];
    });

    it("should delete the message from the User MessagesColumnList",
      function(){

      var column = new MessagesColumn(
        'home',
        'Home',
        'user',
        this.messagesDisplay
      );
      column.messagesList = [{id_str: '599583255113891843'}];
      this.messagesDisplay.messagesColumnsList.push(column);
      this.messagesDisplay.messagesColumnsList[0]
        .columnContentHTML = document.createElement('div');

      this.messagesDisplay.deleteMessage({
        streamSource: 'home',
        tweet: {
          delete: {
            status: {
              id_str: '599583255113891843'
            }
          }
        }
      });

      expect(this.messagesDisplay.messagesColumnsList[0].messagesList)
        .toEqual([]);

    });

    it("should delete the message from the tracking MessagesColumnList",
      function(){

      var column = new MessagesColumn(
        2,
        'Hashtag',
        'tracking',
        this.messagesDisplay
      );

      column.addMessage({
        id_str: '599583255113891841',
        user: 'John',
        entities: {},
      },
      'tracking', false);
      column.addMessage({
        id_str: '599583255113891842',
        user: 'John',
        entities: {},
      },
      'tracking', false);
      column.addMessage({
        id_str: '599583255113891843',
        user: 'John',
        entities: {},
      },
      'tracking', false);

      var stateBeforeDeletion = column.messagesList;

      this.messagesDisplay.messagesColumnsList.push(column);
      this.messagesDisplay.messagesColumnsList[0]
        .columnContentHTML = document.createElement('div');

      expect(stateBeforeDeletion.length).toEqual(3);

      this.messagesDisplay.deleteMessage({
        streamSource: 'tracking',
        tweet: {
          delete: {
            status: {
              id_str: '599583255113891842'
            }
          }
        }
      });

      expect(stateBeforeDeletion.length).toEqual(2);
      expect(this.messagesDisplay.messagesColumnsList[0].messagesList)
        .toEqual(
        [
          stateBeforeDeletion[0],
          stateBeforeDeletion[1]
        ]
      );
      expect(stateBeforeDeletion[0]).not.toEqual(stateBeforeDeletion[1]);
    });
  });

  describe("processIncoming()", function(){
    beforeEach(function(){
      this.messagesDisplay = new MessagesDisplay();
      this.messagesDisplay.messagesColumnsList = [];
    });

    it("should add message going to search-timeline", function(){

      var column = new MessagesColumn(
        2,
        'Hashtag',
        'tracking',
        this.messagesDisplay
      );

      this.messagesDisplay.columnsLayout = [
        {
          id: 2,
          name: "Hashtag",
          hashtags: ['test', 'anotherHashtag'],
          type: "tracking"
        },
      ];


      var incoming = {
        keyword: '#test',
        streamSource: 'search-timeline',
        tweet: {
          statuses:[
            {
              id_str: '5',
              user: 'John',
              text: 'Some content',
              entities: {}
            },
            {
              id_str: '6',
              user: 'Alice',
              text: 'Some content',
              entities: {}
            }
          ]
        }
      }

      this.messagesDisplay.messagesColumnsList.push(column);
      this.messagesDisplay.messagesColumnsList[0]
        .columnContentHTML = document.createElement('div');

      this.messagesDisplay.processIncoming(incoming);

      expect(this.messagesDisplay.messagesColumnsList[0].messagesList.length)
        .toEqual(2);
    });

  });
});
