import React from 'react';
import { createRoot } from 'react-dom/client';
import JsonToHtmlConverter from './json-to-html-converter.jsx';
import './index.css';

// Debug: verificar se o DOM está carregado
console.log('converter-main.jsx carregado');

const container = document.getElementById('converter-root');
console.log('Container encontrado:', container);

if (container) {
  const root = createRoot(container);
  console.log('Root criado, renderizando componente...');
  root.render(<JsonToHtmlConverter />);
} else {
  console.error('Container "converter-root" não encontrado!');
}
