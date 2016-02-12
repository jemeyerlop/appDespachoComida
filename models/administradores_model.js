var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var administradoresSchema = new Schema({
  administrador: {type: String, required: true, unique: true},
  clave: {type: String, required: true},
  roll: {type: String, required: true}//Control general | Cocina | Despacho
}, {collection: 'administradores'});

var administradoresModel = mongoose.model('administradoresModel', administradoresSchema);
exports.administradoresModel = administradoresModel;