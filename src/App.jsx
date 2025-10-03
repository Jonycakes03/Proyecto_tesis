import React, { useState } from "react";
import { downloadText } from "./utils/fileDownload.js";
import { buildTex } from "./utils/latexExport.js";
import { downloadZip } from "./utils/zipDownload.js";

export default function App() {
  // Estado inicial para meta (Portada)
  const [meta, setMeta] = useState({
    title: "Mi Tesis",
    author: "Johnatan Josue Suarez",
    date: "25 Septiembre 2025",
  });

  // Estado para secciones: Introducción, Capítulos (dinámicos), Conclusiones
  const [intro, setIntro] = useState("");
  const [chapters, setChapters] = useState([
    { id: "ch1", title: "Capítulo 1", content: "" }
  ]);
  const [conclusions, setConclusions] = useState("");

  // BibTeX
  const [bib, setBib] = useState(`@article{smith2023,
  author = {Smith, Jane},
  title = {Un gran paper},
  journal = {Revista de Ejemplo},
  year = {2023}
}`);

  // Construye el arreglo de secciones para exportar
  const sections = [
    { id: "intro", title: "Introducción", level: 1, content: intro },
    {
      id: "chapters",
      title: "Capítulos",
      level: 1,
      children: chapters.map((ch, idx) => ({
        id: ch.id,
        title: ch.title || `Capítulo ${idx + 1}`,
        level: 2,
        content: ch.content || ""
      }))
    },
    { id: "conclusions", title: "Conclusiones", level: 1, content: conclusions }
  ];


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

  async function exportZIP() {
    const tex = buildTex("", { meta, sections });
    await downloadZip([
      { name: "thesis.tex", content: tex },
      { name: "references.bib", content: bib }
    ], "thesis.zip");
  }

  // UI para editar capítulos dinámicamente
  function addChapter() {
    setChapters([...chapters, { id: `ch${chapters.length + 1}`, title: `Capítulo ${chapters.length + 1}`, content: "" }]);
  }
  function removeChapter(idx) {
    setChapters(chapters.filter((_, i) => i !== idx));
  }
  function updateChapter(idx, field, value) {
    setChapters(chapters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-6">Thesis Builder (Demo)</h1>

      {/* Portada (meta) */}
      <div className="bg-white p-4 rounded shadow mb-6 w-full max-w-xl">
        <h2 className="font-semibold mb-2">Portada</h2>
        <input
          className="border p-1 rounded w-full mb-2"
          value={meta.title}
          onChange={e => setMeta({ ...meta, title: e.target.value })}
          placeholder="Título de la tesis"
        />
        <input
          className="border p-1 rounded w-full mb-2"
          value={meta.author}
          onChange={e => setMeta({ ...meta, author: e.target.value })}
          placeholder="Autor"
        />
        <input
          className="border p-1 rounded w-full"
          value={meta.date}
          onChange={e => setMeta({ ...meta, date: e.target.value })}
          placeholder="Fecha"
        />
      </div>

      {/* Introducción */}
      <div className="bg-white p-4 rounded shadow mb-6 w-full max-w-xl">
        <h2 className="font-semibold mb-2">Introducción</h2>
        <textarea
          className="border p-1 rounded w-full min-h-[80px]"
          value={intro}
          onChange={e => setIntro(e.target.value)}
          placeholder="Texto de la introducción"
        />
      </div>

      {/* Capítulos */}
      <div className="bg-white p-4 rounded shadow mb-6 w-full max-w-xl">
        <h2 className="font-semibold mb-2">Capítulos</h2>
        {chapters.map((ch, idx) => (
          <div key={ch.id} className="mb-4 border-b pb-2">
            <input
              className="border p-1 rounded w-full mb-1 font-semibold"
              value={ch.title}
              onChange={e => updateChapter(idx, "title", e.target.value)}
              placeholder={`Título del capítulo ${idx + 1}`}
            />
            <textarea
              className="border p-1 rounded w-full min-h-[60px]"
              value={ch.content}
              onChange={e => updateChapter(idx, "content", e.target.value)}
              placeholder={`Texto del capítulo ${idx + 1}`}
            />
            {chapters.length > 1 && (
              <button
                className="text-red-500 text-xs mt-1"
                onClick={() => removeChapter(idx)}
              >Eliminar capítulo</button>
            )}
          </div>
        ))}
        <button
          className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
          onClick={addChapter}
        >Agregar capítulo</button>
      </div>

      {/* Conclusiones */}
      <div className="bg-white p-4 rounded shadow mb-6 w-full max-w-xl">
        <h2 className="font-semibold mb-2">Conclusiones</h2>
        <textarea
          className="border p-1 rounded w-full min-h-[80px]"
          value={conclusions}
          onChange={e => setConclusions(e.target.value)}
          placeholder="Texto de las conclusiones"
        />
      </div>

      {/* BibTeX */}
      <div className="bg-white p-4 rounded shadow mb-6 w-full max-w-xl">
        <h2 className="font-semibold mb-2">Referencias (BibTeX)</h2>
        <textarea
          className="border p-1 rounded w-full min-h-[80px] font-mono"
          value={bib}
          onChange={e => setBib(e.target.value)}
          placeholder="Pega aquí tus referencias en formato BibTeX"
        />
      </div>

      {/* Botones de exportación */}
      <div className="flex gap-4 mb-8">
        <button onClick={exportJSON} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export JSON
        </button>
        <button onClick={exportTEX} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export TEX
        </button>
        <button onClick={exportBIB} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export BIB
        </button>
        <button onClick={exportZIP} className="px-4 py-2 border rounded bg-white shadow hover:bg-gray-100">
          Export ZIP
        </button>
      </div>
    </div>
  );
}
