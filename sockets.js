var pedidosModel = require('./models/pedidos_model.js').pedidosModel;

module.exports = function(io) {

//VARIABLE QUE DETERMINA DESDE CUÁNTOS MINUTOS HACIA ATRÁS ACTUALIZAR PARA LOS NUEVOS SOCKET QUE SE CONECTEN
var desdeHaceUnTiempo=((Date.now()/1000/60)-60);//desde hace '-x' minutos

//CLIENTE

    var ioCliente = io.of('/SK_cliente');
    ioCliente.on('connection', function(socket){
        console.log('cliente conectado');
    //evento 'clienteConectado'
        socket.on('clienteConectado', function(data) {
            console.log(data+socket.id);
        });
    //evento 'pedidoRealizado'
        socket.on('pedidoRealizado', function(data) {
        //preparar datos como cadenas de texto simplificados para los operarios
        //console.log(data);
          var cliente=data[0];//acceder al objeto puro de cliente
          var cadenaCliente='';
          for(var dato in cliente){
          cadenaCliente+=dato+ ': '+cliente[dato]+'<br>';
          }
          console.log('CLIENTE');
          console.log(cadenaCliente);
          var pedido=data[1];     
          var cadenaPedido='';
          for(var objeto in pedido){
            for(var item in pedido[objeto]){
              if(item !== '_idItem'){//que no se escriba el _idItem
                if(item !== 'nombreProducto'){
                  cadenaPedido+=item+' '+pedido[objeto][item]+', ';
                }else{
                  cadenaPedido+=pedido[objeto][item]+', '
                }
              }
            }
          cadenaPedido=cadenaPedido.slice(0,-2);//sacar última coma y espacio
          cadenaPedido+='<br>';
          }
          console.log('PEDIDO');
          console.log(cadenaPedido);
          var idSocketCliente=socket.id.replace('/SK_cliente#','');//se le quita la subcadena '/SK_cliente#' al id del socket del cliente para evitar problemas posteriormente en el navegador al usar el id del socket como un id de HTML
            var d = new Date();
            if(d.getHours() < 10){var horas='0'+d.getHours();}else{var horas=d.getHours();};
            if(d.getMinutes() < 10){var minutos='0'+d.getMinutes();}else{var minutos=d.getMinutes();};
            var horaPedido=horas+':'+minutos;
            var infoPedido={pedido:cadenaPedido, cliente:cadenaCliente, id:idSocketCliente,horaPedido:horaPedido};
            //console.log(infoPedido);
        //registrar pedido en bd
            pedidosModel.create([{pedido:infoPedido.pedido,cliente:infoPedido.cliente,idPedido:infoPedido.id,horaPedido:infoPedido.horaPedido}], function(err){
                if(err){
                  console.log('no se pudo insertar pedido');
                }else{
                  console.log('pedido insertado');
              //emisión a 'CONTROL GENERAL' para que registre el nuevo pedido
                  ioControlGeneral.emit('nuevoPedido', infoPedido);//emite a todos los socket en 'ioControlGeneral'
              //emisión a 'COCINA' para preparar el nuevo pedido
                  ioCocina.emit('iniciarPreparacion', infoPedido);//emite a todos los socket en 'ioCocina'
              //emisión a 'CLIENTE' filtrado por id relacionado al pedido
                  ioCliente.to('/SK_cliente#'+infoPedido.id).emit('pedidoAnotado', 'Pedido ingresado con código: "'+infoPedido.id+'"');//responde a ese id
                }
            });
        });
    });

//COCINA

    var ioCocina = io.of('/SK_cocina');
    ioCocina.on('connection', function(socket){
        console.log('cocina conectada');    
    //evento 'cocinaConectada'
        socket.on('cocinaConectada', function(data) {
            console.log(data+socket.id);
        });
    //alimentar nuevo socket con info de la bd
        
        var query = pedidosModel.find({ingreso:{$gte:desdeHaceUnTiempo}},'pedido idPedido despachado estadoDespacho -_id');//excluir _id y elegir los otros señalados
        query.exec(function(err, docs){
            if(err){        
                console.log('no se pudo encontrar la información');
                console.log(err);
            }else{
                console.log(docs);
            //emisión al socket de cocina que se acaba de conectar
                ioCocina.to(socket.id).emit('actualizacion', docs);//envía la información de los pedidos de los últimos minutos (var desdeHaceUnTiempo) al socket que se acaba de conectar, para que quede a la par de los otros según la info de la bd
            }
        });    
    //evento 'pedidoPreparado'
        socket.on('pedidoPreparado', function(infoPedido) {
        //registrar cambio en bd
            pedidosModel.update({idPedido:infoPedido.id},{$set:{despachado:true}},function(err, raw){
                if(err){
                  console.log('no se pudo modificar el documento');
                }else{
                  pedidosModel.find({idPedido:infoPedido.id}, 'cliente', function (err, docs) {
                    if(err){
                      console.log('no se pudo encontrar el cliente');
                    }else{
                      infoPedido.cliente=docs[0].cliente;
                      console.log(infoPedido.cliente);
                      console.log(infoPedido.pedido);
                      console.log('documento modificado');
                  //emisión a 'COCINA' para actualizar estado
                      ioCocina.emit('pedidoPreparado', infoPedido);//emite a todos los socket del canal en 'ioCocina'
                  //emisión a 'DESPACHO' para enviar el pedido
                      ioDespacho.emit('pedidoPreparado', infoPedido);//emite a todos los socket del canal en 'ioDespacho'
                  //emisión a 'CONTROL GENERAL' para actualizar estado
                      ioControlGeneral.emit('pedidoPreparado', infoPedido);//emite a todos los socket del canal en 'ioControlGeneral'
                  //emisión a 'CLIENTE' filtrado por id relacionado al pedido
                      ioCliente.to('/SK_cliente#'+infoPedido.id).emit('pedidoDespachado', 'Pedido despachado');
                    }
                  });
                }
            });
        });

    //evento 'despachoCancelado'
        socket.on('despachoCancelado', function(infoPedido) {
        //registrar cambio en bd
            pedidosModel.update({idPedido:infoPedido.id},{$set:{despachado:false}},function(err, raw){
                if(err){
                  console.log('no se pudo modificar el documento');
                }else{
                  console.log('documento modificado');
              //emisión a 'COCINA' para actualizar estado
                  ioCocina.emit('despachoCancelado', infoPedido);//emite a todos los socket del canal en 'ioCocina'
              //emisión a 'DESPACHO' para cancelar envío
                  ioDespacho.emit('despachoCancelado', infoPedido);//emite a todos los socket del canal en 'ioDespacho'
              //emisión a 'CONTROL GENERAL' para actualizar estado
                  ioControlGeneral.emit('despachoCancelado', infoPedido);//emite a todos los socket del canal en 'ioControlGeneral'
              //emisión a 'CLIENTE' filtrado por id relacionado al pedido
                  ioCliente.to('/SK_cliente#'+infoPedido.id).emit('cancelarAvisoDePedidoDespachado', '');//envía cadena vacía para que se borre el aviso que decía que había sido despachado
                }
            });            
        });

    });

//DESPACHO

    var ioDespacho = io.of('/SK_despacho');
    ioDespacho.on('connection', function(socket){
        console.log('despacho conectado');
    //evento 'despachoConectado'
        socket.on('despachoConectado', function(data) {
            console.log(data+socket.id);
        });
    //alimentar nuevo socket con info de la bd
        var query = pedidosModel.find({ingreso:{$gte:desdeHaceUnTiempo}, despachado:true},'pedido cliente idPedido estadoDespacho -_id');//excluir _id y elegir los otros señalados
        query.exec(function(err, docs){
            if(err){        
                console.log('no se pudo encontrar la información');
                console.log(err);
            }else{
                console.log(docs);
            //emisión al socket de despacho que se acaba de conectar
                ioDespacho.to(socket.id).emit('actualizacion', docs);//envía la información de los pedidos de los últimos minutos (var desdeHaceUnTiempo) al socket que se acaba de conectar, para que quede a la par de los otros según la info de la bd
            }
        });
    //evento 'cambioEstadoDespacho'
        socket.on('cambioEstadoDespacho', function(infoEstadoDespacho) {
        //registrar cambio en bd
            var nuevoEstado=infoEstadoDespacho.estado;
            var mensajeFinalCliente='';
            switch(nuevoEstado) {
                case 'estadoDespachoEnDespacho':
                    nuevoEstado='en-despacho';
                    break;
                case 'estadoDespachoEntregado':
                    nuevoEstado='-entregado-';
                    mensajeFinalCliente='Su pedido ha sido entregado';
                    break;
                case 'estadoDespachoRechazado':
                    nuevoEstado='-rechazado-';
                    mensajeFinalCliente='Usted ha rechazado el pedido, disculpe las molestias';
                    break;
            }
            pedidosModel.update({idPedido:infoEstadoDespacho.id},{$set:{estadoDespacho:nuevoEstado}},function(err, raw){
                if(err){
                  console.log('no se pudo modificar el documento');
                  console.log(err);
                }else{
                  console.log('documento modificado');
              //emisión a 'COCINA' para actualizar estado de despacho e impedir que se cancele un despacho desde la cocina si éste está en estado de 'entregado o 'rechazado', o bien, permitir que un despacho vuelva a ser cancelable desde la cocina si éste vuelve al estado 'enDespacho'        
                  ioCocina.emit('cambioEstadoDespacho', infoEstadoDespacho);//emite a todos los socket del canal en 'ioCocina'          
              //emisión a 'DESPACHO' para actualizar estado de despacho
                  ioDespacho.emit('cambioEstadoDespacho', infoEstadoDespacho);//emite a todos los socket del canal en 'ioDespacho'
              //emisión a 'CONTROL GENERAL' para actualizar estado de despacho
                  ioControlGeneral.emit('cambioEstadoDespacho', infoEstadoDespacho);//emite a todos los socket del canal en 'ioControlGeneral'
              //emisión a 'CLIENTE' filtrado por id relacionado al pedido
                  ioCliente.to('/SK_cliente#'+infoEstadoDespacho.id).emit('mensajeFinal', mensajeFinalCliente);
                }
            });                  
        });
    });

//CONTROL GENERAL

    var ioControlGeneral = io.of('/SK_controlGeneral');
    ioControlGeneral.on('connection', function(socket){
        console.log('control general conectado');
    //evento 'controlGeneralConectado'
        socket.on('controlGeneralConectado', function(data) {
            console.log(data+socket.id);
        });
    //alimentar nuevo socket con info de la bd
        var query = pedidosModel.find({ingreso:{$gte:desdeHaceUnTiempo}},'pedido idPedido horaPedido estadoDespacho despachado -_id');//excluir _id y elegir los otros señalados
        query.exec(function(err, docs){
            if(err){        
                console.log('no se pudo encontrar la información');
                console.log(err);
            }else{
                console.log(docs);
            //emisión al socket de control general que se acaba de conectar
                ioControlGeneral.to(socket.id).emit('actualizacion', docs);//envía la información de los pedidos de los últimos minutos (var desdeHaceUnTiempo) al socket que se acaba de conectar, para que quede a la par de los otros según la info de la bd
            }
        });
    });

};