# Funcionalidad de Importación y Exportación

## Descripción General

El sistema de Mock API Service ahora incluye funcionalidades completas de importación y exportación de environments, permitiendo:

- **Exportar** environments completos con todas sus rutas, respuestas y reglas
- **Importar** environments desde archivos JSON personalizados
- **Importar** especificaciones OpenAPI 3.0 y convertirlas en environments
- **Compatibilidad** total con el estándar OpenAPI 3.0

## Características Principales

### 🚀 **Exportación**
- **Formato JSON personalizado**: Incluye toda la configuración del environment
- **Formato OpenAPI 3.0**: Especificación estándar compatible con herramientas externas
- **Descarga automática**: Los archivos se descargan automáticamente al navegador
- **Nombres descriptivos**: Los archivos incluyen timestamp y nombre del environment

### 📥 **Importación**
- **JSON personalizado**: Restaura environments completos exportados previamente
- **OpenAPI 3.0**: Convierte especificaciones estándar en environments funcionales
- **Actualización inteligente**: Si el environment existe, se actualiza en lugar de duplicar
- **Transacciones seguras**: Todas las operaciones son atómicas (todo o nada)

### 🔄 **Compatibilidad OpenAPI 3.0**
- **Paths**: Se convierten en rutas del environment
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- **Parameters**: Query, headers y path parameters se convierten en reglas
- **Responses**: Cada código de estado se convierte en una respuesta
- **Examples**: Los ejemplos de respuesta se usan como body de las respuestas

## Uso de la Funcionalidad

### Exportar un Environment

1. **Desde la lista de environments:**
   - Haz clic en el botón "Exportar" en cualquier tarjeta de environment
   - Selecciona el formato de exportación (JSON o OpenAPI 3.0)
   - Confirma la exportación
   - El archivo se descargará automáticamente

2. **Formato de archivo exportado:**
   - **JSON personalizado**: `environment_Nombre_YYYY-MM-DD_HH-MM-SS.json`
   - **OpenAPI 3.0**: `environment_Nombre_openapi_YYYY-MM-DD_HH-MM-SS.json`

### Importar un Environment

1. **Desde archivo JSON personalizado:**
   - Haz clic en "Importar" en la barra de herramientas
   - Selecciona "Desde archivo JSON personalizado"
   - Elige el archivo JSON exportado previamente
   - Haz clic en "Importar JSON"

2. **Desde archivo OpenAPI 3.0:**
   - Haz clic en "Importar" en la barra de herramientas
   - Selecciona "Desde archivo OpenAPI 3.0"
   - Elige el archivo OpenAPI (JSON, YAML, YML)
   - Haz clic en "Importar OpenAPI"

## Estructura de Datos

### Formato JSON Personalizado

```json
{
  "environment": {
    "id": 1,
    "name": "Development",
    "description": "Entorno de desarrollo",
    "base_url": "http://localhost:8000",
    "is_active": true
  },
  "routes": [
    {
      "id": 1,
      "path": "/api/users",
      "method": "GET",
      "description": "Obtener lista de usuarios",
      "is_active": true,
      "responses": [
        {
          "id": 1,
          "name": "Lista exitosa",
          "status_code": 200,
          "headers": "{\"Content-Type\": \"application/json\"}",
          "body": "{\"users\": []}",
          "delay_ms": 0,
          "is_default": true,
          "rules": [
            {
              "id": 1,
              "name": "Query parameter",
              "rule_type": "query",
              "field_name": "limit",
              "operator": "exists",
              "value": "10",
              "priority": 0
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "exported_at": "2024-01-15 10:30:00",
    "version": "1.0",
    "total_routes": 1
  }
}
```

### Formato OpenAPI 3.0

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "API de Usuarios",
    "description": "API de ejemplo",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:8000",
      "description": "Servidor de desarrollo"
    }
  ],
  "paths": {
    "/api/users": {
      "get": {
        "summary": "Obtener lista de usuarios",
        "responses": {
          "200": {
            "description": "Lista exitosa",
            "content": {
              "application/json": {
                "example": {
                  "users": []
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Casos de Uso

### 🔄 **Migración entre Entornos**
- Exporta un environment de desarrollo
- Importa en el entorno de staging o producción
- Mantén consistencia entre diferentes entornos

### 📚 **Compartir Configuraciones**
- Exporta environments como plantillas
- Comparte con otros desarrolladores
- Mantén estándares de API en el equipo

### 🛠️ **Integración con Herramientas Externas**
- Importa especificaciones desde Swagger/OpenAPI
- Usa con Postman, Insomnia, etc.
- Compatible con generadores de código

### 📋 **Backup y Restauración**
- Haz backup de configuraciones importantes
- Restaura en caso de pérdida de datos
- Versiona tus configuraciones de API

## Limitaciones y Consideraciones

### ⚠️ **Limitaciones Actuales**
- Solo soporta archivos JSON (no YAML directamente)
- Los parámetros de body en OpenAPI no se procesan completamente
- Las reglas complejas pueden requerir ajuste manual

### 🔧 **Recomendaciones**
- **Para OpenAPI**: Usa archivos JSON para mejor compatibilidad
- **Para reglas complejas**: Revisa y ajusta las reglas importadas
- **Para producción**: Valida siempre las configuraciones importadas

### 🚨 **Consideraciones de Seguridad**
- Solo importa archivos de fuentes confiables
- Revisa el contenido antes de importar
- Las importaciones pueden sobrescribir datos existentes

## Troubleshooting

### ❌ **Error: "Archivo OpenAPI 3.0 inválido"**
- Verifica que el archivo tenga la estructura correcta
- Asegúrate de que `openapi` sea "3.0.0"
- Valida la sintaxis JSON del archivo

### ❌ **Error: "Formato de archivo inválido"**
- Verifica que el JSON personalizado tenga la estructura correcta
- Asegúrate de que incluya `environment` y `routes`
- Revisa que no haya errores de sintaxis

### ❌ **Error: "Error al importar"**
- Verifica que la base de datos esté funcionando
- Revisa los logs del servidor para más detalles
- Asegúrate de que el archivo no esté corrupto

### ✅ **Solución: Verificar archivo de ejemplo**
- Usa el archivo `examples/openapi-example.json` como referencia
- Compara la estructura con tu archivo
- Asegúrate de que siga el estándar OpenAPI 3.0

## Archivos de Ejemplo

- **`examples/openapi-example.json`**: Especificación OpenAPI 3.0 completa
- **Exporta un environment existente**: Para ver el formato JSON personalizado

## Soporte Técnico

Si encuentras problemas con la importación o exportación:

1. Verifica que el archivo tenga el formato correcto
2. Revisa la consola del navegador para errores
3. Consulta los logs del servidor
4. Usa los archivos de ejemplo como referencia

---

**Nota**: Esta funcionalidad está diseñada para ser robusta y segura, pero siempre es recomendable hacer backup de tus configuraciones antes de realizar importaciones masivas.
