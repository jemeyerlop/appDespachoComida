var mongoose = require('mongoose');
var usuariosModel = require('../models/usuarios_model.js').usuariosModel;
var pizzasModel = require('../models/pizzas_model.js').pizzasModel;
var url = require('url');
//encriptación de claves
var crypto = require('crypto');
function hashPW(pwd){
  return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}
//CONTROLADORES DE LOGIN Y PÁGINAS DE INICIO
  exports.usuariosLoginForm = function(req, res) {
      if(req.session.usuario){
          console.log('a');
          res.redirect('/usuariosInicio');
      }else if(req.session.error){
          console.log('b');
          res.render('usuariosLoginForm.html', {
              mensajeError: req.session.error
          });
      }else{
          //recién va por el primer intento
          console.log('c');
          res.render('usuariosLoginForm.html', {
              mensajeError: ''
          });
      }
  };

  exports.usuariosLogin = function(req, res) {
      usuariosModel.findOne({email: req.body.email, clave:hashPW(req.body.clave)}, function (err, usuarioEncontrado) {
          if (err) {
              console.log(err);
          } else {
              if (usuarioEncontrado!==null) {
                  //console.log(usuarioEncontrado);
                  console.log('d');
                  req.session.regenerate(function(){
                      req.session.usuario = usuarioEncontrado;
                      //agregar a la session un carro de pedidos
                      req.session.carro=[];
                      //agregar mensaje de exito
                      req.session.success = 'Bienvenido/a ' + usuarioEncontrado.nombre;
                      res.redirect('/usuariosInicio');
                  });
              } else {
                  console.log('e');
                  req.session.regenerate(function(){
                      req.session.error = 'La clave y el email no coinciden';
                      res.redirect('/usuariosLoginForm');
                  });
              }
          }
      });
  };

  exports.usuariosLogout = function(req, res) {
      req.session.destroy(function(){
          console.log('h');
          res.redirect('/usuariosLoginForm');
      }); 
  };
//PROTEGIDOS POR LOGIN PARA ADMINISTRADORES (Control general)
  exports.usuariosListar = function(req, res) {    
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
      var query = usuariosModel.find();
      query.exec(function(err, docs){
      	if(!err){        
          var usuarios=docs;
          res.render('usuariosListar.html', {
              usuarios: usuarios
          });
      	}
      });
    } else {
        res.redirect('/administradoresLoginForm');
    }    
  };

  exports.usuariosEliminar = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {   
      //extraer datos de url
      var url_parts = url.parse(req.url, true);
      var url_query = url_parts.query;
      //eliminar en bd
      usuariosModel.remove({_id: url_query._id}, function (err){
        if(err){
          console.log(err);
          res.render('usuariosEliminar.html', {
            mensaje: 'Hubo un error'
          });
        }else{
          res.render('usuariosEliminar.html', {
            mensaje: 'Usuario eliminado'
          });
        }
      });
    } else {
        res.redirect('/administradoresLoginForm');
    } 
  };
//DE LIBRE ACCESO

  exports.usuariosAgregarForm = function(req, res) {     
    	res.render('usuariosAgregarForm.html');
  };

  exports.usuariosAgregar = function(req, res) {
  	var nuevoUsuario = req.body;
      //console.log('antes '+nuevoUsuario.clave);
      nuevoUsuario.clave=hashPW(nuevoUsuario.clave);
      //console.log('después '+nuevoUsuario.clave);
    	usuariosModel.create([nuevoUsuario], function(err){
  	  	if(err){
          console.log(err);
          res.render('usuariosAgregar.html', {
            mensaje: 'Hubo un error'
          });
  	  	}else{
          res.render('usuariosAgregar.html', {
            mensaje: 'Usted ha sido registrado correctamente'
          });
  	  	}
  	});
  };
  //de libre acceso, pero con características internas que cambian dependiendo de si se está logueado o no
    exports.usuariosInicio = function(req, res) {
      if(req.session.usuario){
        res.render('usuariosInicio.html', {
          mensajeBienvenida: req.session.success,
          logueado: true
        });
      }else{
        res.render('usuariosInicio.html', {
          logueado: false
        });
      }
    };

    exports.usuariosMenuPizzas = function(req, res) {
      var query = pizzasModel.find();
      query.exec(function(err, docs){
        if(!err){        
          var pizzas=docs;
          if(req.session.usuario){
            var logueado=true;
          }else{
            var logueado=false;
          }
          res.render('usuariosMenuPizzas.html', {
              pizzas: pizzas,
              logueado: logueado
          });          
        }
      });
    };
//PROTEGIDOS POR LOGIN PARA USUARIO
    exports.usuariosModificarForm = function(req, res) {
        if(req.session.usuario){
            res.render('usuariosModificarForm.html',{
                nombre: req.session.usuario.nombre,
                apellido: req.session.usuario.apellido,
                direccion: req.session.usuario.direccion,
                telefono: req.session.usuario.telefono,
                email: req.session.usuario.email,
                _id: req.session.usuario._id
            });
        }else{
            res.redirect('/usuariosLoginForm');
        };
    };

    exports.usuariosModificar = function(req, res) {
        if(req.session.usuario){
            var modificacion = req.body;
            usuariosModel.update({_id:modificacion._id},{$set:{nombre:modificacion.nombre,apellido:modificacion.apellido,direccion:modificacion.direccion,telefono:modificacion.telefono,email:modificacion.email}},function(err, raw){
                if(err){
                    console.log(err);
                    res.render('usuariosModificar.html', {
                      mensaje: 'Hubo un error'
                    });
                }else{
                    //si se modificaron los datos en la bd, entonces también actualizarlos en el objeto 'usuario' de la actual session abierta para poder seguir usando los mismos datos de la session actualizados sin que sea necesario hacer una nueva session
                    req.session.usuario.nombre=modificacion.nombre;
                    req.session.usuario.apellido=modificacion.apellido;
                    req.session.usuario.direccion=modificacion.direccion;
                    req.session.usuario.telefono=modificacion.telefono;
                    req.session.usuario.email=modificacion.email;
                    //renderizar
                    res.render('usuariosModificar.html', {
                      mensaje: 'Datos modificados'
                    });
                }
            });
        }else{
            res.redirect('/usuariosLoginForm');
        };   
    };

    exports.clienteCarro = function(req, res) {//(ajax desde usuariosMenuPizzas.html)
        if(req.session.usuario){          
          var datosPizza = req.body;
          req.session.carro.push(datosPizza);
          console.log(req.session.carro);
          res.send(true);
        }else{
          res.send(false);
        };   
    };

    exports.vaciarCarro = function(req, res) {//(ajax desde cliente.html)
        if(req.session.usuario){          
          console.log('antes');
          console.log(req.session.carro);
          req.session.carro=[];
          console.log('después');
          console.log(req.session.carro);
          res.send(true);
        }else{
          res.send(false);
        };   
    };