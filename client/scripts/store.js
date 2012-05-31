(function(){
  function Store(){
    var self = this
      , kCart = null;
    //This includes the login info on the page (required to have happen if we utilize the base layout because it depends on the loginObject)
    self.loginObject = ko.observable(loginObject());
    self.storeItems = ko.observableArray([]);
    self.errors = ko.observableArray([]);
    self.storeCategories = ko.observableArray([]);
    self.selectedCategory = ko.observable('');
    self.initialized = ko.booleanObservable(false);
    self.showCart = ko.booleanObservable(false);
    self.cartUpdated = ko.booleanObservable(false);
    self.saveCartData = ko.booleanObservable(false);
    self.orderHistory = ko.observableArray([]);

    self.cart = ko.observableArray([]);
    self.cart.subscribe(function(){
      self.updateKCart();
    })


    self.loginObject().user.subscribe(function(newVal){
      if(newVal){
        self.populateCart();
      }else{
        self.saveCartData(false);
        self.cart([]);
      }
    });


    self.cartPrice = ko.computed(function(){
      var cart = self.cart()
        , total = 0;
      for(var i=0;i<cart.length;i++){
        total += cart[i].item.price()*cart[i].qty();
      }
      return '$' + addCommas(total.toFixed(2));
    });

    self.cartItems = ko.computed(function(){
      var cart = self.cart()
        , total = 0;
      for(var i=0;i<cart.length;i++){
        total += cart[i].qty();
      }
      return total;
    });


    //METHODS
    //METHODS
    //METHODS
    //METHODS
    //METHODS

    self.checkout = function(){
      var order = new KOrderHistory();
      order.set('order',ko.toJS(self.cart))
      order.save({
        success: function(){
          alert('Checkout Success!');
          self.cart([]);
          self.populateOrderHistory();
        }
      });
    }

    self.toggleViewCart = function(){
      self.showCart(!self.showCart());
    }

    /**
     * Updates the Kinvey Cart server side
     */
    self.updateKCart = function(){
      //Only update it if we have finished initializing
      if(self.initialized() && self.saveCartData()){
        self.cartUpdated(true);
        setTimeout(function(){
          self.cartUpdated(false);
        },300);
        kCart.set('items',ko.toJS(self.cart));
        kCart.save();
      }
    }


    self.addError = function(message){
      var error = new ErrorMessage(message);
      self.errors.push(error);
      setTimeout(function(){
        self.errors.remove(error);
      },1000);
    }

    /**
     * Select the category to display items
     * @param category
     */
    self.selectCategory = function(category){
      self.selectedCategory(category);
    }

    /**
     * Add a store item to the cart
     * @param storeItem
     */
    self.addToCart = function(storeItem){
      //Get the cart
      var cart = self.cart();
      for(var i=0;i<cart.length;i++){
        //Loop through the cart items to see if we already have it in here
        if(cart[i].item.id() == storeItem.id()){
          //Item found! Update its qty by 1
          cart[i].qty( cart[i].qty() + 1);
          return;
        }
      }
      //No existing cart item found, add a new one
      self.cart.push(new CartItem(storeItem));
    }

    /**
     * Removes the cart item from the cart
     * @param cartItem
     */
    self.removeFromCart = function(cartItem){
      self.cart.remove(cartItem);
    }

    /**
     * Initialize the order history
     * @return {Object} Deferred
     */
    self.populateOrderHistory = function(){
      var deferred = $.Deferred();

      deferred.resolve();
      return deferred.promise();

    }

    /**
     * Initialize the store items
     * @return {Object} Deferred
     */
    self.populateStoreItems = function(){
      var query = new Kinvey.Query()
        , deferred = $.Deferred();
      //Sort the items by name
      query.on('name').sort();

      //Get the store items
      new Kinvey.Collection('store-items',query).fetch({
        success: function(storeItems) {
          //Reset the store items to nil
          self.storeItems([]);
          for(var i=0;i<storeItems.length;i++){
            //Get the raw item so we can grab its data easily
            var storeItem = new StoreItem(storeItems[i].toJSON());
            //Load in the categories
            if(self.storeCategories.indexOf(storeItem.category()) == -1){
              self.storeCategories.push(storeItem.category());
            }
            //Add the store item to the list of store items
            self.storeItems.push(storeItem);
          }
          deferred.resolve();
        },
        error: function(error) {
          deferred.reject(error.error);
        }
      });
      return deferred.promise();
    }

    /**
     * Populate the cart from the database
     * @return {*}
     */
    self.populateCart = function(){
      var deferred = $.Deferred();
      if(!self.loginObject().user()){
        deferred.resolve();
        return deferred.promise();
      }
      new Kinvey.Collection('user-cart').fetch({
        success: function(kCarts){
          self.saveCartData(false);
          self.cart([]);
          var cartFound = false;
          for(var i=0;i<kCarts.length;i++){
            if(kCarts[i].attr._acl.creator == self.loginObject().user().getUsername()){
              kCart = kCarts[i];
              var cartItems = kCarts[i].get('items');
              for(var j=0;j<cartItems.length;j++){
                var cartItem = new CartItem(new StoreItem(cartItems[j].item));
                cartItem.qty(cartItems[j].qty);
                self.cart.push(cartItem);
              }
              cartFound = true;
            }
          }
          if(!cartFound){
            kCart = new KCart();
          }
          self.saveCartData(true);
          deferred.resolve();
        },
        error: function(error){
          deferred.reject(error.error);
        }
      });
      return deferred.promise();
    }


    //Initialization, we need the store items before we can populate the cart
    self.populateStoreItems()
    .pipe(function(){
        return self.populateCart()
    })
    .then(function(){
      self.initialized(true);
    })
    .fail(function(){
      console.log(arguments);
    })
    self.populateStoreItems();
  }

  function StoreItem(storeItemData){
    var self = this;
    self.category = ko.observable(storeItemData.category);
    self.name = ko.observable(storeItemData.name);
    self.price = ko.observable(parseFloat(storeItemData.price));
    self.id = ko.observable(storeItemData._id);
    self.formattedPrice = ko.computed({
      read: function () {
        return '$' + addCommas(self.price().toFixed(2));
      },
      write: function (value) {
        // Strip out unwanted characters, parse as float, then write the raw data back to the underlying "price" observable
        value = parseFloat(value.replace(/[^\.\d]/g, ""));
        self.price(isNaN(value) ? 0 : value); // Write to underlying storage
      },
      owner: self
    });
  }

  function CartItem(StoreItem){
    var self = this;
    self.qty = ko.numericObservable(1);
    self.item = StoreItem;
    self.tmpQty = ko.numericObservable(1);

    self.qty.subscribe(function(newVal){
      self.tmpQty(newVal);
      store.updateKCart();
    })

    self.updateQty = function(cartItem){
      cartItem.qty(cartItem.tmpQty());
    }
  }


  function ErrorMessage(msg){
    var self = this;
    self.message = ko.observable(msg);
  }

  /**
   * Defines the KCart for querying
   * @type {*}
   */
  var KCart = Kinvey.Entity.extend({
    constructor: function(attributes) {
      Kinvey.Entity.prototype.constructor.call(this, 'user-cart', attributes);
    }
  });

  /**
   * Defines the KOrderHistory for querying
   * @type {*}
   */
  var KOrderHistory = Kinvey.Entity.extend({
    constructor: function(attributes) {
      Kinvey.Entity.prototype.constructor.call(this, 'order-history', attributes);
    }
  });


  //Source: http://www.mredkj.com/javascript/numberFormat.html
  function addCommas(nStr){
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }


  var store = new Store();
  //The magic line that starts the entire chain rolling with knockout.
  ko.applyBindings(store);
})();