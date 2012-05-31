module.exports = function(app){
  app.get('/',function(req,res){
    res.render('store')
  })
  app.get('/todo',function(req,res){
    res.render('index')
  })
}