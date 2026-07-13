import { useState } from 'react';
import AppShell from './components/AppShell.jsx';
import AssignmentPage from './components/AssignmentPage.jsx';
import './styles.css';

function PrototypePlaceholder() {
  return <section id="panel-Прототип" role="tabpanel" className="prototype-placeholder"><p className="eyebrow">Интерактивный прототип</p><h1>Потенциал новых точек</h1><p>Карта и рекомендации появятся на следующем этапе.</p></section>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Задание');
  return <AppShell activeTab={activeTab} onTabChange={setActiveTab}>{activeTab === 'Задание' ? <AssignmentPage /> : <PrototypePlaceholder />}</AppShell>;
}
