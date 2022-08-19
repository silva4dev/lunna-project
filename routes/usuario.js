// Carregando módulos
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Models
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

router.get("/registro", (req, res) => {
    const erros = req.flash("erros");
    const nome = req.flash("nome");
    const email = req.flash("email");
    const senha = req.flash("senha");
    const confirmar_senha = req.flash("confirmar_senha");
    res.render("usuarios/registro", {
        erros: erros,
        nome: nome,
        email: email,
        senha: senha,
        confirmar_senha: confirmar_senha
    });
});

router.post("/registro", (req, res) => {
    const erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome inválido"
        });
    }
    else if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({
            texto: "E-mail inválido"
        });
    }
    else if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({
            texto: "Senha inválida"
        });
    }
    else if(req.body.senha.length < 4) {
        erros.push({
            texto: "Senha precisa conter no minimo 4 caracteres"
        });
    }
    else if(req.body.senha != req.body.confirmar_senha) {
        erros.push({
            texto: "As senhas são diferentes, tente novamente!"
        });
    }

    if(erros.length > 0) {
        req.flash("erros", erros);
        req.flash("nome", req.body.nome);
        req.flash("email", req.body.email);
        req.flash("senha", req.body.senha);
        req.flash("confirmar_senha", req.body.confirmar_senha);
        res.redirect("/usuarios/registro");
    } else {
        Usuario.findOne({email: req.body.email}).then(usuario => {
            if(usuario) {
                req.flash("error_msg", "E-mail já existe no nosso sistema")
                res.redirect("/usuarios/registro");
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    //status: 1
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if(err) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                            res.redirect("/");
                        } else {
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso!");
                                res.redirect("/");
                            }).catch(err => {
                                req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!");
                                res.redirect("/usuarios/registro");
                            });
                        }
                    });
                })
            }
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao cadastrar o usuário");
            res.redirect("/");
        });
    }

});

router.get("/login", (req, res) => {
    res.render("usuarios/login");
}); 

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/");
})


module.exports = router;