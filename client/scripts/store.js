(function(){
  function Store(){
    var self = this;
    //This includes the login info on the page (required to have happen if we utilize the base layout because it depends on the loginObject)
    self.loginObject = ko.observable(loginObject());
    self.storeItems = ko.observableArray([]);
    self.errors = ko.observableArray([]);
    self.storeCategories = ko.observableArray([]);
    self.selectedCategory = ko.observable('');
    self.initialized = ko.booleanObservable(false);

    self.cart = ko.observableArray([]);
    self.cartPrice = ko.computed(function(){
      var cart = self.cart()
        , total = 0;
      for(var i=0;i<cart.length;i++){
        total += cart[i].item.price()*cart[i].qty();
      }
      return total.toFixed(2);
    });

    self.cartItems = ko.computed(function(){
      var cart = self.cart()
        , total = 0;
      for(var i=0;i<cart.length;i++){
        total += cart[i].qty();
      }
      return total;
    });


    self.addError = function(message){
      var error = new ErrorMessage(message);
      self.errors.push(error);
      setTimeout(function(){
        self.errors.remove(error);
      },1000);
    }

    self.selectCategory = function(category){
      self.selectedCategory(category);
    }

    self.addToCart = function(storeItem){
      var cart = self.cart();
      for(var i=0;i<cart.length;i++){
        if(cart[i].item.id() == storeItem.id()){
          cart[i].qty( cart[i].qty() + 1);
          return;
        }
      }
      self.cart.push(new CartItem(storeItem));
    }

    self.populateStoreItems = function(){
      var query = new Kinvey.Query();
      query.on('name').sort();

      new Kinvey.Collection('store-items',query).fetch({
        success: function(storeItems) {
          self.storeItems([]);
          for(var i=0;i<storeItems.length;i++){
            var storeItem = new StoreItem(storeItems[i]);
            if(self.storeCategories.indexOf(storeItem.category()) == -1){
              self.storeCategories.push(storeItem.category());
            }
            self.storeItems.push(storeItem);
          }
          self.initialized(true);
        },
        error: function(error) {
          store.addError(error.error);
        }
      });
    }
    self.populateStoreItems();
  }

  function StoreItem(kStoreItem){
    var self = this;
    self.category = ko.observable(kStoreItem.get('category'));
    self.name = ko.observable(kStoreItem.get('name'));
    self.price = ko.observable(parseFloat(kStoreItem.get('price')).toFixed(2));

    self.id = ko.observable(kStoreItem.getId());
  }

  function CartItem(StoreItem){
    var self = this;
    self.qty = ko.numericObservable(1);
    self.item = StoreItem;
  }


  function ErrorMessage(msg){
    var self = this;
    self.message = ko.observable(msg);
  }

  /**
   * Defines the KListItem for querying
   * @type {*}
   */
  var KStoreItem = Kinvey.Entity.extend({
    constructor: function(attributes) {
      Kinvey.Entity.prototype.constructor.call(this, 'store-items', attributes);
    }
  });

  var store = new Store();
  //The magic line that starts the entire chain rolling with knockout.
  ko.applyBindings(store);
})();