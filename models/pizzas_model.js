var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pizzasSchema = new Schema({
  nombre: {type: String, required: true, unique: true},
  ingredientes: {type: String, required: true},
  valor: {type: Number, required: true}
}, {collection: 'pizzas'});

var pizzasModel = mongoose.model('pizzasModel', pizzasSchema);
exports.pizzasModel = pizzasModel;