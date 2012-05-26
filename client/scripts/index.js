(function(){

  function Index(){
    var self = this;
    self.loginObject = ko.observable(loginObject());
    self.initialized = ko.booleanObservable(false);
    self.todoList = ko.observableArray([]);
    self.newListItemText = ko.observable();

    //METHODS
    //METHODS
    //METHODS
    //METHODS
    //METHODS
    self.addListItem = function(){
      var kListItem = new KListItem({title: self.newListItemText(), completed: false});
      kListItem.save();
      self.todoList.push(new ListItem(kListItem));
      self.newListItemText('');
    }

    self.removeListItem = function(listItem){
      self.todoList.remove(listItem);
      listItem.remove();
    }

    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    self.initialized(true);

    var kListCollection = new Kinvey.Collection('list-collection');
    kListCollection.fetch({
      success: function(list) {
        for(var i=0;i<list.length;i++){
          self.todoList.push(new ListItem(list[i]));
        }
      },
      error: function(error) {
        alert(error.error);
      }
    });

    return this;
  }

  function ListItem(kEntity){
    var self = this;
    self.title = ko.observable('');
    self.title(kEntity.get('title'));
    self.title.subscribe(function(newValue){
      kEntity.set('title',newValue);
      kEntity.save({
        error: function(error){
          alert(error.error);
        }
      });
    });

    self.completed = ko.booleanObservable(false);
    self.completed(kEntity.get('completed'));
    self.completed.subscribe(function(newValue){
      kEntity.set('completed',newValue);
      kEntity.save({
        error: function(error){
          alert(error.error);
        }
      });
    });

    //METHODS
    //METHODS
    //METHODS
    //METHODS
    //METHODS

    self.remove = function(){
      kEntity.destroy();
    }
  }

  /**
   * Defines the KListItem for querying
   * @type {*}
   */
  var KListItem = Kinvey.Entity.extend({
    constructor: function(attributes) {
      Kinvey.Entity.prototype.constructor.call(this, 'list-collection', attributes);
    }
  });

  ko.applyBindings(new Index());
})();