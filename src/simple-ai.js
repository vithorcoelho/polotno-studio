// Sistema AI Write simplificado para integração com Polotno
import { AI_CONFIG, validateConfig, getToneConfig } from './ai-config.js';

// Função principal para gerar texto com OpenAI
export async function generateAIText(originalText, tone = 'friendly') {
  if (!validateConfig()) {
    throw new Error('Configuração OpenAI inválida. Verifique o arquivo .env');
  }

  if (!originalText || originalText.trim().length === 0) {
    throw new Error('Texto original é obrigatório');
  }

  const toneConfig = getToneConfig(tone);
  const prompt = toneConfig.prompt + originalText.trim();

  if (AI_CONFIG.debug.enabled && AI_CONFIG.debug.logRequests) {
    console.log('🎯 Gerando texto AI:', {
      originalText,
      tone,
      prompt: prompt.substring(0, 100) + '...'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em reescrita de textos. Mantenha o significado original mas mude o tom conforme solicitado. Responda apenas com o texto reescrito, sem explicações adicionais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.generation.temperature,
        max_tokens: AI_CONFIG.generation.maxTokens,
        top_p: AI_CONFIG.generation.topP,
        frequency_penalty: AI_CONFIG.generation.frequencyPenalty,
        presence_penalty: AI_CONFIG.generation.presencePenalty,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Erro na API OpenAI: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.error?.message || response.statusText}`;
      } catch (e) {
        errorMessage += ` - ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta da API OpenAI inválida');
    }

    const generatedText = data.choices[0].message.content.trim();

    if (AI_CONFIG.debug.enabled && AI_CONFIG.debug.logResponses) {
      console.log('✅ Texto gerado com sucesso:', {
        input: originalText.substring(0, 50) + '...',
        output: generatedText.substring(0, 50) + '...',
        tone,
        tokensUsed: data.usage?.total_tokens || 'desconhecido'
      });
    }

    return generatedText;

  } catch (error) {
    if (AI_CONFIG.debug.enabled && AI_CONFIG.debug.logErrors) {
      console.error('❌ Erro ao gerar texto AI:', error);
    }
    
    // Re-throw com mensagem mais amigável
    if (error.message.includes('401')) {
      throw new Error('Chave da API OpenAI inválida. Verifique sua configuração.');
    } else if (error.message.includes('429')) {
      throw new Error('Limite de uso da API OpenAI excedido. Tente novamente mais tarde.');
    } else if (error.message.includes('insufficient_quota')) {
      throw new Error('Créditos da OpenAI esgotados. Adicione créditos à sua conta.');
    }
    
    throw error;
  }
}

// Função para testar a configuração
export async function testAIConfiguration() {
  try {
    console.log('🧪 Testando configuração AI...');
    
    const testText = 'Olá mundo';
    const result = await generateAIText(testText, 'friendly');
    
    console.log('✅ Teste de configuração bem-sucedido!');
    console.log('📝 Texto de teste:', testText);
    console.log('🎯 Resultado:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de configuração:', error.message);
    return false;
  }
}

// Função utilitária para limpar e validar texto
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .substring(0, 1000);  // Limita tamanho
}

// Função para estimar custo aproximado
export function estimateCost(text, model = AI_CONFIG.openai.defaultModel) {
  const approximateTokens = Math.ceil(text.length / 4); // Estimativa grosseira
  
  const costs = {
    'gpt-3.5-turbo': 0.002 / 1000, // $0.002 por 1K tokens
    'gpt-4': 0.03 / 1000,          // $0.03 por 1K tokens
    'gpt-4-turbo': 0.01 / 1000,    // $0.01 por 1K tokens
  };
  
  const costPerToken = costs[model] || costs['gpt-3.5-turbo'];
  return (approximateTokens * costPerToken).toFixed(6);
}
