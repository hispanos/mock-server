// Environment Manager - Gestión de environments
export class EnvironmentManager {
    constructor(app) {
        this.app = app;
    }
    
    showModal(environment = null) {
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
    
    async save() {
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
                this.app.alertManager.show('Environment guardado exitosamente', 'success');
                this.app.loadEnvironments();
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            this.app.alertManager.show('Error al guardar environment', 'danger');
        }
    }
    
    async edit(id) {
        const environment = this.app.getEnvironmentById(id);
        if (environment) {
            this.showModal(environment);
        }
    }
    
    async delete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este environment?')) {
            try {
                const response = await fetch(`api.php/environments?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.app.alertManager.show('Environment eliminado exitosamente', 'success');
                    this.app.loadEnvironments();
                } else {
                    throw new Error('Error al eliminar');
                }
            } catch (error) {
                console.error('Error:', error);
                this.app.alertManager.show('Error al eliminar environment', 'danger');
            }
        }
    }
}
