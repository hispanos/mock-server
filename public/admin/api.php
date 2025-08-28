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
            
        case 'export':
            handleExport($method, $db);
            break;
            
        case 'import':
            handleImport($method, $db);
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

function handleExport($method, $db) {
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        return;
    }
    
    $environmentId = $_GET['environment_id'] ?? null;
    $format = $_GET['format'] ?? 'json'; // json, openapi
    
    if (!$environmentId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de environment requerido']);
        return;
    }
    
    try {
        // Obtener el environment
        $environment = $db->fetch("SELECT * FROM environments WHERE id = ?", [$environmentId]);
        if (!$environment) {
            http_response_code(404);
            echo json_encode(['error' => 'Environment no encontrado']);
            return;
        }
        
        // Obtener todas las rutas del environment
        $routes = $db->fetchAll("SELECT * FROM routes WHERE environment_id = ?", [$environmentId]);
        
        if ($format === 'openapi') {
            // Exportar como OpenAPI 3.0
            $openapiSpec = generateOpenAPISpec($environment, $routes, $db);
            
            $filename = 'environment_' . $environment['name'] . '_openapi_' . date('Y-m-d_H-i-s') . '.json';
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . strlen(json_encode($openapiSpec)));
            
            echo json_encode($openapiSpec, JSON_PRETTY_PRINT);
        } else {
            // Exportar como JSON personalizado
            $exportData = [
                'environment' => $environment,
                'routes' => [],
                'metadata' => [
                    'exported_at' => date('Y-m-d H:i:s'),
                    'version' => '1.0',
                    'total_routes' => count($routes)
                ]
            ];
            
            foreach ($routes as $route) {
                // Obtener respuestas de esta ruta
                $responses = $db->fetchAll("SELECT * FROM responses WHERE route_id = ?", [$route['id']]);
                
                $routeData = $route;
                $routeData['responses'] = [];
                
                foreach ($responses as $response) {
                    // Obtener reglas de esta respuesta
                    $rules = $db->fetchAll("SELECT * FROM rules WHERE response_id = ?", [$response['id']]);
                    
                    $responseData = $response;
                    $responseData['rules'] = $rules;
                    $routeData['responses'][] = $responseData;
                }
                
                $exportData['routes'][] = $routeData;
            }
            
            $filename = 'environment_' . $environment['name'] . '_' . date('Y-m-d_H-i-s') . '.json';
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . strlen(json_encode($exportData)));
            
            echo json_encode($exportData, JSON_PRETTY_PRINT);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al exportar: ' . $e->getMessage()]);
    }
}

function generateOpenAPISpec($environment, $routes, $db) {
    $openapi = [
        'openapi' => '3.0.0',
        'info' => [
            'title' => $environment['name'] . ' API',
            'description' => $environment['description'] ?? 'API generada desde Mock API Service',
            'version' => '1.0.0',
            'contact' => [
                'name' => 'Mock API Service',
                'url' => 'https://github.com/mock-api-service'
            ]
        ],
        'servers' => [
            [
                'url' => $environment['base_url'],
                'description' => $environment['name'] . ' Server'
            ]
        ],
        'paths' => [],
        'components' => [
            'schemas' => [],
            'responses' => []
        ]
    ];
    
    foreach ($routes as $route) {
        $path = $route['path'];
        $method = strtolower($route['method']);
        
        // Obtener respuestas de esta ruta
        $responses = $db->fetchAll("SELECT * FROM responses WHERE route_id = ?", [$route['id']]);
        
        $pathItem = [
            'summary' => $route['description'] ?? $route['path'],
            'description' => $route['description'] ?? 'Endpoint para ' . $route['path'],
            'responses' => []
        ];
        
        foreach ($responses as $response) {
            $statusCode = (string)$response['status_code'];
            $responseName = $response['name'];
            
            // Obtener reglas de esta respuesta
            $rules = $db->fetchAll("SELECT * FROM rules WHERE response_id = ?", [$response['id']]);
            
            $responseSpec = [
                'description' => $responseName,
                'content' => [
                    'application/json' => [
                        'example' => json_decode($response['body'], true) ?: $response['body']
                    ]
                ]
            ];
            
            // Agregar headers si existen
            if ($response['headers']) {
                $headers = json_decode($response['headers'], true);
                if ($headers) {
                    $responseSpec['headers'] = [];
                    foreach ($headers as $headerName => $headerValue) {
                        $responseSpec['headers'][$headerName] = [
                            'description' => 'Header ' . $headerName,
                            'example' => $headerValue
                        ];
                    }
                }
            }
            
            // Agregar parámetros basados en las reglas
            if ($rules) {
                $pathItem['parameters'] = [];
                foreach ($rules as $rule) {
                    if ($rule['rule_type'] === 'query') {
                        $pathItem['parameters'][] = [
                            'name' => $rule['field_name'],
                            'in' => 'query',
                            'description' => 'Parámetro: ' . $rule['name'],
                            'required' => false,
                            'schema' => [
                                'type' => 'string'
                            ],
                            'example' => $rule['value']
                        ];
                    } elseif ($rule['rule_type'] === 'header') {
                        $pathItem['parameters'][] = [
                            'name' => $rule['field_name'],
                            'in' => 'header',
                            'description' => 'Header: ' . $rule['name'],
                            'required' => false,
                            'schema' => [
                                'type' => 'string'
                            ],
                            'example' => $rule['value']
                        ];
                    }
                }
            }
            
            $pathItem['responses'][$statusCode] = $responseSpec;
        }
        
        $openapi['paths'][$path][$method] = $pathItem;
    }
    
    return $openapi;
}

