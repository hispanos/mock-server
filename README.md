# Mock API Service

Una aplicación completa para mockear servicios de API REST con PHP y MySQL. Permite crear environments, rutas, respuestas y reglas para simular APIs reales durante el desarrollo y testing.

## 🚀 Características

- **Environments**: Crear múltiples entornos (desarrollo, testing, staging)
- **Rutas**: Configurar endpoints con todos los métodos HTTP (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
- **Respuestas múltiples**: Cada ruta puede tener múltiples respuestas con diferentes códigos de estado
- **Sistema de reglas**: Respuestas condicionales basadas en headers, query parameters, body o reglas personalizadas
- **Interfaz intuitiva**: Panel de administración web moderno y fácil de usar
- **URLs dinámicas**: Soporte para parámetros dinámicos en las rutas (ej: `/api/users/{id}`)
- **Delays configurables**: Simular latencia de red
- **CORS habilitado**: Listo para desarrollo frontend

## 📋 Requisitos

- PHP 7.4 o superior
- MySQL 5.7 o superior
- Servidor web (Apache/Nginx)
- Extensión PDO para PHP
- Extensión JSON para PHP

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

```bash
git clone <url-del-repositorio>
cd mock-api-service
```

### 2. Configurar la base de datos

1. Crear una base de datos MySQL
2. Importar el esquema desde `database/schema.sql`
3. Configurar las credenciales en `config/database.php`

```php
return [
    'host' => 'localhost',
    'database' => 'mock_api_service',
    'username' => 'tu_usuario',
    'password' => 'tu_password',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];
```

### 3. Configurar el servidor web

#### Apache
Asegúrate de que el módulo `mod_rewrite` esté habilitado y que el archivo `.htaccess` esté funcionando.

#### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

### 4. Configurar permisos

```bash
chmod 755 public/
chmod 644 config/database.php
```

## 🚀 Uso

### Acceso a la aplicación

- **Panel de administración**: `http://tu-dominio/admin/`
- **API de mocking**: `http://tu-dominio/` (cualquier endpoint)

### Crear tu primer mock

1. **Crear un Environment**
   - Ve a la sección "Environments"
   - Haz clic en "Agregar"
   - Completa el nombre, descripción y URL base

2. **Crear una Ruta**
   - Ve a la sección "Rutas"
   - Haz clic en "Agregar"
   - Selecciona el environment
   - Define el método HTTP y la ruta
   - Agrega una descripción

3. **Crear una Respuesta**
   - Ve a la sección "Respuestas"
   - Haz clic en "Agregar"
   - Selecciona la ruta
   - Define el status code, headers y body
   - Marca como respuesta por defecto si es necesario

4. **Opcional: Crear Reglas**
   - Ve a la sección "Reglas"
   - Haz clic en "Agregar"
   - Define cuándo debe usarse esta respuesta

### Ejemplos de uso

#### GET /api/users
```json
{
  "users": [
    {"id": 1, "name": "Juan Pérez", "email": "juan@example.com"},
    {"id": 2, "name": "María García", "email": "maria@example.com"}
  ]
}
```

#### POST /api/users
```json
{
  "message": "Usuario creado exitosamente",
  "id": 3
}
```

#### Con reglas condicionales
- Si el header `X-Error` existe → Status 500
- Si el query parameter `search` está vacío → Lista vacía
- Si el ID no es numérico → Error 400

## 🔧 Configuración avanzada

### Headers personalizados
```json
{
  "Content-Type": "application/json",
  "X-Custom-Header": "valor",
  "Cache-Control": "no-cache"
}
```

### Delays configurables
- Simula latencia de red
- Útil para testing de timeouts
- Configurable en milisegundos

### Rutas dinámicas
- `/api/users/{id}` → Coincide con `/api/users/123`
- `/api/products/{category}/{id}` → Coincide con `/api/products/electronics/456`

## 📁 Estructura del proyecto

```
mock/
├── config/
│   └── database.php          # Configuración de la base de datos
├── database/
│   └── schema.sql            # Esquema de la base de datos
├── src/
│   ├── Database.php          # Clase de conexión a la base de datos
│   └── MockService.php       # Lógica principal de mocking
├── public/
│   ├── index.php             # Punto de entrada principal
│   ├── .htaccess             # Configuración de Apache
│   └── admin/                # Panel de administración
│       ├── index.html        # Interfaz principal
│       ├── app.js            # Lógica del frontend
│       └── api.php           # API de administración
└── README.md                 # Este archivo
```

## 🧪 Testing

### Probar endpoints
```bash
# GET request
curl http://tu-dominio/api/users

# POST request
curl -X POST http://tu-dominio/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Usuario", "email": "nuevo@example.com"}'

# Con headers personalizados
curl -H "X-Error: true" http://tu-dominio/api/users
```

### Testing con herramientas
- **Postman**: Importa las URLs y prueba diferentes métodos
- **Insomnia**: Similar a Postman, muy intuitivo
- **cURL**: Desde línea de comandos
- **JavaScript fetch**: Para testing frontend

## 🔒 Seguridad

- **CORS habilitado**: Para desarrollo frontend
- **Validación de entrada**: Todos los datos se validan antes de procesarse
- **Prepared statements**: Previene inyección SQL
- **Headers de seguridad**: XSS protection, content type sniffing, etc.

## 🚨 Troubleshooting

### Error de conexión a la base de datos
- Verifica las credenciales en `config/database.php`
- Asegúrate de que MySQL esté ejecutándose
- Verifica que la base de datos exista

### Las rutas no funcionan
- Verifica que `mod_rewrite` esté habilitado en Apache
- Confirma que el archivo `.htaccess` esté presente
- Verifica los permisos del directorio

### Errores 500
- Revisa los logs de error de PHP
- Verifica que todas las extensiones estén habilitadas
- Confirma que los archivos tengan los permisos correctos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de troubleshooting
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema
4. Incluye información sobre tu entorno (PHP, MySQL, servidor web)

## 🎯 Roadmap

- [ ] Importar/exportar configuraciones
- [ ] Logs de requests
- [ ] Métricas de uso
- [ ] Autenticación para el panel de administración
- [ ] API para gestión programática
- [ ] Soporte para WebSockets
- [ ] Plantillas de respuestas
- [ ] Testing automático de endpoints

---

**¡Disfruta mockeando tus APIs! 🚀**
