import logoTechvill from '../assets/logo-techvill.svg';
import Disclaimer from './Disclaimer.jsx';

export default function AppShell({ activeTab, onTabChange, children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Техвилл — на главную">
          <img className="brand-logo" src={logoTechvill} alt="Техвилл" />
          <span className="brand-copy">
            <small>Аббасов Роман Русланович: тестовое задание для AI-команды Техвилл</small>
          </span>
        </a>
        <nav className="tabs" role="tablist" aria-label="Разделы проекта">
          {['Задание', 'Прототип', 'Использованные инструменты и знания'].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>
      <Disclaimer />
      <main id="top">{children}</main>
    </div>
  );
}
