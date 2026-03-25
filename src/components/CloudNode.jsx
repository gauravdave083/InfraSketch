import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import useDiagramStore from '../store/useDiagramStore';

const CloudNode = memo(({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
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

  const accentColor = data.color || 'var(--accent)';
  const handleStyle = { background: accentColor };

  return (
    <div className={`cloud-node${selected ? ' selected' : ''}`}>
      {/* Top handles - 4 connection points */}
      <Handle type="source" position={Position.Top} id="top-1" style={{...handleStyle, left: '20%'}} isConnectable={true} />
      <Handle type="source" position={Position.Top} id="top-2" style={{...handleStyle, left: '40%'}} isConnectable={true} />
      <Handle type="source" position={Position.Top} id="top-3" style={{...handleStyle, left: '60%'}} isConnectable={true} />
      <Handle type="source" position={Position.Top} id="top-4" style={{...handleStyle, left: '80%'}} isConnectable={true} />
      
      {/* Right handles - 4 connection points */}
      <Handle type="source" position={Position.Right} id="right-1" style={{...handleStyle, top: '20%'}} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right-2" style={{...handleStyle, top: '40%'}} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right-3" style={{...handleStyle, top: '60%'}} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right-4" style={{...handleStyle, top: '80%'}} isConnectable={true} />
      
      {/* Bottom handles - 4 connection points */}
      <Handle type="source" position={Position.Bottom} id="bottom-1" style={{...handleStyle, left: '20%'}} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom-2" style={{...handleStyle, left: '40%'}} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom-3" style={{...handleStyle, left: '60%'}} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom-4" style={{...handleStyle, left: '80%'}} isConnectable={true} />
      
      {/* Left handles - 4 connection points */}
      <Handle type="source" position={Position.Left} id="left-1" style={{...handleStyle, top: '20%'}} isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left-2" style={{...handleStyle, top: '40%'}} isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left-3" style={{...handleStyle, top: '60%'}} isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left-4" style={{...handleStyle, top: '80%'}} isConnectable={true} />

      <div className="node-icon" dangerouslySetInnerHTML={{ __html: data.svg }} />

      {isEditing ? (
        <input
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="node-label"
          style={{
            border: `1px solid var(--accent)`,
            borderRadius: '4px',
            padding: '2px 6px',
            outline: 'none',
            width: '90px',
            textAlign: 'center',
            fontSize: '10.5px',
            background: 'var(--bg-3)',
            color: 'var(--text-0)',
          }}
        />
      ) : (
        <div className="node-label" onDoubleClick={handleDoubleClick} title={data.label}>
          {data.label}
        </div>
      )}
    </div>
  );
});

CloudNode.displayName = 'CloudNode';

export default CloudNode;
