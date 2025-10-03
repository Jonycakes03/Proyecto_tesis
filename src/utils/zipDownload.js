// src/utils/zipDownload.js
// Utility to create and download a zip file with given files (using JSZip)
import JSZip from "jszip";

export async function downloadZip(files, zipName = "thesis.zip") {
  const zip = new JSZip();
  for (const { name, content } of files) {
    zip.file(name, content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}
