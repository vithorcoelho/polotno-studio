import React, { useState, useRef } from 'react';
import {
  Button,
  Card,
  H2,
  H4,
  Intent,
  TextArea,
  NonIdealState,
  Callout,
  Divider,
  ButtonGroup,
  Code
} from '@blueprintjs/core';
import { Download, Code as CodeIcon, EyeOpen } from '@blueprintjs/icons';
import { createStore } from 'polotno/model/store';
import { downloadFile } from 'polotno/utils/download';

// Fallback function to generate basic HTML
const generateBasicHTML = (store) => {
  const pages = store.pages.map((page, index) => {
    const elements = page.children.map(element => {
      if (element.type === 'text') {
        return `
          <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
            font-size: ${element.fontSize || 16}px;
            font-family: ${element.fontFamily || 'Arial'};
            color: ${element.fill || '#000000'};
            font-weight: ${element.fontWeight || 'normal'};
            text-align: ${element.align || 'left'};
          ">
            ${element.text || ''}
          </div>`;
      } else if (element.type === 'image') {
        return `
          <img src="${element.src || ''}" style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
          ">`;
      }
      return '';
    }).join('');

    return `
      <div class="page-${index}" style="
        position: relative;
        width: ${page.width || store.width}px;
        height: ${page.height || store.height}px;
        margin: 20px auto;
        border: 1px solid #ddd;
        background: white;
        page-break-after: always;
      ">
        ${elements}
      </div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polotno Export</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: ${store.width + 40}px;
            margin: 0 auto;
        }
        @media print {
            body { background: white; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="container">
        ${pages}
    </div>
</body>
</html>`;
};

const JsonToHtmlConverter = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const previewRef = useRef(null);

  const convertJsonToHtml = async () => {
    if (!jsonInput.trim()) {
      setError('Por favor, cole um JSON válido do Polotno');
      return;
    }

    setIsConverting(true);
    setError('');
    setHtmlOutput('');

    try {
      // Parse JSON
      const jsonData = JSON.parse(jsonInput);
      
      // Validate if it's a Polotno JSON
      if (!jsonData.pages || !Array.isArray(jsonData.pages)) {
        throw new Error('JSON inválido: não é um projeto Polotno válido');
      }

      // Create a temporary store to load the JSON
      const store = createStore({
        width: jsonData.width || 800,
        height: jsonData.height || 600,
        unit: jsonData.unit || 'px'
      });

      // Load JSON into store
      store.loadJSON(jsonData);

      // Try multiple approaches to get HTML
      let htmlText;
      
      try {
        // Method 1: Use toHTML() which should return a blob
        const htmlBlob = await store.toHTML();
        htmlText = await htmlBlob.text();
      } catch (error1) {
        console.warn('toHTML() failed, trying alternative method:', error1);
        
        try {
          // Method 2: Use saveAsHTML without fileName to get the blob
          const result = await store.saveAsHTML({});
          if (result && result.url) {
            const response = await fetch(result.url);
            htmlText = await response.text();
          } else if (result instanceof Blob) {
            htmlText = await result.text();
          } else {
            throw new Error('Método saveAsHTML não retornou resultado válido');
          }
        } catch (error2) {
          console.warn('saveAsHTML() failed, trying manual HTML generation:', error2);
          
          // Method 3: Manual HTML generation as fallback
          htmlText = generateBasicHTML(store);
        }
      }
      
      if (!htmlText) {
        throw new Error('Não foi possível gerar o HTML do projeto');
      }
      
      setHtmlOutput(htmlText);
      setError('');
      
    } catch (err) {
      console.error('Erro na conversão:', err);
      
      // Provide more specific error messages
      if (err.name === 'SyntaxError') {
        setError('JSON inválido: verifique a sintaxe do JSON');
      } else if (err.message.includes('não é um projeto Polotno válido')) {
        setError('JSON inválido: não é um projeto Polotno válido. Certifique-se de que o JSON contém uma propriedade "pages"');
      } else {
        setError(`Erro ao converter JSON para HTML: ${err.message}`);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const downloadHtml = () => {
    if (!htmlOutput) return;

    const blob = new Blob([htmlOutput], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'polotno-export.html');
    URL.revokeObjectURL(url);
  };

  const previewHtml = () => {
    if (!htmlOutput) return;

    setIsPreviewMode(true);
    
    // Open preview in new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlOutput);
      newWindow.document.close();
    }
  };

  const copyToClipboard = async () => {
    if (!htmlOutput) return;
    
    try {
      await navigator.clipboard.writeText(htmlOutput);
      // Simple alert for now - could be improved with toast notifications
      alert('HTML copiado para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = htmlOutput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('HTML copiado para a área de transferência!');
    }
  };

  const clearAll = () => {
    setJsonInput('');
    setHtmlOutput('');
    setError('');
    setIsPreviewMode(false);
  };

  const loadExample = () => {
    const exampleJson = {
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
            },
            {
              "type": "text",
              "x": 100,
              "y": 250,
              "width": 600,
              "height": 50,
              "text": "Este é um exemplo de projeto Polotno",
              "fontSize": 18,
              "fontFamily": "Arial",
              "fill": "#666666"
            }
          ]
        }
      ]
    };
    
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f5f8fa'
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <H2>Conversor JSON para HTML - Polotno</H2>
        <p style={{ color: '#5c7080', marginTop: '10px' }}>
          Cole o JSON do seu projeto Polotno e converta para HTML
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Input Section */}
        <Card>
          <H4>JSON do Polotno</H4>
          <TextArea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Cole aqui o JSON do seu projeto Polotno..."
            style={{ 
              width: '100%', 
              height: '400px', 
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
            fill
          />
          
          <div style={{ marginTop: '15px' }}>
            <ButtonGroup>
              <Button
                intent={Intent.PRIMARY}
                onClick={convertJsonToHtml}
                loading={isConverting}
                disabled={!jsonInput.trim()}
              >
                Converter para HTML
              </Button>
              <Button onClick={loadExample}>
                Carregar Exemplo
              </Button>
              <Button onClick={clearAll}>
                Limpar
              </Button>
            </ButtonGroup>
          </div>

          {error && (
            <Callout intent={Intent.DANGER} style={{ marginTop: '15px' }}>
              {error}
            </Callout>
          )}
        </Card>

        {/* Output Section */}
        <Card>
          <H4>HTML Gerado</H4>
          {htmlOutput ? (
            <>
              <TextArea
                value={htmlOutput}
                readOnly
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}
                fill
              />
              
              <div style={{ marginTop: '15px' }}>
                <ButtonGroup>
                  <Button
                    intent={Intent.SUCCESS}
                    icon={<Download />}
                    onClick={downloadHtml}
                  >
                    Baixar HTML
                  </Button>
                  <Button
                    icon={<EyeOpen />}
                    onClick={previewHtml}
                  >
                    Visualizar
                  </Button>
                  <Button
                    icon={<CodeIcon />}
                    onClick={copyToClipboard}
                  >
                    Copiar
                  </Button>
                </ButtonGroup>
              </div>
            </>
          ) : (
            <NonIdealState
              icon="document"
              title="Nenhum HTML gerado"
              description="Cole um JSON válido e clique em 'Converter' para gerar o HTML"
            />
          )}
        </Card>
      </div>

      <Divider />

      {/* Instructions */}
      <Card style={{ marginTop: '20px' }}>
        <H4>Como usar</H4>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Abra seu projeto no Polotno Studio</li>
          <li>Vá em "File" {'>'} "Save as JSON" para exportar o JSON do projeto</li>
          <li>Cole o conteúdo do arquivo JSON no campo à esquerda</li>
          <li>Clique em "Converter para HTML"</li>
          <li>Use "Baixar HTML" para salvar o arquivo ou "Visualizar" para ver o resultado</li>
        </ol>
        
        <Callout style={{ marginTop: '15px' }}>
          <strong>Dica:</strong> Você pode usar o botão "Carregar Exemplo" para testar o conversor com um JSON de exemplo.
        </Callout>
        
        <Callout intent={Intent.WARNING} style={{ marginTop: '15px' }}>
          <strong>Nota:</strong> O HTML gerado é uma representação estática do seu design. 
          Elementos interativos como vídeos podem não funcionar perfeitamente no HTML exportado.
        </Callout>
      </Card>
    </div>
  );
};

export default JsonToHtmlConverter;
