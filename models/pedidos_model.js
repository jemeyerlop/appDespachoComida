var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pedidosSchema = new Schema({
  pedido: {type: String, required: true},
  cliente: {type: String, required: true},
  idPedido: {type: String, required: true},
  ingreso: {type: Number, default: Date.now()/1000/60},//tiempo actual en minutos desde las 00:00:00 UTC del 1 de enero de 1970
  horaPedido: {type: String, required: true},
  despachado: {type: Boolean, default: false},
  estadoDespacho: {type: String, default: 'en-despacho'}//en-despacho|-entregado-|-rechazado- (los guiones son para que todas las posibles cadenas de texto sean iguales ya que al ser capped collection no se permite cambiar el tamaño total, por lo tanto con los guiones todos quedan en 11, que es el tamaño de la cadena más grande ('en-despacho'))
}, {collection: 'pedidos', capped: { size: 100000, max: 1000, autoIndexId: true }});

var pedidosModel = mongoose.model('pedidosModel', pedidosSchema);
exports.pedidosModel = pedidosModel;