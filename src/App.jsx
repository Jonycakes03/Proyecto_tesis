import React, { useState } from "react";
import { downloadText } from "./utils/fileDownload.js";
import { buildTex } from "./utils/latexExport.js";

export default function App() {
  // Estado inicial
  const [meta, setMeta] = useState({
    title: "Mi Tesis",
    author: "Johnatan Josue Suarez",
    date: "25 Septiembre 2025",
  });

  const [sections, setSections] = useState([
    { id: "1", title: "Introducción", level: 1, content: "Este es el inicio de la tesis.", children: [] },
    { id: "2", title: "Conclusiones", level: 1, content: "Aquí van las conclusiones.", children: [] },
  ]);

  const [bib, setBib] = useState(`@article{smith2023,
  author = {Smith, Jane},
  title = {Un gran paper},
  journal = {Revista de Ejemplo},
  year = {2023}
}`);  

  // Funciones de exportación
  function exportJSON() {
    downloadText("thesis.json", JSON.stringify({ meta, sections }, null, 2));
  }

  function exportTEX() {
    const tex = buildTex("", { meta, sections });
    downloadText("thesis.tex", tex);
  }

  function exportBIB() {
    downloadText("references.bib", bib);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">Thesis Builder (Demo)</h1>

      <div className="flex gap-4">
        <button onClick={exportJSON} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export JSON
        </button>
        <button onClick={exportTEX} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export TEX
        </button>
        <button onClick={exportBIB} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export BIB
        </button>
      </div>
    </div>
  );
}
