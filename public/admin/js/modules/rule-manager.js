// Rule Manager - Gestión de reglas
export class RuleManager {
    constructor(app) {
        this.app = app;
    }
    
    showModal(rule = null, responseId = null) {
        const modal = new bootstrap.Modal(document.getElementById('ruleModal'));
        const form = document.getElementById('ruleForm');
        
        // Cargar respuestas en el select
        const responseSelect = document.getElementById('rule-response');
        responseSelect.innerHTML = '<option value="">Seleccionar respuesta</option>';
        
        // Obtener todas las respuestas de todas las rutas
        const allResponses = [];
        this.app.routes.forEach(route => {
            if (route.responses) {
                route.responses.forEach(response => {
                    const env = this.app.getEnvironmentById(route.environment_id);
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
    
    async save() {
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
                this.app.alertManager.show('Regla guardada exitosamente', 'success');
                this.app.routeManager.loadRoutesWithNestedData();
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            this.app.alertManager.show('Error al guardar regla', 'danger');
        }
    }
    
    async edit(id) {
        const rule = this.app.getRuleById(id);
        if (rule) {
            this.showModal(rule);
        } else {
            this.app.alertManager.show('Regla no encontrada', 'danger');
        }
    }
    
    async delete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
            try {
                const response = await fetch(`api.php/rules?id=${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.app.alertManager.show('Regla eliminada exitosamente', 'success');
                    this.app.routeManager.loadRoutesWithNestedData();
                } else {
                    throw new Error('Error al eliminar');
                }
            } catch (error) {
                console.error('Error:', error);
                this.app.alertManager.show('Error al eliminar regla', 'danger');
            }
        }
    }
}
