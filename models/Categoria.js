const moongose = require("mongoose");
const Schema = moongose.Schema;

const Categoria = new Schema ({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
});

moongose.model("categorias", Categoria);