function handleImport($method, $db) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        return;
    }
    
    try {
        $format = $_POST['format'] ?? 'json';
        
        if ($format === 'openapi' && isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            // Importar desde OpenAPI
            $fileContent = file_get_contents($_FILES['file']['tmp_name']);
            $importData = json_decode($fileContent, true);
            
            if (!$importData || $importData['openapi'] !== '3.0.0') {
                http_response_code(400);
                echo json_encode(['error' => 'Archivo OpenAPI 3.0 inválido']);
                return;
            }
            
            $importResult = importFromOpenAPI($importData, $db);
        } else {
            // Importar desde JSON personalizado
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $fileContent = file_get_contents($_FILES['file']['tmp_name']);
            } else {
                $fileContent = file_get_contents('php://input');
            }
            
            if (!$fileContent) {
                http_response_code(400);
                echo json_encode(['error' => 'No se proporcionó contenido para importar']);
                return;
            }
            
            $importData = json_decode($fileContent, true);
            if (!$importData || !isset($importData['environment']) || !isset($importData['routes'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Formato de archivo inválido']);
                return;
            }
            
            $importResult = importFromCustomJSON($importData, $db);
        }
        
        echo json_encode($importResult);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al importar: ' . $e->getMessage()]);
    }
}

function importFromOpenAPI($openapiData, $db) {
    // Iniciar transacción
    $db->getConnection()->beginTransaction();
    
    try {
        $serverUrl = $openapiData['servers'][0]['url'] ?? 'http://localhost';
        $apiTitle = $openapiData['info']['title'] ?? 'Imported API';
        $apiDescription = $openapiData['info']['description'] ?? 'API importada desde OpenAPI';
        
        // Crear environment
        $db->query(
            "INSERT INTO environments (name, description, base_url, is_active) VALUES (?, ?, ?, ?)",
            [$apiTitle, $apiDescription, $serverUrl, 1]
        );
        $environmentId = $db->lastInsertId();
        
        $importedCounts = [
            'routes' => 0,
            'responses' => 0,
            'rules' => 0
        ];
        
        // Procesar paths
        foreach ($openapiData['paths'] as $path => $pathItem) {
            foreach ($pathItem as $method => $operation) {
                if (!in_array($method, ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'])) {
                    continue;
                }
                
                // Crear ruta
                $db->query(
                    "INSERT INTO routes (environment_id, path, method, description, is_active) VALUES (?, ?, ?, ?, ?)",
                    [$environmentId, $path, strtoupper($method), $operation['summary'] ?? $operation['description'] ?? $path, 1]
                );
                $routeId = $db->lastInsertId();
                $importedCounts['routes']++;
                
                // Procesar respuestas
                foreach ($operation['responses'] as $statusCode => $response) {
                    $responseName = $response['description'] ?? 'Status ' . $statusCode;
                    $responseBody = '';
                    $responseHeaders = '{}';
                    
                    // Validar y limpiar el status code
                    $statusCode = (int)$statusCode;
                    if ($statusCode < 100 || $statusCode > 599) {
                        $statusCode = 200; // Valor por defecto si es inválido
                    }
                    
                    if (isset($response['content']['application/json']['example'])) {
                        $responseBody = json_encode($response['content']['application/json']['example']);
                    }
                    
                    if (isset($response['headers'])) {
                        $headers = [];
                        foreach ($response['headers'] as $headerName => $headerSpec) {
                            $headers[$headerName] = $headerSpec['example'] ?? '';
                        }
                        $responseHeaders = json_encode($headers);
                    }
                    
                    // Determinar si es la respuesta por defecto (200 o 201 son candidatos)
                    $isDefault = ($statusCode === 200 || $statusCode === 201) ? 1 : 0;
                    
                    // Crear respuesta
                    try {
                        $db->query(
                            "INSERT INTO responses (route_id, name, status_code, headers, body, delay_ms, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            [$routeId, $responseName, $statusCode, $responseHeaders, $responseBody, 0, $isDefault]
                        );
                        $responseId = $db->lastInsertId();
                        $importedCounts['responses']++;
                    } catch (Exception $e) {
                        // Log del error para debugging
                        error_log("Error insertando respuesta: " . $e->getMessage());
                        error_log("Datos: routeId=$routeId, name=$responseName, statusCode=$statusCode, isDefault=$isDefault");
                        throw $e;
                    }
                    
                    // Procesar parámetros como reglas
                    if (isset($operation['parameters'])) {
                        foreach ($operation['parameters'] as $parameter) {
                            $ruleType = $parameter['in'] === 'query' ? 'query' : 'header';
                            $fieldName = $parameter['name'];
                            $operator = 'exists';
                            $value = $parameter['example'] ?? '';
                            
                            $db->query(
                                "INSERT INTO rules (response_id, name, rule_type, field_name, operator, value, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                [$responseId, 'Param: ' . $fieldName, $ruleType, $fieldName, $operator, $value, 0]
                            );
                            $importedCounts['rules']++;
                        }
                    }
                }
            }
        }
        
        // Confirmar transacción
        $db->getConnection()->commit();
        
        return [
            'message' => 'API OpenAPI importada exitosamente',
            'environment_id' => $environmentId,
            'imported' => $importedCounts
        ];
        
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $db->getConnection()->rollBack();
        throw $e;
    }
}

function importFromCustomJSON($importData, $db) {
    // Iniciar transacción
    $db->getConnection()->beginTransaction();
    
    try {
        // Crear o actualizar el environment
        $envData = $importData['environment'];
        $existingEnv = $db->fetch("SELECT id FROM environments WHERE name = ?", [$envData['name']]);
        
        if ($existingEnv) {
            // Actualizar environment existente
            $db->query(
                "UPDATE environments SET description = ?, base_url = ?, is_active = ? WHERE id = ?",
                [$envData['description'], $envData['base_url'], $envData['is_active'], $existingEnv['id']]
            );
            $environmentId = $existingEnv['id'];
        } else {
            // Crear nuevo environment
            $db->query(
                "INSERT INTO environments (name, description, base_url, is_active) VALUES (?, ?, ?, ?)",
                [$envData['name'], $envData['description'], $envData['base_url'], $envData['is_active']]
            );
            $environmentId = $db->lastInsertId();
        }
        
        // Eliminar rutas existentes del environment (si se está actualizando)
        if ($existingEnv) {
            $db->query("DELETE FROM routes WHERE environment_id = ?", [$environmentId]);
        }
        
        $importedCounts = [
            'routes' => 0,
            'responses' => 0,
            'rules' => 0
        ];
        
        // Importar rutas
        foreach ($importData['routes'] as $routeData) {
            $db->query(
                "INSERT INTO routes (environment_id, path, method, description, is_active) VALUES (?, ?, ?, ?, ?)",
                [$environmentId, $routeData['path'], $routeData['method'], $routeData['description'], $routeData['is_active']]
            );
            $routeId = $db->lastInsertId();
            $importedCounts['routes']++;
            
            // Importar respuestas
            if (isset($routeData['responses'])) {
                foreach ($routeData['responses'] as $responseData) {
                    $db->query(
                        "INSERT INTO responses (route_id, name, status_code, headers, body, delay_ms, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [
                            $routeId,
                            $responseData['name'],
                            $responseData['status_code'],
                            $responseData['headers'],
                            $responseData['body'],
                            $responseData['delay_ms'] ?? 0,
                            $responseData['is_default'] ?? false
                        ]
                    );
                    $responseId = $db->lastInsertId();
                    $importedCounts['responses']++;
                    
                    // Importar reglas
                    if (isset($responseData['rules'])) {
                        foreach ($responseData['rules'] as $ruleData) {
                            $db->query(
                                "INSERT INTO rules (response_id, name, rule_type, field_name, operator, value, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                [
                                    $responseId,
                                    $ruleData['name'],
                                    $ruleData['rule_type'],
                                    $ruleData['field_name'],
                                    $ruleData['operator'],
                                    $ruleData['value'],
                                    $ruleData['priority'] ?? 0
                                ]
                            );
                            $importedCounts['rules']++;
                        }
                    }
                }
            }
        }
        
        // Confirmar transacción
        $db->getConnection()->commit();
        
        return [
            'message' => 'Environment importado exitosamente',
            'environment_id' => $environmentId,
            'imported' => $importedCounts
        ];
        
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $db->getConnection()->rollBack();
        throw $e;
    }
}
