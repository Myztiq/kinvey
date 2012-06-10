(function(){
  function Store(){
    var self = this
      , kCart = null;
    //This includes the login info on the page (required to have happen if we utilize the base layout because it depends on the loginObject)
    self.loginObject = ko.observable(loginObject(this));
    self.storeItems = ko.observableArray([]);
    self.errors = ko.observableArray([]);
    self.storeCategories = ko.observableArray([]);
    self.selectedCategory = ko.observable('');
    self.initialized = ko.booleanObservable(false);
    self.showCart = ko.booleanObservable(false);
    self.showStore = ko.booleanObservable(true);
    self.showOrderHistory = ko.booleanObservable(false);
    self.showCheckout = ko.booleanObservable(false);
    self.cartUpdated = ko.booleanObservable(false);
    self.saveCartData = ko.booleanObservable(false);
    self.orderHistory = ko.observableArray([]);

    self.orderStreet = ko.observable('');
    self.orderZipCode = ko.observable('');
    self.orderState = ko.observable('');
    self.orderPhone = ko.observable('');
    self.orderName = ko.observable('');
    self.orderCity = ko.observable('');

    self.orderBillingStreet = ko.observable('');
    self.orderBillingZipCode = ko.observable('');
    self.orderBillingState = ko.observable('');
    self.orderBillingPhone = ko.observable('');
    self.orderBillingName = ko.observable('');
    self.orderBillingCity = ko.observable('');

    self.orderPhoneFormatted = ko.computed({
      read: function () {
        return formatPhone(this.orderPhone());
      },
      write: function (value) {
        value = value.replace(/[^0-9]+/g, "");
        this.orderPhone(value);
      },
      owner: this
    });

    self.orderBillingPhoneFormatted = ko.computed({
      read: function () {
        return formatPhone(this.orderBillingPhone());
      },
      write: function (value) {
        value = value.replace(/[^0-9]+/g, "");
        this.orderBillingPhone(value);
      },
      owner: this
    });

    self.cart = ko.observableArray([]);
    self.cart.subscribe(function(){
      self.updateKCart();
    })


    self.loginObject().user.subscribe(function(newVal){
      if(newVal){
        self.populateCart();
        self.populateOrderHistory();
      }else{
        self.saveCartData(false);
        self.cart([]);
        self.orderHistory([]);
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
    /**
     * Copies the shipping information to the billing information
     */
    self.copyShippingToBilling = function(){
      self.orderBillingStreet(self.orderStreet());
      self.orderBillingZipCode(self.orderZipCode());
      self.orderBillingState(self.orderState());
      //By updating the formatted number it also updates the non-formatted one
      self.orderBillingPhoneFormatted(self.orderPhone());
      self.orderBillingName(self.orderName());
      self.orderBillingCity(self.orderCity());
    }
    /**
     * Processes the final checkout process
     */
    self.checkout = function(){
      var  orderDetails = {
            shipping:{
                street: self.orderStreet()
              , zipCode: self.orderZipCode()
              , state: self.orderState()
              , phone: self.orderPhone()
              , name: self.orderName()
              , city: self.orderCity()
            },
            billing:{
                street: self.orderBillingStreet()
              , zipCode: self.orderBillingZipCode()
              , state: self.orderBillingState()
              , phone: self.orderBillingPhone()
              , name: self.orderBillingName()
              , city: self.orderBillingCity()
            }
          }
        , valid = true;
      for(var orderType in orderDetails){
        for(var orderItem in orderDetails[orderType]){
          if(!orderDetails[orderType][orderItem].length){
            valid = false
          }
        }
      }
      if(!valid){
        self.addError('All the form fields are required.');
      }
      //If the formatter cannot detect the phone type then it must be invalid
      if(formatPhone(orderDetails.shipping.phone) == orderDetails.shipping.phone){
        valid = false;
        self.addError('Your shipping phone is invalid.');
      }
      //If the formatter cannot detect the phone type then it must be invalid
      if(formatPhone(orderDetails.billing.phone) == orderDetails.billing.phone){
        valid = false;
        self.addError('Your billing phone is invalid.');
      }

      if(valid){
        var order = new KOrderHistory();
        order.set('date', (new Date()).getTime());
        order.set('order',ko.toJS(self.cart));
        order.set('details',orderDetails);
        order.save({
          success: function(){
            self.addError('Your order has been placed successfully!');
            self.cart([]);
            self.populateOrderHistory();
            self.setView('orderHistory');
          },
          error: function(error){
            self.addError(error);
          }
        });
      }
    }

    self.viewStore = function(){
      self.setView('store');
    }
    self.viewCheckout = function(){
      self.setView('checkout');
    }
    self.viewCart = function(){
      self.setView('cart');
    }
    self.viewOrderHistory = function(){
      self.setView('orderHistory');
    }

    var activeView = '';
    self.setView = function(view){
      if(activeView == view){
        return;
      }
      activeView = view;
      self.showStore(false);
      self.showOrderHistory(false);
      self.showCart(false);
      self.showCheckout(false);
      switch (view){
        case 'store':
          self.showStore(true);
          break;
        case 'checkout':
          self.showCheckout(true);
          break;
        case 'cart':
          self.showCart(true);
          break;
        case 'orderHistory':
          self.showOrderHistory(true);
          break;
      }
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

    /**
     * Adds an error to the page which will be removed after x seconds
     * @param message
     */
    self.addError = function(message){
      var error = new ErrorMessage(message);
      self.errors.push(error);
      setTimeout(function(){
        self.errors.remove(error);
      },2000);
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
      if(!self.cart().length){
        self.setView('store');
      }
    }

    /**
     * Initialize the order history
     * @return {Object} Deferred
     */
    self.populateOrderHistory = function(){
      var deferred = $.Deferred()
        , query = new Kinvey.Query()
      ;
      query.on('date').sort();
      if(!self.loginObject().user()){
        deferred.resolve();
        return deferred.promise();
      }

      self.orderHistory([]);
      new Kinvey.Collection('order-history').fetch({
        success: function(orderHistory){
          for(var i=0;i<orderHistory.length;i++){
            self.orderHistory.push(new OrderHistory(orderHistory[i]));
          }
          deferred.resolve();
        },
        error: function(error){
          deferred.reject(error.error);
        }
      })
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
            kCart = kCarts[i];
            var cartItems = kCarts[i].get('items');
            for(var j=0;j<cartItems.length;j++){
              var cartItem = new CartItem(new StoreItem(cartItems[j].item));
              cartItem.qty(cartItems[j].qty);
              self.cart.push(cartItem);
            }
            cartFound = true;
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
      return $.when(self.populateCart(), self.populateOrderHistory());
    })
    .then(function(){
      self.initialized(true);
    })
    .fail(function(error){
        self.addError(error.error);
    })
    self.populateStoreItems();
  }

  /**
   * Takes the raw data from a kStore item and maps it to a knockout style store item
   * @param storeItemData
   * @constructor
   */
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

  /**
   * Takes a store item and returns a knockout style cart item with quantity
   * @param StoreItem
   * @constructor
   */
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

  /**
   * Takes a Kinvey order history object and returns back a knockout style order history mapping
   * @param kOrderHistory
   * @constructor
   */
  function OrderHistory(kOrderHistory){
    var self = this
      , kOrder = kOrderHistory.get('order')
      , kOrderDate = kOrderHistory.get('date');
    self.order = ko.observableArray([]);
    self.orderDate = ko.observable(moment(kOrderDate).format('dddd, MMMM Do YYYY, h:mm a'));
    self.orderDetails = ko.observable(kOrderHistory.get('details'));
    if(!self.orderDetails()){
      self.orderDetails({});
    }
    self.orderPrice = ko.computed(function(){
      var cart = self.order()
        , total = 0;
      for(var i=0;i<cart.length;i++){
        total += cart[i].item.price()*cart[i].qty();
      }
      return '$' + addCommas(total.toFixed(2));
    });

    self.orderItems = ko.computed(function(){
      var cart = self.order()
        , total = 0;
      for(var i=0;i<cart.length;i++){
        total += cart[i].qty();
      }
      return total;
    });


    for(var i=0;i<kOrder.length;i++){
      var cartItem = new CartItem(new StoreItem(kOrder[i].item));
      cartItem.qty(kOrder[i].qty);
      self.order.push(cartItem);
    }
    self.toggleOrderBody = function(model, evt){
      $(evt.currentTarget).toggleClass('active');
      $(evt.currentTarget).find('.orderBody').stop(true,true).slideToggle();
    }
  }

  /**
   * Error message object where an error message will be added to the page
   * @param msg
   * @constructor
   */
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



  /**
   * Add commas into the numeeric value (1000 -> 1,000)
   * Source: http://www.mredkj.com/javascript/numberFormat.html
   * @param nStr
   * @return {string}
   */
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


/**
 * Formats the input phone number and returns a string of the phone number. This was brought out into the global namespace because it is being used on the page as a utility method for display purposes.
 * Source: http://grover.open2space.com/content/javascript-formatting-phone-numbers-and-postal-codes
 * @param phonenum
 * @return {string}
 */
function formatPhone(phonenum) {
  var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (regexObj.test(phonenum)) {
    var parts = phonenum.match(regexObj);
    var phone = "";
    if (parts[1]) { phone += "+1 (" + parts[1] + ") "; }
    phone += parts[2] + "-" + parts[3];
    return phone;
  }
  else {
    //invalid phone number
    return phonenum;
  }
}