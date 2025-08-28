// Mock API Service - Aplicación principal
import { EnvironmentManager } from './modules/environment-manager.js';
import { RouteManager } from './modules/route-manager.js';
import { ResponseManager } from './modules/response-manager.js';
import { RuleManager } from './modules/rule-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { AlertManager } from './modules/alert-manager.js';

class MockAPIService {
    constructor() {
        this.currentSection = 'environments';
        this.environments = [];
        this.routes = [];
        this.responses = [];
        this.rules = [];
        
        // Inicializar módulos
        this.environmentManager = new EnvironmentManager(this);
        this.routeManager = new RouteManager(this);
        this.responseManager = new ResponseManager(this);
        this.ruleManager = new RuleManager(this);
        this.uiManager = new UIManager(this);
        this.alertManager = new AlertManager();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadEnvironments();
    }
    
    setupEventListeners() {
        // Botón agregar
        document.getElementById('add-btn').addEventListener('click', () => {
            this.showAddModal();
        });
        
        // Filtro de environment
        document.getElementById('environment-filter').addEventListener('change', () => {
            this.routeManager.loadRoutesWithNestedData();
        });
    }
    
    showAddModal() {
        switch(this.currentSection) {
            case 'environments':
                this.environmentManager.showModal();
                break;
            case 'routes':
                this.routeManager.showModal();
                break;
        }
    }
    
    async loadEnvironments() {
        try {
            const response = await fetch('api.php/environments');
            this.environments = await response.json();
            this.uiManager.renderEnvironments();
            this.uiManager.updateEnvironmentFilters();
        } catch (error) {
            console.error('Error cargando environments:', error);
            this.alertManager.show('Error cargando environments', 'danger');
        }
    }
    
    getEnvironmentById(id) {
        return this.environments.find(env => env.id == id);
    }
    
    getRouteById(id) {
        return this.routes.find(route => route.id == id);
    }
    
    getResponseById(id) {
        for (let route of this.routes) {
            if (route.responses) {
                const response = route.responses.find(r => r.id == id);
                if (response) return response;
            }
        }
        return null;
    }
    
    getRuleById(id) {
        for (let route of this.routes) {
            if (route.responses) {
                for (let response of route.responses) {
                    if (response.rules) {
                        const rule = response.rules.find(r => r.id == id);
                        if (rule) return rule;
                    }
                }
            }
        }
        return null;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.mockAPIService = new MockAPIService();
});
