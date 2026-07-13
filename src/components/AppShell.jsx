export default function AppShell({ activeTab, onTabChange, children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Техвилл — на главную">
          <span className="brand-mark">Т</span>
          <span><b>Техвилл</b><small>AI location intelligence</small></span>
        </a>
        <nav className="tabs" role="tablist" aria-label="Разделы проекта">
          {['Задание', 'Прототип'].map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} aria-controls={`panel-${tab}`} onClick={() => onTabChange(tab)}>{tab}</button>
          ))}
        </nav>
        <span className="demo-badge">PM AI · demo</span>
      </header>
      <main id="top">{children}</main>
    </div>
  );
}
