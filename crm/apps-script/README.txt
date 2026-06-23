Quatro Folhas - CRM v1 (Google Sheets + Apps Script)

Objetivo
- Receber leads do site (WhatsApp + consentimento LGPD) e salvar em uma planilha.

1) Criar a planilha
1. Abra o Google Drive
2. Crie uma planilha: "Leads Quatro Folhas"

2) Criar o Apps Script
1. Na planilha: Extensoes -> Apps Script
2. Apague o conteudo do arquivo existente e cole o conteudo de:
   quatro-site/crm/apps-script/Code.gs
3. Salve

3) Publicar como Web App (API)
1. Deploy -> New deployment
2. Select type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. Copie a "Web app URL"

4) Ligar o site ao endpoint
1. Abra:
   quatro-site/script.js
2. Procure a constante:
   CRM_OPTIN_ENDPOINT
3. Cole a URL do Web App.

Dados gravados na aba "leads"
- createdAt (data/hora do registro)
- whatsapp (somente digitos)
- page (pagina de origem)
- userAgent (navegador)
- ts (timestamp do navegador, ISO)

Observacao importante (CORS)
- O site envia usando navigator.sendBeacon (sem ler resposta), para evitar bloqueios de CORS.

