import { useState } from "react";
import { ActionButton } from "./components";
import "./app.css"; // Importamos los estilos que definimos aparte
import { downloadZip } from "./utils/zipDownload";

// --- FUNCIONES DE UTILIDAD (Internas para evitar errores de importación) ---

const downloadText = (filename, content) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const buildTex = (preamble, { meta, sections }) => {
  let tex = `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{graphicx}\n\\title{${meta.title}}\n\\author{${meta.author}}\n\\date{${meta.date}}\n\\begin{document}\n\\maketitle\n\n`;

  sections.forEach(section => {
    if (section.id === 'intro') {
      tex += `\\section*{${section.title}}\n${section.content}\n\n`;
    } else if (section.id === 'chapters') {
      section.children.forEach(ch => {
        tex += `\\section{${ch.title}}\n${ch.content}\n\n`;
        if (ch.images && ch.images.length > 0) {
          ch.images.forEach(img => {
            tex += `\\begin{figure}[h]\n\\centering\n% \\includegraphics[width=0.8\\textwidth]{images/${img.filename}}\n\\caption{${img.caption || img.filename}}\n\\end{figure}\n\n`;
          });
        }
      });
    } else if (section.id === 'conclusions') {
      tex += `\\section*{${section.title}}\n${section.content}\n\n`;
    }
  });
  tex += `\\end{document}`;
  return tex;
};

