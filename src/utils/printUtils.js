/**
 * Senior Engineering Hidden-Iframe Print Subsystem
 * Eliminates popup blockers, background DOM leaks, blank pages, and Chrome visibility traps.
 */
export const printElementById = (elementId, title = 'Document') => {
  const printEl = document.getElementById(elementId);
  if (!printEl) {
    window.print();
    return;
  }

  // Remove existing iframe if present
  let iframe = document.getElementById('pharma-print-iframe');
  if (iframe) {
    iframe.remove();
  }

  // Create an invisible same-origin iframe
  iframe = document.createElement('iframe');
  iframe.id = 'pharma-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 5mm 6mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            color: #000000 !important;
            font-family: Arial, sans-serif;
          }
          html, body {
            background: #FFFFFF !important;
            width: 100%;
            height: auto;
            font-size: 9.5pt;
            line-height: 1.35;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            color: #000000 !important;
          }
          .no-print, button, .btn {
            display: none !important;
          }
        </style>
      </head>
      <body style="padding: 0; margin: 0; background: #FFFFFF;">
        ${printEl.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Iframe print error, falling back to window.print():', err);
      window.print();
    }
  }, 250);
};
