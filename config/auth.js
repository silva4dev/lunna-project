// Carregando módulos
const localStrategy = require("passport-local");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

const passport = function(passport) {
    passport.use(new localStrategy({usernameField: "email", passwordField: "senha"}, (email, senha, done) => {
        Usuario.findOne({email: email}).then(usuario => {
            if(!usuario) {
                return done(null, false, { message: "Esta conta não existe"});
            }
            bcrypt.compare(senha, usuario.senha, (err, sucesso) => {
                if(sucesso) {
                    return done(null, usuario);
                } else {
                    return done(null, false, { message: "Senha incorreta"});
                }
            })
        });
    }));
    
    passport.serializeUser((usuario, done) => { // salvar os dados do usuario na sessão
        done(null, usuario.id);
    });

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        });
    });
}

module.exports = passport