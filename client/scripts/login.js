function loginObject(){
  Kinvey.init({
    appKey: 'kid1711',
    appSecret: 'c541ea1210a54dc1a60df0b6ac8b9575'
  });

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
          self.loginVisible(false);
          self.registerVisible(false);
          $.cookie('user',JSON.stringify({
              username: self.username()
            , password: self.password()
          }));
        },
        error: function(error) {
          console.log(error);
          alert(error.error);
        }
      });
    }

    /**
     * Preform login utilizing the form variables
     */
    self.login = function(){
      var user = new Kinvey.User();
      user.login(self.username(), self.password(), {
        success: function(user) {
          self.user(user);
          self.loginVisible(false);
          self.registerVisible(false);
          $.cookie('user',JSON.stringify({
              username: self.username()
            , password: self.password()
          }));
        },
        error: function(error) {
          console.log(error);
          alert(error.error);
        }
      });
    }

    /**
     * Logs the current user out
     */
    self.logout = function(){
      var user = Kinvey.getCurrentUser();
      if(null !== user) {
        $.cookie('user',null);
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
      self.loginInitialized(true);
    }else{
      //Workaround for non-sticky user logins
      var userCookie = $.cookie('user');
      if(userCookie){
        userCookie = JSON.parse(userCookie);
        var kinveyUser = new Kinvey.User();
        kinveyUser.login(userCookie.username, userCookie.password, {
          success: function(user) {
            self.user(user);
            self.loginInitialized(true);
          },
          error: function(error) {
            console.log(error);
            alert(error.error);
          }
        });
      }else{
        self.showLogin();
        self.loginInitialized(true);
      }
    }
    return this;
  }

}