# Mock API Service

Una aplicación completa para crear y gestionar servicios de API REST mock con PHP y MySQL. Permite crear entornos, rutas, respuestas múltiples y reglas condicionales de manera intuitiva.

## 🚀 Características

- **Entornos**: Organiza tus mocks por diferentes entornos (desarrollo, staging, producción)
- **Rutas**: Define endpoints con métodos HTTP específicos
- **Respuestas Múltiples**: Asocia diferentes respuestas a cada ruta con códigos de estado HTTP
- **Reglas Condicionales**: Configura respuestas basadas en headers, parámetros de query o body
- **Interfaz Intuitiva**: Panel de administración web fácil de usar
- **Base de Datos**: Almacenamiento persistente en MySQL
- **CORS**: Soporte completo para Cross-Origin Resource Sharing
- **URLs Dinámicas**: Soporte para parámetros en URLs (ej: `/api/users/{id}`)
- **Delays Configurables**: Simula latencia de red configurable

## 🏗️ Arquitectura

### Backend
- **PHP**: Lógica de negocio y API REST
- **MySQL**: Base de datos para almacenar configuración
- **PDO**: Conexión segura a base de datos
- **Apache**: Servidor web con rewrite rules

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript ES6**: Módulos ES6 para mejor organización
- **Bootstrap 5**: Framework CSS para UI consistente

## 📁 Estructura del Proyecto

```
mock/
├── database/
│   ├── schema.sql                 # Esquema de base de datos
│   └── migration_add_priority_to_responses.sql
├── public/
│   ├── .htaccess                  # Rewrite rules para Apache
│   ├── api.php                    # Punto de entrada de la API
│   └── admin/                     # Panel de administración
│       ├── index.html             # Interfaz principal
│       ├── css/
│       │   └── styles.css         # Estilos centralizados
│       └── js/
│           ├── app.js             # Punto de entrada JavaScript
│           ├── config/
│           │   └── config.js      # Configuración centralizada
│           └── modules/           # Módulos ES6
│               ├── environment-manager.js
│               ├── route-manager.js
│               ├── response-manager.js
│               ├── rule-manager.js
│               ├── ui-manager.js
│               └── alert-manager.js
├── src/
│   ├── Database.php               # Clase singleton para conexión DB
│   ├── MockService.php            # Lógica principal del servicio mock
│   └── AdminAPI.php               # API para el panel de administración
└── README.md                      # Este archivo
```

## 🛠️ Instalación

### Requisitos
- PHP 7.4 o superior
- MySQL 5.7 o superior
- Apache con mod_rewrite habilitado
- Extensión PHP PDO MySQL

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd mock
   ```

2. **Configura la base de datos**
   ```bash
   # Crea la base de datos
   mysql -u root -p
   CREATE DATABASE mock_api_service;
   USE mock_api_service;
   
   # Importa el esquema
   source database/schema.sql;
   ```

3. **Configura la conexión a la base de datos**
   Edita `src/Database.php` con tus credenciales:
   ```php
   private $host = 'localhost';
   private $dbname = 'mock_api_service';
   private $username = 'tu_usuario';
   private $password = 'tu_password';
   ```

4. **Configura el servidor web**
   - Asegúrate de que el directorio `public/` sea el document root
   - Verifica que mod_rewrite esté habilitado
   - El archivo `.htaccess` ya está configurado para redirigir todas las peticiones a `api.php`

## 🎯 Uso

### 1. Acceder al Panel de Administración
Navega a `http://tu-dominio/admin/` para acceder al panel de administración.

### 2. Crear un Entorno
- Haz clic en "Nuevo Environment"
- Define un nombre y descripción
- Guarda el entorno

### 3. Crear Rutas
- Selecciona "Rutas" en el menú
- Haz clic en "Nueva Ruta"
- Define:
  - Método HTTP (GET, POST, PUT, DELETE, etc.)
  - URL del endpoint
  - Entorno al que pertenece
  - Descripción

### 4. Configurar Respuestas
- Dentro de cada ruta, expande la sección "Respuestas"
- Haz clic en "Nueva Respuesta"
- Define:
  - Nombre de la respuesta
  - Código de estado HTTP
  - Headers (en formato JSON)
  - Body de la respuesta
  - Delay en milisegundos
  - Si es respuesta por defecto

### 5. Configurar Reglas (Opcional)
- Dentro de cada respuesta, expande la sección "Reglas"
- Define condiciones basadas en:
  - Headers de la petición
  - Parámetros de query
  - Body de la petición
- Las reglas determinan qué respuesta se devuelve

### 6. Probar el Mock
Una vez configurado, puedes hacer peticiones a tu endpoint:
```bash
curl http://tu-dominio/api/users
```

## 🔧 Configuración

### Variables CSS
El archivo `public/admin/css/styles.css` contiene variables CSS para personalización:
```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
}
```

### Configuración JavaScript
El archivo `public/admin/js/config/config.js` centraliza la configuración:
- URLs de la API
- Duración de animaciones
- Configuración de alertas
- Métodos HTTP soportados
- Tipos de reglas disponibles

## 📊 Base de Datos

### Tablas Principales

#### `environments`
- Almacena entornos (desarrollo, staging, producción)

#### `routes`
- Define las rutas de la API con métodos HTTP

#### `responses`
- Respuestas asociadas a cada ruta
- Incluye código de estado, headers, body y delay
- Campo `priority` para ordenar respuestas

#### `rules`
- Reglas condicionales para seleccionar respuestas
- Soporta condiciones en headers, query y body

## 🚀 API Endpoints

### Mock Service
- `GET/POST/PUT/DELETE /api/*` - Endpoints mock configurados

### Admin API
- `POST /api.php` - Endpoint para operaciones CRUD del panel de administración

## 🔒 Seguridad

- **Validación de entrada**: Todos los datos de entrada son validados
- **Prepared Statements**: Uso de PDO para prevenir SQL injection
- **CORS configurable**: Headers CORS personalizables por entorno

## 🧪 Testing

Para probar que todo funciona correctamente:

1. **Verifica la base de datos**
   ```bash
   mysql -u root -p mock_api_service -e "SHOW TABLES;"
   ```

2. **Prueba el panel de administración**
   - Navega a `/admin/`
   - Crea un entorno de prueba
   - Crea una ruta simple
   - Configura una respuesta

3. **Prueba el endpoint mock**
   ```bash
   curl http://tu-dominio/api/test
   ```

## 🐛 Troubleshooting

### Error: "Unknown column 'priority'"
Si encuentras este error, ejecuta la migración:
```sql
source database/migration_add_priority_to_responses.sql;
```

### Problemas de CORS
Verifica que los headers CORS estén configurados correctamente en las respuestas.

### Errores de base de datos
- Verifica las credenciales en `src/Database.php`
- Asegúrate de que la base de datos existe
- Verifica que el usuario tenga permisos suficientes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔄 Changelog

### v1.0.0
- Implementación inicial del servicio mock
- Panel de administración web
- Soporte para entornos, rutas, respuestas y reglas
- Arquitectura modular JavaScript ES6
- Estructura de base de datos completa
- Soporte para CORS y URLs dinámicas
