/**
 * Configuration de l'API
 * 
 * Pour activer les appels API réels :
 * 1. Démarrez votre backend Spring Boot sur http://localhost:8080
 * 2. Changez USE_MOCK_DATA à false
 * 3. Configurez API_BASE_URL si nécessaire
 */

export const API_CONFIG = {
  // Basculer entre données mockées et API réelle
    // Désactivation des mocks pour utiliser le backend réel
    USE_MOCK_DATA: false,
  
  // URL de base de l'API
//  API_BASE_URL: 'http://localhost:8080/api',
    API_BASE_URL: 'https://jardin.vps.ttelab.fr/api',

  // Timeout des requêtes (en ms)
  REQUEST_TIMEOUT: 30000,
  
  // Activer les logs de debug
  DEBUG: true,
};

// Helper pour logger les appels API en mode debug
export function logAPICall(method: string, endpoint: string, data?: any) {
  if (API_CONFIG.DEBUG && !API_CONFIG.USE_MOCK_DATA) {
    console.log(`[API] ${method} ${endpoint}`, data || '');
  }
}

// Helper pour logger les erreurs API
export function logAPIError(method: string, endpoint: string, error: any) {
  if (API_CONFIG.DEBUG) {
    console.error(`[API ERROR] ${method} ${endpoint}`, error);
  }
}
