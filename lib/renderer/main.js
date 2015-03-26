function ViewModel() {
    this.lists = ko.observableArray([{
    	name: 'TODO',
    	cards: ['Test 1', 'Test 2']
    }, {
    	name: 'Again',
    	cards: ['Hey']
    }]);
}
window.viewModel = new ViewModel();
ko.applyBindings(window.viewModel);