export default function App() {
  // --- ESTADOS ---
  const [meta, setMeta] = useState({
    title: "Mi Tesis",
    author: "Johnatan Josue Suarez",
    date: "25 Septiembre 2025",
  });

  const [intro, setIntro] = useState("");
  const [chapters, setChapters] = useState([
    { id: "ch1", title: "Capítulo 1", content: "", images: [], tables: [], equations: [] }
  ]);
  const [conclusions, setConclusions] = useState("");
  const [bib, setBib] = useState(`@article{smith2023,\n  author = {Smith, Jane},\n  title = {Un gran paper},\n  journal = {Revista de Ejemplo},\n  year = {2023}\n}`);

  // Estructura lógica para exportar
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
        content: ch.content || "",
        images: ch.images || []
      }))
    },
    { id: "conclusions", title: "Conclusiones", level: 1, content: conclusions }
  ];

  // --- ACCIONES ---
  function exportJSON() { downloadText("thesis.json", JSON.stringify({ meta, sections }, null, 2)); }
  function exportTEX() { const tex = buildTex("", { meta, sections }); downloadText("thesis.tex", tex); }
  function exportBIB() { downloadText("references.bib", bib); }
  async function exportZIP() {
    const tex = buildTex("", { meta, sections });
    // Prefix image filenames with "images/" so they go into that folder in the zip
    const imageFiles = chapters.flatMap(ch => (ch.images || []).map(im => ({ name: `images/${im.filename}`, content: im.file })));
    const toZip = [{ name: "thesis.tex", content: tex }, { name: "references.bib", content: bib }, ...imageFiles];
    await downloadZip(toZip, "thesis.zip");
  }

  // --- HELPERS DE EDICIÓN ---
  const addChapter = () => setChapters([...chapters, { id: `ch${chapters.length + 1}`, title: `Capítulo ${chapters.length + 1}`, content: "", images: [], tables: [], equations: [] }]);
  const removeChapter = (idx) => setChapters(chapters.filter((_, i) => i !== idx));
  const updateChapter = (idx, field, value) => setChapters(chapters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch));

  const updateItemMeta = (type, idx, itemId, field, value) => {
    setChapters(chapters.map((ch, i) => i === idx ? {
      ...ch,
      [type]: (ch[type] || []).map(item => item.id === itemId ? { ...item, [field]: value } : item)
    } : ch));
  };

  function addImageToChapter(idx, file) {
    if (!file) return;
    setChapters(chapters.map((ch, i) => i === idx ? { ...ch, images: [...(ch.images || []), { id: Date.now(), file, filename: file.name, caption: "", width: "" }] } : ch));
  }
  function removeImageFromChapter(idx, id) { setChapters(chapters.map((ch, i) => i === idx ? { ...ch, images: ch.images.filter(x => x.id !== id) } : ch)); }

  // Auto-resize para textareas (efecto elástico)
  const handleResize = (e, setter) => {
    setter(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // --- RENDERIZADO ---
  return (
    <div className="app-container">

      {/* Barra de Navegación */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-name">Thesis Builder</span>
          <span className="brand-separator">/</span>
          <span className="document-title">{meta.title || "Sin título"}</span>
        </div>
        <div className="nav-actions">
          <ActionButton parentMethod={exportJSON} label="JSON" />
          <ActionButton parentMethod={exportTEX} label="LaTeX" />
          <ActionButton parentMethod={exportZIP} primary label="Exportar" />
        </div>
      </nav>

      {/* Área Principal de Edición */}
      <main className="editor-main">

        {/* Bloque: Portada */}
        <div className="section-block">
          <input
            className="input-ghost input-h1"
            value={meta.title}
            onChange={e => setMeta({ ...meta, title: e.target.value })}
            placeholder="Título de la Tesis"
          />

          <div className="meta-group">
            <div className="meta-item">
              <span className="label-small">Autor</span>
              <input
                className="input-ghost input-meta"
                value={meta.author}
                onChange={e => setMeta({ ...meta, author: e.target.value })}
                placeholder="Tu Nombre"
              />
            </div>
            <div className="meta-item">
              <span className="label-small">Fecha</span>
              <input
                className="input-ghost input-meta"
                value={meta.date}
                onChange={e => setMeta({ ...meta, date: e.target.value })}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>
        </div>

        {/* Bloque: Introducción */}
        <section className="section-block">
          <div className="section-header">
            <h2 className="label-small">Introducción</h2>
          </div>
          <textarea
            className="input-ghost textarea-content"
            value={intro}
            onChange={e => handleResize(e, setIntro)}
            placeholder="Escribe una introducción..."
          />
        </section>

        {/* Bloque: Capítulos */}
        <div className="section-block">
          {chapters.map((ch, idx) => (
            <section key={ch.id} className="chapter-block">

              <div className="chapter-title-row">
                <input
                  className="input-ghost input-h1"
                  style={{ fontSize: '2rem', marginBottom: 0 }}
                  value={ch.title}
                  onChange={e => updateChapter(idx, "title", e.target.value)}
                  placeholder="Título del Capítulo"
                />
                <button onClick={() => removeChapter(idx)} className="btn btn-danger">
                  Eliminar
                </button>
              </div>

              <textarea
                className="input-ghost textarea-content"
                value={ch.content}
                onChange={e => {
                  updateChapter(idx, "content", e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="Empieza a escribir..."
              />

              {/* Grid de Imágenes */}
              <div className="media-grid">
                {ch.images?.map(im => (
                  <div key={im.id} className="image-card">
                    <span className="label-small">{im.filename}</span>
                    <button
                      onClick={() => removeImageFromChapter(idx, im.id)}
                      className="btn-close-card"
                    >×</button>
                    <input
                      className="input-ghost caption-input"
                      value={im.caption}
                      onChange={e => updateItemMeta('images', idx, im.id, 'caption', e.target.value)}
                      placeholder="Escribe un pie de foto..."
                    />
                  </div>
                ))}
              </div>

              {/* Herramientas Flotantes */}
              <div className="hover-toolbar">
                <label className="tool-btn">
                  <span>+ Imagen</span>
                  <input type="file" className="hidden" accept="image/*" style={{ display: 'none' }} onChange={e => addImageToChapter(idx, e.target.files?.[0])} />
                </label>
                <button className="tool-btn">+ Tabla</button>
                <button className="tool-btn">+ Ecuación</button>
              </div>
            </section>
          ))}

          <button onClick={addChapter} className="btn-add-large">
            <span style={{ fontSize: '1.5rem' }}>+</span>
            <span style={{ fontWeight: 500 }}>Agregar nuevo capítulo</span>
          </button>
        </div>

        {/* Bloque: Conclusiones */}
        <section className="section-block">
          <div className="section-header">
            <h2 className="label-small">Conclusiones</h2>
          </div>
          <textarea
            className="input-ghost textarea-content"
            value={conclusions}
            onChange={e => handleResize(e, setConclusions)}
            placeholder="Escribe las conclusiones..."
          />
        </section>

        {/* Bloque: Referencias */}
        <section className="section-block" style={{ marginBottom: 0 }}>
          <div className="section-header">
            <h2 className="label-small">Referencias (BibTeX)</h2>
          </div>
          <textarea
            className="input-ghost textarea-content textarea-mono"
            value={bib}
            onChange={e => setBib(e.target.value)}
            placeholder="Pega aquí tus referencias..."
          />
          <div style={{ marginTop: '1rem' }}>
            <ActionButton parentMethod={exportBIB} label="Exportar referencias" />
          </div>
        </section>

      </main>
    </div>
  );
}