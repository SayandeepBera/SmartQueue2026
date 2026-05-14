import React from 'react';
import FieldError from '../../Hooks/FieldError';
import Label from '../../Hooks/Label';
import FileDropZone from './FileDropZone';

const REQUIRED_DOCS = [
    { id: "reg_cert", label: "Registration Certificate", required: true, desc: "Official certificate of incorporation or registration" },
    { id: "gst", label: "GST Certificate", required: true, desc: "Valid GST registration document" },
    { id: "id_proof", label: "Owner ID Proof", required: true, desc: "Aadhaar / PAN / Passport of authorized person" },
    { id: "address_proof", label: "Address Proof", required: false, desc: "Utility bill or lease agreement" },
    { id: "logo", label: "Organization Logo", required: false, desc: "PNG or SVG logo, min 200×200px" },
];

const FormSlide4 = ({ data, setData, errors }) => {
    const handleFile = (docId, file) => {
        setData({ ...data, docs: { ...data.docs, [docId]: file } });
    };
    
    const handleRemove = (docId) => {
        const updated = { ...data.docs };
        delete updated[docId];
        setData({ ...data, docs: updated });
    };

    const uploaded = Object.keys(data.docs || {}).length;
    const required = REQUIRED_DOCS.filter(d => d.required).length;

    return (
        <div className="step-enter">
            <div className="mb-8">
                <p className="text-[11px] text-teal-400 font-semibold tracking-[2px] uppercase mb-2">Step 4 of 6</p>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'serif', fangsome" }}>Upload documents</h3>
                <p className="text-sm text-white/40">Required for verification. All documents are encrypted and stored securely.</p>
            </div>

            {/* Upload progress */}
            <div className="glass-teal rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ animation: "fadeUp .4s both" }}>
                <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="4" />
                        <circle cx="22" cy="22" r="18" fill="none" stroke="#14b8a6" strokeWidth="4"
                            strokeDasharray={`${(uploaded / REQUIRED_DOCS.length) * 113} 113`} strokeLinecap="round"
                            style={{ transition: "stroke-dasharray .5s ease" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-teal-400">{uploaded}/{REQUIRED_DOCS.length}</div>
                </div>
                <div>
                    <div className="text-sm font-semibold text-white">{uploaded} of {REQUIRED_DOCS.length} documents uploaded</div>
                    <div className="text-[11px] text-white/40 mt-0.5">{required} required · {REQUIRED_DOCS.length - required} optional</div>
                </div>
                {uploaded >= required && (
                    <div className="ml-auto text-xs font-bold text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/20 check-bounce">
                        ✓ Required docs done
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {REQUIRED_DOCS.map((doc, i) => (
                    <div key={doc.id} style={{ animation: `fadeUp .4s ${i * 0.07}s both` }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Label>{doc.label}</Label>
                            {doc.required
                                ? <span className="text-[9px] font-bold text-red-400/80 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/15 uppercase tracking-wider">Required</span>
                                : <span className="text-[9px] font-bold text-white/25 bg-white/4 px-2 py-0.5 rounded-full border border-white/8 uppercase tracking-wider">Optional</span>
                            }
                        </div>
                        <p className="text-[11px] text-white/30 mb-2">{doc.desc}</p>
                        <FileDropZone doc={doc} file={data.docs?.[doc.id]} onFile={handleFile} onRemove={handleRemove} />
                    </div>
                ))}
            </div>

            <div className="mt-5 glass rounded-2xl p-4 flex items-start gap-3">
                <span className="text-lg shrink-0">🔒</span>
                <div>
                    <div className="text-xs font-semibold text-white/70 mb-0.5">Secure document handling</div>
                    <div className="text-[11px] text-white/35 leading-relaxed">All documents are AES-256 encrypted, stored on secure servers, and only accessed by verified SmartQueue reviewers. Files are never shared with third parties.</div>
                </div>
            </div>

            <FieldError msg={errors.docs} />
        </div>
    );
}

export default FormSlide4
