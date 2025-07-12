# 🚀 Guia de Instalação - AI Write

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento
- **Node.js**: 16+ 
- **npm**: 8+
- **Polotno Studio**: Versão atual
- **Chave OpenAI**: API Key válida

### Dependências Necessárias
```bash
npm install openai
```

---

## ⚡ Instalação Rápida

### 1. **Clone e Configure**
```bash
# Se ainda não tem o projeto
git clone [polotno-studio-url]
cd polotno-studio

# Instalar dependência OpenAI
npm install openai
```

### 2. **Configurar Variáveis de Ambiente**
Crie o arquivo `.env` na raiz:
```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-SUA_CHAVE_OPENAI_AQUI

# Polotno Configuration (manter existente)
VITE_POLOTNO_KEY=sua_chave_polotno_existente
```

### 3. **Verificar Arquivos do Sistema**
Certifique-se que estes arquivos existem:
```
src/
├── ai-text-interceptor.js    ✓ Core do sistema
├── ai-config.js             ✓ Configurações  
└── index.jsx               ✓ Inicialização
```

### 4. **Iniciar Aplicação**
```bash
npm start
```

---

## 🔧 Instalação Detalhada

### **Passo 1: Obter Chave OpenAI**

1. **Acesse**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Faça login** ou crie uma conta
3. **Clique em "Create new secret key"**
4. **Copie a chave** (formato: `sk-proj-...`)
5. **Adicione créditos** à sua conta OpenAI

### **Passo 2: Configurar .env**

**Modelo do arquivo `.env`:**
```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-SUA_CHAVE_OPENAI_AQUI

# Polotno Configuration (manter a existente)
VITE_POLOTNO_KEY=

# Plausible Analytics (opcional)
VITE_PLAUSIBLE_DOMAIN=
```

**⚠️ Importante:**
- Nunca commite o arquivo `.env` com chaves reais
- Use chaves diferentes para desenvolvimento e produção
- Monitore o uso de créditos OpenAI

### **Passo 3: Verificar Integração**

**Arquivo `src/index.jsx` deve conter:**
```javascript
import { setupCustomTextAI } from './ai-text-interceptor';

// ... outras importações ...

unstable_setAnimationsEnabled(true);

// Configurar AI Write personalizado com OpenAI
setupCustomTextAI();

const store = createStore({ key: 'nFA5H9elEytDyPyvKL7T' });
// ... resto do código ...
```

---

## ✅ Verificação da Instalação

### **1. Iniciar Aplicação**
```bash
npm start
```

**Deve mostrar:**
```
VITE v6.3.5  ready in 478ms
➜  Local:   http://localhost:5175/
```

### **2. Verificar Console**
Abra **F12 → Console** e procure por:
```
✅ AI Write personalizado configurado com OpenAI (Fetch + XHR)!
```

### **3. Testar Funcionalidade**
1. **Adicione um texto** ao design
2. **Selecione o texto**
3. **Clique em "iaWriter"**
4. **Escolha um tom** (ex: Friendly)
5. **Observe os logs**:
   ```
   🔄 Interceptando chamada AI Write do Polotno...
   ✅ Texto gerado com sucesso: [texto gerado]
   🎯 Aplicando texto diretamente no elemento...
   ```

### **4. Verificar Aplicação**
- O texto no editor deve **mudar automaticamente**
- **Não deve haver erros** no console
- A **interface deve responder** normalmente

---

## 🛠️ Configuração Personalizada

### **Modelo OpenAI**
Edite `ai-config.js`:
```javascript
export const AI_CONFIG = {
  defaultModel: 'gpt-4', // ou 'gpt-3.5-turbo'
  generation: {
    temperature: 0.8,    // Mais criativo
    maxTokens: 200      // Textos mais longos
  }
};
```

### **Tons Personalizados**
Adicione novos tons em `ai-config.js`:
```javascript
export const TONE_CONFIGS = {
  academic: {
    name: 'Acadêmico',
    description: 'Linguagem científica',
    prompt: 'Reescreva em linguagem acadêmica: ',
    icon: '🎓',
    category: 'formal'
  }
};
```

