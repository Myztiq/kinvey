(function(){
  function Index(){
    var self = this;
    //This includes the login info on the page (required to have happen if we utilize the base layout because it depends on the loginObject)
    self.loginObject = ko.observable(loginObject());


    self.initialized = ko.booleanObservable(false);
    self.todoList = ko.observableArray([]);
    self.newListItemText = ko.observable();
    self.showCompleted = ko.booleanObservable(true);

    self.loginObject().user.subscribe(function(newVal){
      if(newVal){
        self.setup();
      }else{
        self.initialized(false);
      }
    })

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

    self.sort = function(){
      self.todoList.sort(function(a,b){
        var key= 'title';
        var leftKey = a[key]().toLowerCase();
        var rightKey = b[key]().toLowerCase();
        return  leftKey == rightKey ? 0 : (leftKey < rightKey ? -1 : 1);
      });
    }


    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION

    self.setup = function(){
      var kListCollection = new Kinvey.Collection('list-collection');
      kListCollection.fetch({
        success: function(list) {
          self.todoList([]);
          for(var i=0;i<list.length;i++){
            //This check should not need to be here... When I fetch from the list-collection it should only return items that I have access to read...
            //if(list[i].attr._acl.creator == self.loginObject().user().getUsername()){
              self.todoList.push(new ListItem(list[i]));
            //}
          }
          self.sort();
          self.initialized(true);
        },
        error: function(error) {
          alert(error.error);
        }
      });
    }
    self.setup();

    return this;
  }

  /**
   * Custom knockout extender to save the entire list item on change
   * @param target
   * @param options
   */
  ko.extenders.saveOnChange = function(target, options) {
    target.subscribe(function(newVal){
      if(newVal){
        options.kEntity.set(options.key,newVal)
        options.kEntity.save();
      }
    });
    return target;
  };



  function ListItem(kEntity){
    var self = this;
    self.title = ko.observable(kEntity.get('title')).extend({saveOnChange:{key: 'title', kEntity: kEntity}});
    self.completed = ko.booleanObservable(kEntity.get('completed')).extend({saveOnChange:{key: 'completed', kEntity: kEntity}});

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

  //The magic line that starts the entire chain rolling with knockout.
  ko.applyBindings(new Index());
})();