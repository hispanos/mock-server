// Loading Manager - Gestión de estados de loading
export class LoadingManager {
    constructor() {
        this.isLoading = false;
        this.loadingCount = 0;
        this.init();
    }
    
    init() {
        // Crear elementos de loading para secciones específicas
        this.createSectionLoadings();
    }
    
    createSectionLoadings() {
        // Crear loading para la sección de environments
        const environmentsSection = document.getElementById('environments-section');
        if (environmentsSection) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'environments-loading';
            loadingDiv.className = 'section-loading';
            loadingDiv.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <div class="loading-text">
                    <span class="text-muted">Cargando environments...</span>
                </div>
            `;
            loadingDiv.style.display = 'none';
            environmentsSection.appendChild(loadingDiv);
        }
        
        // Crear loading para la sección de routes
        const routesSection = document.getElementById('routes-section');
        if (routesSection) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'routes-loading';
            loadingDiv.className = 'section-loading';
            loadingDiv.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <div class="loading-text">
                    <span class="text-muted">Cargando rutas...</span>
                </div>
            `;
            loadingDiv.style.display = 'none';
            routesSection.appendChild(loadingDiv);
        }
    }
    
    // Mostrar loading global (overlay completo)
    showGlobalLoading(message = 'Cargando contenido...') {
        this.isLoading = true;
        this.loadingCount++;
        
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const messageElement = overlay.querySelector('.loading-text h5');
            if (messageElement) {
                messageElement.textContent = message;
            }
            overlay.classList.add('show');
        }
    }
    
    // Ocultar loading global
    hideGlobalLoading() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0) {
            this.isLoading = false;
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('show');
            }
        }
    }
    
    // Mostrar loading de sección específica
    showSectionLoading(sectionName, message = null) {
        const loadingId = `${sectionName}-loading`;
        const loadingElement = document.getElementById(loadingId);
        
        if (loadingElement) {
            if (message) {
                const messageElement = loadingElement.querySelector('.loading-text span');
                if (messageElement) {
                    messageElement.textContent = message;
                }
            }
            loadingElement.style.display = 'flex';
        }
    }
    
    // Ocultar loading de sección específica
    hideSectionLoading(sectionName) {
        const loadingId = `${sectionName}-loading`;
        const loadingElement = document.getElementById(loadingId);
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    // Mostrar loading en contenedor específico
    showContainerLoading(containerId, message = 'Cargando...') {
        const container = document.getElementById(containerId);
        if (container) {
            // Guardar contenido original
            if (!container.dataset.originalContent) {
                container.dataset.originalContent = container.innerHTML;
            }
            
            container.innerHTML = `
                <div class="section-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <div class="loading-text">
                        <span class="text-muted">${message}</span>
                    </div>
                </div>
            `;
        }
    }
    
    // Restaurar contenido original del contenedor
    hideContainerLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container && container.dataset.originalContent) {
            container.innerHTML = container.dataset.originalContent;
            delete container.dataset.originalContent;
        }
    }
    
    // Mostrar loading en card específica
    showCardLoading(cardElement, message = 'Cargando...') {
        if (cardElement) {
            // Guardar contenido original
            if (!cardElement.dataset.originalContent) {
                cardElement.dataset.originalContent = cardElement.innerHTML;
            }
            
            cardElement.classList.add('card-loading');
            cardElement.innerHTML = `
                <div class="card-body d-flex align-items-center justify-content-center">
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">${message}</small>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Restaurar contenido original de la card
    hideCardLoading(cardElement) {
        if (cardElement && cardElement.dataset.originalContent) {
            cardElement.innerHTML = cardElement.dataset.originalContent;
            cardElement.classList.remove('card-loading');
            delete cardElement.dataset.originalContent;
        }
    }
    
    // Mostrar loading en botón
    showButtonLoading(buttonElement, loadingText = 'Cargando...') {
        if (buttonElement) {
            // Guardar contenido original
            if (!buttonElement.dataset.originalContent) {
                buttonElement.dataset.originalContent = buttonElement.innerHTML;
            }
            
            buttonElement.disabled = true;
            buttonElement.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ${loadingText}
            `;
        }
    }
    
    // Restaurar contenido original del botón
    hideButtonLoading(buttonElement) {
        if (buttonElement && buttonElement.dataset.originalContent) {
            buttonElement.innerHTML = buttonElement.dataset.originalContent;
            buttonElement.disabled = false;
            delete buttonElement.dataset.originalContent;
        }
    }
    
    // Loading con delay mínimo para evitar parpadeo
    showLoadingWithDelay(loadingFunction, delay = 300) {
        const startTime = Date.now();
        
        loadingFunction();
        
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, delay - elapsedTime);
        
        if (remainingDelay > 0) {
            setTimeout(() => {
                // El loading ya se ocultó, no hacer nada
            }, remainingDelay);
        }
    }
    
    // Loading con progreso
    showProgressLoading(containerId, progress = 0) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="section-loading">
                    <div class="text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <div class="progress mb-3" style="width: 200px;">
                            <div class="progress-bar" role="progressbar" style="width: ${progress}%" 
                                 aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                                ${progress}%
                            </div>
                        </div>
                        <div class="loading-text">
                            <span class="text-muted">Progreso: ${progress}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Loading con mensaje personalizado y tipo
    showCustomLoading(containerId, type = 'info', message = 'Cargando...', icon = null) {
        const container = document.getElementById(containerId);
        if (container) {
            const iconClass = icon || this.getIconForType(type);
            const colorClass = this.getColorForType(type);
            
            container.innerHTML = `
                <div class="section-loading">
                    <div class="text-center">
                        <i class="${iconClass} ${colorClass} mb-3" style="font-size: 2rem;"></i>
                        <div class="loading-text">
                            <span class="text-muted">${message}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Obtener icono según el tipo
    getIconForType(type) {
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle',
            'loading': 'fas fa-spinner fa-spin'
        };
        return icons[type] || icons['info'];
    }
    
    // Obtener color según el tipo
    getColorForType(type) {
        const colors = {
            'info': 'text-info',
            'success': 'text-success',
            'warning': 'text-warning',
            'error': 'text-danger',
            'loading': 'text-primary'
        };
        return colors[type] || colors['info'];
    }
}
