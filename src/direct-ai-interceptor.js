// Interceptador direto para substituir chamadas da API Polotno por OpenAI
import { generateAIText } from './simple-ai.js';
import { AI_CONFIG } from './ai-config.js';

let isInterceptorActive = false;

// Função para aplicar texto diretamente no elemento selecionado
function applyTextToSelectedElement(newText) {
  try {
    // Busca pelo elemento de texto selecionado no Polotno
    const selectedElement = window.store?.selectedElements?.[0];
    
    if (!selectedElement || selectedElement.type !== 'text') {
      console.warn('⚠️ Nenhum elemento de texto selecionado');
      return false;
    }

    // Aplica o novo texto
    selectedElement.set({ text: newText });
    
    if (AI_CONFIG.debug.enabled) {
      console.log('✅ Texto aplicado com sucesso no elemento!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao aplicar texto no elemento:', error);
    return false;
  }
}

// Interceptador para requisições fetch
function interceptFetch() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(url, options = {}) {
    // Verifica se é uma chamada para a API de texto do Polotno
    if (typeof url === 'string' && url.includes('api.polotno.com/api/ai/text')) {
      
      if (AI_CONFIG.debug.enabled) {
        console.log('🔍 Interceptando chamada fetch para API Polotno:', url);
      }

      try {
        // Extrai parâmetros da URL
        const urlObj = new URL(url);
        const tone = urlObj.searchParams.get('tone') || 'friendly';
        
        // Extrai texto do body da requisição
        let originalText = '';
        if (options.body) {
          const bodyData = JSON.parse(options.body);
          originalText = bodyData.text || bodyData.originalText || '';
        }

        if (!originalText) {
          throw new Error('Texto original não encontrado na requisição');
        }

        // Gera texto com OpenAI
        const generatedText = await generateAIText(originalText, tone);
        
        // Aplica diretamente no elemento
        applyTextToSelectedElement(generatedText);
        
        // Retorna resposta simulada para manter compatibilidade
        return new Response(JSON.stringify({
          text: generatedText,
          success: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Erro no interceptador fetch:', error);
        
        // Retorna erro simulado
        return new Response(JSON.stringify({
          error: error.message,
          success: false
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Para outras URLs, usa fetch original
    return originalFetch.apply(this, arguments);
  };
}

// Interceptador para requisições XMLHttpRequest
function interceptXHR() {
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._url = url;
    this._method = method;
    return originalXHROpen.apply(this, [method, url, ...args]);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    // Verifica se é uma chamada para a API de texto do Polotno
    if (this._url && this._url.includes('api.polotno.com/api/ai/text')) {
      
      if (AI_CONFIG.debug.enabled) {
        console.log('🔍 Interceptando chamada XHR para API Polotno:', this._url);
      }

      // Simula processamento assíncrono
      setTimeout(async () => {
        try {
          // Extrai parâmetros da URL
          const urlObj = new URL(this._url, window.location.origin);
          const tone = urlObj.searchParams.get('tone') || 'friendly';
          
          // Extrai texto do body
          let originalText = '';
          if (data) {
            const bodyData = JSON.parse(data);
            originalText = bodyData.text || bodyData.originalText || '';
          }

          if (!originalText) {
            throw new Error('Texto original não encontrado na requisição');
          }

          // Gera texto com OpenAI
          const generatedText = await generateAIText(originalText, tone);
          
          // Aplica diretamente no elemento
          applyTextToSelectedElement(generatedText);
          
          // Simula resposta de sucesso
          Object.defineProperty(this, 'status', { value: 200 });
          Object.defineProperty(this, 'statusText', { value: 'OK' });
          Object.defineProperty(this, 'responseText', { 
            value: JSON.stringify({ text: generatedText, success: true })
          });
          Object.defineProperty(this, 'readyState', { value: 4 });
          
          this.onreadystatechange && this.onreadystatechange();
          this.onload && this.onload();

        } catch (error) {
          console.error('❌ Erro no interceptador XHR:', error);
          
          // Simula resposta de erro
          Object.defineProperty(this, 'status', { value: 500 });
          Object.defineProperty(this, 'statusText', { value: 'Internal Server Error' });
          Object.defineProperty(this, 'responseText', { 
            value: JSON.stringify({ error: error.message, success: false })
          });
          Object.defineProperty(this, 'readyState', { value: 4 });
          
          this.onreadystatechange && this.onreadystatechange();
          this.onerror && this.onerror();
        }
      }, 100); // Pequeno delay para simular latência
      
      return;
    }
    
    // Para outras URLs, usa send original
    return originalXHRSend.apply(this, arguments);
  };
}

// Função principal para configurar interceptadores
export function setupDirectAIInterceptor() {
  if (isInterceptorActive) {
    console.warn('⚠️ Interceptador direto já está ativo');
    return;
  }

  try {
    interceptFetch();
    interceptXHR();
    isInterceptorActive = true;
    
    console.log('✅ Interceptador direto AI configurado com sucesso!');
    
    if (AI_CONFIG.debug.enabled) {
      console.log('🔧 Configurações ativas:', {
        fetch: 'interceptado',
        xhr: 'interceptado',
        aplicacaoDireta: 'habilitada'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao configurar interceptador direto:', error);
  }
}

// Função para desativar interceptadores
export function disableDirectAIInterceptor() {
  // Nota: Uma vez que os protótipos são alterados, 
  // seria necessário recarregar a página para restaurar completamente
  console.log('⚠️ Para desativar completamente o interceptador, recarregue a página');
  isInterceptorActive = false;
}

// Função de status
export function getInterceptorStatus() {
  return {
    active: isInterceptorActive,
    timestamp: new Date().toISOString()
  };
}
