import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  Classes,
  AnchorButton,
} from '@blueprintjs/core';
import { downloadFile } from 'polotno/utils/download';

export const ViewJsonButton = observer(({ store }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [jsonData, setJsonData] = React.useState('');

  const handleViewJson = () => {
    try {
      // Usar exatamente a mesma lógica do botão de download
      const json = store.toJSON();
      
      console.log('JSON data:', json);
      
      if (json) {
        setJsonData(JSON.stringify(json, null, 2));
      } else {
        setJsonData('{"message": "Nenhum design encontrado"}');
      }
      
      setIsOpen(true);
    } catch (error) {
      console.error('Error getting JSON:', error);
      setJsonData(JSON.stringify({
        error: 'Erro ao obter JSON',
        message: error.message
      }, null, 2));
      setIsOpen(true);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonData);
  };

  const handleDownloadJson = () => {
    try {
      const json = store.toJSON();
      const url =
        'data:text/json;base64,' +
        window.btoa(unescape(encodeURIComponent(JSON.stringify(json))));
      downloadFile(url, 'polotno.json');
    } catch (error) {
      console.error('Error downloading JSON:', error);
    }
  };

  return (
    <>
      <Button
        text="Visualizar JSON"
        onClick={handleViewJson}
        minimal
      />
      
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="JSON do Design"
        style={{ width: '90vw', maxWidth: '800px' }}
      >
        <div className={Classes.DIALOG_BODY}>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <AnchorButton 
              text="Copiar JSON" 
              onClick={handleCopyJson}
              small
            />
            <AnchorButton 
              text="Baixar JSON" 
              onClick={handleDownloadJson}
              small
              intent="primary"
            />
          </div>
          <div
            style={{
              background: '#ffffff',
              padding: '15px',
              borderRadius: '4px',
              maxHeight: '60vh',
              overflow: 'auto',
              border: '1px solid #ccc',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: '1.4',
                color: '#2d3748',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'transparent'
              }}
            >
              {jsonData || 'Nenhum dado JSON encontrado'}
            </pre>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
});
