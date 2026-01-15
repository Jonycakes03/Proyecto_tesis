import React, { useState, useEffect } from "react";
import { ActionButton } from "./components";
import "./app.css"; // Importamos los estilos que definimos aparte
import { downloadZip } from "./utils/zipDownload";
import { buildTex } from "./utils/latexExport";
import { get, set } from "idb-keyval";
import { fileToBase64, base64ToFile } from "./utils/imageUtils";

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

// --- COMPONENTES INTERNOS DE MODAL ---

const TableModal = ({ onClose, onInsert }) => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [step, setStep] = useState(1); // 1: Config, 2: Data
  const [data, setData] = useState({});

  const handleCellChange = (r, c, val) => {
    setData({ ...data, [`${r}-${c}`]: val });
  };

  const handleInsert = () => {
    onInsert({ rows, cols, data });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Agregar Tabla</h3>
        {step === 1 ? (
          <div className="modal-body">
            <div className="form-group">
              <label>Filas:</label>
              <input type="number" min="1" value={rows} onChange={e => setRows(parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Columnas:</label>
              <input type="number" min="1" value={cols} onChange={e => setCols(parseInt(e.target.value))} />
            </div>
            <div className="modal-actions">
              <button onClick={onClose}>Cancelar</button>
              <button onClick={() => setStep(2)}>Siguiente</button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <div className="table-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: rows * cols }).map((_, idx) => {
                const r = Math.floor(idx / cols);
                const c = idx % cols;
                return (
                  <input
                    key={`${r}-${c}`}
                    placeholder={`(${r + 1},${c + 1})`}
                    value={data[`${r}-${c}`] || ""}
                    onChange={e => handleCellChange(r, c, e.target.value)}
                  />
                );
              })}
            </div>
            <div className="modal-actions">
              <button onClick={() => setStep(1)}>Atrás</button>
              <button onClick={handleInsert}>Insertar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EquationModal = ({ onClose, onInsert }) => {
  const [content, setContent] = useState("");

  const handleInsert = () => {
    onInsert({ content });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Agregar Ecuación</h3>
        <div className="modal-body">
          <textarea
            placeholder="Escribe tu ecuación en LaTeX (ej: E = mc^2)"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            style={{ width: '100%' }}
          />
          <div className="modal-actions">
            <button onClick={onClose}>Cancelar</button>
            <button onClick={handleInsert}>Insertar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReferenceModal = ({ onClose, onInsert }) => {
  const [type, setType] = useState("article");
  const [fields, setFields] = useState({ key: "", author: "", title: "", year: "", journal: "", publisher: "" });

  const handleChange = (field, value) => {
    setFields({ ...fields, [field]: value });
  };

  const handleInsert = () => {
    // Basic BibTeX generation
    let bib = `@${type}{${fields.key || "ref" + Date.now()},\n`;
    if (fields.author) bib += `  author = {${fields.author}},\n`;
    if (fields.title) bib += `  title = {${fields.title}},\n`;
    if (fields.year) bib += `  year = {${fields.year}},\n`;
    if (type === "article" && fields.journal) bib += `  journal = {${fields.journal}},\n`;
    if ((type === "book" || type === "inproceedings") && fields.publisher) bib += `  publisher = {${fields.publisher}},\n`;
    bib += `}`;

    onInsert(bib);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Agregar Referencia</h3>
        <div className="modal-body">
          <div className="form-group">
            <label>Tipo:</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="article">Artículo</option>
              <option value="book">Libro</option>
              <option value="inproceedings">Conferencia</option>
              <option value="misc">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Clave (Citation Key):</label>
            <input placeholder="ej: smith2023" value={fields.key} onChange={e => handleChange("key", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Autor:</label>
            <input placeholder="Autor(es)" value={fields.author} onChange={e => handleChange("author", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Título:</label>
            <input placeholder="Título del trabajo" value={fields.title} onChange={e => handleChange("title", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Año:</label>
            <input type="number" placeholder="Año" value={fields.year} onChange={e => handleChange("year", e.target.value)} />
          </div>

          {type === "article" && (
            <div className="form-group">
              <label>Journal:</label>
              <input placeholder="Nombre de la revista" value={fields.journal} onChange={e => handleChange("journal", e.target.value)} />
            </div>
          )}

          {(type === "book" || type === "inproceedings") && (
            <div className="form-group">
              <label>Publisher:</label>
              <input placeholder="Editorial" value={fields.publisher} onChange={e => handleChange("publisher", e.target.value)} />
            </div>
          )}

          <div className="modal-actions">
            <button onClick={onClose}>Cancelar</button>
            <button onClick={handleInsert}>Insertar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red' }}>
          <h1>Algo salió mal.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  // --- ESTADOS ---
  const [meta, setMeta] = useState({

    title: "Mi Tesis",
    author: "Nombre del autor",
    date: "Fecha de la tesis",
  });

  const [intro, setIntro] = useState("");
  const [chapters, setChapters] = useState([
    { id: "ch1", title: "Capítulo 1", content: "", images: [], tables: [], equations: [] }
  ]);
  const [conclusions, setConclusions] = useState("");
  const [bib, setBib] = useState(`@article{smith2023,\n  author = {Smith, Jane},\n  title = {Un gran paper},\n  journal = {Revista de Ejemplo},\n  year = {2023}\n}`);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'table' | 'equation' | 'reference' | null
  const [activeChapterIdx, setActiveChapterIdx] = useState(null);


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
        images: ch.images || [],
        tables: ch.tables || [],
        equations: ch.equations || []
      }))
    },
    { id: "conclusions", title: "Conclusiones", level: 1, content: conclusions }
  ];

  // --- ACCIONES ---
  // --- EFECTOS DE PERSISTENCIA ---
  const [loading, setLoading] = useState(true);

  // Cargar estado al inicio
  useEffect(() => {
    async function loadState() {
      try {
        const saved = await get('thesis-data');
        if (saved) {
          if (saved.meta) setMeta(saved.meta);
          if (saved.intro) setIntro(saved.intro);
          if (saved.chapters && Array.isArray(saved.chapters)) setChapters(saved.chapters);
          if (saved.conclusions) setConclusions(saved.conclusions);
          if (saved.bib) setBib(saved.bib);
        }
      } catch (err) {
        console.error("Error loading state:", err);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  // Auto-guardado (Debounced 1s)
  useEffect(() => {
    if (loading) return; // No guardar mientras carga

    const timer = setTimeout(() => {
      set('thesis-data', {
        meta,
        intro,
        chapters, // IndexedDB soporta File/Blob nativamente
        conclusions,
        bib
      }).catch(err => console.error("Error auto-saving:", err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [meta, intro, chapters, conclusions, bib, loading]);


  // --- ACCIONES ---
  async function exportJSON() {
    // Para exportar a JSON (texto), necesitamos convertir las imágenes (Blob/File) a Base64
    const chaptersWithBase64 = await Promise.all(chapters.map(async (ch) => {
      const imagesBase64 = await Promise.all((ch.images || []).map(async (im) => ({
        ...im,
        file: null, // No podemos guardar el objeto File en JSON
        base64: await fileToBase64(im.file),
        mimeType: im.file.type || 'image/png' // Guardar tipo para reconstruir
      })));
      return { ...ch, images: imagesBase64 };
    }));

    const exportData = {
      meta,
      intro,
      chapters: chaptersWithBase64,
      conclusions,
      bib,
      version: 1
    };

    downloadText("thesis_backup.json", JSON.stringify(exportData, null, 2));
  }

  async function importJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.meta) setMeta(data.meta);
      if (data.intro) setIntro(data.intro);
      if (data.conclusions) setConclusions(data.conclusions);
      if (data.bib) setBib(data.bib);

      if (data.chapters) {
        // Reconstruir File objects desde Base64
        const reconstructedChapters = data.chapters.map(ch => ({
          ...ch,
          images: (ch.images || []).map(im => ({
            ...im,
            file: base64ToFile(im.base64, im.filename),
            base64: undefined // Limpiar base64 de la memoria activa si no se necesita
          }))
        }));
        setChapters(reconstructedChapters);
      }

      alert("Copia de seguridad restaurada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al importar el archivo JSON.");
    }
  }

  function getExportSections() {
    return [
      { title: "Introducción", level: 1, content: intro, unnumbered: true },
      ...chapters.map(ch => ({
        title: ch.title,
        level: 1,
        content: ch.content,
        images: ch.images,
        tables: ch.tables,
        equations: ch.equations
      })),
      { title: "Conclusiones", level: 1, content: conclusions, unnumbered: true }
    ];
  }

  function exportTEX() {
    const exportSections = getExportSections();
    const tex = buildTex("", { meta, sections: exportSections });
    downloadText("thesis.tex", tex);
  }
  function exportBIB() { downloadText("references.bib", bib); }
  async function exportZIP() {
    const exportSections = getExportSections();
    const tex = buildTex("", { meta, sections: exportSections });
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

  // Table & Equation Helpers
  const openModal = (type, idx) => {
    setActiveModal(type);
    setActiveChapterIdx(idx);
  };
  const closeModal = () => {
    setActiveModal(null);
    setActiveChapterIdx(null);
  };
  const insertTable = (tableData) => {
    if (activeChapterIdx === null) return;
    setChapters(chapters.map((ch, i) => i === activeChapterIdx ? { ...ch, tables: [...(ch.tables || []), { id: Date.now(), ...tableData }] } : ch));
  };
  const insertEquation = (eqData) => {
    if (activeChapterIdx === null) return;
    setChapters(chapters.map((ch, i) => i === activeChapterIdx ? { ...ch, equations: [...(ch.equations || []), { id: Date.now(), ...eqData }] } : ch));
  };
  const removeTable = (idx, id) => { setChapters(chapters.map((ch, i) => i === idx ? { ...ch, tables: ch.tables.filter(x => x.id !== id) } : ch)); };
  const removeEquation = (idx, id) => { setChapters(chapters.map((ch, i) => i === idx ? { ...ch, equations: ch.equations.filter(x => x.id !== id) } : ch)); };

  const insertReference = (bibEntry) => {
    setBib(prev => prev + "\n\n" + bibEntry);
  };


  // Auto-resize para textareas (efecto elástico)
  const handleResize = (e, setter) => {
    setter(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // --- RENDERIZADO ---
  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Cargando tus datos...</div>;
  }

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
          <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Importar</span>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importJSON} />
          </label>
          <ActionButton parentMethod={exportJSON} label="Guardar Backup" />
          <ActionButton parentMethod={exportTEX} label="LaTeX" />
          <ActionButton parentMethod={exportZIP} primary label="Exportar ZIP" />
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
              {ch.images && ch.images.length > 0 && (
                <div className="media-grid">
                  {ch.images.map(im => (
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
              )}

              {/* Lista de Tablas */}
              {ch.tables && ch.tables.length > 0 && (
                <div className="media-list">
                  <h4>Tablas</h4>
                  {ch.tables.map(tbl => (
                    <div key={tbl.id} className="media-item">
                      <span>Tabla ({tbl.rows}x{tbl.cols})</span>
                      <button onClick={() => removeTable(idx, tbl.id)} className="btn-small-danger">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de Ecuaciones */}
              {ch.equations && ch.equations.length > 0 && (
                <div className="media-list">
                  <h4>Ecuaciones</h4>
                  {ch.equations.map(eq => (
                    <div key={eq.id} className="media-item">
                      <code>{eq.content}</code>
                      <button onClick={() => removeEquation(idx, eq.id)} className="btn-small-danger">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}


              {/* Herramientas Flotantes */}
              <div className="hover-toolbar">
                <label className="tool-btn">
                  <span>+ Imagen</span>
                  <input type="file" className="hidden" accept="image/*" style={{ display: 'none' }} onChange={e => addImageToChapter(idx, e.target.files?.[0])} />
                </label>
                <button className="tool-btn" onClick={() => openModal('table', idx)}>+ Tabla</button>
                <button className="tool-btn" onClick={() => openModal('equation', idx)}>+ Ecuación</button>
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
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setActiveModal('reference')}>+ Referencia</button>
            <ActionButton parentMethod={exportBIB} label="Exportar referencias" />
          </div>
        </section>

      </main>

      {/* MODALES */}
      {activeModal === 'table' && <TableModal onClose={closeModal} onInsert={insertTable} />}
      {activeModal === 'equation' && <EquationModal onClose={closeModal} onInsert={insertEquation} />}
      {activeModal === 'reference' && <ReferenceModal onClose={() => setActiveModal(null)} onInsert={insertReference} />}

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}