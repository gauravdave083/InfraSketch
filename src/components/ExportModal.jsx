import { useState, useCallback, useEffect } from 'react';
import { X, FileImage, FileCode, FileText, Download, Monitor, Smartphone, Sparkles } from 'lucide-react';
import useDiagramStore from '../store/useDiagramStore';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const FORMATS = [
  { id: 'png', label: 'PNG', icon: FileImage, ext: '.png' },
  { id: 'svg', label: 'SVG', icon: FileCode, ext: '.svg' },
  { id: 'pdf', label: 'PDF', icon: FileText, ext: '.pdf' },
  { id: 'json', label: 'JSON', icon: FileCode, ext: '.json' },
];

const RESOLUTIONS = [
  { id: '1x', label: '1x', desc: 'Standard', ratio: 1, icon: Smartphone },
  { id: '2x', label: '2x', desc: 'High DPI', ratio: 2, icon: Monitor },
  { id: '4x', label: '4x', desc: 'Ultra HD', ratio: 4, icon: Sparkles },
];

const Toggle = ({ checked, onChange, label }) => (
  <button
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between w-full p-4 rounded-xl transition-all"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
  >
    <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{label}</span>
    <div
      className="relative w-11 h-6 rounded-full transition-all"
      style={{
        background: checked ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' : 'var(--bg-5)',
        boxShadow: checked ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{
          left: checked ? 'calc(100% - 22px)' : '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  </button>
);

export default function ExportModal({ onClose }) {
  const [format, setFormat] = useState('png');
  const [resolution, setResolution] = useState('2x');
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [transparentBg, setTransparentBg] = useState(false);
  const [includeGrid, setIncludeGrid] = useState(false);
  const [fitToContent, setFitToContent] = useState(true);
  const [includeLabels, setIncludeLabels] = useState(true);
  const { diagramName, getDiagramData } = useDiagramStore();

  const getFlowElement = () => document.querySelector('.react-flow__viewport');
  const filterFn = (node) => {
    if (node?.classList?.contains('react-flow__minimap')) return false;
    if (node?.classList?.contains('react-flow__controls')) return false;
    return true;
  };

  useEffect(() => {
    setFileName(`${diagramName || 'Untitled Diagram'}${FORMATS.find(f => f.id === format)?.ext || '.png'}`);
  }, [diagramName, format]);

  useEffect(() => {
    const el = getFlowElement();
    if (!el) return;
    toPng(el, { backgroundColor: '#0B0F19', pixelRatio: 0.5, filter: filterFn })
      .then(setPreview)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const resRatio = RESOLUTIONS.find((r) => r.id === resolution)?.ratio || 2;

  const doExport = useCallback(async () => {
    setExporting(true);
    const el = getFlowElement();
    const bgColor = transparentBg ? 'transparent' : '#0B0F19';
    try {
      if (format === 'json') {
        const data = getDiagramData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = fileName;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'svg') {
        const dataUrl = await toSvg(el, { backgroundColor: bgColor, filter: filterFn });
        const a = document.createElement('a');
        a.download = fileName;
        a.href = dataUrl;
        a.click();
      } else if (format === 'png') {
        const dataUrl = await toPng(el, { backgroundColor: bgColor, pixelRatio: resRatio, filter: filterFn });
        const a = document.createElement('a');
        a.download = fileName;
        a.href = dataUrl;
        a.click();
      } else if (format === 'pdf') {
        const dataUrl = await toPng(el, { backgroundColor: bgColor, pixelRatio: resRatio, filter: filterFn });
        const img = new window.Image();
        img.src = dataUrl;
        await new Promise((r) => (img.onload = r));
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width / resRatio, img.height / resRatio],
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / resRatio, img.height / resRatio);
        pdf.save(fileName);
      }
      setTimeout(() => onClose(), 400);
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  }, [format, resolution, resRatio, fileName, transparentBg, getDiagramData, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="p-0"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '800px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-0)' }}>
              Export Diagram
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              Choose format and resolution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-3)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="px-8 pt-8">
          <div
            className="w-full rounded-2xl overflow-hidden flex items-center justify-center relative"
            style={{
              height: '250px',
              background: '#0B0F19',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-4)' }}>
                Generating preview...
              </span>
            )}
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-medium"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                color: 'var(--text-2)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Preview
            </div>
          </div>
        </div>

        {/* Format */}
        <div className="px-8 pt-8">
          <label className="text-[11px] font-bold uppercase tracking-wider mb-4 block" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            Format
          </label>
          <div className="grid grid-cols-4 gap-4">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl transition-all"
                  style={{
                    height: '52px',
                    background: active ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                    color: active ? 'white' : 'var(--text-2)',
                    boxShadow: active ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
                    transform: active ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="text-xs font-semibold">{f.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution (only for PNG/PDF) */}
        {(format === 'png' || format === 'pdf') && (
          <div className="px-8 pt-8">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-4 block" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-4">
              {RESOLUTIONS.map((r) => {
                const Icon = r.icon;
                const active = resolution === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id)}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl transition-all"
                    style={{
                      height: '72px',
                      background: active ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                      color: active ? '#7c3aed' : 'var(--text-2)',
                      boxShadow: active ? '0 0 16px rgba(124,58,237,0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  >
                    <Icon size={18} />
                    <div className="text-center">
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Options */}
        {(format === 'png' || format === 'svg' || format === 'pdf') && (
          <div className="px-8 pt-8">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-4 block" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
              Options
            </label>
            <div className="space-y-3">
              <Toggle checked={transparentBg} onChange={setTransparentBg} label="Transparent background" />
              <Toggle checked={includeGrid} onChange={setIncludeGrid} label="Include grid" />
              <Toggle checked={fitToContent} onChange={setFitToContent} label="Fit to content" />
              <Toggle checked={includeLabels} onChange={setIncludeLabels} label="Include labels" />
            </div>
          </div>
        )}

        {/* File Name */}
        <div className="px-8 pt-8">
          <label className="text-[11px] font-bold uppercase tracking-wider mb-4 block" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl text-sm transition-all outline-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-0)',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
              e.target.style.borderColor = '#7c3aed';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.03)';
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-8 py-6 mt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-2)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={doExport}
            disabled={exporting}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: exporting ? 'var(--text-4)' : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
              boxShadow: exporting ? 'none' : '0 0 20px rgba(124,58,237,0.4)',
              cursor: exporting ? 'wait' : 'pointer',
              transform: exporting ? 'scale(1)' : 'scale(1)',
            }}
            onMouseEnter={(e) => !exporting && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {exporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download size={16} />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
