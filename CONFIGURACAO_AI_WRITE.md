# 📝 Configuração do Recurso "AI Write" (iaWrite) no Polotno Studio

## 🔍 Visão Geral

O recurso "AI Write" (também conhecido como "iaWrite" nas traduções) é uma funcionalidade de geração de texto com IA integrada ao Polotno Studio. Este recurso permite aos usuários gerar texto automaticamente usando inteligência artificial diretamente no editor.

## 🏗️ Arquitetura do Sistema

### 1. **API Principal**: Polotno API
- **Endpoint Base**: `https://api.polotno.com/`
- **Chave de API**: Obtida através da função `getKey()` do SDK
- **Localização**: `/src/utils/validate-key` (parte do Polotno SDK)

### 2. **Estrutura de Tradução**
O recurso está disponível em múltiplos idiomas:
- **Português**: "Escrita IA" (`/src/translations/pt-br.json`)
- **Inglês**: "AI write" (`/src/translations/en.json`)
- **Francês**: "Écriture IA" (`/src/translations/fr.json`)
- **Russo**: "ИИ-текст" (`/src/translations/ru.json`)
- **Indonésio**: "Tulis AI" (`/src/translations/id.json`)
- **Chinês**: "AI写作" (`/src/translations/zh-ch.json`)

## ⚙️ Configuração Atual

### 1. **Chave de API**
```javascript
// Localização: src/index.jsx
const store = createStore({ key: 'nFA5H9elEytDyPyvKL7T' });
```

**⚠️ IMPORTANTE**: Esta é uma chave de demonstração. Para uso em produção, você deve:
1. Obter sua própria chave em [https://polotno.com/login](https://polotno.com/login)
2. Substituir a chave no código ou usar variáveis de ambiente

### 2. **Integração com API Externa**
Para usar a API oficial da OpenAI diretamente:
- **Provider**: OpenAI API oficial
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Autenticação**: Via Bearer Token (chave API da OpenAI)
- **Modelo Recomendado**: `gpt-3.5-turbo` ou `gpt-4`

## 🔧 Como Configurar

### Opção 1: API OpenAI Direta (Recomendado)
1. Obtenha sua chave API em [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie um arquivo `.env` na raiz do projeto:
```env
VITE_OPENAI_API_KEY=sk-sua_chave_openai_aqui
VITE_POLOTNO_KEY=sua_chave_polotno_aqui
```

3. Instale a biblioteca oficial da OpenAI:
```bash
npm install openai
```

### Opção 2: Backend Proxy (Mais Seguro)
Crie um backend que proxy as requisições para manter a chave segura:
```env
# Backend .env
OPENAI_API_KEY=sk-sua_chave_openai_aqui
```

## 📊 Sistema de Créditos

O sistema implementa um controle de créditos para funcionalidades AI:

### Localização: `/src/credits.js`
- **Armazenamento**: localStorage (⚠️ não seguro para produção)
- **Reset**: Diário
- **Padrão**: 10 créditos por dia

### Como Personalizar:
```javascript
// Exemplo de uso
const { credits, consumeCredits } = useCredits('aiWriteCredits', 20);
```

## 🔌 APIs Utilizadas

### 1. **API OpenAI Oficial - Geração de Texto**
```javascript
// Implementação com API oficial da OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ Apenas para desenvolvimento
});

const generateText = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "Você é um assistente criativo que gera textos para designs gráficos."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    throw error;
  }
};
```

### 2. **Implementação via Backend Proxy (Mais Seguro)**
```javascript
// Frontend - chamada para seu backend
const generateTextSecure = async (prompt) => {
  const response = await fetch('/api/ai/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  if (!response.ok) {
    throw new Error('Erro ao gerar texto');
  }
  
  const data = await response.json();
  return data.text;
};
```

### 3. **Outros Modelos OpenAI Disponíveis**
- **GPT-4**: Mais avançado, melhor qualidade
- **GPT-3.5-turbo**: Mais rápido, custo menor
- **GPT-4-turbo**: Equilibrio entre qualidade e velocidade

## 🚀 Implementação Personalizada

### Para implementar seu próprio sistema AI Write:

1. **Crie um novo componente**:
```javascript
// src/components/ai-write-panel.jsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, InputGroup } from '@blueprintjs/core';
import { getKey } from 'polotno/utils/validate-key';

export const AIWritePanel = observer(({ store }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generateText = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.polotno.com/api/ai/text-generation?KEY=${getKey()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, provider: 'openai' })
        }
      );
      const data = await response.json();
      
      // Adicionar texto gerado ao canvas
      store.activePage.addElement({
        type: 'text',
        text: data.text,
        x: store.width / 2 - 200,
        y: store.height / 2,
        width: 400
      });
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <InputGroup
        placeholder="Descreva o texto que deseja gerar..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button 
        onClick={generateText} 
        loading={loading}
        disabled={!prompt}
      >
        Gerar Texto com IA
      </Button>
    </div>
  );
});
```

2. **Integre ao painel lateral**:
```javascript
// src/App.jsx
import { AIWritePanel } from './components/ai-write-panel';

// Adicione à lista de seções
const AI_WRITE_SECTION = {
  name: 'ai-write',
  Tab: (props) => <SectionTab name="AI Write" {...props} />,
  Panel: AIWritePanel,
};

DEFAULT_SECTIONS.push(AI_WRITE_SECTION);
```

## 🔐 Considerações de Segurança

### ⚠️ Problemas Atuais:
1. **Chave de API exposta**: A chave está no código frontend
2. **Créditos no localStorage**: Facilmente manipulável
3. **Sem autenticação de usuário**: Qualquer um pode usar

### ✅ Recomendações para Produção:
1. **Backend Proxy**: Crie um backend que:
   - Armazene as chaves de API de forma segura
   - Implemente autenticação de usuário
   - Controle o uso de créditos no servidor

2. **Exemplo de Backend (Node.js/Express)**:
```javascript
app.post('/api/ai/generate-text', authenticateUser, async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        prompt: req.body.prompt,
        max_tokens: 150
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar texto' });
  }
});
```

## 📚 Recursos Adicionais

### Documentação Oficial:
- [Polotno SDK](https://polotno.com/docs)
- [API Documentation](https://polotno.com/docs/api)

### Exemplos de Implementação:
- Verifique o arquivo `/src/sections/stable-diffusion-section.jsx` para ver como outras funcionalidades AI são implementadas
- O arquivo `/src/topbar/postprocess.jsx` mostra como fazer chamadas para APIs AI

## 🆘 Solução de Problemas

### Problemas Comuns:
1. **"API key inválida"**: Verifique se a chave do Polotno está correta
2. **"Sem créditos"**: Verifique o sistema de créditos em `/src/credits.js`
3. **"Funcionalidade não aparece"**: Verifique se o componente está registrado corretamente

### Debug:
```javascript
// Adicione logs para debug
console.log('Polotno Key:', getKey());
console.log('Credits available:', credits);
```

---

**📝 Nota**: Esta documentação foi criada com base na análise do código fonte atual. Para informações mais específicas sobre endpoints de geração de texto, consulte a documentação oficial da API Polotno ou entre em contato com o suporte técnico.
