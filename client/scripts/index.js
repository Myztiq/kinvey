(function(){
  function Index(){
    var self = this;
    //This includes the login info on the page (required to have happen if we utilize the base layout because it depends on the loginObject)
    self.loginObject = ko.observable(loginObject());


    self.initialized = ko.booleanObservable(false);
    self.todoList = ko.observableArray([]);
    self.newListItemText = ko.observable();
    self.showCompleted = ko.booleanObservable(true);
    self.errors = ko.observableArray([]);

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
      listItem.remove(function(){
        self.todoList.remove(listItem);
      });
    }

    self.sort = function(){
      self.todoList.sort(function(a,b){
        var key= 'title';
        var leftKey = a[key]().toLowerCase();
        var rightKey = b[key]().toLowerCase();
        return  leftKey == rightKey ? 0 : (leftKey < rightKey ? -1 : 1);
      });
    }

    self.addError = function(message){
      var error = new ErrorMessage(message);
      self.errors.push(error);
      setTimeout(function(){
        self.errors.remove(error);
      },1000);
    }


    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION

    self.setup = function(){
      if(!self.loginObject().user()){
        return;
      }
      var kListCollection = new Kinvey.Collection('list-collection');
      kListCollection.fetch({
        success: function(list) {
          self.todoList([]);
          for(var i=0;i<list.length;i++){
            //This check should not need to be here... When I fetch from the list-collection it should only return items that I have access to read...
            if(list[i].attr._acl.creator == self.loginObject().user().getUsername()){
              self.todoList.push(new ListItem(list[i]));
            }
          }
          self.sort();
          self.initialized(true);
        },
        error: function(error) {
          index.addError(error.error);
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
    var saveTimer; //Timer to throttle the entry saving
    target.subscribe(function(newVal){
      if(newVal){
        //Clear the timeout so we can set the save to go after another 300ms
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function(){
          //Preform the save (don't forget to update the entry)
          options.kEntity.set(options.key,newVal);
          options.kEntity.save({
            error:function(error){
              index.addError(error.error);
            }
          });
        },300)
      }
    });
    return target;
  };

  function ErrorMessage(msg){
    var self = this;
    self.message = ko.observable(msg);
  }



  function ListItem(kEntity){
    var self = this;
    self.title = ko.observable(kEntity.get('title')).extend({saveOnChange:{key: 'title', kEntity: kEntity}});
    self.completed = ko.booleanObservable(kEntity.get('completed')).extend({saveOnChange:{key: 'completed', kEntity: kEntity}});
    self.creator = ko.booleanObservable(kEntity.attr._acl.creator);
    //METHODS
    //METHODS
    //METHODS
    //METHODS
    //METHODS
    self.remove = function(cb){
      kEntity.destroy({
        success:function(){
          cb();
        },
        error: function(error){
          index.addError(error.error);
        }
      });
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

  var index = new Index();
  //The magic line that starts the entire chain rolling with knockout.
  ko.applyBindings(index);
})();