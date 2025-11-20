// src/utils/zipDownload.js
// Utility to create and download a zip file with given files (using JSZip)
import JSZip from "jszip";

export async function downloadZip(files, zipName = "thesis.zip") {
  const zip = new JSZip();
    for (const { name, content } of files) {
      if (!content) continue;

      // If content is a File or Blob, add it as binary
      if (typeof Blob !== "undefined" && content instanceof Blob) {
        zip.file(name, content);
      } else if (content instanceof ArrayBuffer) {
        zip.file(name, content);
      } else if (typeof content === "string") {
        zip.file(name, content);
      } else {
        // try to handle File-like objects (some wrappers)
        try {
          zip.file(name, content);
        } catch (err) {
          // fallback to string coercion
          zip.file(name, String(content));
        }
      }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}
