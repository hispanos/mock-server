// UI Manager - Gestión de la interfaz de usuario
export class UIManager {
    constructor(app) {
        this.app = app;
        this.setupNavigation();
    }
    
    setupNavigation() {
        // Configurar navegación entre secciones
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (event) => {
                this.showSection(event.target.getAttribute('data-section'));
            });
        });
    }
    
    showSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section-content').forEach(el => el.style.display = 'none');
        
        // Mostrar la sección seleccionada
        const sectionElement = document.getElementById(section + '-section');
        sectionElement.style.display = 'block';
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        event.target.classList.add('active');
        
        // Actualizar título y botón
        this.app.currentSection = section;
        this.updateSectionHeader();
        
        // Mostrar loading global al cambiar de sección
        this.app.loadingManager.showGlobalLoading(`Cargando ${section === 'environments' ? 'environments' : 'rutas'}...`);
        
        // Cargar datos según la sección
        switch(section) {
            case 'environments':
                this.app.loadEnvironments().finally(() => {
                    this.app.loadingManager.hideGlobalLoading();
                });
                break;
            case 'routes':
                this.app.routeManager.loadRoutesWithNestedData().finally(() => {
                    this.app.loadingManager.hideGlobalLoading();
                });
                break;
        }
    }
    
    updateSectionHeader() {
        const titles = {
            'environments': 'Environments',
            'routes': 'Rutas'
        };
        
        document.getElementById('section-title').textContent = titles[this.app.currentSection];
        document.getElementById('add-btn').innerHTML = '<i class="fas fa-plus me-2"></i>Agregar';
    }
    
    renderEnvironments() {
        const container = document.getElementById('environments-list');
        container.innerHTML = '';
        
        if (this.app.environments.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-inbox fa-3x mb-3"></i>
                        <h5>No hay environments configurados</h5>
                        <p>Haz clic en "Agregar" para crear tu primer environment</p>
                    </div>
                </div>
            `;
            return;
        }
        
        this.app.environments.forEach((env, index) => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-3';
            
            // Crear el contenido de la card directamente
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
                            <button class="btn btn-outline-primary btn-sm" onclick="mockAPIService.environmentManager.edit(${env.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="mockAPIService.environmentManager.delete(${env.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar la card al contenedor
            container.appendChild(card);
        });
    }
    
    renderRoutesWithNestedData() {
        const container = document.getElementById('routes-container');
        
        // Mostrar loading en el contenedor
        this.app.loadingManager.showContainerLoading('routes-container', 'Cargando rutas y respuestas...');
        
            container.innerHTML = '';
            
            this.app.routes.forEach((route, index) => {
            const env = this.app.getEnvironmentById(route.environment_id);
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
                            <button class="btn btn-sm btn-outline-primary" onclick="mockAPIService.routeManager.edit(${route.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="mockAPIService.routeManager.delete(${route.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                    ${route.description ? `<p class="text-muted mb-0 mt-2">${route.description}</p>` : ''}
                </div>
                
                <div class="responses-container">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center accordion-toggle collapsed" onclick="mockAPIService.uiManager.toggleResponses(${route.id})">
                            <i class="fas fa-chevron-down me-2"></i>
                            <h6 class="mb-0">
                                <i class="fas fa-reply me-2"></i>Respuestas (${route.responses.length})
                            </h6>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="mockAPIService.responseManager.showModal(null, ${route.id})">
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
                                                <span class="badge bg-${this.app.responseManager.getStatusColor(response.status_code)} ms-2">${response.status_code}</span>
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
                                                <button class="btn btn-sm btn-outline-primary" onclick="mockAPIService.responseManager.edit(${response.id})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="mockAPIService.responseManager.delete(${response.id})">
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
                                            <div class="d-flex align-items-center accordion-toggle collapsed" onclick="mockAPIService.uiManager.toggleRules(${response.id})">
                                                <i class="fas fa-chevron-down me-2"></i>
                                                <h6 class="mb-0">
                                                    <i class="fas fa-cogs me-2"></i>Reglas (${response.rules.length})
                                                </h6>
                                            </div>
                                            <button class="btn btn-sm btn-outline-primary" onclick="mockAPIService.ruleManager.showModal(null, ${response.id})">
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
                                                                <button class="btn btn-sm btn-outline-primary" onclick="mockAPIService.ruleManager.edit(${rule.id})">
                                                                    <i class="fas fa-edit"></i>
                                                                </button>
                                                                <button class="btn btn-sm btn-outline-danger" onclick="mockAPIService.ruleManager.delete(${rule.id})">
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
    
    updateEnvironmentFilters() {
        const envFilter = document.getElementById('environment-filter');
        
        // Limpiar y repoblar environment filter
        envFilter.innerHTML = '<option value="">Todos los environments</option>';
        this.app.environments.forEach(env => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = env.name;
            envFilter.appendChild(option);
        });
    }
    
    // Funciones para el acordeón
    toggleResponses(routeId) {
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
    
    toggleRules(responseId) {
        const content = document.getElementById(`rules-${responseId}`);
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
    
    // Funciones para expandir/colapsar todas las secciones
    expandAllSections() {
        this.app.routes.forEach(route => {
            if (route.responses && route.responses.length > 0) {
                this.toggleAllResponses(route.id, true);
                
                route.responses.forEach(response => {
                    if (response.rules && response.rules.length > 0) {
                        this.toggleAllRules(response.id, true);
                    }
                });
            }
        });
    }
    
    collapseAllSections() {
        this.app.routes.forEach(route => {
            if (route.responses && route.responses.length > 0) {
                this.toggleAllResponses(route.id, false);
                
                route.responses.forEach(response => {
                    if (response.rules && response.rules.length > 0) {
                        this.toggleAllRules(response.id, false);
                    }
                });
            }
        });
    }
    
    toggleAllResponses(routeId, expand = true) {
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
    
    toggleAllRules(responseId, expand = true) {
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
}
