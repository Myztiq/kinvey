module.exports = function(app){
  app.get('/',function(req,res){
    res.render('index')
  })
  app.get('/store',function(req,res){
    res.render('store')
  })
}