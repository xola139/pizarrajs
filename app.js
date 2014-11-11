//Inicializamos los objetos necesarios.
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    usuarios = [];

var port = Number(process.env.PORT || 5000);

server.listen(port);


app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendfile('public/index.html');
});

//Se ha establecido conexión
io.sockets.on('connection', function(socket) {


    socket.on('nuevo usuario', function(data, callback) {
        encontrado = false;
        console.log('+ Se ha conectado: '+data);
        for (var i = 0; i < usuarios.length; i++) {

            if (usuarios[i].nombre === data)
                encontrado = true;
        }

        if (encontrado || data === "") {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            usuarios.push({nombre: data});
            actualizarUsuarios();
        }
    });

    /* Cuando un usuario realiza una acción en el public,
     recibimos los datos de la acción en concreto y
     envío a todos los demás las coordenadas */

    socket.on('comenzarTrazo',function(data){
        //console.log('Dibujando...');
        io.sockets.emit('abajo',data);
    });

    socket.on('dibujar',function(data){
        io.sockets.emit('mover',data);
    });

    socket.on('terminarTrazo',function(data){
        //console.log('Trazo terminado');
        io.sockets.emit('arriba',data);
    });

    socket.on('limpiar',function(){
        //console.log('Pizarra limpia');
        io.sockets.emit('limpiar',true);
    });

    function actualizarUsuarios() {
        io.sockets.emit('usuarios', usuarios);
    }

    socket.on('disconnect', function(data) {

        if (!socket.nickname) {
            return;
        }

        for (var i = 0; i < usuarios.length; i++) {

            if (usuarios[i].nombre === socket.nickname) {
                console.log('- Se ha desconectado: '+usuarios[i].nombre);
                usuarios.splice(i, 1);
                actualizarUsuarios();
            }
        }


    });
});