// Configurações para o sistema AI Write personalizado com OpenAI

export const AI_CONFIG = {
  // Configurações da API OpenAI
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    defaultModel: 'gpt-3.5-turbo', // ou 'gpt-4' para melhor qualidade
    baseURL: 'https://api.openai.com/v1',
  },

  // Configurações de geração de texto
  generation: {
    temperature: 0.7,     // Criatividade (0.0 = determinístico, 1.0 = muito criativo)
    maxTokens: 50,        // Comprimento máximo do texto gerado (reduzido para textos curtos)
    topP: 1.0,           // Diversidade do vocabulário
    frequencyPenalty: 0,  // Penalidade por repetição de tokens
    presencePenalty: 0,   // Penalidade por repetição de tópicos
  },

  // Configurações de debug
  debug: {
    enabled: true,
    logRequests: true,
    logResponses: true,
    logErrors: true,
  },

  // URLs da API Polotno para interceptação
  polotno: {
    apiDomain: 'api.polotno.com',
    textEndpoint: '/api/ai/text',
  }
};

// Configurações dos tons de escrita
export const TONE_CONFIGS = {
  friendly: {
    name: 'Amigável',
    description: 'Tom casual e acolhedor',
    prompt: 'Reescreva de forma amigável e concisa (máximo 5 palavras): ',
    icon: '😊',
    category: 'casual'
  },
  professional: {
    name: 'Profissional',
    description: 'Tom formal e empresarial',
    prompt: 'Reescreva de forma profissional e concisa (máximo 5 palavras): ',
    icon: '💼',
    category: 'formal'
  },
  confident: {
    name: 'Confiante',
    description: 'Tom assertivo e determinado',
    prompt: 'Reescreva de forma confiante e concisa (máximo 5 palavras): ',
    icon: '💪',
    category: 'assertive'
  },
  encouraging: {
    name: 'Encorajador',
    description: 'Tom motivacional e inspirador',
    prompt: 'Reescreva de forma encorajadora e concisa (máximo 5 palavras): ',
    icon: '🌟',
    category: 'motivational'
  },
  witty: {
    name: 'Espirituoso',
    description: 'Tom humorístico e inteligente',
    prompt: 'Reescreva de forma espirituosa e concisa (máximo 5 palavras): ',
    icon: '🎭',
    category: 'creative'
  },
  direct: {
    name: 'Direto',
    description: 'Tom conciso e objetivo',
    prompt: 'Reescreva de forma direta e objetiva (máximo 3 palavras): ',
    prompt: 'Reescreva o texto a seguir de forma direta e concisa: ',
    icon: '🎯',
    category: 'efficient'
  }
};

// Função para validar configuração
export function validateConfig() {
  if (!AI_CONFIG.openai.apiKey) {
    console.error('❌ VITE_OPENAI_API_KEY não configurada no arquivo .env');
    return false;
  }

  if (!AI_CONFIG.openai.apiKey.startsWith('sk-')) {
    console.error('❌ Chave OpenAI inválida. Deve começar com "sk-"');
    return false;
  }

  return true;
}

// Função para obter configuração de tom
export function getToneConfig(tone) {
  const config = TONE_CONFIGS[tone];
  
  if (!config) {
    console.warn(`⚠️ Tom "${tone}" não encontrado, usando "friendly" como padrão`);
    return TONE_CONFIGS.friendly;
  }

  return config;
}

// Função para obter lista de tons disponíveis
export function getAvailableTones() {
  return Object.keys(TONE_CONFIGS).map(key => ({
    key,
    ...TONE_CONFIGS[key]
  }));
}

// Função para debug - log configurações (sem expor secrets)
export function logConfig() {
  if (!AI_CONFIG.debug.enabled) return;

  console.group('🔧 Configurações AI Write');
  console.log('🤖 Modelo:', AI_CONFIG.openai.defaultModel);
  console.log('🌡️ Temperature:', AI_CONFIG.generation.temperature);
  console.log('📏 Max Tokens:', AI_CONFIG.generation.maxTokens);
  console.log('🔑 API Key configurada:', !!AI_CONFIG.openai.apiKey);
  console.log('🎨 Tons disponíveis:', Object.keys(TONE_CONFIGS).length);
  console.groupEnd();
}
