module.exports = function(app){
  return {
    routes: require('./routes.js')(app)
  };
}