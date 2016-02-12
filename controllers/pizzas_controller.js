var mongoose = require('mongoose');
var pizzasModel = require('../models/pizzas_model.js').pizzasModel;
var url = require('url');
//PROTEGIDOS POR LOGIN PARA ADMINISTRADORES (Control general)
  exports.pizzasListar = function(req, res) {    
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
      var query = pizzasModel.find();
      query.exec(function(err, docs){
      	if(!err){        
          var pizzas=docs;
          res.render('pizzasListar.html', {
              pizzas: pizzas
          });
      	}
      });
    } else {
        res.redirect('/administradoresLoginForm');
    }  
  };

  exports.pizzasAgregarForm = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
    	res.render('pizzasAgregarForm.html');
    } else {
        res.redirect('/administradoresLoginForm');
    }  
  };

  exports.pizzasAgregar = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
    	var nuevaPizza = req.body;
      	pizzasModel.create([nuevaPizza], function(err){
    	  	if(err){
            console.log(err);
            res.render('pizzasAgregar.html', {
              mensaje: 'Hubo un error'
            });
    	  	}else{
            res.render('pizzasAgregar.html', {
              mensaje: 'Pizza agregada'
            });
    	  	}
      	});
      } else {
          res.redirect('/administradoresLoginForm');
      }        
    };

  exports.pizzasModificarForm = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
      //extraer datos de url
      var url_parts = url.parse(req.url, true);
      var url_query = url_parts.query;
      //consultar a bd
      var query = pizzasModel.find({_id: url_query._id});
      query.exec(function(err, docs){
        if(!err){        
          res.render('pizzasModificarForm.html', {
              _id: docs[0]._id,
              nombre: docs[0].nombre,
              ingredientes: docs[0].ingredientes,
              valor: docs[0].valor
          });
        }else{
          console.log(err);
        }
      });
    } else {
        res.redirect('/administradoresLoginForm');
    }      
  };

  exports.pizzasModificar = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
      var modificacion = req.body;
        pizzasModel.update({_id:modificacion._id},{$set:{nombre:modificacion.nombre,ingredientes:modificacion.ingredientes,valor:modificacion.valor}},function(err, raw){
          if(err){
            console.log(err);
            res.render('pizzasModificar.html', {
              mensaje: 'Hubo un error'
            });
          }else{
            res.render('pizzasModificar.html', {
              mensaje: 'Pizza modificada'
            });
          }
      });
    } else {
        res.redirect('/administradoresLoginForm');
    }       
  };

  exports.pizzasEliminar = function(req, res) {
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
      //extraer datos de url
      var url_parts = url.parse(req.url, true);
      var url_query = url_parts.query;
      //eliminar en bd
      pizzasModel.remove({_id: url_query._id}, function (err){
        if(err){
          console.log(err);
          res.render('pizzasEliminar.html', {
            mensaje: 'Hubo un error'
          });
        }else{
          res.render('pizzasEliminar.html', {
            mensaje: 'Pizza eliminada'
          });
        }
      });
    } else {
        res.redirect('/administradoresLoginForm');
    }        
  };