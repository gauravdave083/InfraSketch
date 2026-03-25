import { useState, useEffect, useMemo } from 'react';
import { X, Palette, Type, Zap, Tag, Link2, Trash2, ArrowRight, ArrowLeftRight, Minus } from 'lucide-react';
import useDiagramStore from '../store/useDiagramStore';
import { getIconById } from '../data/cloudIcons';

const EDGE_COLORS = [
  { color: '#a1a1aa', name: 'Gray' },
  { color: '#a855f7', name: 'Purple' },
  { color: '#06B6D4', name: 'Cyan' },
  { color: '#22c55e', name: 'Green' },
  { color: '#eab308', name: 'Yellow' },
  { color: '#f43f5e', name: 'Rose' },
  { color: '#EC4899', name: 'Pink' },
];
const EDGE_TYPES = ['smoothstep', 'bezier', 'straight', 'step'];
const LINE_TYPES = [
  { id: 'animated', label: 'Animated', desc: 'Flowing dashes', icon: '⚡' },
  { id: 'dotted', label: 'Dotted', desc: 'Dashed line', icon: '⋯' },
  { id: 'solid', label: 'Solid', desc: 'Continuous line', icon: '━' },
];

export default function PropertiesPanel() {
  const {
    nodes, edges, selectedNodes, selectedEdges,
    updateNodeLabel, updateEdgeStyle, toggleEdgeAnimated, setEdgeLabel, setEdgeDirection, deleteSelected, updateEdgeType,
  } = useDiagramStore();

  const selectedNode = useMemo(() => {
    if (selectedNodes.length !== 1) return null;
    return nodes.find((n) => n.id === selectedNodes[0]);
  }, [selectedNodes, nodes]);

  const selectedEdge = useMemo(() => {
    if (selectedEdges.length !== 1) return null;
    return edges.find((e) => e.id === selectedEdges[0]);
  }, [selectedEdges, edges]);

  const hasSelection = selectedNode || selectedEdge;

  const [labelDraft, setLabelDraft] = useState('');
  const [edgeLabelDraft, setEdgeLabelDraft] = useState('');

  useEffect(() => {
    if (selectedNode) setLabelDraft(selectedNode.data.label);
  }, [selectedNode]);

  useEffect(() => {
    if (selectedEdge) setEdgeLabelDraft(selectedEdge.label || '');
  }, [selectedEdge]);

  if (!hasSelection) return null;

  const panelStyle = {
    background: 'var(--bg-1)',
    borderLeft: '1px solid var(--border-0)',
    color: 'var(--text-0)',
  };

  const inputStyle = {
    width: '100%',
    height: '44px',
    padding: '0 14px',
    fontSize: 13,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    color: 'var(--text-0)',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const inputFocusStyle = {
    borderColor: '#8b5cf6',
    boxShadow: '0 0 0 2px rgba(139,92,246,0.3)',
  };

  const sectionTitle = {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const sectionContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  };

  return (
    <div
      className="h-full flex flex-col shrink-0 animate-slide-in-right"
      style={{ ...panelStyle, width: 300 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-0)', padding: '16px 20px' }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)' }}>
          Properties
        </span>
        <button
          onClick={deleteSelected}
          className="flex items-center justify-center rounded-xl transition-colors"
          style={{ color: 'var(--danger)', width: 32, height: 32 }}
          data-tooltip="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>
        {/* === NODE PROPERTIES === */}
        {selectedNode && (
          <>
            {/* Preview */}
            <div className="flex flex-col items-center gap-3 py-4" style={{ marginBottom: 20 }}>
              <div
                className="w-16 h-16 flex items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.15)',
                }}
                dangerouslySetInnerHTML={{ __html: selectedNode.data.svg }}
              />
              <span className="text-base font-semibold" style={{ color: 'var(--text-0)' }}>
                {selectedNode.data.label}
              </span>
              <span
                className="text-[11px] px-3 py-1 rounded-full"
                style={{
                  background: 'var(--bg-3)',
                  color: selectedNode.data.color || 'var(--accent)',
                  border: '1px solid var(--border-0)',
                }}
              >
                {selectedNode.data.provider?.toUpperCase()} / {selectedNode.data.category}
              </span>
            </div>

            {/* Label */}
            <div style={sectionContainer}>
              <div style={sectionTitle}>
                <Type size={11} />
                Label
              </div>
              <input
                type="text"
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => { 
                  updateNodeLabel(selectedNode.id, labelDraft); 
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'; 
                  e.target.style.boxShadow = 'none'; 
                }}
                onKeyDown={(e) => e.key === 'Enter' && updateNodeLabel(selectedNode.id, labelDraft)}
                placeholder="Node label..."
                style={inputStyle}
              />
            </div>

            {/* Position */}
            <div>
              <div style={sectionTitle}>
                <Tag size={10} className="inline mr-1" />
                Position
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--text-4)' }}>X</label>
                  <input
                    type="text"
                    readOnly
                    value={Math.round(selectedNode.position.x)}
                    style={{ ...inputStyle, cursor: 'default', opacity: 0.7 }}
                  />
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--text-4)' }}>Y</label>
                  <input
                    type="text"
                    readOnly
                    value={Math.round(selectedNode.position.y)}
                    style={{ ...inputStyle, cursor: 'default', opacity: 0.7 }}
                  />
                </div>
              </div>
            </div>

            {/* Node ID */}
            <div>
              <div style={sectionTitle}>ID</div>
              <div
                className="text-[10px] p-2 rounded-md break-all"
                style={{ background: 'var(--bg-3)', color: 'var(--text-4)' }}
              >
                {selectedNode.id}
              </div>
            </div>
          </>
        )}

        {/* === EDGE PROPERTIES === */}
        {selectedEdge && (
          <>
            <div className="flex flex-col items-center gap-3 py-4" style={{ marginBottom: 20, borderBottom: '1px solid var(--border-0)', paddingBottom: 20 }}>
              <div
                className="w-16 h-16 flex items-center justify-center rounded-2xl"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.15)'
                }}
              >
                <Link2 size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <span className="text-base font-semibold" style={{ color: 'var(--text-0)' }}>
                Edge Connection
              </span>
            </div>

            {/* Edge Label */}
            <div style={sectionContainer}>
              <div style={sectionTitle}>
                <Type size={11} />
                Label
              </div>
              <input
                type="text"
                value={edgeLabelDraft}
                onChange={(e) => setEdgeLabelDraft(e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => { 
                  setEdgeLabel(selectedEdge.id, edgeLabelDraft); 
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'; 
                  e.target.style.boxShadow = 'none'; 
                }}
                onKeyDown={(e) => e.key === 'Enter' && setEdgeLabel(selectedEdge.id, edgeLabelDraft)}
                placeholder="Add label..."
                style={inputStyle}
              />
            </div>

            {/* Direction - Segmented Control */}
            <div style={sectionContainer}>
              <div style={sectionTitle}>
                <ArrowRight size={11} />
                Direction
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'one-way', label: 'One-way', icon: ArrowRight },
                  { id: 'both-way', label: 'Both', icon: ArrowLeftRight },
                  { id: 'none', label: 'None', icon: Minus },
                ].map((d) => {
                  const Icon = d.icon;
                  const currentDir = selectedEdge.data?.direction || (selectedEdge.markerEnd ? 'one-way' : 'none');
                  const active = currentDir === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setEdgeDirection(selectedEdge.id, d.id)}
                      className="transition-all"
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 12,
                        background: active ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'rgba(255,255,255,0.05)',
                        color: active ? '#fff' : 'var(--text-2)',
                        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 600,
                        boxShadow: active ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
                      }}
                    >
                      <Icon size={14} />
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edge Type */}
            <div style={sectionContainer}>
              <div style={sectionTitle}>Type</div>
              <div className="grid grid-cols-2 gap-2">
                {EDGE_TYPES.map((t) => {
                  const active = selectedEdge.type === t;
                  return (
                    <button
                      key={t}
                      onClick={() => updateEdgeStyle(selectedEdge.id, { type: t })}
                      className="transition-all"
                      style={{
                        height: 40,
                        borderRadius: 12,
                        background: active ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'rgba(255,255,255,0.05)',
                        color: active ? '#fff' : 'var(--text-2)',
                        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: active ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line Style - Premium Cards */}
            <div style={sectionContainer}>
              <div style={sectionTitle}>
                <Minus size={11} />
                Line Style
              </div>
              <div className="flex flex-col gap-2">
                {LINE_TYPES.map((lt) => {
                  const currentLineType = selectedEdge.data?.lineType || 'animated';
                  const active = currentLineType === lt.id;
                  return (
                    <button
                      key={lt.id}
                      onClick={() => updateEdgeType(selectedEdge.id, lt.id)}
                      className="transition-all"
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? '#8b5cf6' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        boxShadow: active ? '0 0 20px rgba(139,92,246,0.25)' : 'none',
                        transform: 'translateY(0)',
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{lt.icon}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-1)' }}>
                            {lt.label}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                            {lt.desc}
                          </span>
                        </div>
                      </div>
                      {active && <span style={{ fontSize: 16 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edge Color - Premium Swatches */}
            <div style={sectionContainer}>
              <div style={sectionTitle}>
                <Palette size={11} />
                Color
              </div>
              <div className="flex gap-2 flex-wrap">
                {EDGE_COLORS.map((c) => {
                  const active = selectedEdge.style?.stroke === c.color;
                  return (
                    <button
                      key={c.color}
                      onClick={() => updateEdgeStyle(selectedEdge.id, { style: { ...selectedEdge.style, stroke: c.color } })}
                      className="transition-transform"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c.color,
                        border: 'none',
                        outline: active ? '2px solid white' : 'none',
                        outlineOffset: 2,
                        cursor: 'pointer',
                        boxShadow: active ? `0 0 12px ${c.color}` : '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={c.name}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
