// src/utils/fileDownload.js
/**
 * Download plain text content as a file on the client.
 * @param {string} filename The file name to use for the download.
 * @param {string} text The text content to save.
 */
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
