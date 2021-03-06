function loginObject(parent){
  Kinvey.init({
    appKey: 'kid1711',
    appSecret: 'c541ea1210a54dc1a60df0b6ac8b9575'
  });
  var parent = parent;
  return Login();

  function Login(){
    var self = this;
    self.loginInitialized = ko.booleanObservable(false);
    self.user = ko.observable(false);
    self.username = ko.observable('');
    self.password = ko.observable('');
    self.fullName = ko.observable('');

    self.loginVisible = ko.booleanObservable(false);
    self.registerVisible = ko.booleanObservable(false);


    //METHODS
    //METHODS
    //METHODS
    //METHODS
    //METHODS

    /**
     * Show the register form
     */
    self.showRegister = function(){
      self.loginVisible(false);
      self.registerVisible(true);
    }

    /**
     * Show the login form
     */
    self.showLogin = function(){
      self.loginVisible(true);
      self.registerVisible(false);
    }

    /**
     * Preform registration utilizing the form variables
     */
    self.register = function(){
      Kinvey.User.create({
          username: self.username()
        , password: self.password()
        , fullName: self.fullName()
      }, {
        success: function(user) {
          self.user(user);
          self.password('');
          self.loginVisible(false);
          self.registerVisible(false);
        },
        error: function(error) {
          parent.addError(error.error);
        }
      });
    }

    /**
     * Preform login utilizing the form variables
     */
    self.login = function(){
      new Kinvey.User().login(self.username(), self.password(), {
        success: function(user) {
          self.user(user);
          self.loginVisible(false);
          self.registerVisible(false);
          self.password('');
        },
        error: function(error) {
          parent.addError(error.error);
        }
      });
    }

    /**
     * Logs the current user out
     */
    self.logout = function(){
      var user = Kinvey.getCurrentUser();
      if(null !== user) {
        user.logout();
      }
      self.user(false);
      self.showLogin();
    }



    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION
    //INITIALIZATION

    var user = Kinvey.getCurrentUser();
    if(user){
      self.user(user);
    }else{
      self.showLogin();
    }
    self.loginInitialized(true);
    return this;
  }

}