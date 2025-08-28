<?php

class MockService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Obtiene la respuesta mock para una ruta y método específicos
     */
    public function getMockResponse($path, $method, $headers = [], $queryParams = [], $body = null)
    {
        // Buscar la ruta en todos los environments activos
        $route = $this->findRoute($path, $method);
        
        if (!$route) {
            return $this->getDefault404Response();
        }

        // Obtener todas las respuestas para esta ruta
        $responses = $this->getResponsesForRoute($route['id']);
        
        if (empty($responses)) {
            return $this->getDefault500Response();
        }

        // Aplicar reglas para seleccionar la respuesta apropiada
        $selectedResponse = $this->selectResponseByRules($responses, $headers, $queryParams, $body);
        
        if (!$selectedResponse) {
            // Si no hay reglas que coincidan, usar la respuesta por defecto
            $selectedResponse = $this->getDefaultResponse($responses);
        }

        // Aplicar delay si está configurado
        if ($selectedResponse['delay_ms'] > 0) {
            usleep($selectedResponse['delay_ms'] * 1000);
        }

        return [
            'status_code' => $selectedResponse['status_code'],
            'headers' => json_decode($selectedResponse['headers'], true) ?: [],
            'body' => $selectedResponse['body']
        ];
    }

    /**
     * Busca una ruta que coincida con el path y método
     */
    private function findRoute($path, $method)
    {
        // Primero buscar coincidencias exactas
        $route = $this->db->fetch(
            "SELECT r.*, e.base_url FROM routes r 
             JOIN environments e ON r.environment_id = e.id 
             WHERE r.path = ? AND r.method = ? AND r.is_active = 1 AND e.is_active = 1",
            [$path, $method]
        );

        if ($route) {
            return $route;
        }

        // Si no hay coincidencia exacta, buscar con parámetros dinámicos
        $routes = $this->db->fetchAll(
            "SELECT r.*, e.base_url FROM routes r 
             JOIN environments e ON r.environment_id = e.id 
             WHERE r.method = ? AND r.is_active = 1 AND e.is_active = 1",
            [$method]
        );

        foreach ($routes as $route) {
            if ($this->matchDynamicRoute($route['path'], $path)) {
                return $route;
            }
        }

        return null;
    }

    /**
     * Verifica si una ruta dinámica coincide con el path solicitado
     */
    private function matchDynamicRoute($routePath, $requestPath)
    {
        // Convertir la ruta de la base de datos a un patrón regex
        $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';
        
        return preg_match($pattern, $requestPath);
    }

    /**
     * Obtiene todas las respuestas para una ruta específica
     */
    private function getResponsesForRoute($routeId)
    {
        return $this->db->fetchAll(
            "SELECT * FROM responses WHERE route_id = ? ORDER BY is_default DESC, priority DESC, name",
            [$routeId]
        );
    }

    /**
     * Selecciona la respuesta basada en las reglas aplicadas
     */
    private function selectResponseByRules($responses, $headers, $queryParams, $body)
    {
        foreach ($responses as $response) {
            $rules = $this->getRulesForResponse($response['id']);
            
            if (empty($rules)) {
                continue;
            }

            $allRulesMatch = true;
            foreach ($rules as $rule) {
                if (!$this->evaluateRule($rule, $headers, $queryParams, $body)) {
                    $allRulesMatch = false;
                    break;
                }
            }

            if ($allRulesMatch) {
                return $response;
            }
        }

        return null;
    }

    /**
     * Obtiene las reglas para una respuesta específica
     */
    private function getRulesForResponse($responseId)
    {
        return $this->db->fetchAll(
            "SELECT * FROM rules WHERE response_id = ? ORDER BY priority DESC",
            [$responseId]
        );
    }

    /**
     * Evalúa si una regla se cumple
     */
    private function evaluateRule($rule, $headers, $queryParams, $body)
    {
        switch ($rule['rule_type']) {
            case 'header':
                return $this->evaluateHeaderRule($rule, $headers);
            
            case 'query':
                return $this->evaluateQueryRule($rule, $queryParams);
            
            case 'body':
                return $this->evaluateBodyRule($rule, $body);
            
            case 'custom':
                return $this->evaluateCustomRule($rule, $headers, $queryParams, $body);
            
            default:
                return false;
        }
    }

    /**
     * Evalúa reglas de headers
     */
    private function evaluateHeaderRule($rule, $headers)
    {
        $headerValue = $headers[$rule['field_name']] ?? null;
        
        switch ($rule['operator']) {
            case 'exists':
                return $headerValue !== null;
            
            case 'not_exists':
                return $headerValue === null;
            
            case 'equals':
                return $headerValue === $rule['value'];
            
            case 'contains':
                return strpos($headerValue, $rule['value']) !== false;
            
            case 'regex':
                return preg_match($rule['value'], $headerValue);
            
            default:
                return false;
        }
    }

    /**
     * Evalúa reglas de query parameters
     */
    private function evaluateQueryRule($rule, $queryParams)
    {
        $paramValue = $queryParams[$rule['field_name']] ?? null;
        
        switch ($rule['operator']) {
            case 'exists':
                return $paramValue !== null;
            
            case 'not_exists':
                return $paramValue === null;
            
            case 'equals':
                return $paramValue === $rule['value'];
            
            case 'contains':
                return strpos($paramValue, $rule['value']) !== false;
            
            case 'regex':
                return preg_match($rule['value'], $paramValue);
            
            default:
                return false;
        }
    }

    /**
     * Evalúa reglas del body
     */
    private function evaluateBodyRule($rule, $body)
    {
        if (empty($body)) {
            return $rule['operator'] === 'not_exists';
        }

        $bodyData = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $bodyData = $body;
        }

        if (is_array($bodyData) && isset($rule['field_name'])) {
            $fieldValue = $bodyData[$rule['field_name']] ?? null;
        } else {
            $fieldValue = $body;
        }

        switch ($rule['operator']) {
            case 'exists':
                return $fieldValue !== null;
            
            case 'not_exists':
                return $fieldValue === null;
            
            case 'equals':
                return $fieldValue === $rule['value'];
            
            case 'contains':
                return strpos($fieldValue, $rule['value']) !== false;
            
            case 'regex':
                return preg_match($rule['value'], $fieldValue);
            
            default:
                return false;
        }
    }

    /**
     * Evalúa reglas personalizadas
     */
    private function evaluateCustomRule($rule, $headers, $queryParams, $body)
    {
        // Aquí se pueden implementar reglas más complejas
        // Por ahora, siempre retorna false
        return false;
    }

    /**
     * Obtiene la respuesta por defecto
     */
    private function getDefaultResponse($responses)
    {
        foreach ($responses as $response) {
            if ($response['is_default']) {
                return $response;
            }
        }
        
        // Si no hay respuesta por defecto, usar la primera
        return $responses[0];
    }

    /**
     * Respuesta por defecto para rutas no encontradas
     */
    private function getDefault404Response()
    {
        return [
            'status_code' => 404,
            'headers' => ['Content-Type' => 'application/json'],
            'body' => json_encode(['error' => 'Ruta no encontrada'])
        ];
    }

    /**
     * Respuesta por defecto para errores del servidor
     */
    private function getDefault500Response()
    {
        return [
            'status_code' => 500,
            'headers' => ['Content-Type' => 'application/json'],
            'body' => json_encode(['error' => 'Error interno del servidor'])
        ];
    }
}
