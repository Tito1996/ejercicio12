const http=require('http');
const url=require('url');
const fs=require('fs');

//Para este ejercicio se requiere, ademas de los tres que ya hemos visto, un nuevo modulo llamado 'querystring'. Nos ayudara a analizar los datos cargados en el formulario cuando llegan al servidor.
const querystring = require('querystring');

const mime = {
    'html' : 'text/html',
    'css'  : 'text/css',
    'jpg'  : 'image/jpg',
    'ico'  : 'image/x-icon',
    'mp3'  : 'audio/mpeg3',
    'mp4'  : 'video/mp4'
};

// En la funcion anonima de createServer obtenemos el path del recurso y lo concatenamos con 'public'(donde almacenamos los recursos).
const servidor = http.createServer((pedido ,respuesta) => {
    const objetourl = url.parse(pedido.url);
    let camino = 'public' + objetourl.pathname;
    if (camino == 'public/') camino = 'public/index.html';
    encaminar(pedido, respuesta, camino);
});

servidor.listen(8888);

//La funcion encaminar analiza mediante un switch el contenido de camino
function encaminar(pedido, respuesta, camino) {
    console.log(camino);
    switch (camino) {
        case 'public/recuperardatos': { //Llama a la función recuperar y le pasa los dos objetos 'pedido' y 'respuesta'.
            recuperar(pedido, respuesta);
            break;
        }
        default: { //Devuelve la página estática index.html como hemos visto en ejercicios anteriores.
            fs.stat(camino, error => {
                if(!error) {
                    fs.readFile(camino, (error, contenido) => {
                        if(error){
                            respuesta.writeHead(500, {'Content-Type': 'text/plain'});
                            respuesta.write('Error interno');
                            respuesta.end();	
                        } else {
                            const vec = camino.split('.');
                            const extension=vec[vec.length-1];
                            const mimearchivo=mime[extension];
                            respuesta.writeHead(200, {'Content-Type': mimearchivo});
                            respuesta.write(contenido);
                            respuesta.end();
                        }
                    });
                }else{
                    respuesta.writeHead(404, {'Content-Type': 'text/html'});
                    respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');		
                    respuesta.end();
                }
            });
        }
    }
}

//La función recuperar se encarga de recuperar los dos datos del formulario y generar un archivo HTML para retornarlo al navegador.
function recuperar(pedido, respuesta) {
    let info = '';

    //Pasaremos un string con el valor 'data' y una función anónima que se irá llamando a medida que lleguen los datos al servidor desde el navegador
    pedido.on('data', datosparciales => {
        info += datosparciales; //A medida que van llegando los datos los vamos concatenando en 'info'
    });

    //Cuando llegan todos los datos, se ejecuta la función anónima que le pasamos al método 'on' con el string 'end'
    pedido.on('end', () => {

        //Al llegar aqui la variable info contiene los datos tal que 'nombre=juan&clave=12345'
        //Ahora accedemos a los valores de cada propiedad del formulario.
        const formulario = querystring.parse(info);
        //Genera un objeto literal con el contenido de info y lo guarda en la variable formulario, tal que
        //{
        //    nombre:'juan',
        //    clave:'123456'
        //}
        respuesta.writeHead(200, {'Content-Type': 'text/html'});
        const pagina=
            `<!doctype html><html><head></head><body>
            Nombre de usuario:${formulario['nombre']}<br>
            Clave:${formulario['clave']}<br>
            <a href="index.html">Retornar</a>
            </body></html>`;
        respuesta.end(pagina);	
    });
}

console.log('Servidor web iniciado');