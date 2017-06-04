# appDespachoComida
Aplicación web para administrar pedidos de comida rápida con despacho a domicilio, mediante el uso de Socket.IO entre los distintos usuarios involucrados en el proceso.

Actualmente funcionando en Node.js 4.2.4 y MongoDB 3.0

Instrucciones para la demo

1. Para los enlaces señalados abajo, abrir y loguearse en cada uno de ellos desde un dispositivo o navagador distinto, de tal manera que los 4 usuarios (uno por enlace) puedan estar simultaneamente logueados e interactuar entre si

Loguearse a control general (administrador: administrador | clave: 1234)
http://appjemeyerlop.us-3.evennode.com/administradoresLoginForm

Loguearse a cocina (administrador: cocina | clave: 1234)
http://appjemeyerlop.us-3.evennode.com/administradoresLoginForm

Loguearse a despacho (administrador: despacho | clave: 1234)
http://appjemeyerlop.us-3.evennode.com/administradoresLoginForm

Loguearse a cliente (email: cliente@gmail.com | clave: 1234)
http://appjemeyerlop.us-3.evennode.com/usuariosLoginForm

2. Posteriormente, en el sitio del cliente, en la sección 'Pizzas', añadir productos al carro y luego en la sección 'Hacer pedido' realizar el pedido

3. Una vez que se envíe el pedido, se podrá ver que éste se refleja en las páginas de 'Control general' y 'Cocina'

4. Se podrá apreciar la interacción entre los distintos usuarios (control general, cocina, despacho y cliente) en la medida que los usuarios de cocina y despacho seleccionen las diversas opciones de sus respectivas páginas. Cada cambio se verá reflejado automáticamente en las páginas de los otros usuarios, gracias a la conexión entre ellas por medio de Socket.IO
