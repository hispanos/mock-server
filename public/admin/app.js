// Mock API Service - JavaScript Application
let currentSection = 'environments';
let environments = [];
let routes = [];
let responses = [];
let rules = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadEnvironments();
    setupEventListeners();
});

function setupEventListeners() {
    // Botón agregar
    document.getElementById('add-btn').addEventListener('click', function() {
        showAddModal();
    });

    // Filtro de environment
    document.getElementById('environment-filter').addEventListener('change', function() {
        loadRoutesWithNestedData();
    });
}

// Navegación entre secciones
function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(el => el.style.display = 'none');
    
    // Mostrar la sección seleccionada
    document.getElementById(section + '-section').style.display = 'block';
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    
    // Actualizar título y botón
    currentSection = section;
    updateSectionHeader();
    
    // Cargar datos según la sección
    switch(section) {
        case 'environments':
            loadEnvironments();
            break;
        case 'routes':
            loadRoutesWithNestedData();
            break;
    }
}

function updateSectionHeader() {
    const titles = {
        'environments': 'Environments',
        'routes': 'Rutas'
    };
    
    document.getElementById('section-title').textContent = titles[currentSection];
    document.getElementById('add-btn').innerHTML = '<i class="fas fa-plus me-2"></i>Agregar';
}

// Funciones para Environments
async function loadEnvironments() {
    try {
        const response = await fetch('api.php/environments');
        environments = await response.json();
        renderEnvironments();
        updateEnvironmentFilters();
    } catch (error) {
        console.error('Error cargando environments:', error);
        showAlert('Error cargando environments', 'danger');
    }
}

