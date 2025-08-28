// Route Manager - Gestión de rutas
export class RouteManager {
    constructor(app) {
        this.app = app;
    }
    
    async loadRoutesWithNestedData() {
        try {
            const environmentId = document.getElementById('environment-filter').value;
            const url = environmentId ? `api.php/routes?environment_id=${environmentId}` : 'api.php/routes';
            const response = await fetch(url);
            this.app.routes = await response.json();
            
            // Cargar respuestas para cada ruta
            for (let route of this.app.routes) {
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
            
            this.app.uiManager.renderRoutesWithNestedData();
        } catch (error) {
            console.error('Error cargando rutas:', error);
            this.app.alertManager.show('Error cargando rutas', 'danger');
        }
    }
    
    showModal(route = null) {
        const modal = new bootstrap.Modal(document.getElementById('routeModal'));
        const form = document.getElementById('routeForm');
        
        // Cargar environments en el select
        const envSelect = document.getElementById('route-environment');
        envSelect.innerHTML = '<option value="">Seleccionar environment</option>';
        this.app.environments.forEach(env => {
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
    
    async save() {
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
                this.app.alertManager.show('Ruta guardada exitosamente', 'success');
                this.loadRoutesWithNestedData();
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            this.app.alertManager.show('Error al guardar ruta', 'danger');
        }
    }
    
    async edit(id) {
        const route = this.app.getRouteById(id);
        if (route) {
            this.showModal(route);
        }
    }
    
    async delete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
            try {
                const response = await fetch(`api.php/routes?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.app.alertManager.show('Ruta eliminada exitosamente', 'success');
                    this.loadRoutesWithNestedData();
                } else {
                    throw new Error('Error al eliminar');
                }
            } catch (error) {
                console.error('Error:', error);
                this.app.alertManager.show('Error al eliminar ruta', 'danger');
            }
        }
    }
}
