import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { Unplug, Plug } from 'lucide-react';
import useDiagramStore from '../store/useDiagramStore';

const ContainerNode = memo(({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const [handlesEnabled, setHandlesEnabled] = useState(data.handlesEnabled || false);
  const [isActive, setIsActive] = useState(false);
  const updateNodeLabel = useDiagramStore((s) => s.updateNodeLabel);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditLabel(data.label);
  }, [data.label]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editLabel.trim()) {
      updateNodeLabel(id, editLabel.trim());
    }
  }, [id, editLabel, updateNodeLabel]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') { setIsEditing(false); setEditLabel(data.label); }
  }, [handleBlur, data.label]);

  const handleEdgeClick = useCallback((e) => {
    e.stopPropagation();
    setIsActive(!isActive);
  }, [isActive]);

  const toggleHandles = useCallback((e) => {
    e.stopPropagation();
    setHandlesEnabled(!handlesEnabled);
  }, [handlesEnabled]);

  const containerType = data.containerType || 'vpc';
  const accentColor = data.color || '#FF9900';

  const containerStyles = {
    vpc: {
      background: 'rgba(76, 175, 80, 0.08)',
      border: '2px solid #4CAF50',
      borderColor: '#4CAF50',
    },
    subnet: {
      background: 'rgba(33, 150, 243, 0.08)',
      border: '2px dashed #2196F3',
      borderColor: '#2196F3',
    },
    'security-group': {
      background: 'rgba(255, 152, 0, 0.08)',
      border: '2px dotted #FF9800',
      borderColor: '#FF9800',
    },
    region: {
      background: 'rgba(156, 39, 176, 0.05)',
      border: '2px solid #9C27B0',
      borderColor: '#9C27B0',
    },
  };

  const style = containerStyles[containerType] || containerStyles.vpc;

  return (
    <div
      className="container-node"
      style={{
        width: '100%',
        height: '100%',
        minWidth: '300px',
        minHeight: '200px',
        position: 'relative',
        borderRadius: '8px',
      }}
    >
      {/* Non-interactive background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          ...style,
          borderRadius: '8px',
          pointerEvents: 'none',
          opacity: isActive ? 1 : 0.6,
        }}
      />

      {/* Interactive border - click to activate (only border area) */}
      <div
        onClick={handleEdgeClick}
        style={{
          position: 'absolute',
          inset: 0,
          border: style.border,
          borderRadius: '8px',
          pointerEvents: 'all',
          cursor: 'pointer',
          background: 'transparent',
        }}
        title="Click border to activate container"
      />
      
      {/* Center area blocker - prevents clicks from passing through when inactive */}
      {!isActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            inset: '15px',
            pointerEvents: 'all',
            cursor: 'default',
            background: 'transparent',
          }}
        />
      )}

      {/* Node Resizer - only when active */}
      {isActive && (
        <NodeResizer
          color={style.borderColor}
          isVisible={selected}
          minWidth={300}
          minHeight={200}
          lineStyle={{ borderWidth: '2px' }}
          handleStyle={{ width: '12px', height: '12px', borderRadius: '3px' }}
        />
      )}

      {/* Header with label and controls */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
        }}
      >
        {data.svg && (
          <div
            style={{ width: '20px', height: '20px', flexShrink: 0 }}
            dangerouslySetInnerHTML={{ __html: data.svg }}
          />
        )}
        {isEditing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              border: `1px solid ${accentColor}`,
              borderRadius: '4px',
              padding: '4px 8px',
              outline: 'none',
              background: 'var(--bg-2)',
              color: 'var(--text-0)',
              fontSize: '13px',
              fontWeight: '600',
              flex: 1,
            }}
          />
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-0)',
              cursor: 'text',
              flex: 1,
            }}
            title={data.label}
          >
            {data.label}
          </div>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(76,175,80,0.2)',
              color: '#4CAF50',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            ACTIVE
          </div>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(76,175,80,0.2)',
              color: '#4CAF50',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            ACTIVE
          </div>
        )}
        
        {/* Connection handles toggle button */}
        {selected && isActive && (
          <button
            onClick={toggleHandles}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: handlesEnabled ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
              color: handlesEnabled ? '#7c3aed' : 'var(--text-2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={handlesEnabled ? 'Disable connection handles' : 'Enable connection handles'}
          >
            {handlesEnabled ? <Plug size={14} /> : <Unplug size={14} />}
          </button>
        )}
      </div>

      {/* Connection handles - only when active and enabled */}
      {isActive && handlesEnabled && (
        <>
          <Handle
            type="source"
            position={Position.Top}
            id="top"
            style={{ background: accentColor, opacity: selected ? 1 : 0.6 }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={{ background: accentColor, opacity: selected ? 1 : 0.6 }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{ background: accentColor, opacity: selected ? 1 : 0.6 }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            style={{ background: accentColor, opacity: selected ? 1 : 0.6 }}
          />
        </>
      )}
    </div>
  );
});

ContainerNode.displayName = 'ContainerNode';

export default ContainerNode;
