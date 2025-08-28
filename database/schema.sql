-- Esquema de base de datos para Mock API Service
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS mock_api_service;
USE mock_api_service;

-- Tabla de environments (entornos)
CREATE TABLE environments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    base_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de rutas
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    environment_id INT NOT NULL,
    path VARCHAR(500) NOT NULL,
    method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_route (environment_id, path, method)
);

-- Tabla de respuestas
CREATE TABLE responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status_code INT NOT NULL DEFAULT 200,
    headers JSON,
    body TEXT,
    delay_ms INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Tabla de reglas para seleccionar respuestas
CREATE TABLE rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    rule_type ENUM('header', 'query', 'body', 'custom') NOT NULL,
    field_name VARCHAR(255),
    operator ENUM('equals', 'contains', 'regex', 'exists', 'not_exists') NOT NULL,
    value TEXT,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo
INSERT INTO environments (name, description, base_url) VALUES 
('Development', 'Entorno de desarrollo', 'http://localhost:8000'),
('Testing', 'Entorno de testing', 'http://localhost:8000'),
('Staging', 'Entorno de staging', 'http://localhost:8000');

-- Insertar rutas de ejemplo
INSERT INTO routes (environment_id, path, method, description) VALUES 
(1, '/api/users', 'GET', 'Obtener lista de usuarios'),
(1, '/api/users', 'POST', 'Crear nuevo usuario'),
(1, '/api/users/{id}', 'GET', 'Obtener usuario por ID'),
(1, '/api/users/{id}', 'PUT', 'Actualizar usuario'),
(1, '/api/users/{id}', 'DELETE', 'Eliminar usuario');

-- Insertar respuestas de ejemplo
INSERT INTO responses (route_id, name, status_code, headers, body, is_default) VALUES 
(1, 'Lista de usuarios exitosa', 200, '{"Content-Type": "application/json"}', '{"users": [{"id": 1, "name": "Juan Pérez", "email": "juan@example.com"}, {"id": 2, "name": "María García", "email": "maria@example.com"}]}', TRUE),
(1, 'Sin usuarios', 200, '{"Content-Type": "application/json"}', '{"users": []}', FALSE),
(1, 'Error del servidor', 500, '{"Content-Type": "application/json"}', '{"error": "Error interno del servidor"}', FALSE),
(2, 'Usuario creado exitosamente', 201, '{"Content-Type": "application/json"}', '{"message": "Usuario creado exitosamente", "id": 3}', TRUE),
(3, 'Usuario encontrado', 200, '{"Content-Type": "application/json"}', '{"id": 1, "name": "Juan Pérez", "email": "juan@example.com"}', TRUE),
(3, 'Usuario no encontrado', 404, '{"Content-Type": "application/json"}', '{"error": "Usuario no encontrado"}', FALSE);

-- Insertar reglas de ejemplo
INSERT INTO rules (response_id, name, rule_type, field_name, operator, value, priority) VALUES 
(2, 'Query parameter empty', 'query', 'search', 'equals', '', 1),
(3, 'Header error', 'header', 'X-Error', 'exists', '', 1),
(6, 'ID no válido', 'query', 'id', 'regex', '^[0-9]+$', 1);
