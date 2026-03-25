import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CloudNode from './CloudNode';
import ContainerNode from './ContainerNode';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import PropertiesPanel from './PropertiesPanel';
import ExportModal from './ExportModal';
import useDiagramStore from '../store/useDiagramStore';
import useThemeStore from '../store/useThemeStore';

const nodeTypes = { 
  cloudNode: CloudNode,
  containerNode: ContainerNode,
};

function DiagramCanvas() {
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [showExport, setShowExport] = useState(false);
  const [showProperties, setShowProperties] = useState(true);

  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    addNode, onSelectionChange, onNodeDragStop,
    undo, redo, deleteSelected, setViewport, selectedNodes, selectedEdges,
  } = useDiagramStore();

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;
      let iconData;
      try { iconData = JSON.parse(data); } catch { return; }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX, y: event.clientY,
      });

      // Find if dropped inside a container node
      const intersectingNode = nodes.find(node => {
        if (node.type !== 'containerNode') return false;
        const nodeWidth = node.style?.width || 400;
        const nodeHeight = node.style?.height || 300;
        return (
          position.x >= node.position.x &&
          position.x <= node.position.x + nodeWidth &&
          position.y >= node.position.y &&
          position.y <= node.position.y + nodeHeight
        );
      });

      addNode({
        label: iconData.label, 
        iconId: iconData.id, 
        svg: iconData.svg,
        provider: iconData.provider, 
        color: iconData.color,
        category: iconData.category, 
        position,
        isContainer: iconData.isContainer,
        containerType: iconData.containerType,
        parentNode: intersectingNode?.id,
      });
    },
    [reactFlowInstance, addNode, nodes]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 'e') { e.preventDefault(); setShowExport(true); }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected]);

  const onMoveEnd = useCallback((_, viewport) => setViewport(viewport), [setViewport]);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    style: { strokeWidth: 2, stroke: '#a1a1aa' },
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#a1a1aa' },
  }), []);

  return (
    <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg-0)' }}>
      <Toolbar
        reactFlowInstance={reactFlowInstance}
        onExport={() => setShowExport(true)}
        onToggleProperties={() => setShowProperties((p) => !p)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main canvas area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            onNodeDragStop={onNodeDragStop}
            onMoveEnd={onMoveEnd}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionMode="loose"
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode={null}
            selectionOnDrag
            panOnScroll
            panOnScrollSpeed={0.6}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            zoomActivationKeyCode={null}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            connectionLineStyle={{ stroke: 'var(--accent)', strokeWidth: 2 }}
            connectionLineType="smoothstep"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant="lines"
              gap={40}
              size={1}
              color="var(--grid-color)"
              style={{ background: 'var(--canvas-bg)' }}
            />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) => node.data?.color || '#64748b'}
              maskColor="var(--minimap-mask)"
              style={{ width: 150, height: 100 }}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center animate-fade-in">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border-0)',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 14v7M14 17.5h7" stroke="url(#emptyGrad)" />
                    <defs>
                      <linearGradient id="emptyGrad" x1="3" y1="3" x2="21" y2="21">
                        <stop stopColor="#a855f7" />
                        <stop offset="1" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: 'var(--text-2)' }}
                >
                  Start building your diagram
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                  Drag cloud components from the sidebar onto the canvas
                </p>
                <div
                  className="mt-3 text-[10px] px-3 py-1 rounded-full inline-block"
                  style={{
                    background: 'var(--bg-2)',
                    color: 'var(--text-3)',
                    border: '1px solid var(--border-0)',
                  }}
                >
                  Ctrl+E to export &middot; Ctrl+Z to undo
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {showProperties && hasSelection && <PropertiesPanel />}
      </div>

      <StatusBar />

      {/* Export Modal */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <DiagramCanvas />
    </ReactFlowProvider>
  );
}
