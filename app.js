//Inicializamos los objetos necesarios.
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var port = Number(process.env.PORT || 5000);
server.listen(port);

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendfile('public/index.html');
});

//Se ha establecido conexión
io.sockets.on('connection', function(socket) {

    /* Cuando un usuario realiza una acción en el public,
     recibimos los datos de la acción en concreto y
     envío a todos los demás las coordenadas */

    socket.on('comenzarTrazo',function(coord){
        console.log('Dibujando...');
        io.sockets.emit('abajo',coord);
    });

    socket.on('terminarTrazo',function(coord){
        console.log('Trazo terminado');
        io.sockets.emit('arriba',coord);
    });

    socket.on('dibujar',function(coord){
        io.sockets.emit('mover',coord);
    });

    socket.on('limpiar',function(){
        console.log('Pizarra limpia');
        io.sockets.emit('limpiar',true);
    });

});