function renderEnvironments() {
    const container = document.getElementById('environments-list');
    container.innerHTML = '';
    
    environments.forEach(env => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-3';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${env.name}</h5>
                        <span class="badge ${env.is_active ? 'bg-success' : 'bg-secondary'}">
                            ${env.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    <p class="card-text text-muted">${env.description || 'Sin descripción'}</p>
                    <p class="card-text"><small class="text-muted">${env.base_url}</small></p>
                    <div class="btn-group w-100">
                        <button class="btn btn-outline-primary btn-sm" onclick="editEnvironment(${env.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteEnvironment(${env.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function showAddModal() {
    switch(currentSection) {
        case 'environments':
            showEnvironmentModal();
            break;
        case 'routes':
            showRouteModal();
            break;
    }
}

function showEnvironmentModal(environment = null) {
    const modal = new bootstrap.Modal(document.getElementById('environmentModal'));
    const form = document.getElementById('environmentForm');
    
    if (environment) {
        document.getElementById('environmentModalTitle').textContent = 'Editar Environment';
        document.getElementById('environment-id').value = environment.id;
        document.getElementById('environment-name').value = environment.name;
        document.getElementById('environment-description').value = environment.description || '';
        document.getElementById('environment-base-url').value = environment.base_url;
        document.getElementById('environment-active').checked = environment.is_active == 1;
    } else {
        document.getElementById('environmentModalTitle').textContent = 'Nuevo Environment';
        form.reset();
        document.getElementById('environment-id').value = '';
    }
    
    modal.show();
}

async function saveEnvironment() {
    const form = document.getElementById('environmentForm');
    const formData = {
        name: document.getElementById('environment-name').value,
        description: document.getElementById('environment-description').value,
        base_url: document.getElementById('environment-base-url').value,
        is_active: document.getElementById('environment-active').checked ? 1 : 0
    };
    
    const id = document.getElementById('environment-id').value;
    const method = id ? 'PUT' : 'POST';
    
    if (id) {
        formData.id = id;
    }
    
    try {
        const response = await fetch('api.php/environments', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('environmentModal')).hide();
            showAlert('Environment guardado exitosamente', 'success');
            loadEnvironments();
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar environment', 'danger');
    }
}

async function editEnvironment(id) {
    const environment = environments.find(env => env.id == id);
    if (environment) {
        showEnvironmentModal(environment);
    }
}

async function deleteEnvironment(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este environment?')) {
        try {
            const response = await fetch(`api.php/environments?id=${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showAlert('Environment eliminado exitosamente', 'success');
                loadEnvironments();
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al eliminar environment', 'danger');
        }
    }
}

// Funciones para Routes
async function loadRoutesWithNestedData() {
    try {
        const environmentId = document.getElementById('environment-filter').value;
        const url = environmentId ? `api.php/routes?environment_id=${environmentId}` : 'api.php/routes';
        const response = await fetch(url);
        routes = await response.json();
        
        // Cargar respuestas para cada ruta
        for (let route of routes) {
            try {
                const responsesResponse = await fetch(`api.php/responses?route_id=${route.id}`);
                route.responses = await responsesResponse.json();
                
                // Cargar reglas para cada respuesta
                for (let response of route.responses) {
                    try {
                        const rulesResponse = await fetch(`api.php/rules?response_id=${response.id}`);
                        response.rules = await rulesResponse.json();
                    } catch (error) {
                        console.error('Error cargando reglas para respuesta:', response.id, error);
                        response.rules = [];
                    }
                }
            } catch (error) {
                console.error('Error cargando respuestas para ruta:', route.id, error);
                route.responses = [];
            }
        }
        
        renderRoutesWithNestedData();
    } catch (error) {
        console.error('Error cargando rutas:', error);
        showAlert('Error cargando rutas', 'danger');
    }
}

function renderRoutesWithNestedData() {
    const container = document.getElementById('routes-container');
    container.innerHTML = '';
    
    routes.forEach(route => {
        const env = environments.find(e => e.id == route.environment_id);
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        
        routeCard.innerHTML = `
            <div class="route-header">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <h6 class="mb-1"><code>${route.path}</code></h6>
                        <span class="badge method-badge method-${route.method.toLowerCase()}">${route.method}</span>
                    </div>
                    <div class="col-md-3">
                        <strong>Environment:</strong> ${env ? env.name : 'N/A'}
                    </div>
                    <div class="col-md-3">
                        <strong>Estado:</strong> 
                        <span class="badge ${route.is_active ? 'bg-success' : 'bg-secondary'}">
                            ${route.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                    <div class="col-md-3 text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="editRoute(${route.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteRoute(${route.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
                ${route.description ? `<p class="text-muted mb-0 mt-2">${route.description}</p>` : ''}
            </div>
            
                         <div class="responses-container">
                 <div class="d-flex justify-content-between align-items-center mb-3">
                                           <div class="d-flex align-items-center accordion-toggle collapsed" onclick="toggleResponses(${route.id})">
                          <i class="fas fa-chevron-down me-2"></i>
                         <h6 class="mb-0">
                             <i class="fas fa-reply me-2"></i>Respuestas (${route.responses.length})
                         </h6>
                     </div>
                     <button class="btn btn-sm btn-primary" onclick="showResponseModal(null, ${route.id})">
                         <i class="fas fa-plus me-1"></i>Agregar Respuesta
                     </button>
                 </div>
                 
                                   <div class="accordion-content collapsed" id="responses-${route.id}">
                     ${route.responses.length === 0 ? 
                         '<p class="text-muted text-center py-3">No hay respuestas configuradas para esta ruta</p>' : 
                         route.responses.map(response => `
                             <div class="response-card">
                                 <div class="response-header">
                                     <div class="row align-items-center">
                                         <div class="col-md-3">
                                             <strong>${response.name}</strong>
                                             <span class="badge bg-${getStatusColor(response.status_code)} ms-2">${response.status_code}</span>
                                         </div>
                                         <div class="col-md-3">
                                             <strong>Delay:</strong> ${response.delay_ms}ms
                                         </div>
                                         <div class="col-md-3">
                                             <strong>Por defecto:</strong> 
                                             <span class="badge ${response.is_default ? 'bg-primary' : 'bg-secondary'}">
                                                 ${response.is_default ? 'Sí' : 'No'}
                                             </span>
                                         </div>
                                         <div class="col-md-3 text-end">
                                             <button class="btn btn-sm btn-outline-primary" onclick="editResponse(${response.id})">
                                                 <i class="fas fa-edit"></i>
                                             </button>
                                             <button class="btn btn-sm btn-outline-danger" onclick="deleteResponse(${response.id})">
                                                 <i class="fas fa-trash"></i>
                                             </button>
                                         </div>
                                     </div>
                                     <div class="mt-2">
                                         <small><strong>Headers:</strong> <code>${response.headers || '{}'}</code></small><br>
                                         <small><strong>Body:</strong> <code>${response.body ? response.body.substring(0, 100) + (response.body.length > 100 ? '...' : '') : '{}'}</code></small>
                                     </div>
                                 </div>
                                 
                                 <div class="rules-container">
                                     <div class="d-flex justify-content-between align-items-center mb-2">
                                                                                   <div class="d-flex align-items-center accordion-toggle collapsed" onclick="toggleRules(${response.id})">
                                              <i class="fas fa-chevron-down me-2"></i>
                                             <h6 class="mb-0">
                                                 <i class="fas fa-cogs me-2"></i>Reglas (${response.rules.length})
                                             </h6>
                                         </div>
                                         <button class="btn btn-sm btn-outline-primary" onclick="showRuleModal(null, ${response.id})">
                                             <i class="fas fa-plus me-1"></i>Agregar Regla
                                         </button>
                                     </div>
                                     
                                                                           <div class="accordion-content collapsed" id="rules-${response.id}">
                                         ${response.rules.length === 0 ? 
                                             '<p class="text-muted text-center py-2">No hay reglas configuradas para esta respuesta</p>' : 
                                             response.rules.map(rule => `
                                                 <div class="rule-item">
                                                     <div class="row align-items-center">
                                                         <div class="col-md-2">
                                                             <strong>${rule.name}</strong>
                                                         </div>
                                                         <div class="col-md-2">
                                                             <span class="badge bg-info">${rule.rule_type}</span>
                                                         </div>
                                                         <div class="col-md-2">
                                                             <strong>Campo:</strong> ${rule.field_name || '-'}
                                                         </div>
                                                         <div class="col-md-2">
                                                             <strong>Operador:</strong> 
                                                             <span class="badge bg-secondary">${rule.operator}</span>
                                                         </div>
                                                         <div class="col-md-2">
                                                             <strong>Valor:</strong> <code>${rule.value || '-'}</code>
                                                         </div>
                                                         <div class="col-md-2 text-end">
                                                             <button class="btn btn-sm btn-outline-primary" onclick="editRule(${rule.id})">
                                                                 <i class="fas fa-edit"></i>
                                                             </button>
                                                             <button class="btn-sm btn-outline-danger" onclick="deleteRule(${rule.id})">
                                                                 <i class="fas fa-trash"></i>
                                                             </button>
                                                         </div>
                                                     </div>
                                                 </div>
                                             `).join('')
                                         }
                                     </div>
                                 </div>
                             </div>
                         `).join('')
                     }
                 </div>
             </div>
        `;
        
        container.appendChild(routeCard);
    });
}

function showRouteModal(route = null) {
    const modal = new bootstrap.Modal(document.getElementById('routeModal'));
    const form = document.getElementById('routeForm');
    
    // Cargar environments en el select
    const envSelect = document.getElementById('route-environment');
    envSelect.innerHTML = '<option value="">Seleccionar environment</option>';
    environments.forEach(env => {
        const option = document.createElement('option');
        option.value = env.id;
        option.textContent = env.name;
        envSelect.appendChild(option);
    });
    
    if (route) {
        document.getElementById('routeModalTitle').textContent = 'Editar Ruta';
        document.getElementById('route-id').value = route.id;
        document.getElementById('route-environment').value = route.environment_id;
        document.getElementById('route-method').value = route.method;
        document.getElementById('route-path').value = route.path;
        document.getElementById('route-description').value = route.description || '';
        document.getElementById('route-active').checked = route.is_active == 1;
    } else {
        document.getElementById('routeModalTitle').textContent = 'Nueva Ruta';
        form.reset();
        document.getElementById('route-id').value = '';
    }
    
    modal.show();
}

async function saveRoute() {
    const form = document.getElementById('routeForm');
    const formData = {
        environment_id: document.getElementById('route-environment').value,
        method: document.getElementById('route-method').value,
        path: document.getElementById('route-path').value,
        description: document.getElementById('route-description').value,
        is_active: document.getElementById('route-active').checked ? 1 : 0
    };
    
    const id = document.getElementById('route-id').value;
    const method = id ? 'PUT' : 'POST';
    
    if (id) {
        formData.id = id;
    }
    
    try {
        const response = await fetch('api.php/routes', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('routeModal')).hide();
            showAlert('Ruta guardada exitosamente', 'success');
            loadRoutesWithNestedData();
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar ruta', 'danger');
    }
}

async function editRoute(id) {
    const route = routes.find(r => r.id == id);
    if (route) {
        showRouteModal(route);
    }
}

async function deleteRoute(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
        try {
            const response = await fetch(`api.php/routes?id=${id}`, {
                method: 'DELETE'
            });
            
                    if (response.ok) {
            showAlert('Ruta eliminada exitosamente', 'success');
            loadRoutesWithNestedData();
        } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al eliminar ruta', 'danger');
        }
    }
}



function getStatusColor(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'danger';
    return 'secondary';
}

function showResponseModal(response = null, routeId = null) {
    const modal = new bootstrap.Modal(document.getElementById('responseModal'));
    const form = document.getElementById('responseForm');
    
    // Cargar rutas en el select
    const routeSelect = document.getElementById('response-route');
    routeSelect.innerHTML = '<option value="">Seleccionar ruta</option>';
    routes.forEach(route => {
        const env = environments.find(e => e.id == route.environment_id);
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `${env ? env.name + ' - ' : ''}${route.method} ${route.path}`;
        routeSelect.appendChild(option);
    });
    
    if (response) {
        document.getElementById('responseModalTitle').textContent = 'Editar Respuesta';
        document.getElementById('response-id').value = response.id;
        document.getElementById('response-route').value = response.route_id;
        document.getElementById('response-name').value = response.name;
        document.getElementById('response-status').value = response.status_code;
        document.getElementById('response-delay').value = response.delay_ms;
        document.getElementById('response-default').checked = response.is_default == 1;
        document.getElementById('response-headers').value = response.headers || '{}';
        document.getElementById('response-body').value = response.body || '';
    } else {
        document.getElementById('responseModalTitle').textContent = 'Nueva Respuesta';
        form.reset();
        document.getElementById('response-id').value = '';
        document.getElementById('response-status').value = '200';
        document.getElementById('response-delay').value = '0';
        
        // Si se proporciona un routeId, preseleccionarlo
        if (routeId) {
            document.getElementById('response-route').value = routeId;
        }
    }
    
    modal.show();
}

async function saveResponse() {
    const form = document.getElementById('responseForm');
    const formData = {
        route_id: document.getElementById('response-route').value,
        name: document.getElementById('response-name').value,
        status_code: document.getElementById('response-status').value,
        delay_ms: document.getElementById('response-delay').value,
        is_default: document.getElementById('response-default').checked ? 1 : 0,
        headers: document.getElementById('response-headers').value,
        body: document.getElementById('response-body').value
    };
    
    const id = document.getElementById('response-id').value;
    const method = id ? 'PUT' : 'POST';
    
    if (id) {
        formData.id = id;
    }
    
    try {
        const response = await fetch('api.php/responses', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('responseModal')).hide();
            showAlert('Respuesta guardada exitosamente', 'success');
            loadRoutesWithNestedData();
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar respuesta', 'danger');
    }
}

async function editResponse(id) {
    // Buscar la respuesta en la estructura anidada de rutas
    let foundResponse = null;
    for (let route of routes) {
        if (route.responses) {
            foundResponse = route.responses.find(r => r.id == id);
            if (foundResponse) {
                break;
            }
        }
    }
    
    if (foundResponse) {
        showResponseModal(foundResponse);
    } else {
        showAlert('Respuesta no encontrada', 'danger');
    }
}

async function deleteResponse(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta respuesta?')) {
        try {
            const response = await fetch(`api.php/responses?id=${id}`, {
                method: 'DELETE'
            });
            
                    if (response.ok) {
            showAlert('Respuesta eliminada exitosamente', 'success');
            loadRoutesWithNestedData();
        } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al eliminar respuesta', 'danger');
        }
    }
}



function showRuleModal(rule = null, responseId = null) {
    const modal = new bootstrap.Modal(document.getElementById('ruleModal'));
    const form = document.getElementById('ruleForm');
    
    // Cargar respuestas en el select
    const responseSelect = document.getElementById('rule-response');
    responseSelect.innerHTML = '<option value="">Seleccionar respuesta</option>';
    
    // Obtener todas las respuestas de todas las rutas
    const allResponses = [];
    routes.forEach(route => {
        if (route.responses) {
            route.responses.forEach(response => {
                const env = environments.find(e => e.id == route.environment_id);
                allResponses.push({
                    ...response,
                    routeInfo: `${env ? env.name + ' - ' : ''}${route.method} ${route.path}`
                });
            });
        }
    });
    
    allResponses.forEach(response => {
        const option = document.createElement('option');
        option.value = response.id;
        option.textContent = `${response.name} (${response.routeInfo})`;
        responseSelect.appendChild(option);
    });
    
    if (rule) {
        document.getElementById('ruleModalTitle').textContent = 'Editar Regla';
        document.getElementById('rule-id').value = rule.id;
        document.getElementById('rule-response').value = rule.response_id;
        document.getElementById('rule-name').value = rule.name;
        document.getElementById('rule-type').value = rule.rule_type;
        document.getElementById('rule-operator').value = rule.operator;
        document.getElementById('rule-field').value = rule.field_name || '';
        document.getElementById('rule-value').value = rule.value || '';
        document.getElementById('rule-priority').value = rule.priority;
    } else {
        document.getElementById('ruleModalTitle').textContent = 'Nueva Regla';
        form.reset();
        document.getElementById('rule-id').value = '';
        document.getElementById('rule-priority').value = '0';
        
        // Si se proporciona un responseId, preseleccionarlo
        if (responseId) {
            document.getElementById('rule-response').value = responseId;
        }
    }
    
    modal.show();
}

async function saveRule() {
    const form = document.getElementById('ruleForm');
    const formData = {
        response_id: document.getElementById('rule-response').value,
        name: document.getElementById('rule-name').value,
        rule_type: document.getElementById('rule-type').value,
        operator: document.getElementById('rule-operator').value,
        field_name: document.getElementById('rule-field').value,
        value: document.getElementById('rule-value').value,
        priority: document.getElementById('rule-priority').value
    };
    
    const id = document.getElementById('rule-id').value;
    const method = id ? 'PUT' : 'POST';
    
    if (id) {
        formData.id = id;
    }
    
    try {
        const response = await fetch('api.php/rules', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('ruleModal')).hide();
            showAlert('Regla guardada exitosamente', 'success');
            loadRoutesWithNestedData();
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar regla', 'danger');
    }
}

async function editRule(id) {
    // Buscar la regla en la estructura anidada de rutas y respuestas
    let foundRule = null;
    for (let route of routes) {
        if (route.responses) {
            for (let response of route.responses) {
                if (response.rules) {
                    foundRule = response.rules.find(r => r.id == id);
                    if (foundRule) {
                        break;
                    }
                }
            }
            if (foundRule) break;
        }
    }
    
    if (foundRule) {
        showRuleModal(foundRule);
    } else {
        showAlert('Regla no encontrada', 'danger');
    }
}

async function deleteRule(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
        try {
            const response = await fetch(`api.php/rules?id=${id}`, {
                method: 'DELETE'
            });
            
                    if (response.ok) {
            showAlert('Regla eliminada exitosamente', 'success');
            loadRoutesWithNestedData();
        } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al eliminar regla', 'danger');
        }
    }
}

// Funciones auxiliares
function updateEnvironmentFilters() {
    const envFilter = document.getElementById('environment-filter');
    
    // Limpiar y repoblar environment filter
    envFilter.innerHTML = '<option value="">Todos los environments</option>';
    environments.forEach(env => {
        const option = document.createElement('option');
        option.value = env.id;
        option.textContent = env.name;
        envFilter.appendChild(option);
    });
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Funciones para el acordeón
function toggleResponses(routeId) {
    const content = document.getElementById(`responses-${routeId}`);
    const toggle = content.previousElementSibling.querySelector('.accordion-toggle');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    } else {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        toggle.classList.remove('collapsed');
    }
}

function toggleRules(responseId) {
    const content = document.getElementById(`rules-${responseId}`);
    const toggle = content.previousElementSibling.querySelector('.accordion-toggle');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        toggle.classList.remove('collapsed');
    } else {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        toggle.classList.add('collapsed');
    }
}

// Función para expandir/colapsar todas las respuestas de una ruta
function toggleAllResponses(routeId, expand = true) {
    const content = document.getElementById(`responses-${routeId}`);
    const toggle = content.previousElementSibling.querySelector('.accordion-toggle');
    
    if (expand) {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        toggle.classList.remove('collapsed');
    } else {
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}

// Función para expandir/colapsar todas las reglas de una respuesta
function toggleAllRules(responseId, expand = true) {
    const content = document.getElementById(`rules-${responseId}`);
    const toggle = content.previousElementSibling.querySelector('.accordion-toggle');
    
    if (expand) {
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        toggle.classList.remove('collapsed');
    } else {
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}

// Funciones para expandir/colapsar todas las secciones
function expandAllSections() {
    // Expandir todas las respuestas
    routes.forEach(route => {
        if (route.responses && route.responses.length > 0) {
            toggleAllResponses(route.id, true);
            
            // Expandir todas las reglas de cada respuesta
            route.responses.forEach(response => {
                if (response.rules && response.rules.length > 0) {
                    toggleAllRules(response.id, true);
                }
            });
        }
    });
}

function collapseAllSections() {
    // Colapsar todas las respuestas
    routes.forEach(route => {
        if (route.responses && route.responses.length > 0) {
            toggleAllResponses(route.id, false);
            
            // Colapsar todas las reglas de cada respuesta
            route.responses.forEach(response => {
                if (response.rules && response.rules.length > 0) {
                    toggleAllRules(response.id, false);
                }
            });
        }
    });
}
