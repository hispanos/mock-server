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
        const saveButton = document.querySelector('#environmentModal .btn-primary');
        
        // Mostrar loading en el botón
        this.app.loadingManager.showButtonLoading(saveButton, 'Guardando...');
        
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
        } finally {
            // Ocultar loading del botón
            this.app.loadingManager.hideButtonLoading(saveButton);
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
                // Mostrar loading global
                this.app.loadingManager.showGlobalLoading('Eliminando environment...');
                
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
            } finally {
                // Ocultar loading global
                this.app.loadingManager.hideGlobalLoading();
            }
        }
    }
    
    async export(environmentId) {
        try {
            // Mostrar modal de exportación
            const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
            const environmentSelect = document.getElementById('exportEnvironment');
            const exportFormat = document.getElementById('exportFormat');
            
            // Limpiar y cargar environments en el select
            environmentSelect.innerHTML = '<option value="">Selecciona un environment...</option>';
            this.app.environments.forEach(env => {
                const option = document.createElement('option');
                option.value = env.id;
                option.textContent = env.name;
                if (env.id == environmentId) {
                    option.selected = true;
                }
                environmentSelect.appendChild(option);
            });
            
            exportModal.show();
            
            // Configurar evento de exportación
            document.getElementById('exportConfirmBtn').onclick = async () => {
                const selectedEnv = environmentSelect.value;
                const format = exportFormat.value;
                
                if (!selectedEnv) {
                    this.app.alertManager.show('Selecciona un environment para exportar', 'warning');
                    return;
                }
                
                try {
                    // Mostrar loading
                    this.app.loadingManager.showGlobalLoading('Exportando environment...');
                    
                    // Crear enlace de descarga
                    const url = `api.php/export?environment_id=${selectedEnv}&format=${format}`;
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = '';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    exportModal.hide();
                    this.app.alertManager.show('Environment exportado exitosamente', 'success');
                } catch (error) {
                    console.error('Error al exportar:', error);
                    this.app.alertManager.show('Error al exportar environment', 'danger');
                } finally {
                    this.app.loadingManager.hideGlobalLoading();
                }
            };
            
        } catch (error) {
            console.error('Error al mostrar modal de exportación:', error);
            this.app.alertManager.show('Error al mostrar modal de exportación', 'danger');
        }
    }
    
    async importFromFile(file, format = 'json') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', format);
            
            // Mostrar loading
            this.app.loadingManager.showGlobalLoading('Importando environment...');
            
            const response = await fetch('api.php/import', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.app.alertManager.show(result.message, 'success');
                
                // Recargar environments
                await this.app.loadEnvironments();
                
                // Cerrar modal de importación
                bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
                
                // Limpiar formularios
                document.getElementById('importJsonForm').reset();
                document.getElementById('importOpenAPIForm').reset();
                
                return result;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Error al importar');
            }
        } catch (error) {
            console.error('Error al importar:', error);
            this.app.alertManager.show(error.message || 'Error al importar environment', 'danger');
            throw error;
        } finally {
            this.app.loadingManager.hideGlobalLoading();
        }
    }
}
