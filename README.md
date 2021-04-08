1. Instalar Node.js.
2. Instalar MongoDB Server.
3. Clonar repo de github ( https://github.com/marryabobora/API_DELILAH ).
4. Crear una carpeta donde se guardarán los datos del servidor.
5. Inicializar un servidor de MongoDB, con el comando 'mongod --dbpath [dirección de la carpeta creada]'.
6. Ejecutar el comando 'node index.js' en la carpeta donde se clonó el repo.
7. La API esta ejecutándose, y estará escuchando llamadas a http://localhost:3000/.
8. Importar la colección de Postman.
9. Configurar las variables PATH para que apunten a la API de Node sin puerto (localhost por defecto).


.Para crear usuario: 

Llamar a endpoint crear user, esto creará un usuário con username admin y password Password123 la respuesta contendrá una ID en cual debe ser puesto en la variable ID de la colección.

.Para logearso como usuario: 

Llamar al endpoint login de la colección, esto retornará un token este token debe ser insertado en la variable adminToken de la colección. 

.Para agregar un plato:

Se debe llamar al endpoint crear plato, esto creará un plato llamado fideos de precio $120 y retornará un dishId que debe ser insertado en la variable dishId de la colección.

.Para ver todos los platos:

Se debe llamar al endpoint ver todo los platos. 

.Para generar un nuevo pedido:

Se debe llamar al endpoint crear orden, esto creara una orden de pedido del plato fideos (dishId en un array en el body, esto retornara un ordenId que debe ser insertado en la variable orderId de la colección). 

.Para actualizar el pedido:

Se debe llamar al endpoint actualizar orden, esto cambiará el estado (state) de 0 (iniciado) a 2 (en camino), esto se pode cambiar en el body. 

.Para realizar CRUD de productos:

Se puede llamar a los distintos endpoints de la carpeta platos. Crear, actualizar y borrrar platos solo se puede hacer con un token de administrador. 

Más información sobre los diferentes endpoints se pueden encontrar en el archivo de documentación index.html. 

