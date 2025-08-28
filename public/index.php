<?php
/**
 * Mock API Service - Punto de entrada principal
 * Intercepta todas las peticiones HTTP y las redirige al servicio de mocking
 */

// Configurar headers CORS para permitir peticiones desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivos necesarios
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/MockService.php';

try {
    // Obtener información de la petición
    $requestUri = $_SERVER['REQUEST_URI'];
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    
    // Remover query string del URI
    $path = parse_url($requestUri, PHP_URL_PATH);
    
    // Obtener headers de la petición
    $headers = [];
    foreach (getallheaders() as $name => $value) {
        $headers[strtolower($name)] = $value;
    }
    
    // Obtener query parameters
    $queryParams = $_GET;
    
    // Obtener body de la petición
    $body = null;
    if (in_array($requestMethod, ['POST', 'PUT', 'PATCH'])) {
        $body = file_get_contents('php://input');
    }
    
    // Crear instancia del servicio de mocking
    $mockService = new MockService();
    
    // Obtener respuesta mock
    $response = $mockService->getMockResponse($path, $requestMethod, $headers, $queryParams, $body);
    
    // Establecer status code
    http_response_code($response['status_code']);
    
    // Establecer headers de respuesta
    foreach ($response['headers'] as $headerName => $headerValue) {
        header("$headerName: $headerValue");
    }
    
    // Enviar body de respuesta
    echo $response['body'];
    
} catch (Exception $e) {
    // En caso de error, devolver respuesta de error
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ]);
}