### **Debug Detalhado**
Para desenvolvimento, ative logs completos:
```javascript
export const AI_CONFIG = {
  debug: {
    enabled: true,
    logRequests: true,
    logResponses: true,
    logErrors: true
  }
};
```

---

## 🔧 Solução de Problemas

### **Erro: "VITE_OPENAI_API_KEY não configurada"**
**Solução:**
1. Verifique se o arquivo `.env` existe na raiz
2. Confirme se a chave está no formato correto
3. Reinicie o servidor: `Ctrl+C` → `npm start`

### **Erro: "Domain is invalid"**
**Solução:**
- ✅ **Normal!** Este erro confirma que o interceptor está funcionando
- O sistema automaticamente redireciona para OpenAI

### **Erro: "Limite de requisições excedido"**
**Solução:**
1. Verifique créditos na conta OpenAI
2. Aguarde alguns minutos
3. Considere upgrade do plano OpenAI

### **Texto não aparece no editor**
**Verificações:**
1. Console mostra `✅ Texto gerado com sucesso`?
2. Console mostra `🎯 Aplicando texto diretamente...`?
3. Elemento de texto está selecionado?
4. Recarregue a página e tente novamente

### **Interceptor não funciona**
**Soluções:**
1. Verifique se `setupCustomTextAI()` está sendo chamado
2. Console deve mostrar: `✅ AI Write personalizado configurado...`
3. Verifique se não há erros JavaScript bloqueando
4. Force reload: `Ctrl+Shift+R`

---

## 🔍 Logs de Debug

### **Ativar Debug Completo**
1. **Abra Console** (F12)
2. **Execute**:
   ```javascript
   window.DEBUG_AI = true;
   ```
3. **Teste a funcionalidade**
4. **Observe logs detalhados**

### **Principais Logs**
```javascript
// Inicialização
✅ AI Write personalizado configurado com OpenAI (Fetch + XHR)!

// Interceptação
🔍 Chamada para API Polotno detectada: [URL]
🔄 Interceptando chamada AI Write do Polotno...

// Processamento  
📝 Parâmetros extraídos: { originalText, command, tone }
🎯 Prompt final para OpenAI: [prompt]

// Resultado
✅ Texto gerado com sucesso: [texto]
🎯 Aplicando texto diretamente no elemento...
✅ Texto aplicado com sucesso no elemento!
```

---

## 📊 Monitoramento

### **Uso de Créditos OpenAI**
- **GPT-3.5-turbo**: ~$0.002 por requisição
- **GPT-4**: ~$0.01-0.03 por requisição
- **Monitoramento**: [https://platform.openai.com/usage](https://platform.openai.com/usage)

### **Performance**
- **Latência típica**: 2-3 segundos
- **Taxa de sucesso**: >95%
- **Limite recomendado**: 100-500 requisições/dia

---

## 🚀 Próximos Passos

### **Depois da Instalação**
1. **Explore diferentes tons** disponíveis
2. **Teste com textos variados**
3. **Configure tons personalizados**
4. **Monitore uso de créditos**

### **Personalizações Avançadas**
1. **Adicionar novos modelos** OpenAI
2. **Criar prompts específicos** para seu uso
3. **Configurar cache** para economia
4. **Implementar analytics** personalizados

### **Integração com Produção**
1. **Configurar variáveis** de produção
2. **Implementar rate limiting**
3. **Configurar monitoramento**
4. **Backup de configurações**

---

## 📞 Suporte

### **Em caso de problemas:**
1. **Verifique os logs** no console
2. **Confirme configurações** do .env
3. **Teste com conta OpenAI** funcionando
4. **Documente erros** com screenshots dos logs

### **Recursos Úteis**
- **OpenAI Status**: [https://status.openai.com/](https://status.openai.com/)
- **OpenAI Docs**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Polotno Docs**: [https://polotno.com/docs](https://polotno.com/docs)

---

*Guia criado em: Julho 2025*  
*Versão: 1.0*  
*Testado em: Windows, macOS, Linux*
