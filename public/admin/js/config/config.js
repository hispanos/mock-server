// Configuración del proyecto Mock API Service
export const CONFIG = {
    // Configuración de la API
    API: {
        BASE_URL: 'api.php',
        ENDPOINTS: {
            ENVIRONMENTS: 'environments',
            ROUTES: 'routes',
            RESPONSES: 'responses',
            RULES: 'rules'
        }
    },
    
    // Configuración de la interfaz
    UI: {
        ANIMATION_DURATION: 300,
        ALERT_DURATION: 5000,
        ACCORDION_MAX_HEIGHT: 1000
    },
    
    // Configuración de estilos
    STYLES: {
        COLORS: {
            PRIMARY: '#007bff',
            SUCCESS: '#28a745',
            WARNING: '#ffc107',
            DANGER: '#dc3545',
            INFO: '#17a2b8',
            SECONDARY: '#6c757d',
            LIGHT: '#f8f9fa',
            DARK: '#343a40'
        },
        SHADOWS: {
            SMALL: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
            MEDIUM: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
            LARGE: '0 1rem 3rem rgba(0, 0, 0, 0.175)'
        }
    },
    
    // Configuración de métodos HTTP
    HTTP_METHODS: {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        PATCH: 'PATCH',
        OPTIONS: 'OPTIONS',
        HEAD: 'HEAD'
    },
    
    // Configuración de tipos de reglas
    RULE_TYPES: {
        HEADER: 'header',
        QUERY: 'query',
        BODY: 'body',
        CUSTOM: 'custom'
    },
    
    // Configuración de operadores
    OPERATORS: {
        EQUALS: 'equals',
        CONTAINS: 'contains',
        REGEX: 'regex',
        EXISTS: 'exists',
        NOT_EXISTS: 'not_exists'
    }
};

// Constantes del sistema
export const CONSTANTS = {
    // Estados
    STATUS: {
        ACTIVE: 1,
        INACTIVE: 0
    },
    
    // Códigos de estado HTTP comunes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    },
    
    // Valores por defecto
    DEFAULTS: {
        DELAY_MS: 0,
        PRIORITY: 0,
        IS_DEFAULT: false
    }
};

// Configuración de desarrollo
export const DEV_CONFIG = {
    DEBUG: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    SHOW_CONSOLE_LOGS: true,
    API_TIMEOUT: 10000
};
