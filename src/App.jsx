import { useState } from 'react';
import AppShell from './components/AppShell.jsx';
import AssignmentPage from './components/AssignmentPage.jsx';
import PrototypePage from './components/PrototypePage.jsx';
import './styles.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('Задание');
  return <AppShell activeTab={activeTab} onTabChange={setActiveTab}>{activeTab === 'Задание' ? <AssignmentPage /> : <PrototypePage />}</AppShell>;
}
