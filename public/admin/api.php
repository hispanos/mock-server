<?php
/**
 * API de administración para gestionar los mocks
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../src/Database.php';

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Obtener el endpoint de la URL
$endpoint = end($pathParts);

try {
    switch ($endpoint) {
        case 'environments':
            handleEnvironments($method, $db);
            break;
            
        case 'routes':
            handleRoutes($method, $db);
            break;
            
        case 'responses':
            handleResponses($method, $db);
            break;
            
        case 'rules':
            handleRules($method, $db);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint no encontrado']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleEnvironments($method, $db) {
    switch ($method) {
        case 'GET':
            $environments = $db->fetchAll("SELECT * FROM environments ORDER BY name");
            echo json_encode($environments);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->query(
                "INSERT INTO environments (name, description, base_url) VALUES (?, ?, ?)",
                [$data['name'], $data['description'], $data['base_url']]
            );
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Environment creado exitosamente']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $db->query(
                "UPDATE environments SET name = ?, description = ?, base_url = ?, is_active = ? WHERE id = ?",
                [$data['name'], $data['description'], $data['base_url'], $data['is_active'], $data['id']]
            );
            echo json_encode(['message' => 'Environment actualizado exitosamente']);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $db->query("DELETE FROM environments WHERE id = ?", [$id]);
                echo json_encode(['message' => 'Environment eliminado exitosamente']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
            }
            break;
    }
}

function handleRoutes($method, $db) {
    switch ($method) {
        case 'GET':
            $environmentId = $_GET['environment_id'] ?? null;
            if ($environmentId) {
                $routes = $db->fetchAll(
                    "SELECT * FROM routes WHERE environment_id = ? ORDER BY path, method",
                    [$environmentId]
                );
            } else {
                $routes = $db->fetchAll("SELECT * FROM routes ORDER BY environment_id, path, method");
            }
            echo json_encode($routes);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->query(
                "INSERT INTO routes (environment_id, path, method, description) VALUES (?, ?, ?, ?)",
                [$data['environment_id'], $data['path'], $data['method'], $data['description']]
            );
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Ruta creada exitosamente']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $db->query(
                "UPDATE routes SET path = ?, method = ?, description = ?, is_active = ? WHERE id = ?",
                [$data['path'], $data['method'], $data['description'], $data['is_active'], $data['id']]
            );
            echo json_encode(['message' => 'Ruta actualizada exitosamente']);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $db->query("DELETE FROM routes WHERE id = ?", [$id]);
                echo json_encode(['message' => 'Ruta eliminada exitosamente']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
            }
            break;
    }
}

function handleResponses($method, $db) {
    switch ($method) {
        case 'GET':
            $routeId = $_GET['route_id'] ?? null;
            if ($routeId) {
                $responses = $db->fetchAll(
                    "SELECT * FROM responses WHERE route_id = ? ORDER BY is_default DESC, name",
                    [$routeId]
                );
            } else {
                $responses = $db->fetchAll("SELECT * FROM responses ORDER BY route_id, is_default DESC, name");
            }
            echo json_encode($responses);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Si esta respuesta será por defecto, desactivar las otras
            if ($data['is_default']) {
                $db->query(
                    "UPDATE responses SET is_default = 0 WHERE route_id = ?",
                    [$data['route_id']]
                );
            }
            
            $stmt = $db->query(
                "INSERT INTO responses (route_id, name, status_code, headers, body, delay_ms, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $data['route_id'],
                    $data['name'],
                    $data['status_code'],
                    json_encode($data['headers']),
                    $data['body'],
                    $data['delay_ms'] ?? 0,
                    $data['is_default'] ?? false
                ]
            );
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Respuesta creada exitosamente']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Si esta respuesta será por defecto, desactivar las otras
            if ($data['is_default']) {
                $db->query(
                    "UPDATE responses SET is_default = 0 WHERE route_id = ? AND id != ?",
                    [$data['route_id'], $data['id']]
                );
            }
            
            $db->query(
                "UPDATE responses SET name = ?, status_code = ?, headers = ?, body = ?, delay_ms = ?, is_default = ? WHERE id = ?",
                [
                    $data['name'],
                    $data['status_code'],
                    json_encode($data['headers']),
                    $data['body'],
                    $data['delay_ms'] ?? 0,
                    $data['is_default'] ?? false,
                    $data['id']
                ]
            );
            echo json_encode(['message' => 'Respuesta actualizada exitosamente']);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $db->query("DELETE FROM responses WHERE id = ?", [$id]);
                echo json_encode(['message' => 'Respuesta eliminada exitosamente']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
            }
            break;
    }
}

function handleRules($method, $db) {
    switch ($method) {
        case 'GET':
            $responseId = $_GET['response_id'] ?? null;
            if ($responseId) {
                $rules = $db->fetchAll(
                    "SELECT * FROM rules WHERE response_id = ? ORDER BY priority DESC, name",
                    [$responseId]
                );
            } else {
                $rules = $db->fetchAll("SELECT * FROM rules ORDER BY response_id, priority DESC, name");
            }
            echo json_encode($rules);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->query(
                "INSERT INTO rules (response_id, name, rule_type, field_name, operator, value, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $data['response_id'],
                    $data['name'],
                    $data['rule_type'],
                    $data['field_name'],
                    $data['operator'],
                    $data['value'],
                    $data['priority'] ?? 0
                ]
            );
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Regla creada exitosamente']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $db->query(
                "UPDATE rules SET name = ?, rule_type = ?, field_name = ?, operator = ?, value = ?, priority = ? WHERE id = ?",
                [
                    $data['name'],
                    $data['rule_type'],
                    $data['field_name'],
                    $data['operator'],
                    $data['value'],
                    $data['priority'] ?? 0,
                    $data['id']
                ]
            );
            echo json_encode(['message' => 'Regla actualizada exitosamente']);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $db->query("DELETE FROM rules WHERE id = ?", [$id]);
                echo json_encode(['message' => 'Regla eliminada exitosamente']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
            }
            break;
    }
}
