import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from '@xyflow/react';

const MAX_HISTORY = 50;

const useDiagramStore = create((set, get) => ({
  // Core state
  nodes: [],
  edges: [],
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  
  // UI state
  diagramName: 'Untitled Diagram',
  selectedNodes: [],
  selectedEdges: [],
  isModified: false,
  
  // Viewport
  viewport: { x: 0, y: 0, zoom: 1 },

  // --- Snapshot helpers ---
  _pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isModified: true,
    });
  },

  // --- Node operations ---
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isModified: true,
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isModified: true,
    }));
  },

  onConnect: (connection) => {
    const edge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#a1a1aa' },
      style: { strokeWidth: 2, stroke: '#a1a1aa' },
      data: { 
        direction: 'one-way',
        lineType: 'animated',
        label: ''
      },
      className: 'edge-animated',
    };
    set((state) => ({
      edges: addEdge(edge, state.edges),
      isModified: true,
    }));
    get()._pushHistory();
  },

  updateEdgeType: (edgeId, lineType) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            className: `edge-${lineType}`,
            data: { ...edge.data, lineType },
          };
        }
        return edge;
      }),
      isModified: true,
    }));
    get()._pushHistory();
  },

  updateEdgeLabel: (edgeId, label) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            label,
            data: { ...edge.data, label },
          };
        }
        return edge;
      }),
      isModified: true,
    }));
    get()._pushHistory();
  },

  addNode: (nodeData) => {
    const isContainer = nodeData.isContainer || false;
    
    // Set dimensions based on container type
    let width = 100;
    let height = 100;
    
    if (isContainer) {
      switch (nodeData.containerType) {
        case 'region':
          width = 800;
          height = 600;
          break;
        case 'vpc':
          width = 600;
          height = 450;
          break;
        case 'subnet':
          width = 400;
          height = 300;
          break;
        case 'security-group':
          width = 350;
          height = 250;
          break;
        default:
          width = 400;
          height = 300;
      }
    }
    
    // Calculate z-index for containers
    let zIndex = undefined;
    if (isContainer) {
      const state = get();
      const containerNodes = state.nodes.filter(n => n.type === 'containerNode');
      const maxZIndex = containerNodes.length > 0
        ? Math.max(...containerNodes.map(n => n.style?.zIndex || 1))
        : 0;
      zIndex = maxZIndex + 1;
    }
    
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: isContainer ? 'containerNode' : 'cloudNode',
      position: nodeData.position || { x: 100, y: 100 },
      data: {
        label: nodeData.label,
        iconId: nodeData.iconId,
        svg: nodeData.svg,
        provider: nodeData.provider,
        color: nodeData.color,
        category: nodeData.category,
        containerType: nodeData.containerType,
      },
      ...(nodeData.parentNode && { 
        parentNode: nodeData.parentNode,
        extent: 'parent',
      }),
      ...(isContainer && {
        style: {
          width,
          height,
          zIndex,
        },
      }),
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      isModified: true,
    }));
    get()._pushHistory();
  },

  deleteSelected: () => {
    const { nodes, edges, selectedNodes, selectedEdges } = get();
    const selectedNodeIds = new Set(selectedNodes);
    const selectedEdgeIds = new Set(selectedEdges);
    
    set({
      nodes: nodes.filter(n => !selectedNodeIds.has(n.id)),
      edges: edges.filter(e => !selectedEdgeIds.has(e.id) && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)),
      selectedNodes: [],
      selectedEdges: [],
      isModified: true,
    });
    get()._pushHistory();
  },

  updateNodeLabel: (nodeId, label) => {
    set((state) => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
      isModified: true,
    }));
  },

  onSelectionChange: ({ nodes, edges }) => {
    set({
      selectedNodes: nodes.map(n => n.id),
      selectedEdges: edges.map(e => e.id),
    });
    
    // Bring selected container nodes to front
    if (nodes.length === 1 && nodes[0].type === 'containerNode') {
      get().bringToFront(nodes[0].id);
    }
  },

  bringToFront: (nodeId) => {
    set((state) => {
      const maxZIndex = Math.max(
        ...state.nodes
          .filter(n => n.type === 'containerNode')
          .map(n => n.style?.zIndex || 1),
        1
      );
      
      return {
        nodes: state.nodes.map(node => {
          if (node.id === nodeId && node.type === 'containerNode') {
            return {
              ...node,
              style: {
                ...node.style,
                zIndex: maxZIndex + 1,
              },
            };
          }
          return node;
        }),
      };
    });
  },

  onNodeDragStop: () => {
    get()._pushHistory();
  },

  // --- Undo / Redo ---
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];
    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      historyIndex: newIndex,
      isModified: true,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];
    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      historyIndex: newIndex,
      isModified: true,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // --- Save / Load ---
  setDiagramName: (name) => set({ diagramName: name }),

  getDiagramData: () => {
    const { nodes, edges, diagramName, viewport } = get();
    return {
      name: diagramName,
      nodes,
      edges,
      viewport,
      exportedAt: new Date().toISOString(),
    };
  },

  loadDiagram: (data) => {
    set({
      nodes: data.nodes || [],
      edges: data.edges || [],
      diagramName: data.name || 'Untitled Diagram',
      viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
      history: [{ nodes: data.nodes || [], edges: data.edges || [] }],
      historyIndex: 0,
      isModified: false,
    });
  },

  clearDiagram: () => {
    set({
      nodes: [],
      edges: [],
      history: [{ nodes: [], edges: [] }],
      historyIndex: 0,
      selectedNodes: [],
      selectedEdges: [],
      isModified: false,
      diagramName: 'Untitled Diagram',
    });
  },

  setViewport: (viewport) => set({ viewport }),

  // --- Edge style updates ---
  updateEdgeStyle: (edgeId, updates) => {
    set((state) => ({
      edges: state.edges.map(e => {
        if (e.id !== edgeId) return e;
        const merged = { ...e, ...updates };
        // Sync marker colors when stroke color changes
        const newStroke = updates.style?.stroke;
        if (newStroke) {
          if (merged.markerEnd) merged.markerEnd = { ...merged.markerEnd, color: newStroke };
          if (merged.markerStart) merged.markerStart = { ...merged.markerStart, color: newStroke };
        }
        return merged;
      }),
      isModified: true,
    }));
  },

  toggleEdgeAnimated: (edgeId) => {
    set((state) => ({
      edges: state.edges.map(e =>
        e.id === edgeId ? { ...e, animated: !e.animated } : e
      ),
      isModified: true,
    }));
  },

  setEdgeLabel: (edgeId, label) => {
    set((state) => ({
      edges: state.edges.map(e =>
        e.id === edgeId ? { ...e, label } : e
      ),
      isModified: true,
    }));
  },

  setEdgeDirection: (edgeId, direction) => {
    const edgeObj = get().edges.find(e => e.id === edgeId);
    const markerColor = edgeObj?.style?.stroke || '#a1a1aa';
    const marker = { type: MarkerType.ArrowClosed, width: 16, height: 16, color: markerColor };
    set((state) => ({
      edges: state.edges.map(e => {
        if (e.id !== edgeId) return e;
        if (direction === 'one-way') {
          return { ...e, markerEnd: marker, markerStart: undefined, data: { ...e.data, direction: 'one-way' } };
        }
        if (direction === 'both-way') {
          return { ...e, markerEnd: marker, markerStart: marker, data: { ...e.data, direction: 'both-way' } };
        }
        // 'none' - no arrows
        return { ...e, markerEnd: undefined, markerStart: undefined, data: { ...e.data, direction: 'none' } };
      }),
      isModified: true,
    }));
    get()._pushHistory();
  },
}));

export default useDiagramStore;
