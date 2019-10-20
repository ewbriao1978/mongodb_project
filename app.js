// This a small example of a web system express-like
// No portuguese here, because english is the universal language!!
// Adaptation: Eduardo Wenzel Briao
//eduardo.briao@gmail.com

// Loading modules
const express = require ('express')
const handlebars = require ('express-handlebars')
const bodyParser = require ('body-parser')
const app = express()
// user module
const admin = require ('./routes/admin')
const usuarios = require('./routes/usuario')
// path library from node js
const path = require ("path")
// mongo db settings
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
//I use this model to list current posts on the "home" page
require("./models/Postagem")
require("./models/Categoria")

const Postagem = mongoose.model("postagens")
const Categoria = mongoose.model("categorias")
// Settings
    //Session
    app.use(session({
        secret:"cursodenode",
        resave: true,
        saveUninitialized: true

    }))
    app.use(flash())
    // Middleware
    app.use((req,res,next) => {
        res.locals.success_msg=req.flash("success_msg")
        res.locals.error_msg=req.flash("error_msg")
        next()
    })

    //Bodyparser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())
    // HandleBars
    app.engine('handlebars', handlebars({defaultLayout:'main'}))
    app.set('view engine', 'handlebars')
    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
        console.log("Conectado ao mongo.")
    }).catch((err) => {
        console.log("Erro ao se conectar:"+err)
    })

    // Public
    // How to use statics files (CSS, and son on)
    app.use(express.static(path.join(__dirname,"public")))



// Routes
app.use('/admin',admin)
app.use('/usuarios',usuarios)
app.get('/', (req,res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).limit(3).then((postagens) => {
        res.render("index", {postagens:postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
 })

 app.get('/postagem/:slug',(req,res) => {
     Postagem.findOne({slug:req.params.slug}).then((postagem) => {
         if (postagem){
             res.render("postagem/index",{postagem:postagem})
         }else{
             req.flash("error_msg","Esta postagem não existe.")
             res.redirect("/")
         }
     }).catch((err) => {
         req.flash("error_msg","Houve um erro interno.")
         res.redirect("/")
     })
 })

 app.get("/categorias",(req,res) => {
     Categoria.find().then((categorias) => {
         res.render("categorias/index",{categorias:categorias})
     }).catch((err) => {
         req.flash("error_msg","Houve um erro interno")
         res.redirect("/")
     })
 })

 app.get("/categorias/:slug",(req,res) => {
     Categoria.findOne({slug:req.params.slug}).then((categoria) => {
         if (categoria){
             Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render("categorias/postagens",{postagens:postagens, categoria:categoria})
             }).catch((err) => {
                req.flash("error_msg","Houve um erro interno")
                res.redirect("/")
             })
   

         }else{
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/")

         }
    }).catch((err) => {
        req.flash("error_msg","Houve um erro interno")
        res.redirect("/")
   })

 })

// Others

const PORT = 8081
app.listen (PORT,() => {
    console.log("Servidor rodando")
})