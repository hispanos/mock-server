// Response Manager - Gestión de respuestas
export class ResponseManager {
    constructor(app) {
        this.app = app;
    }
    
    showModal(response = null, routeId = null) {
        const modal = new bootstrap.Modal(document.getElementById('responseModal'));
        const form = document.getElementById('responseForm');
        
        // Cargar rutas en el select
        const routeSelect = document.getElementById('response-route');
        routeSelect.innerHTML = '<option value="">Seleccionar ruta</option>';
        this.app.routes.forEach(route => {
            const env = this.app.getEnvironmentById(route.environment_id);
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
    
    async save() {
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
                this.app.alertManager.show('Respuesta guardada exitosamente', 'success');
                this.app.routeManager.loadRoutesWithNestedData();
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            this.app.alertManager.show('Error al guardar respuesta', 'danger');
        }
    }
    
    async edit(id) {
        const response = this.app.getResponseById(id);
        if (response) {
            this.showModal(response);
        } else {
            this.app.alertManager.show('Respuesta no encontrada', 'danger');
        }
    }
    
    async delete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta respuesta?')) {
            try {
                const response = await fetch(`api.php/responses?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.app.alertManager.show('Respuesta eliminada exitosamente', 'success');
                    this.app.routeManager.loadRoutesWithNestedData();
                } else {
                    throw new Error('Error al eliminar');
                }
            } catch (error) {
                console.error('Error:', error);
                this.app.alertManager.show('Error al eliminar respuesta', 'danger');
            }
        }
    }
    
    getStatusColor(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'success';
        if (statusCode >= 300 && statusCode < 400) return 'info';
        if (statusCode >= 400 && statusCode < 500) return 'warning';
        if (statusCode >= 500) return 'danger';
        return 'secondary';
    }
}
