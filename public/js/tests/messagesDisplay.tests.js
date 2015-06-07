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
});