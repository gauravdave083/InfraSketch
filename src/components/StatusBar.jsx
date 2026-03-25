import { useMemo } from 'react';
import { Wifi, WifiOff, MousePointer2, ZoomIn } from 'lucide-react';
import useDiagramStore from '../store/useDiagramStore';

export default function StatusBar() {
  const { nodes, edges, viewport, selectedNodes, selectedEdges } = useDiagramStore();

  const zoomPercent = useMemo(() => Math.round((viewport.zoom || 1) * 100), [viewport.zoom]);
  const selCount = selectedNodes.length + selectedEdges.length;

  return (
    <div
      className="flex items-center select-none shrink-0"
      style={{
        height: 40,
        padding: '0 20px',
        gap: 20,
        fontSize: 12,
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--border-0)',
        color: 'var(--text-3)',
      }}
    >
      {/* Zoom */}
      <div className="flex items-center gap-2">
        <ZoomIn size={14} style={{ color: 'var(--text-4)' }} />
        <span>{zoomPercent}%</span>
      </div>

      {/* Coordinates */}
      <div className="flex items-center gap-2">
        <MousePointer2 size={14} style={{ color: 'var(--text-4)' }} />
        <span>
          X: {Math.round(viewport.x || 0)}, Y: {Math.round(viewport.y || 0)}
        </span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: 'var(--border-0)' }} />

      {/* Counts */}
      <span>{nodes.length} nodes</span>
      <span>{edges.length} edges</span>

      {selCount > 0 && (
        <>
          <div style={{ width: 1, height: 18, background: 'var(--border-0)' }} />
          <span style={{ color: 'var(--accent)' }}>
            {selCount} selected
          </span>
        </>
      )}

      <div className="flex-1" />

      {/* Connection status */}
      <div className="flex items-center gap-2">
        <Wifi size={14} style={{ color: 'var(--success)' }} />
        <span style={{ color: 'var(--success)' }}>Connected</span>
      </div>
    </div>
  );
}
