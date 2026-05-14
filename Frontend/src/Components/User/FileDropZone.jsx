import React, { useState, useRef, useCallback } from 'react'

const FileDropZone = ({ doc, file, onFile, onRemove }) => {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef();

    // Handle file dropped into the drop zone
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];

        if (f) {
            onFile(doc.id, f);

            if (inputRef.current) {
                inputRef.current.value = null; // reset input to allow re-uploading the same file if needed
            }
        }

    }, [doc.id, onFile]);

    // Handle file selection via the file input
    const handleChange = (e) => {
        if (e.target.files[0]) {
            onFile(doc.id, e.target.files[0]);

            e.target.value = null; // reset input to allow re-uploading the same file if needed
        }
    };

    // Format file size for display
    const formatSize = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    return (
        <div
            className={`rounded-2xl border-2 border-dashed transition-all duration-200 ${drag ? "drop-zone-active scale-[1.01]" : ""}`}
            style={{ borderColor: file ? "rgba(20,184,166,0.5)" : drag ? "rgba(20,184,166,0.6)" : "rgba(255,255,255,0.1)", background: file ? "rgba(20,184,166,0.05)" : drag ? "rgba(20,184,166,0.04)" : "rgba(255,255,255,0.02)" }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
        >
            <input ref={inputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.svg" onChange={handleChange} />

            {file ? (
                <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-teal-500/15 border border-teal-500/25">
                        {file.name.endsWith(".pdf") ? "📄" : "🖼️"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                        <p className="text-[11px] text-white/35 mt-0.5 font-mono">{formatSize(file.size)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-teal-400 font-bold bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">Uploaded ✓</span>
                        <button onClick={() => {
                            onRemove(doc.id);

                            if (inputRef.current) {
                                inputRef.current.value = null; // reset file input to allow re-uploading the same file if needed
                            }
                        }
                        }
                            className="w-7 h-7 rounded-full bg-red-400/10 border border-red-400/20 text-red-400 text-xs flex items-center justify-center hover:bg-red-400/20 transition-all cursor-pointer">
                            ✕
                        </button>
                    </div>
                </div>
            ) : (
                <button className="w-full p-5 flex flex-col items-center gap-2 cursor-pointer" onClick={() => inputRef.current?.click()}>
                    <div className="w-10 h-10 rounded-xl bg-white/4 border border-white/10 flex items-center justify-center text-xl">
                        {drag ? "⬇️" : "📎"}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-white/70">
                            {drag ? "Drop it here!" : "Click or drag to upload"}
                        </p>
                        <p className="text-[11px] text-white/30 mt-0.5">PDF, JPG, PNG — max 5 MB</p>
                    </div>
                </button>
            )}
        </div>
    );
}

export default FileDropZone
