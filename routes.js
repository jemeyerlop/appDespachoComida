var express = require('express');

module.exports = function(app) {

    var usuarios_controller = require('./controllers/usuarios_controller');
    var administradores_controller = require('./controllers/administradores_controller');
    var pizzas_controller = require('./controllers/pizzas_controller');
    var paginas_socket_controller = require('./controllers/paginas_socket_controller');
    app.use('/', express.static( './static'));
    /*
    app.use('/static', express.static( './static')).
        use('/images', express.static( '../images')).
        use('/lib', express.static( '../lib')
    );
    */
//RUTAS DE LOGIN Y PÁGINAS DE INICIO
    //usuarios
        app.get('/usuariosLoginForm', usuarios_controller.usuariosLoginForm);
        app.post('/usuariosLogin', usuarios_controller.usuariosLogin);
        app.get('/usuariosLogout', usuarios_controller.usuariosLogout);
    //administradores
        app.get('/administradoresLoginForm', administradores_controller.administradoresLoginForm);
        app.post('/administradoresLogin', administradores_controller.administradoresLogin);
        app.get('/administradoresLogout', administradores_controller.administradoresLogout);
        //inicios de administradores según roll
            app.get('/cocina', paginas_socket_controller.cocina);//(con socket en sockets.js)
            app.get('/despacho', paginas_socket_controller.despacho);//(con socket en sockets.js)
            app.get('/controlGeneral', paginas_socket_controller.controlGeneral);//(con socket en sockets.js)
//RUTAS DE USUARIOS
    // rutas de usuarios protegidas por login para administradores (roll 'Control general')
        app.get('/usuariosListar', usuarios_controller.usuariosListar);
        app.get('/usuariosEliminar', usuarios_controller.usuariosEliminar);
    // rutas de usuarios con libre acceso
        app.get('/usuariosAgregarForm', usuarios_controller.usuariosAgregarForm);
        app.post('/usuariosAgregar', usuarios_controller.usuariosAgregar);
        //de libre acceso pero con características internas que cambian dependiendo de si se está logueado o no
            app.get('/usuariosInicio', usuarios_controller.usuariosInicio);
            app.get('/usuariosMenuPizzas', usuarios_controller.usuariosMenuPizzas);
    // rutas de usuarios protegidas por login para usuario
        app.get('/usuariosModificarForm', usuarios_controller.usuariosModificarForm);
        app.post('/usuariosModificar', usuarios_controller.usuariosModificar);        
        app.post('/clienteCarro', usuarios_controller.clienteCarro);//(ajax desde usuariosMenuPizzas.html)
        app.post('/vaciarCarro', usuarios_controller.vaciarCarro);//(ajax desde cliente.html)
        app.get('/cliente', paginas_socket_controller.cliente);//(con socket en sockets.js)
//RUTAS DE ADMINISTRADORES (protegidas por login para administradores (roll 'Control general'))
    app.get('/administradoresListar', administradores_controller.administradoresListar);
    app.get('/administradoresEliminar', administradores_controller.administradoresEliminar);
    app.get('/administradoresAgregarForm', administradores_controller.administradoresAgregarForm);
    app.post('/administradoresAgregar', administradores_controller.administradoresAgregar);
//RUTAS DE PIZZAS (protegidas por login para administradores (roll 'Control general'))
    app.get('/pizzasListar', pizzas_controller.pizzasListar);
    app.get('/pizzasAgregarForm', pizzas_controller.pizzasAgregarForm);
    app.post('/pizzasAgregar', pizzas_controller.pizzasAgregar);
    app.get('/pizzasModificarForm', pizzas_controller.pizzasModificarForm);
    app.post('/pizzasModificar', pizzas_controller.pizzasModificar);
    app.get('/pizzasEliminar', pizzas_controller.pizzasEliminar);
};