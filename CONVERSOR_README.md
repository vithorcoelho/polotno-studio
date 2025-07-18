# Conversor JSON para HTML - Polotno Studio

Este projeto inclui uma funcionalidade especial para converter projetos do Polotno Studio (formato JSON) em arquivos HTML estáticos.

## Como acessar o conversor

1. **Pelo menu da aplicação principal**: 
   - No Polotno Studio, vá em `File` > `JSON to HTML Converter`
   - Isso abrirá o conversor em uma nova aba

2. **Diretamente pela URL**:
   - Acesse `/converter.html` no seu navegador
   - Exemplo: `http://localhost:5175/converter.html`

## Como usar

### Passo 1: Obter o JSON do projeto
1. Abra seu projeto no Polotno Studio
2. Vá em `File` > `Save as JSON`
3. Isso fará o download do arquivo JSON do seu projeto

### Passo 2: Converter para HTML
1. Abra o conversor (seguindo um dos métodos acima)
2. Cole o conteúdo do arquivo JSON no campo "JSON do Polotno"
3. Clique em "Converter para HTML"
4. O HTML será gerado automaticamente no painel direito

### Passo 3: Usar o HTML/PDF
- **Gerar PDF**: Clique em "Gerar PDF" para criar um PDF com tamanho exato das páginas
- **Baixar HTML**: Clique em "Baixar HTML" para salvar o arquivo
- **Visualizar**: Clique em "Visualizar" para ver o resultado em uma nova janela
- **Copiar**: Clique em "Copiar" para copiar o código HTML para a área de transferência

## Funcionalidades

- ✅ **Conversão automática**: Transforma projetos Polotno em HTML estático
- ✅ **Geração de PDF**: Cria PDFs com tamanho exato das páginas do projeto
- ✅ **Texto selecionável**: PDFs gerados com texto totalmente selecionável
- ✅ **Validação de JSON**: Verifica se o JSON é um projeto Polotno válido
- ✅ **Exemplo incluído**: Botão "Carregar Exemplo" para testar a funcionalidade
- ✅ **Preview em tempo real**: Visualize o resultado antes de baixar
- ✅ **Interface amigável**: Design responsivo com instruções claras

## Limitações

- O HTML gerado é **estático** - elementos interativos podem não funcionar
- Vídeos e animações podem não ser reproduzidos corretamente
- Fontes personalizadas podem precisar ser ajustadas manualmente
- O layout pode variar dependendo do navegador

## Estrutura de arquivos

```
src/
├── json-to-html-converter.jsx  # Componente principal do conversor
├── converter-main.jsx          # Entry point para a página do conversor
└── topbar/
    └── file-menu.jsx           # Menu atualizado com link para o conversor

converter.html                  # Página standalone para o conversor
```

## Exemplo de JSON válido

```json
{
  "width": 800,
  "height": 600,
  "unit": "px",
  "pages": [
    {
      "id": "page1",
      "children": [
        {
          "type": "text",
          "x": 100,
          "y": 100,
          "width": 600,
          "height": 100,
          "text": "Exemplo de texto convertido para HTML",
          "fontSize": 32,
          "fontFamily": "Arial",
          "fill": "#000000"
        }
      ]
    }
  ]
}
```

## Tecnologias utilizadas

- **React**: Interface do usuário
- **Blueprint.js**: Componentes de UI
- **Polotno SDK**: Funcionalidades de conversão
- **jsPDF**: Geração de arquivos PDF
- **html2canvas**: Conversão HTML para imagem/PDF
- **Vite**: Build tool e desenvolvimento

## Desenvolvimento

Para executar o projeto em modo de desenvolvimento:

```bash
npm start
```

O conversor estará disponível em:
- Aplicação principal: `http://localhost:5175/`
- Conversor direto: `http://localhost:5175/converter.html`

## Build para produção

```bash
npm run build
```

Isso criará os arquivos de produção na pasta `dist/`, incluindo tanto a aplicação principal quanto a página do conversor.
