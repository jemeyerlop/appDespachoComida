var mongoose = require('mongoose');
var administradoresModel = require('../models/administradores_model.js').administradoresModel;
var url = require('url');
//encriptación de claves
var crypto = require('crypto');
function hashPW(pwd){
  return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}

//CONTROLADORES DE LOGIN Y PÁGINA DE INICIO
  exports.administradoresLoginForm = function(req, res) {
      if(req.session.administrador){
          console.log('a');
                if (req.session.administrador.roll=='Control general') {
                    res.redirect('/controlGeneral');
          }else if (req.session.administrador.roll=='Cocina') {
                    res.redirect('/cocina');
          }else if (req.session.administrador.roll=='Despacho') {
                    res.redirect('/despacho');
          };
      }else if(req.session.error){
          console.log('b');
          res.render('administradoresLoginForm.html', {
              mensajeError: req.session.error
          });
      }else{
          //recién va por el primer intento
          console.log('c');
          res.render('administradoresLoginForm.html', {
              mensajeError: ''
          });
      }
  };

  exports.administradoresLogin = function(req, res) {
      administradoresModel.findOne({administrador: req.body.administrador, clave:hashPW(req.body.clave)}, function (err, administradorEncontrado) {
          if (err) {
              console.log(err);
          } else {
              if (administradorEncontrado!==null) {
                  console.log(administradorEncontrado);
                  console.log('d');
                  req.session.regenerate(function(){
                      req.session.administrador = administradorEncontrado;
                      req.session.success = 'Bienvenido/a ' + administradorEncontrado.administrador;
                            if (req.session.administrador.roll=='Control general') {
                                res.redirect('/controlGeneral');
                      }else if (req.session.administrador.roll=='Cocina') {
                                res.redirect('/cocina');
                      }else if (req.session.administrador.roll=='Despacho') {
                                res.redirect('/despacho');
                      };
                  });
              } else {
                  console.log('e');
                  req.session.regenerate(function(){
                      req.session.error = 'La clave y el administrador no coinciden';
                      res.redirect('/administradoresLoginForm');
                  });
              }
          }
      });
  };

  exports.administradoresLogout = function(req, res) {
      req.session.destroy(function(){
          console.log('h');
          res.redirect('/administradoresLoginForm');
      }); 
  };
//PROTEGIDOS POR LOGIN PARA ADMINISTRADORES (Control general)
  exports.administradoresListar = function(req, res) {    
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
      var query = administradoresModel.find();
      query.exec(function(err, docs){
      	if(!err){        
          var administradores=docs;
          res.render('administradoresListar.html', {
              administradores: administradores
          });
      	}
      });
    } else {
        res.redirect('/administradoresLoginForm');
    } 
  };

  exports.administradoresEliminar = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
        //extraer datos de url
        var url_parts = url.parse(req.url, true);
        var url_query = url_parts.query;
        if (req.session.administrador._id != url_query._id) {
          //eliminar en bd
          administradoresModel.remove({_id: url_query._id}, function (err){
            if(err){
              console.log(err);
              res.render('administradoresEliminar.html', {
                mensaje: 'Hubo un error'
              });
            }else{
              res.render('administradoresEliminar.html', {
                mensaje: 'Administrador eliminado'
              });
            }
          });
        } else {
          console.log('Intentó eliminarse a si mismo');
          res.render('administradoresEliminar.html', {
            mensaje: 'No puede eliminarse a si mismo'
          });
        }
    } else {
        res.redirect('/administradoresLoginForm');
    } 
  };

  exports.administradoresAgregarForm = function(req, res) {    
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
    	 res.render('administradoresAgregarForm.html');
    } else {
        res.redirect('/administradoresLoginForm');
    } 
  };

  exports.administradoresAgregar = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
    	var nuevoAdministrador = req.body;
        //console.log('antes '+nuevoAdministrador.clave);
        nuevoAdministrador.clave=hashPW(nuevoAdministrador.clave);
        //console.log('después '+nuevoAdministrador.clave);
      	administradoresModel.create([nuevoAdministrador], function(err){
    	  	if(err){
            console.log(err);
            res.render('administradoresAgregar.html', {
              mensaje: 'Hubo un error'
            });
    	  	}else{
            res.render('administradoresAgregar.html', {
              mensaje: 'Administrador agregado'
            });
    	  	}
    	});
    } else {
        res.redirect('/administradoresLoginForm');
    }      
  };
