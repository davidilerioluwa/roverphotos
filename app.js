require("dotenv").config()
const express= require("express")
const ejs= require("ejs")
const bodyParser= require("body-parser")
const mongoose= require('mongoose')
const request= require("request")
const Session= require("express-session")
const passport= require("passport")
const passportLocalMongoose= require("passport-local-mongoose")



 


mongoose.connect("mongodb+srv://davidilerioluwa:ilerioluwa@cluster0.iheez.mongodb.net/userDB")
var userSchema= new mongoose.Schema({
    username: String,
    password: String,
    like: [String]

})


var username= ""
var password=""


userSchema.plugin(passportLocalMongoose)

let user= mongoose.model("user", userSchema)

var total= ""

app= express();
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine", 'ejs')
app.use(express.static("public"));

app.use(Session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
   
}))



// set up passport
app.use(passport.initialize())
app.use(passport.session())

passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());



// home route



app.get("/", function(req,res){
    
    const options={
        url: "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos",
        qs: {
            api_key: "rbk0smQrg5B0FR9sDA8g9vYuzfo7qP3bhMRHVntb",
            sol: 2000
        }
            }
            function callback(error,response, body){
               total=  JSON.parse(body)
              const photo= total.photos.slice(0,10)
              if(req.isAuthenticated()){

               user.find({username: req.user.username}, function (err,likes) {
                   if (err){console.log(err)
                   } else{
                        liked=likes[0].like
                      
                       res.render("app",({
                           photo: photo,
                           liked:liked
                        }))
                   }
               })
           } else{
               res.redirect("login")
           }
            }
request(options,callback);
         })
// like

         app.post("/", function(req,res){
           
user.findOne({username: req.user.username}, function(err,found){
   const likes= found.like
   if(likes.find(Element => Element==req.body.like)){
      
       user.update(
           { "$pull": { like: req.body.like } },
           function (err, raw) {
               if (err) return handleError(err);
               console.log('The raw response from Mongo was ', raw)
           })
   }else{
      
       user.update(
           { username: req.user.username},
           { "$push": { like: req.body.like } },
           function (err, raw) {
               if (err) return handleError(err);
               console.log('The raw response from Mongo was ', raw)
           })
   }
})

               res.redirect("/#"+req.body.like) 
        })



// account creation


app.get("/create",function(req,res){
    res.render("create")
})
app.post("/create", function(req,res){
    firstName= req.body.firstName
    lastName= req.body.lastName
   username= req.body.username
  password= req.body.password
    


 user.register({username: username}, password, function(err,user){
     if(err){
         console.log(err);
     } else{
         passport.authenticate("local")(req,res,function(){
             
                 res.redirect("/")
             
         })
     }
 })
})



// login


app.get("/login",function(req,res){
    res.render("login")
})
app.post("/login", function(req,res){
   
    firstName= req.body.firstName
      lastName= req.body.lastName
     username= req.body.username
  password= req.body.password

const User =new user({
    username:username,
    password:password
})
req.login(User, function(err){
    if(err){
        console.log(err)
    } else{
  passport.authenticate("local")(req,res,function(){
               passport.authenticate("local")(req,res,function(){
             
                 res.redirect("/")
                 
              
               
         })  


})
}})

}) 

// search


         app.get("/search", function (req,res){
     res.redirect("/")
        })


       app.post("/search", function(req,res){

        if(req.body.date==''){
            res.send("Enter a valid input")
        }
             
            
             
    const options={
        url: "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos",
        qs: {
            api_key: "rbk0smQrg5B0FR9sDA8g9vYuzfo7qP3bhMRHVntb",
            earth_date:  req.body.date
        }
            }
            function callback(error,response, body){
               total=  JSON.parse(body)
               
              const photo= total.photos.slice(0,10)
              if(req.isAuthenticated()){

               user.find({username: req.user.username}, function (err,likes) {
                   if (err){console.log(err)
                   } else{
                        liked=likes[0].like
                       
                       res.render("app",({
                           photo: photo,
                           liked:liked
                        }))
                   }
               })

               
           } else{
               res.redirect("login")
           }
           
            }
         
request(options,callback);
         })




         


// about and contact




app.get("/about", function(req,res){
    res.render('about')
})
app.get("/contact", function(req,res){
    res.render('contact')
})



         app.listen(process.env.PORT || 3000, function(){
             console.log("server running at port 3000")
         })
        