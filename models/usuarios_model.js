var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var usuariosSchema = new Schema({
  nombre: {type: String, required: true},
  apellido: {type: String, required: true},
  direccion: {type: String, required: true},
  telefono: {type: Number, required: true},
  email: {type: String, required: true, unique: true},
  clave: {type: String, required: true}
}, {collection: 'usuarios'});

var usuariosModel = mongoose.model('usuariosModel', usuariosSchema);
exports.usuariosModel = usuariosModel;