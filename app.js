// Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session= require("express-session");
const flash = require("connect-flash");

// Passport
const passport = require("passport");
require("./config/auth")(passport);

// Routes
const admin = require("./routes/admin");
const usuarios = require("./routes/usuario");

// Models
require("./models/Postagem");
require("./models/Categoria");
const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");

// Configurações
// Session
app.use(session({
    secret: "dasdasdçaujdaidjapdsdapodsadasdaopdajkspa",
    resave: true,
    saveUninitialized: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
app.engine("handlebars", handlebars({
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));

app.set("view engine", "handlebars");

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado ao mongo");
}).catch(err => {
    console.log("Erro ao se conectar: " + err);
})

// Public   
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then(postagens => {
        res.render("index", {
            postagens: postagens
        });
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then(postagem => {
        if(postagem) {
            res.render("postagem/index", {
                postagem: postagem
            });
        } else {
            req.flash("error_msg", "Houve um erro essa postagem não existe");
            res.redirect("/");
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao exibir a postagem");
        res.redirect("/");
    })
});

app.get("/404", (req, res) => {
     res.render("404");
});

  
app.get("/categorias", (req, res) => {
    Categoria.find().then(categorias => {
        res.render("categorias/index", {
            categorias: categorias
        });
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then(categoria => {
        if(categoria) {
            Postagem.find({categoria: categoria._id}).then(postagens => {
                res.render("categorias/postagens", {
                    postagens: postagens,
                    categoria: categoria
                });
            }).catch(err => {
                req.flash("error_msg", "Houve um erro ao listar os posts!");
            });
        } else {    
            req.flash("error_msg", "Houve um erro essa categoria não existe");
            res.redirect("/");
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao carregar a página desta categoria");
        res.redirect("/");
    });
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);

// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando!");
});