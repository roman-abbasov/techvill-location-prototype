import { useState } from 'react';
import AppShell from './components/AppShell.jsx';
import AssignmentPage from './components/AssignmentPage.jsx';
import PrototypePage from './components/PrototypePage.jsx';
import ToolsAndKnowledgePage from './components/ToolsAndKnowledgePage.jsx';
import './styles.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('Задание');
  const pages = {
    Задание: <AssignmentPage />,
    Прототип: <PrototypePage />,
    'Использованные инструменты и знания': <ToolsAndKnowledgePage />,
  };
  return <AppShell activeTab={activeTab} onTabChange={setActiveTab}>{pages[activeTab]}</AppShell>;
}
