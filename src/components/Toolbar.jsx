import { useState, useCallback, useRef } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Save, FolderOpen,
  FileDown, FileCode, Trash2, Download, Upload, Sun, Moon,
  User, Settings, LogOut, FolderKanban, PanelRightOpen,
} from 'lucide-react';
import useDiagramStore from '../store/useDiagramStore';
import useThemeStore from '../store/useThemeStore';

export default function Toolbar({ reactFlowInstance, onExport, onToggleProperties }) {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef(null);

  const {
    undo, redo, canUndo, canRedo, deleteSelected,
    selectedNodes, selectedEdges, diagramName, setDiagramName,
    getDiagramData, loadDiagram, clearDiagram, isModified,
  } = useDiagramStore();

  const { theme, toggleTheme } = useThemeStore();
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) reactFlowInstance.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) reactFlowInstance.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) reactFlowInstance.fitView({ duration: 300, padding: 0.2 });
  }, [reactFlowInstance]);

  const exportJSON = useCallback(() => {
    const data = getDiagramData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${diagramName || 'diagram'}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    setShowSaveMenu(false);
  }, [getDiagramData, diagramName]);

  const importJSON = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { loadDiagram(JSON.parse(ev.target.result)); } catch { alert('Invalid JSON'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [loadDiagram]);

  const closeAllMenus = () => { setShowSaveMenu(false); setShowProfileMenu(false); };

  const ToolBtn = ({ onClick, disabled, tooltip, children, danger, active }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all relative"
      style={{
        color: disabled ? 'var(--text-4)' : danger ? 'var(--danger)' : active ? 'var(--accent)' : 'var(--text-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        background: active ? 'rgba(168,85,247,0.1)' : 'transparent',
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = active ? 'rgba(168,85,247,0.15)' : 'var(--bg-4)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = active ? 'rgba(168,85,247,0.1)' : 'transparent')}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="mx-2" style={{ width: 1, height: 28, background: 'var(--border-0)' }} />;

  const dropdownStyle = {
    position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: '230px',
    background: 'var(--bg-1)', border: '1px solid var(--border-0)',
    borderRadius: 16, boxShadow: 'var(--shadow-lg)',
    padding: '6px', zIndex: 60,
  };

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
    padding: '10px 14px', fontSize: '13px', borderRadius: 12,
    color: 'var(--text-2)', cursor: 'pointer', border: 'none',
    background: 'transparent', transition: 'all 150ms',
    textAlign: 'left',
  };

  return (
    <div
      className="flex items-center gap-1.5 relative z-20 shrink-0 glass-strong"
      style={{ height: 60, paddingLeft: 20, paddingRight: 20, borderBottom: '1px solid var(--border-0)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mr-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--shadow-glow)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 14v7M14 17.5h7" />
          </svg>
        </div>
        <input
          type="text"
          value={diagramName}
          onChange={(e) => setDiagramName(e.target.value)}
          className="bg-transparent border-none outline-none rounded-xl"
          style={{ fontSize: 15, fontWeight: 600, width: 180, padding: '6px 10px', color: 'var(--text-0)', transition: 'background var(--t-fast)' }}
          onFocus={(e) => (e.target.style.background = 'var(--bg-3)')}
          onBlur={(e) => (e.target.style.background = 'transparent')}
        />
        {isModified && (
          <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: 'var(--warning)' }} />
        )}
      </div>

      <Sep />

      <ToolBtn onClick={undo} disabled={!canUndo()} tooltip="Undo">
        <Undo2 size={15} />
      </ToolBtn>
      <ToolBtn onClick={redo} disabled={!canRedo()} tooltip="Redo">
        <Redo2 size={15} />
      </ToolBtn>

      <Sep />

      <ToolBtn onClick={handleZoomIn} tooltip="Zoom In">
        <ZoomIn size={15} />
      </ToolBtn>
      <ToolBtn onClick={handleZoomOut} tooltip="Zoom Out">
        <ZoomOut size={15} />
      </ToolBtn>
      <ToolBtn onClick={handleFitView} tooltip="Fit View">
        <Maximize size={15} />
      </ToolBtn>

      <Sep />

      <ToolBtn onClick={deleteSelected} disabled={!hasSelection} tooltip="Delete" danger>
        <Trash2 size={15} />
      </ToolBtn>

      <div className="flex-1" />

      {/* Properties toggle */}
      <ToolBtn onClick={onToggleProperties} tooltip="Properties">
        <PanelRightOpen size={15} />
      </ToolBtn>

      <Sep />

      {/* Save */}
      <div className="relative">
        <ToolBtn
          onClick={() => { setShowSaveMenu(!showSaveMenu); setShowProfileMenu(false); }}
          tooltip="File"
          active={showSaveMenu}
        >
          <Save size={15} />
        </ToolBtn>
        {showSaveMenu && (
          <div style={dropdownStyle} className="animate-fade-in">
            <div className="px-3 py-2 mb-1">
              <div className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>File</div>
              <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>Save and load your diagrams</div>
            </div>
            <div style={{ height: 1, background: 'var(--border-0)', margin: '4px 8px' }} />
            <button style={menuItemStyle} onClick={exportJSON}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <FileDown size={14} /> Download JSON
            </button>
            <button style={menuItemStyle} onClick={() => { fileInputRef.current?.click(); setShowSaveMenu(false); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <FolderOpen size={14} /> Import JSON
            </button>
            <div style={{ height: 1, background: 'var(--border-0)', margin: '4px 8px' }} />
            <button
              style={{ ...menuItemStyle, color: 'var(--danger)' }}
              onClick={() => { if (confirm('Clear entire diagram? This cannot be undone.')) { clearDiagram(); setShowSaveMenu(false); } }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <Trash2 size={14} /> New Diagram
            </button>
          </div>
        )}
      </div>

      {/* Export */}
      <ToolBtn onClick={onExport} tooltip="Export">
        <FileDown size={15} />
      </ToolBtn>

      <Sep />

      {/* Theme */}
      <ToolBtn onClick={toggleTheme} tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </ToolBtn>

      {/* Profile */}
      <div className="relative ml-1">
        <button
          onClick={() => { setShowProfileMenu(!showProfileMenu); setShowSaveMenu(false); }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: showProfileMenu ? '0 0 0 2px var(--accent-glow-strong)' : 'none',
          }}
        >
          <User size={14} color="white" />
        </button>
        {showProfileMenu && (
          <div style={dropdownStyle} className="animate-fade-in">
            <div className="px-3 py-2 mb-1">
              <div className="text-xs font-semibold" style={{ color: 'var(--text-0)' }}>Architect</div>
              <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>architect@infrasketch.io</div>
            </div>
            <div style={{ height: 1, background: 'var(--border-0)', margin: '2px 8px' }} />
            <button style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <FolderKanban size={14} /> My Projects
            </button>
            <button style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <Settings size={14} /> Settings
            </button>
            <button style={menuItemStyle} onClick={toggleTheme}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div style={{ height: 1, background: 'var(--border-0)', margin: '2px 8px' }} />
            <button style={{ ...menuItemStyle, color: 'var(--danger)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".json" onChange={importJSON} className="hidden" />

      {(showSaveMenu || showProfileMenu) && (
        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
      )}
    </div>
  );
}
