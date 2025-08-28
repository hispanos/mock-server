// Mock API Service - Aplicación principal
import { EnvironmentManager } from './modules/environment-manager.js';
import { RouteManager } from './modules/route-manager.js';
import { ResponseManager } from './modules/response-manager.js';
import { RuleManager } from './modules/rule-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { AlertManager } from './modules/alert-manager.js';
import { LoadingManager } from './modules/loading-manager.js';

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
        this.loadingManager = new LoadingManager();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        
        // Mostrar loading inicial
        this.loadingManager.showGlobalLoading('Inicializando aplicación...');
        
        // Cargar environments con delay mínimo
        setTimeout(() => {
            this.loadEnvironments().finally(() => {
                this.loadingManager.hideGlobalLoading();
            });
        }, 500);
    }
    
    setupEventListeners() {
        // Botón agregar
        document.getElementById('add-btn').addEventListener('click', (event) => {
            // Mostrar loading en el botón
            this.loadingManager.showButtonLoading(event.target, 'Preparando...');
            
            setTimeout(() => {
                this.showAddModal();
                this.loadingManager.hideButtonLoading(event.target);
            }, 300);
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
            
            // Mostrar loading de sección
            this.loadingManager.showSectionLoading('environments', 'Cargando environments...');
            
            const response = await fetch('api.php/environments');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.environments = data;
            
            this.uiManager.renderEnvironments();
            this.uiManager.updateEnvironmentFilters();
            
            // Ocultar loading de sección
            this.loadingManager.hideSectionLoading('environments');
        } catch (error) {
            console.error('Error cargando environments:', error);
            this.alertManager.show('Error cargando environments', 'danger');
            this.loadingManager.hideSectionLoading('environments');
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
