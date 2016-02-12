exports.cliente = function(req, res) {
    if(req.session.usuario){
    	res.render('cliente.html',{
            datosCliente:req.session.usuario,
            datosPedido:req.session.carro
        });
    }else{
        res.redirect('/usuariosLoginForm');
    };
};
exports.cocina = function(req, res) {    
    if (req.session.administrador && req.session.administrador.roll=='Cocina') {
  		  res.render('cocina.html');
    } else {
        res.redirect('/administradoresLoginForm');
    } 
};
exports.despacho = function(req, res) {  
    if (req.session.administrador && req.session.administrador.roll=='Despacho') {
  		  res.render('despacho.html');
    } else {
        res.redirect('/administradoresLoginForm');
    } 
};
exports.controlGeneral = function(req, res) {  
    if (req.session.administrador && req.session.administrador.roll=='Control general') {
  		  res.render('controlGeneral.html');
    } else {
        res.redirect('/administradoresLoginForm');
    } 
};