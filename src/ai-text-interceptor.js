// Interceptador personalizado para AI Write usando OpenAI
import { AI_CONFIG, getToneConfig, validateConfig } from './ai-config.js';

let originalFetch = null;
let originalXHROpen = null;

// Função para gerar texto usando OpenAI
async function generateTextWithOpenAI(originalText, tone = 'friendly') {
  if (!validateConfig()) {
    throw new Error('Configuração OpenAI inválida');
  }

  const toneConfig = getToneConfig(tone);
  const prompt = toneConfig.prompt + originalText;

  if (AI_CONFIG.debug.enabled) {
    console.log('🎯 Prompt final para OpenAI:', prompt);
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
            content: 'Você é um assistente especializado em reescrita de textos. Seja muito conciso. Responda apenas com o texto reescrito, sem explicações. Máximo 5 palavras por resposta.'
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('Resposta vazia da OpenAI');
    }

    if (AI_CONFIG.debug.enabled) {
      console.log('✅ Texto gerado com sucesso:', generatedText);
    }

    return generatedText;
  } catch (error) {
    console.error('❌ Erro ao gerar texto:', error);
    throw error;
  }
}

// Função para aplicar texto diretamente no elemento selecionado
function applyTextToSelectedElement(newText) {
  try {
    if (AI_CONFIG.debug.enabled) {
      console.log('🚀 Iniciando aplicação de texto:', newText);
    }

    // Buscar store do Polotno
    const store = window.store;
    if (!store) {
      console.warn('⚠️ Store do Polotno não encontrado');
      return false;
    }

    if (AI_CONFIG.debug.enabled) {
      console.log('✓ Store encontrado');
    }

    let element = null;

    // Método 1: Tentar usar elementos selecionados
    if (store.selectedElements && store.selectedElements.length > 0) {
      if (AI_CONFIG.debug.enabled) {
        console.log('✓ Usando elemento selecionado');
      }
      const selectedId = store.selectedElements[0];
      element = store.getElementById(selectedId);
    }

    // Método 2: Se não há seleção, procurar o último elemento de texto tocado/editado
    if (!element) {
      if (AI_CONFIG.debug.enabled) {
        console.log('⚠️ Nenhum elemento selecionado, procurando último elemento de texto...');
      }

      // Procurar na página atual
      const currentPage = store.activePage;
      if (currentPage) {
        const textElements = currentPage.children.filter(child => child.type === 'text');
        
        if (textElements.length > 0) {
          // Pegar o último elemento de texto (mais recente)
          element = textElements[textElements.length - 1];
          if (AI_CONFIG.debug.enabled) {
            console.log('✓ Encontrado último elemento de texto:', element.id);
          }
        }
      }
    }

    // Método 3: Fallback - procurar qualquer elemento de texto na página
    if (!element) {
      if (AI_CONFIG.debug.enabled) {
        console.log('⚠️ Procurando qualquer elemento de texto na página...');
      }

      const allElements = store.toJSON().pages[store.activePageIndex]?.children || [];
      const textElements = allElements.filter(el => el.type === 'text');
      
      if (textElements.length > 0) {
        // Usar o primeiro elemento de texto encontrado
        const elementData = textElements[0];
        element = store.getElementById(elementData.id);
        if (AI_CONFIG.debug.enabled) {
          console.log('✓ Usando fallback - primeiro elemento de texto:', elementData.id);
        }
      }
    }

    if (!element) {
      console.warn('⚠️ Nenhum elemento de texto encontrado na página');
      return false;
    }

    if (AI_CONFIG.debug.enabled) {
      console.log('✓ Elemento encontrado:', {
        id: element.id,
        type: element.type,
        currentText: element.text
      });
    }

    if (element.type !== 'text') {
      console.warn('⚠️ Elemento encontrado não é um texto, tipo:', element.type);
      return false;
    }

    if (AI_CONFIG.debug.enabled) {
      console.log('✓ Elemento é do tipo texto');
      console.log('🎯 Aplicando texto diretamente no elemento...');
      console.log('📝 Texto anterior:', element.text);
      console.log('📝 Novo texto:', newText);
      console.log('🎨 Configurações atuais do elemento:', {
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontStyle: element.fontStyle,
        fontWeight: element.fontWeight,
        fill: element.fill,
        align: element.align,
        textDecoration: element.textDecoration
      });
    }

    // Primeiro, selecionar o elemento para que seja visível a mudança
    store.selectElements([element.id]);

    // Preservar as configurações de estilo do texto original
    const originalStyles = {
      fontFamily: element.fontFamily,
      fontSize: element.fontSize,
      fontStyle: element.fontStyle,
      fontWeight: element.fontWeight,
      fill: element.fill,
      align: element.align,
      textDecoration: element.textDecoration,
      lineHeight: element.lineHeight,
      letterSpacing: element.letterSpacing,
      opacity: element.opacity,
      // Preservar outras propriedades de estilo
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      scaleX: element.scaleX,
      scaleY: element.scaleY
    };

    if (AI_CONFIG.debug.enabled) {
      console.log('💾 Estilos preservados:', originalStyles);
    }

    // Tentar diferentes métodos de aplicação
    if (AI_CONFIG.debug.enabled) {
      console.log('🔧 Tentando Método 1: element.set()');
    }
    try {
      // Método 1: Usar set()
      element.set({ text: newText });
      
      // Verificar se funcionou
      if (element.text === newText) {
        if (AI_CONFIG.debug.enabled) {
          console.log('✅ Método 1 (set) funcionou!');
        }
        return true;
      } else {
        if (AI_CONFIG.debug.enabled) {
          console.log('❌ Método 1 falhou - texto não foi alterado');
          console.log('📝 Texto atual após set:', element.text);
        }
      }
    } catch (e) {
      console.warn('⚠️ Método 1 (set) falhou:', e);
    }

    if (AI_CONFIG.debug.enabled) {
      console.log('🔧 Tentando Método 2: atribuição direta');
    }
    try {
      // Método 2: Atribuição direta
      element.text = newText;
      
      if (element.text === newText) {
        if (AI_CONFIG.debug.enabled) {
          console.log('✅ Método 2 (atribuição direta) funcionou!');
        }
        return true;
      } else {
        if (AI_CONFIG.debug.enabled) {
          console.log('❌ Método 2 falhou - texto não foi alterado');
        }
      }
    } catch (e) {
      console.warn('⚠️ Método 2 (atribuição direta) falhou:', e);
    }

    if (AI_CONFIG.debug.enabled) {
      console.log('🔧 Tentando Método 3: transaction');
    }
    try {
      // Método 3: Usar actions do store
      store.history.transaction(() => {
        element.set({ text: newText });
      });
      
      if (element.text === newText) {
        if (AI_CONFIG.debug.enabled) {
          console.log('✅ Método 3 (transaction) funcionou!');
        }
        return true;
      } else {
        if (AI_CONFIG.debug.enabled) {
          console.log('❌ Método 3 falhou - texto não foi alterado');
        }
      }
    } catch (e) {
      console.warn('⚠️ Método 3 (transaction) falhou:', e);
    }

    console.error('❌ Todos os métodos de aplicação falharam');
    if (AI_CONFIG.debug.enabled) {
      console.log('🔍 Estado final do elemento:', {
        text: element.text,
        type: element.type,
        id: element.id
      });
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao aplicar texto no elemento:', error);
    return false;
  }
}

// Interceptor para requisições fetch
function interceptFetch() {
  if (originalFetch) return; // Já interceptado
  
  originalFetch = window.fetch;
  
  window.fetch = async function(url, options) {
    // Verificar se é uma chamada para a API de AI do Polotno
    if (typeof url === 'string' && url.includes('api.polotno.com/api/ai/text')) {
      if (AI_CONFIG.debug.enabled) {
        console.log('🔍 Chamada para API Polotno detectada:', url);
        console.log('🔄 Interceptando chamada AI Write do Polotno...');
      }

      try {
        // Extrair parâmetros da requisição original
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        
        // Tentar extrair dados do body se for POST
        let requestData = {};
        if (options?.body) {
          try {
            if (typeof options.body === 'string') {
              requestData = JSON.parse(options.body);
            } else if (options.body instanceof FormData) {
              requestData = Object.fromEntries(options.body.entries());
            }
          } catch (e) {
            console.warn('⚠️ Não foi possível extrair dados do body da requisição');
          }
        }

        // Extrair texto original e comando
        const originalText = requestData.text || params.get('text') || '';
        const command = requestData.command || params.get('command') || '';
        const tone = command.toLowerCase().includes('friendly') ? 'friendly' :
                     command.toLowerCase().includes('professional') ? 'professional' :
                     command.toLowerCase().includes('casual') ? 'casual' :
                     command.toLowerCase().includes('exciting') ? 'exciting' :
                     command.toLowerCase().includes('confident') ? 'confident' :
                     command.toLowerCase().includes('witty') ? 'witty' : 'friendly';

        if (AI_CONFIG.debug.enabled) {
          console.log('📝 Parâmetros extraídos:', { originalText, command, tone });
        }

        if (!originalText) {
          throw new Error('Texto original não encontrado na requisição');
        }

        // Gerar texto usando OpenAI
        const generatedText = await generateTextWithOpenAI(originalText, tone);
        
        if (AI_CONFIG.debug.enabled) {
          console.log('🎯 Tentando aplicar texto gerado:', generatedText);
          console.log('🔍 Estado do store:', {
            storeExists: !!window.store,
            selectedElements: window.store?.selectedElements,
            selectedCount: window.store?.selectedElements?.length || 0
          });
        }
        
        // Aplicar texto diretamente no elemento
        console.log('🔄 Prestes a chamar applyTextToSelectedElement...');
        const applied = applyTextToSelectedElement(generatedText);
        console.log('🔄 Retorno de applyTextToSelectedElement:', applied);
        
        if (AI_CONFIG.debug.enabled) {
          console.log('🔍 Resultado da aplicação:', applied);
        }
        
        if (!applied) {
          console.warn('⚠️ Não foi possível aplicar o texto diretamente, retornando resposta simulada');
        } else {
          console.log('✅ Texto aplicado com sucesso!');
        }

        // Retornar resposta simulada compatível com a API do Polotno
        return new Response(JSON.stringify({
          text: generatedText,
          success: true,
          source: 'openai-custom'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Erro no interceptor:', error);
        
        // Em caso de erro, retornar resposta de erro
        return new Response(JSON.stringify({
          error: error.message,
          success: false
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Para outras requisições, usar fetch normal
    return originalFetch.call(this, url, options);
  };
}

// Interceptor para XMLHttpRequest
function interceptXHR() {
  if (originalXHROpen) return; // Já interceptado
  
  originalXHROpen = XMLHttpRequest.prototype.open;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes('api.polotno.com/api/ai/text')) {
      if (AI_CONFIG.debug.enabled) {
        console.log('🔍 XHR para API Polotno detectada:', url);
      }
      
      // Interceptar a resposta
      this.addEventListener('readystatechange', function() {
        if (this.readyState === 4) {
          if (AI_CONFIG.debug.enabled) {
            console.log('🔄 Interceptando resposta XHR AI Write...');
          }
          
          // Aqui podemos interceptar a resposta se necessário
          // Por enquanto, deixamos o XHR normal funcionar
          // pois o fetch interceptor já cuidará da maioria dos casos
        }
      });
    }
    
    return originalXHROpen.call(this, method, url, ...args);
  };
}

// Função principal para configurar interceptores
export function setupCustomTextAI() {
  try {
    if (!validateConfig()) {
      console.error('❌ Não é possível configurar AI personalizado: configuração inválida');
      return false;
    }

    // Configurar interceptadores
    interceptFetch();
    interceptXHR();
    
    if (AI_CONFIG.debug.enabled) {
      console.log('✅ AI Write personalizado configurado com OpenAI (Fetch + XHR)!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar AI personalizado:', error);
    return false;
  }
}

// Função para limpar interceptadores (útil para desenvolvimento)
export function clearInterceptors() {
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
  
  if (originalXHROpen) {
    XMLHttpRequest.prototype.open = originalXHROpen;
    originalXHROpen = null;
  }
  
  console.log('🧹 Interceptadores removidos');
}
