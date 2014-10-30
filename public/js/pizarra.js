'use strict';

//iniciamos los objetos y variables necesarias
var canvas = null, ctx = null, container = null;
var socket = io.connect('/');
var btnLimpiar = null;
var click = false , block = false; /* Las variables click y block funcionan de forma que cuando un usuario esta dibujando,
                                        los demás deben esperar a que este termine el trazo para poder dibujar ellos */

function iniciar() {
    canvas = document.getElementById('canvas');
    container = canvas.parentElement;
    ctx = canvas.getContext('2d');
    console.log("variables inicializadas");
    btnLimpiar = document.getElementById("limpiar");

    window.addEventListener("resize", canvasResponsive);
    canvasResponsive();
}


/*
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 ========================= interaccion con el servidor =========================
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 */


//Usamos la librería socket.io para comunicarnos con el servidor mediante websockets
socket.on('connect', function(){

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

    //Al soltar el click (dentro o fuera del canvas) enviamos orden de terminar el trazo
    window.addEventListener("mouseup",function(coord){

        if(!block){
            socket.emit('terminarTrazo',{x : coord.x, y : coord.y});
            click = false;
            terminarTrazo(coord);
        }

    },false);

    //Al mover el ratón mientras esta clickado enviamos coordenadas donde continuar el trazo.
    canvas.addEventListener("mousemove",function(coord){

        if(click){
            if(!block){
                socket.emit('dibujar',{x : coord.x, y : coord.y});
                pintar(coord);
            }
        }

    },false);


    //Recibimos mediante websockets las ordenes de dibujo

    socket.on('abajo',function(coord){
        if(!click){
            block = true;
            comenzarTrazo(coord);
        }
    });

    socket.on('arriba',function(coord){
        if(!click){
            block = false;
            terminarTrazo(coord);
        }
    });

    socket.on('mover',function(coord){
        if(block){
            pintar(coord);
        }
    });

    socket.on('limpiar',limpiarPizarra);

});

/*
   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
   ============================== Metodos de pintado =============================
   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 */

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
//vuelve a pintar el rectangulo gris en el canvas
function limpiarPizarra(){
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


/* para adaptar el canvas a diferentes pantallas  */

function canvasResponsive(){
    canvas.width = container.offsetWidth; //max width
    canvas.height = container.offsetHeight; //max height
    limpiarPizarra();
}

iniciar();