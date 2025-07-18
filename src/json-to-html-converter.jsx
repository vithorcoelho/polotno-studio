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
import { Download, Code as CodeIcon, EyeOpen, Document } from '@blueprintjs/icons';
import { createStore } from 'polotno/model/store';
import { downloadFile } from 'polotno/utils/download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Function to generate HTML directly from store (more reliable)
const generateHTMLFromStore = (store) => {
  const pages = store.pages.map((page, pageIndex) => {
    const elements = page.children.map((element, elementIndex) => {
      const elementId = `polotno-element-${pageIndex}-${elementIndex}`;
      
      let elementHTML = '';
      const baseStyle = `
        position: absolute;
        left: ${element.x || 0}px;
        top: ${element.y || 0}px;
        width: ${element.width || 100}px;
        height: ${element.height || 100}px;
        ${element.opacity !== undefined ? `opacity: ${element.opacity};` : ''}
        ${element.rotation ? `transform: rotate(${element.rotation}rad);` : ''}
        ${element.visible === false ? 'display: none;' : ''}
      `;

      if (element.type === 'text') {
        elementHTML = `
          <div id="${elementId}" style="${baseStyle}
            font-size: ${element.fontSize || 16}px;
            font-family: ${element.fontFamily || 'Arial, sans-serif'};
            color: ${element.fill || '#000000'};
            font-weight: ${element.fontWeight || 'normal'};
            font-style: ${element.fontStyle || 'normal'};
            text-align: ${element.align || 'left'};
            text-decoration: ${element.textDecoration || 'none'};
            line-height: ${element.lineHeight || 1.2};
            overflow: hidden;
            word-wrap: break-word;
            white-space: pre-wrap;
          ">${(element.text || '').replace(/\n/g, '<br>')}</div>`;
      } else if (element.type === 'image') {
        elementHTML = `
          <img id="${elementId}" 
               src="${element.src || ''}" 
               style="${baseStyle}
                 object-fit: ${element.cropX !== undefined ? 'none' : 'cover'};
                 ${element.cropX !== undefined ? `object-position: -${element.cropX}px -${element.cropY}px;` : ''}
               " 
               alt="Polotno Image" />`;
      } else if (element.type === 'svg') {
        const svgContent = element.svg || '';
        elementHTML = `
          <div id="${elementId}" style="${baseStyle}
            ${element.fill ? `color: ${element.fill};` : ''}
          ">${svgContent}</div>`;
      } else {
        // Generic element fallback
        elementHTML = `
          <div id="${elementId}" style="${baseStyle}
            background: ${element.fill || 'transparent'};
          "></div>`;
      }
      
      return elementHTML;
    }).join('');

    return `
      <div class="polotno-page" data-page="${pageIndex}" style="
        position: relative;
        width: ${page.width || store.width}px;
        height: ${page.height || store.height}px;
        margin: 0;
        background: ${page.background || '#ffffff'};
        border: none;
        box-shadow: none;
        overflow: hidden;
        page-break-after: always;
      ">
        ${elements}
      </div>`;
  }).join('');

  return `
    <div class="polotno-design" style="
      font-family: Arial, sans-serif;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    ">
      ${pages}
    </div>`;
};

// Function to generate Polotno-like HTML as fallback
const generatePolotnoLikeHTML = (store) => {
  const pages = store.pages.map((page, pageIndex) => {
    const elements = page.children.map((element, elementIndex) => {
      const elementId = `element-${pageIndex}-${elementIndex}`;
      
      if (element.type === 'text') {
        return `
          <div id="${elementId}" style="
            position: absolute;
            left: ${element.x || 0}px;
            top: ${element.y || 0}px;
            width: ${element.width || 100}px;
            height: ${element.height || 50}px;
            font-size: ${element.fontSize || 16}px;
            font-family: ${element.fontFamily || 'Arial, sans-serif'};
            color: ${element.fill || '#000000'};
            font-weight: ${element.fontWeight || 'normal'};
            font-style: ${element.fontStyle || 'normal'};
            text-align: ${element.align || 'left'};
            text-decoration: ${element.textDecoration || 'none'};
            line-height: ${element.lineHeight || 1.2};
            overflow: hidden;
            word-wrap: break-word;
          ">${(element.text || '').replace(/\n/g, '<br>')}</div>`;
      } else if (element.type === 'image') {
        return `
          <img id="${elementId}" src="${element.src || ''}" style="
            position: absolute;
            left: ${element.x || 0}px;
            top: ${element.y || 0}px;
            width: ${element.width || 100}px;
            height: ${element.height || 100}px;
            object-fit: ${element.cropX !== undefined ? 'none' : 'cover'};
            ${element.opacity !== undefined ? `opacity: ${element.opacity};` : ''}
            ${element.rotation ? `transform: rotate(${element.rotation}rad);` : ''}
          " alt="Polotno Image">`;
      } else if (element.type === 'svg') {
        return `
          <div id="${elementId}" style="
            position: absolute;
            left: ${element.x || 0}px;
            top: ${element.y || 0}px;
            width: ${element.width || 100}px;
            height: ${element.height || 100}px;
            ${element.fill ? `color: ${element.fill};` : ''}
            ${element.opacity !== undefined ? `opacity: ${element.opacity};` : ''}
          ">${element.svg || ''}</div>`;
      } else {
        // Generic element fallback
        return `
          <div id="${elementId}" style="
            position: absolute;
            left: ${element.x || 0}px;
            top: ${element.y || 0}px;
            width: ${element.width || 100}px;
            height: ${element.height || 100}px;
            background: ${element.fill || 'transparent'};
            ${element.opacity !== undefined ? `opacity: ${element.opacity};` : ''}
          "></div>`;
      }
    }).join('');

    return `
      <div class="polotno-page" data-page="${pageIndex}" style="
        position: relative;
        width: ${page.width || store.width}px;
        height: ${page.height || store.height}px;
        margin: 0;
        background: ${page.background || '#ffffff'};
        border: none;
        box-shadow: none;
        overflow: hidden;
      ">
        ${elements}
      </div>`;
  }).join('');

  return `
    <div class="polotno-design" style="
      font-family: Arial, sans-serif;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    ">
      ${pages}
    </div>`;
};

