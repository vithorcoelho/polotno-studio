import { chromium } from 'playwright';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Endpoint para gerar PDF com Playwright
app.post('/api/generate-pdf', async (req, res) => {
  let browser;
  
  try {
    const { html, pageSize } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML é obrigatório' });
    }

    console.log('Iniciando geração de PDF com Playwright...');
    
    // Iniciar browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Se temos dimensões específicas, configurar viewport exato
    if (pageSize && pageSize.width && pageSize.height) {
      // Arredondar dimensões para valores inteiros (Playwright não aceita decimais)
      const roundedWidth = Math.round(pageSize.width);
      const roundedHeight = Math.round(pageSize.height);
      
      await page.setViewportSize({
        width: roundedWidth,
        height: roundedHeight
      });
      
      console.log(`Viewport configurado: ${roundedWidth}x${roundedHeight}px (original: ${pageSize.width}x${pageSize.height})`);
    }
    
    // Definir conteúdo HTML
    await page.setContent(html, { 
      waitUntil: 'networkidle' 
    });
    
    // Aguardar um pouco para garantir que tudo carregou
    await page.waitForTimeout(1000);
    
    // Debug: Verificar se o conteúdo foi carregado corretamente
    const bodyDimensions = await page.evaluate(() => {
      const body = document.body;
      return {
        width: body.offsetWidth,
        height: body.offsetHeight,
        scrollWidth: body.scrollWidth,
        scrollHeight: body.scrollHeight
      };
    });
    
    console.log('Dimensões do body:', bodyDimensions);
    console.log('Dimensões esperadas:', pageSize);
    
    // Configurações do PDF
    const pdfOptions = {
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: false
    };
    
    // Se temos dimensões específicas, usar elas
    if (pageSize && pageSize.width && pageSize.height) {
      // Para PDF, usar dimensões originais (com decimais) para máxima precisão
      pdfOptions.width = `${pageSize.width}px`;
      pdfOptions.height = `${pageSize.height}px`;
      console.log(`Configurando PDF com dimensões precisas: ${pageSize.width}x${pageSize.height}px`);
    } else {
      // Fallback para A4 se não tiver dimensões
      pdfOptions.format = 'A4';
    }
    
    // Gerar PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    console.log('PDF gerado com sucesso, tamanho:', pdfBuffer.length);
    
    // Retornar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="polotno-export.pdf"');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      message: error.message 
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PDF Generator' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor PDF Generator rodando na porta ${PORT}`);
});

export default app;
