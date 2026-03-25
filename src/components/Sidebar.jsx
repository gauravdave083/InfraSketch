import { useState, useCallback, useMemo } from 'react';
import { cloudIcons, providerMeta } from '../data/cloudIcons';
import { Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const providers = [
  { key: 'all', name: 'All', color: null },
  { key: 'aws', name: 'AWS', color: '#FF9900' },
  { key: 'azure', name: 'Azure', color: '#0089D6' },
  { key: 'gcp', name: 'GCP', color: '#4285F4' },
  { key: 'generic', name: 'General', color: '#71717a' },
];

export default function Sidebar() {
  const [search, setSearch] = useState('');
  const [activeProvider, setActiveProvider] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  const toggleCategory = useCallback((cat) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const filteredIcons = useMemo(() => {
    return cloudIcons.filter((icon) => {
      const matchProvider = activeProvider === 'all' || icon.provider === activeProvider;
      const matchSearch =
        !search ||
        icon.label.toLowerCase().includes(search.toLowerCase()) ||
        icon.category.toLowerCase().includes(search.toLowerCase()) ||
        icon.id.toLowerCase().includes(search.toLowerCase());
      return matchProvider && matchSearch;
    });
  }, [activeProvider, search]);

  const groupedIcons = useMemo(() => {
    const groups = {};
    filteredIcons.forEach((icon) => {
      if (!groups[icon.category]) groups[icon.category] = [];
      groups[icon.category].push(icon);
    });
    return groups;
  }, [filteredIcons]);

  const onDragStart = useCallback((event, icon) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(icon));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  /* ── Collapsed rail ── */
  if (collapsed) {
    return (
      <div
        className="h-full flex flex-col items-center pt-5 shrink-0"
        style={{ width: 48, background: 'var(--bg-1)', borderRight: '1px solid var(--border-0)' }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-0)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
          data-tooltip="Expand"
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>
    );
  }

  /* ── Expanded panel ── */
  return (
    <div
      className="h-full flex flex-col select-none shrink-0 animate-slide-in-left"
      style={{ width: 320, background: 'var(--bg-1)', borderRight: '1px solid var(--border-0)' }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '20px 20px 16px' }}>
        {/* Title + collapse */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.01em' }}>
            Components
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ width: 32, height: 32, color: 'var(--text-3)', border: '1px solid var(--border-0)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-0)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative" style={{ marginBottom: 16 }}>
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-4)', left: 14 }}
          />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none transition-all"
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border-1)',
              borderRadius: 12,
              color: 'var(--text-0)',
              fontSize: 13,
              padding: '10px 16px 10px 40px',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-1)')}
          />
        </div>

        {/* Provider Tabs */}
        <div className="flex" style={{ gap: 6 }}>
          {providers.map((p) => {
            const active = activeProvider === p.key;
            const isAll = p.key === 'all';
            return (
              <button
                key={p.key}
                onClick={() => setActiveProvider(p.key)}
                className="flex-1 text-center transition-all"
                style={{
                  padding: '7px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 10,
                  background: active
                    ? (isAll ? 'var(--accent)' : `${p.color}18`)
                    : 'var(--bg-3)',
                  color: active
                    ? (isAll ? '#fff' : p.color)
                    : 'var(--text-3)',
                  border: active && !isAll ? `1px solid ${p.color}30` : '1px solid transparent',
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Icon Groups ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '4px 20px 20px' }}
      >
        {Object.keys(groupedIcons).length === 0 && (
          <div className="text-center" style={{ color: 'var(--text-4)', fontSize: 13, marginTop: 80 }}>
            No components found
          </div>
        )}

        {Object.entries(groupedIcons).map(([category, icons]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(category)}
              className="cursor-pointer select-none"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-1)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '4px 0 10px',
              }}
            >
              {category}
            </div>

            {/* Icons Grid */}
            {!collapsedCategories[category] && (
              <div
                className="grid grid-cols-3"
                style={{ gap: 12 }}
              >
                {icons.map((icon) => {
                  const glowColor = icon.color || 'rgba(168,85,247,0.15)';
                  // Determine glow class based on provider and category
                  let glowClass = '';
                  if (icon.provider === 'aws') glowClass = 'aws-glow';
                  else if (icon.provider === 'azure') glowClass = 'azure-glow';
                  else if (icon.provider === 'gcp') glowClass = 'gcp-glow';
                  else if (icon.category === 'Storage') glowClass = 'storage-glow';
                  
                  return (
                    <div
                      key={icon.id}
                      className={`sidebar-item ${glowClass}`}
                      draggable
                      onDragStart={(e) => onDragStart(e, icon)}
                      title={`${icon.label} (${providerMeta[icon.provider]?.name || icon.provider})`}
                      style={{ '--item-glow': `${glowColor}20` }}
                    >
                      <div
                        className="item-icon"
                        dangerouslySetInnerHTML={{ __html: icon.svg }}
                      />
                      <span className="item-label">{icon.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: '1px solid var(--border-0)',
          padding: '10px 20px',
          fontSize: 11,
          color: 'var(--text-4)',
        }}
      >
        Drag components to canvas
      </div>
    </div>
  );
}
