
//iniciamos los objetos y variables necesarias
var registroFrm = $('#registroFormulario'); //objeto del formulario de registro
var nickname = $('#nickname'); //input

var canvas = null, ctx = null, container = null;
var socket = io.connect('/');
var btnLimpiar = null;
var click = false , block = false; /* Las variables click y block funcionan de forma que cuando un usuario esta dibujando,
                                        los demás deben esperar a que este termine el trazo para poder dibujar ellos */
var miUsuario = null;

function iniciar() {
    canvas = document.getElementById("canvas");
    container = canvas.parentElement;
    ctx = canvas.getContext('2d');
    btnLimpiar = document.getElementById("limpiar");

}

registroFrm.submit(function(e){
    e.preventDefault();
    miUsuario = nickname.val();

    socket.emit('nuevo usuario', miUsuario, function(data){
        if(data != false){
            $('#registro').hide();
            $('#contenido').show();
            $('#nickError').html('ok');
            iniciarEscuchas();
            limpiarPizarra();
        }else{
            $('#nickError').html('El nombre de usuario ya esta en uso');
        }
    });

});
/*
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 ========================= interaccion con el servidor =========================
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 */
 function iniciarEscuchas(){
     //Al darle click al botón limpiar enviamos orden de devolver la pizarra a su estado inicial.
     btnLimpiar.addEventListener("click",function(){

         if(!block){
             socket.emit('limpiar',true);
         }

     },false);

     //Al clickar en la pizarra enviamos el punto de inicio del trazo
     canvas.addEventListener("mousedown",function(coord){

         if(!block){
             socket.emit('comenzarTrazo',{x : coord.x, y : coord.y});
             click = true;
             comenzarTrazo(coord);
         }

     },false);

     //Al mover el ratón mientras esta clickado enviamos coordenadas donde continuar el trazo.
     canvas.addEventListener("mousemove",function(coord){

         if(click){
             if(!block){
                 socket.emit('dibujar',{ punto: { x : coord.x, y : coord.y }, usuario: miUsuario});
                 pintar(coord);
             }
         }

     },false);

     //Al soltar el click (dentro o fuera del canvas) enviamos orden de terminar el trazo
     window.addEventListener("mouseup",function(coord){

         if(!block){
             socket.emit('terminarTrazo',{ punto: { x : coord.x, y : coord.y }, usuario: miUsuario});
             click = false;
             terminarTrazo(coord);
         }

     },false);


 }

//Usamos la librería socket.io para comunicarnos con el servidor mediante websockets

    //Recibimos mediante websockets las ordenes de dibujo

    socket.on('abajo',function(coord){
        if(!click){
            block = true;
            comenzarTrazo(coord);
        }
    });

    socket.on('arriba',function(datos){
        if(!click){
            block = false;
            terminarTrazo(datos.punto);
            removerUsuarioActivo(datos.usuario);
        }
    });

    socket.on('mover',function(datos){
        if(block){
            pintar(datos.punto);
        }
        pintarUsuarioActivo(datos.usuario);
    });

    socket.on('limpiar',limpiarPizarra);

    socket.on('usuarios', function(data){
        var contenido = '<h2>Conectados</h2> <ul>';

        for(i=0;i<data.length;i++){
            contenido += '<li id='+data[i].nombre+'>'+data[i].nombre + '</li>';
        }
        contenido += '</ul>';
        $("#listaUsuarios").html(contenido);
    });


/*
   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
   ============================== Metodos de pintado =============================
   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 */
function pintarUsuarioActivo(usuario){
    $('#'+usuario).addClass('activo');
}
function removerUsuarioActivo(usuario){
    $('#'+usuario).removeClass('activo');
}

//Se inicia al trazo en las coordenadas indicadas.
function comenzarTrazo(coord){
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.moveTo(coord.x - canvas.offsetLeft, coord.y - canvas.offsetTop);
}

//Se termina el trazo.
function terminarTrazo(coord){
    ctx.closePath();
}

//Dibujamos el trazo recibiendo la posición actual del ratón.
function pintar(coord){

    ctx.lineTo(coord.x - canvas.offsetLeft, coord.y - canvas.offsetTop);
    ctx.stroke();

}
//vuelve a pintar el rectangulo del fondo en el canvas
function limpiarPizarra(){
    ctx.fillStyle = '#002F27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


iniciar();