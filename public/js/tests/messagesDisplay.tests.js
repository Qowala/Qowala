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
		beforeEach(function() { 
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

	describe("removeHashtag()", function(){

	});
});