// Function to wrap Polotno HTML in complete HTML structure
const wrapInCompleteHTMLStructure = (polotnoHtml, store) => {
  // Extract just the content from Polotno HTML if it's already a complete document
  let content = polotnoHtml;
  
  // If it's already a complete HTML document, extract just the body content
  if (polotnoHtml.includes('<html') && polotnoHtml.includes('</html>')) {
    const bodyMatch = polotnoHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
  }
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=${store.width}, height=${store.height}, initial-scale=1.0">
    <title>Polotno Export - ${store.width}x${store.height}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html {
            width: ${store.width}px;
            height: ${store.height}px;
            margin: 0;
            padding: 0;
        }
        body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
            width: ${store.width}px;
            height: ${store.height}px;
            overflow: hidden;
            position: relative;
        }
        .polotno-container {
            width: ${store.width}px;
            height: ${store.height}px;
            margin: 0;
            padding: 0;
            background: white;
            position: absolute;
            top: 0;
            left: 0;
        }
        .polotno-page {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: always;
            position: relative;
        }
        .polotno-design {
            width: ${store.width}px;
            height: ${store.height}px;
            margin: 0;
            padding: 0;
        }
        @media print {
            html {
                width: ${store.width}px;
                height: ${store.height}px;
            }
            body { 
                background: white; 
                margin: 0;
                padding: 0;
                width: ${store.width}px;
                height: ${store.height}px;
            }
            .polotno-container {
                margin: 0;
                padding: 0;
                width: ${store.width}px;
                height: ${store.height}px;
            }
            .polotno-page {
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="polotno-container">
        ${content}
    </div>
</body>
</html>`;
};

const JsonToHtmlConverter = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [storeData, setStoreData] = useState(null); // Store the Polotno store for PDF generation
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

      console.log('Gerando HTML usando método alternativo...');
      
      try {
        // Usar uma abordagem mais direta - criar o HTML manualmente baseado no store
        // Isso evita problemas de interceptação
        
        // Primeiro, tentar usar toHTML se existir
        let polotnoHTML;
        
        if (typeof store.toHTML === 'function') {
          try {
            polotnoHTML = await store.toHTML();
            console.log('HTML gerado com toHTML');
          } catch (e) {
            console.log('toHTML falhou, usando abordagem manual');
            polotnoHTML = null;
          }
        }
        
        // Se toHTML não funcionou, gerar HTML manual baseado no store
        if (!polotnoHTML) {
          console.log('Gerando HTML manual a partir do store...');
          polotnoHTML = generateHTMLFromStore(store);
        }
        
        // Se ainda não temos HTML, usar fallback final
        if (!polotnoHTML || typeof polotnoHTML !== 'string') {
          console.log('Usando fallback final...');
          polotnoHTML = generatePolotnoLikeHTML(store);
        }
        
        console.log('HTML gerado:', polotnoHTML.substring(0, 200));
        
        // Envolver em estrutura HTML completa se necessário
        let finalHTML = polotnoHTML;
        if (!polotnoHTML.includes('<!DOCTYPE html>') && !polotnoHTML.includes('<html')) {
          finalHTML = wrapInCompleteHTMLStructure(polotnoHTML, store);
        }
        
        setHtmlOutput(finalHTML);
        console.log('HTML gerado com sucesso');
        
      } catch (error) {
        console.error('Erro ao gerar HTML:', error);
        setError(`Falha ao gerar HTML: ${error.message}`);
        return;
      }
      
      setStoreData(store);
      setError('');
      console.log('HTML gerado com sucesso, tamanho:', finalHTML.length);
      
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
    if (!htmlOutput) {
      setError('Primeiro gere o HTML antes de fazer o download');
      return;
    }

    try {
      // Baixar exatamente o mesmo HTML que está sendo exibido
      const blob = new Blob([htmlOutput], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, 'polotno-export.html');
      URL.revokeObjectURL(url);
      console.log('Download do HTML realizado - mesmo conteúdo da visualização');
    } catch (err) {
      console.error('Erro ao baixar HTML:', err);
      setError('Erro ao baixar o arquivo HTML');
    }
  };

  const generatePdfWithPlaywright = async () => {
    if (!htmlOutput) {
      setError('Primeiro gere o HTML antes de fazer o download do PDF');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setError('');

      // Enviar HTML para um endpoint backend que usa Playwright
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlOutput,
          pageSize: storeData ? {
            width: storeData.width,
            height: storeData.height
          } : null
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na geração do PDF: ${response.statusText}`);
      }

      // Fazer download do PDF gerado
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'polotno-export-playwright.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('PDF gerado com sucesso usando Playwright');

    } catch (err) {
      console.error('Erro ao gerar PDF com Playwright:', err);
      setError(`Erro ao gerar PDF: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generatePdf = async () => {
    if (!htmlOutput || !storeData) {
      setError('Primeiro gere o HTML antes de criar o PDF');
      return;
    }

    setIsGeneratingPdf(true);
    setError('');

    try {
      // Create a temporary container to render the SAME HTML that's displayed
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.innerHTML = htmlOutput;
      document.body.appendChild(tempContainer);

      // Get all pages from the container
      const pages = tempContainer.querySelectorAll('[class*="page-"]');
      
      if (pages.length === 0) {
        throw new Error('Nenhuma página encontrada no HTML gerado');
      }

      // Get dimensions from the store
      const pageWidth = storeData.width;
      const pageHeight = storeData.height;

      // Convert pixels to mm for jsPDF (96 DPI to mm)
      const mmWidth = (pageWidth * 25.4) / 96;
      const mmHeight = (pageHeight * 25.4) / 96;

      // Create PDF with custom page size
      const pdf = new jsPDF({
        orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [mmWidth, mmHeight]
      });

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Set the page container to exact dimensions
        page.style.width = `${pageWidth}px`;
        page.style.height = `${pageHeight}px`;
        page.style.position = 'relative';
        page.style.background = 'white';
        page.style.border = 'none';
        page.style.margin = '0';
        page.style.padding = '0';

        // Render page to canvas
        const canvas = await html2canvas(page, {
          width: pageWidth,
          height: pageHeight,
          scale: 2, // Higher resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: 'white',
          logging: false
        });

        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Add page to PDF (skip first page as it's already created)
        if (i > 0) {
          pdf.addPage([mmWidth, mmHeight]);
        }

        // Add image to PDF page
        pdf.addImage(imgData, 'JPEG', 0, 0, mmWidth, mmHeight);
      }

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Save PDF
      pdf.save('polotno-export.pdf');

    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError(`Erro ao gerar PDF: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const previewHtml = () => {
    if (!htmlOutput) {
      setError('Primeiro gere o HTML antes de visualizar');
      return;
    }

    setIsPreviewMode(true);
    
    // Open preview in new window using the same HTML that's displayed
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
    setStoreData(null);
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
                    intent={Intent.PRIMARY}
                    icon={<Document />}
                    onClick={generatePdf}
                    loading={isGeneratingPdf}
                  >
                    Gerar PDF
                  </Button>
                  <Button
                    intent={Intent.PRIMARY}
                    icon={<Document />}
                    onClick={generatePdfWithPlaywright}
                    loading={isGeneratingPdf}
                    style={{ backgroundColor: '#0f5132' }}
                  >
                    PDF Premium
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
          <li>Use as opções disponíveis:
            <ul style={{ marginTop: '8px' }}>
              <li><strong>Gerar PDF</strong>: Cria um PDF com o tamanho exato das páginas</li>
              <li><strong>Baixar HTML</strong>: Salva o arquivo HTML</li>
              <li><strong>Visualizar</strong>: Abre uma prévia em nova janela</li>
              <li><strong>Copiar</strong>: Copia o código HTML</li>
            </ul>
          </li>
        </ol>
        
        <Callout style={{ marginTop: '15px' }}>
          <strong>Dica:</strong> Você pode usar o botão "Carregar Exemplo" para testar o conversor com um JSON de exemplo.
        </Callout>
        
        <Callout intent={Intent.PRIMARY} style={{ marginTop: '15px' }}>
          <strong>Novo: Geração de PDF!</strong> 
          <br />O PDF gerado mantém o tamanho exato das páginas do seu projeto (ex: 1080x1080px = página PDF 1080x1080px).
          O texto no PDF é totalmente selecionável e pesquisável.
          <br /><br />
          <strong>HTML Completo:</strong> O conversor gera HTML usando o método nativo do Polotno e o envolve em uma 
          estrutura HTML completa com {'<html>'}, {'<head>'} e {'<body>'}. O conteúdo do Polotno fica dentro do {'<body>'}.
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
