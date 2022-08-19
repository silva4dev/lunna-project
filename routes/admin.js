// Carregando módulos
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const status = require("../helpers/status");

// Models
require("../models/Categoria");
require("../models/Postagem");

const Categoria = mongoose.model("categorias"); // passar referencia do model para variavel
const Postagem = mongoose.model("postagens");

router.get("/", status, (req, res) => {
    res.render("admin/index");
});

// Categorias
router.get("/categorias", status, (req, res) => {
    Categoria.find().lean().sort({date: "desc"}).then(categorias => {
        res.render("admin/categorias", {
            categorias: categorias,
        });
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
});

router.get("/categorias/add", status, (req, res) => {
    const nome = req.flash("nome");
    const slug = req.flash("slug");
    const erros = req.flash("erros")
    res.render("admin/addcategorias", {
        nome: nome,
        slug: slug,
        erros: erros
    });
});

router.post("/categorias/nova", status, (req, res) => {
    const erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome inválido"
        });
    }
    else if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        });
    }
    else if(req.body.nome.length < 2) {
        erros.push({
            texto: "Nome da categoria é muito pequeno"
        });
    }
    if(erros.length > 0) {
        req.flash("nome", req.body.nome);
        req.flash("slug", req.body.slug);
        req.flash("erros", erros);
        res.redirect("/admin/categorias/add");
    } else {
        Categoria.create({
            nome: req.body.nome,
            slug: req.body.slug
        }).then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!");
            res.redirect("/admin");
        })
    }
});

router.get("/categorias/edit/:id", status, (req, res) => {
    const id = req.params.id;
    Categoria.findById(id).then(categoria => { // Categoria.findOne({_id: req.params.id})
        res.render("admin/editcategorias", {
            nome: categoria.nome,
            slug: categoria.slug, 
            _id: categoria._id,
            erros: req.flash("erros"),
        });
    }).catch(err => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", status, (req, res) => {
    const erros = [];
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome inválido"
        });
    }
    else if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        });
    }
    else if(req.body.nome.length < 2) {
        erros.push({
            texto: "Nome da categoria é muito pequeno"
        });
    }

    if(erros.length > 0) {
        req.flash("erros", erros);
        res.redirect("/admin/categorias/edit/" + req.body.id);
    } else {
        Categoria.findById({_id: req.body.id}).then(categoria => { // Categoria.findOne({_id: req.params.id})
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect("/admin/categorias")
            }).catch(err => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria");
                res.redirect("/admin/categorias");
            });
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao editar a categoria");
            res.redirect("/admin/categorias");
        });
    }
}); 

router.post("/categorias/deletar", status, (req, res) => {
    Categoria.findByIdAndDelete({_id: req.body.id}).then(() => { //Categoria.deleteOne({_id: req.body.id})
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria");
        res.redirect("/admin/categorias");
    });
});

// Postagens
router.get("/postagens", status, (req, res) => {
   Postagem.find().lean().populate("categoria").sort({data: "desc"}).then(postagens => {
       res.render("admin/postagens", {
           postagens: postagens
       });
   }).catch(err => {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
   });  
});

router.get("/postagens/add", status, (req, res) => {
    Categoria.find().then(categorias => {
        res.render("admin/addpostagem", {
            categorias: categorias,
            titulo: req.flash("titulo"),
            slug: req.flash("slug"),
            descricao: req.flash("descricao"),
            conteudo: req.flash("conteudo"),
            erros: req.flash("erros")
        });    
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/admin");
    });
});

router.post("/postagens/nova", status, (req, res) => {
    const erros = [];
    if(!req.body.titulo || req.body.titulo == null || typeof req.body.titulo == undefined) {
        erros.push({
            texto: "Titulo inválido"
        });
    }
    else if(!req.body.slug || req.body.slug == null || typeof req.body.slug == undefined) {
        erros.push({
            texto: "Slug inválido"
        });
    }
    else if(!req.body.descricao || req.body.descricao == null || typeof req.body.descricao == undefined) {
        erros.push({
            texto: "Descrição inválido"
        });   
    }
    else if(!req.body.conteudo || req.body.conteudo == null || typeof req.body.conteudo == undefined) {
        erros.push({
            texto: "Conteúdo inválido"
        });
    }
    else if(req.body.categoria == "0") { 
        erros.push({
            texto: "Categoria inválida, registre uma categoria"
        });
    }
    if(erros.length > 0) {
        req.flash("titulo", req.body.titulo);
        req.flash("slug", req.body.slug);
        req.flash("descricao", req.body.descricao);
        req.flash("conteudo", req.body.conteudo);
        req.flash("erros", erros);
        res.redirect("/admin/postagens/add");
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch(err => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem");
            res.redirect("/admin/postagens");
        });
    }
}); 

router.get("/postagens/edit/:id", status, (req, res) => {
    Postagem.findOne({_id: req.params.id }).then(postagem => {
        Categoria.find().then(categorias => {
             res.render("admin/editpostagens", {
                 categorias: categorias,
                 postagem: postagem,
                 erros: req.flash("erros")
             });
        }).catch(err => {   
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/postagens");
        });
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
        res.redirect("/admin/postagens");
    });
});

router.post("/postagem/edit", status, (req, res) => {
    const erros = [];
    if(!req.body.titulo || req.body.titulo == null || typeof req.body.titulo == undefined) {
        erros.push({
            texto: "Titulo inválido"
        });
    }
    else if(!req.body.slug || req.body.slug == null || typeof req.body.slug == undefined) {
        erros.push({
            texto: "Slug inválido"
        });
    }
    else if(!req.body.descricao || req.body.descricao == null || typeof req.body.descricao == undefined) {
        erros.push({
            texto: "Descrição inválido"
        });
    }
    else if(!req.body.conteudo || req.body.conteudo == null || typeof req.body.conteudo == undefined) {
        erros.push({
            texto: "Conteúdo inválido"
        });
    }
    else if(req.body.categoria == "0") { 
        erros.push({
            texto: "Categoria inválida, registre uma categoria"
        });
    }
    if(erros.length > 0) {
        req.flash("erros", erros);
        res.redirect("/admin/postagens/edit/" + req.body.id);
    } else {
        Postagem.findOne({_id: req.body.id}).then(postagem => {
            postagem.titulo = req.body.titulo;
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.conteudo = req.body.conteudo;
            postagem.categoria = req.body.categoria;
            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!");
                res.redirect("/admin/postagens");
            }).catch(err => {
                req.flash("error_msg", "Erro interno");
                res.redirect("/admin/postagens");
            });
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao salvar a edição");
            res.redirect("/admin/postagens");
        });
    }
});

router.get("/postagens/deletar/:id", status, (req, res) => { // Outra maneira de deletar postagem
    Postagem.findByIdAndDelete({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem");
        res.redirect("/admin/postagens");
    })
});


module.exports = router;