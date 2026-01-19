import { useState, useEffect } from "react";
import { 
  Book, 
  Download, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  FileText, 
  Save, 
  Type, 
  Calendar, 
  User,
  Quote,
  Layout,
  X
} from "lucide-react";

// --- EXTERNAL LIBRARIES LOADER (JSZip & FileSaver) ---
// Cargamos estas librerías dinámicamente para permitir la exportación ZIP sin npm install
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// --- UTILS ---

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
  let tex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\title{${meta.title}}
\\author{${meta.author}}
\\date{${meta.date}}

\\begin{document}

\\maketitle

`;

  sections.forEach(section => {
    if (section.id === 'intro') {
      tex += `\\section*{${section.title}}\n${section.content}\n\n`;
    } else if (section.id === 'chapters') {
      section.children.forEach(ch => {
        tex += `\\section{${ch.title}}\n${ch.content}\n\n`;
        if (ch.images && ch.images.length > 0) {
          ch.images.forEach(img => {
            tex += `\\begin{figure}[h]
\\centering
% \\includegraphics[width=0.8\\textwidth]{images/${img.filename}}
\\caption{${img.caption || img.filename}}
\\end{figure}\n\n`;
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

export default function ThesisBuilderPro() {
  // --- STATE ---
  const [loadingLibs, setLoadingLibs] = useState(true);
  const [meta, setMeta] = useState({
    title: "Mi Tesis Increíble",
    author: "Tu Nombre Aquí",
    date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
  });

  const [intro, setIntro] = useState("");
  const [chapters, setChapters] = useState([
    { id: "ch1", title: "Capítulo 1", content: "", images: [] }
  ]);
  const [conclusions, setConclusions] = useState("");
  const [bib, setBib] = useState(`@article{ejemplo2025,
  author = {Apellido, Nombre},
  title = {Título del Artículo},
  journal = {Revista Científica},
  year = {2025}
}`);

  // Cargar dependencias para ZIP
  useEffect(() => {
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js")
    ]).then(() => setLoadingLibs(false)).catch(e => console.error("Error loading libs", e));
  }, []);

  // --- ACTIONS ---
  
  // Estructura lógica para exportar
  const getSections = () => [
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

  const exportJSON = () => downloadText("thesis_data.json", JSON.stringify({ meta, sections: getSections(), bib }, null, 2));
  
  const exportTEX = () => {
    const tex = buildTex("", { meta, sections: getSections() });
    downloadText("main.tex", tex);
  };
  
  const exportBIB = () => downloadText("references.bib", bib);

  const exportZIP = async () => {
    if (loadingLibs || !window.JSZip) {
      alert("Las librerías de compresión aún se están cargando. Intenta de nuevo en unos segundos.");
      return;
    }

    const zip = new window.JSZip();
    const tex = buildTex("", { meta, sections: getSections() });
    
    // Add text files
    zip.file("main.tex", tex);
    zip.file("references.bib", bib);
    
    // Add images folder
    const imgFolder = zip.folder("images");
    chapters.forEach(ch => {
      if (ch.images) {
        ch.images.forEach(img => {
          if (img.file) {
            imgFolder.file(img.filename, img.file);
          }
        });
      }
    });

    // Generate zip
    const content = await zip.generateAsync({ type: "blob" });
    window.saveAs(content, "Mi_Proyecto_Tesis.zip");
  };

  // --- CHAPTER HELPERS ---
  const addChapter = () => setChapters([...chapters, { id: `ch${Date.now()}`, title: `Nuevo Capítulo`, content: "", images: [] }]);
  
  const removeChapter = (idx) => {
    if (confirm("¿Estás seguro de eliminar este capítulo?")) {
      setChapters(chapters.filter((_, i) => i !== idx));
    }
  };

  const updateChapter = (idx, field, value) => {
    const newChapters = [...chapters];
    newChapters[idx][field] = value;
    setChapters(newChapters);
  };

  const addImageToChapter = (idx, file) => {
    if (!file) return;
    const newChapters = [...chapters];
    // Create object URL for preview
    const previewUrl = URL.createObjectURL(file);
    
    newChapters[idx].images.push({ 
      id: Date.now(), 
      file, 
      filename: file.name, 
      caption: "",
      preview: previewUrl 
    });
    setChapters(newChapters);
  };

  const removeImage = (chIdx, imgId) => {
    const newChapters = [...chapters];
    newChapters[chIdx].images = newChapters[chIdx].images.filter(x => x.id !== imgId);
    setChapters(newChapters);
  };

  const updateImageCaption = (chIdx, imgId, caption) => {
    const newChapters = [...chapters];
    const img = newChapters[chIdx].images.find(x => x.id === imgId);
    if (img) img.caption = caption;
    setChapters(newChapters);
  };

  // Auto-resize textarea
  const adjustHeight = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800 pb-20">
      {/* Import Google Sans-like font (Outfit) */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
      body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
            <Book className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">Thesis Builder</h1>
            <p className="text-xs text-slate-500 font-medium">Editor Profesional</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-1 mr-4 border-r border-slate-200 pr-4">
            <ExportButton icon={<FileText size={16}/>} label="JSON" onClick={exportJSON} />
            <ExportButton icon={<Quote size={16}/>} label="BibTeX" onClick={exportBIB} />
            <ExportButton icon={<Type size={16}/>} label="LaTeX" onClick={exportTEX} />
          </div>
          <button 
            onClick={exportZIP}
            disabled={loadingLibs}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span>{loadingLibs ? "Cargando..." : "Descargar ZIP"}</span>
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto mt-10 px-4 sm:px-6">
        
        {/* DOCUMENT PAGE EFFECT */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[80vh] overflow-hidden">
          
          {/* HEADER SECTION (Cover) */}
          <header className="bg-gradient-to-b from-slate-50 to-white px-8 md:px-16 pt-16 pb-12 border-b border-slate-100">
            <input
              className="w-full text-5xl md:text-6xl font-bold text-slate-900 placeholder:text-slate-300 bg-transparent outline-none mb-8 tracking-tight"
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              placeholder="Título de la Tesis"
            />
            
            <div className="flex flex-wrap gap-8 text-slate-500">
              <div className="flex items-center gap-2 group">
                <User size={18} className="text-indigo-500 group-hover:text-indigo-600" />
                <input
                  className="bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400 focus:text-indigo-700 min-w-[200px]"
                  value={meta.author}
                  onChange={(e) => setMeta({ ...meta, author: e.target.value })}
                  placeholder="Nombre del Autor"
                />
              </div>
              <div className="flex items-center gap-2 group">
                <Calendar size={18} className="text-indigo-500 group-hover:text-indigo-600" />
                <input
                  className="bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400 focus:text-indigo-700"
                  value={meta.date}
                  onChange={(e) => setMeta({ ...meta, date: e.target.value })}
                  placeholder="Fecha"
                />
              </div>
            </div>
          </header>

          {/* CONTENT BODY */}
          <div className="px-8 md:px-16 py-12 space-y-16">
            
            {/* INTRODUCTION */}
            <SectionBlock title="Introducción" icon={<Layout size={20} />}>
              <AutoTextArea
                value={intro}
                onChange={(e) => {
                  setIntro(e.target.value);
                  adjustHeight(e);
                }}
                placeholder="Escribe una introducción memorable aquí..."
              />
            </SectionBlock>

            {/* CHAPTERS */}
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Book size={16} /> Capítulos
                </h2>
              </div>

              {chapters.map((ch, idx) => (
                <div key={ch.id} className="group relative pl-6 border-l-2 border-slate-200 hover:border-indigo-300 transition-colors duration-300">
                  
                  {/* Chapter Header */}
                  <div className="flex items-start justify-between mb-4">
                    <input
                      className="text-3xl font-bold text-slate-800 placeholder:text-slate-300 bg-transparent outline-none w-full"
                      value={ch.title}
                      onChange={(e) => updateChapter(idx, "title", e.target.value)}
                      placeholder="Título del Capítulo"
                    />
                    <button 
                      onClick={() => removeChapter(idx)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar capítulo"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Chapter Content */}
                  <AutoTextArea
                    value={ch.content}
                    onChange={(e) => {
                      updateChapter(idx, "content", e.target.value);
                      adjustHeight(e);
                    }}
                    placeholder="Empieza a desarrollar tu capítulo..."
                    className="min-h-[120px] text-lg leading-relaxed text-slate-700"
                  />

                  {/* Media Grid */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ch.images.map((img) => (
                      <div key={img.id} className="relative group/card bg-slate-50 rounded-xl border border-slate-100 p-3 flex gap-3 items-center hover:shadow-md transition-all">
                        <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                          {img.preview ? (
                            <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={24}/></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-500 truncate mb-1">{img.filename}</p>
                          <input
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm text-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            value={img.caption}
                            onChange={(e) => updateImageCaption(idx, img.id, e.target.value)}
                            placeholder="Añadir pie de foto..."
                          />
                        </div>
                        <button 
                          onClick={() => removeImage(idx, img.id)}
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Image Button */}
                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                      <ImageIcon size={16} />
                      <span>Añadir Imagen</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => addImageToChapter(idx, e.target.files?.[0])} 
                      />
                    </label>
                  </div>
                </div>
              ))}

              {/* Add Chapter Button */}
              <button 
                onClick={addChapter}
                className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="bg-slate-100 group-hover:bg-indigo-100 p-2 rounded-full transition-colors">
                  <Plus size={20} />
                </div>
                Agregar nuevo capítulo
              </button>
            </div>

            {/* CONCLUSIONS */}
            <SectionBlock title="Conclusiones" icon={<Save size={20} />}>
              <AutoTextArea
                value={conclusions}
                onChange={(e) => {
                  setConclusions(e.target.value);
                  adjustHeight(e);
                }}
                placeholder="Resume tus hallazgos principales..."
              />
            </SectionBlock>

            {/* REFERENCES */}
            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Quote size={16} /> Referencias (BibTeX)
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                <textarea
                  className="w-full bg-transparent border-none outline-none font-mono text-sm text-slate-600 h-32 resize-y"
                  value={bib}
                  onChange={(e) => setBib(e.target.value)}
                  placeholder="@article{...}"
                  spellCheck={false}
                />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function SectionBlock({ title, icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4 text-indigo-600">
        {icon}
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AutoTextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full bg-transparent border-none outline-none resize-none text-lg text-slate-700 placeholder:text-slate-300 leading-relaxed ${className}`}
      onInput={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      rows={1}
      {...props}
    />
  );
}

function ExportButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}