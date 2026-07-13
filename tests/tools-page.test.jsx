import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ToolsAndKnowledgePage from '../src/components/ToolsAndKnowledgePage.jsx';

const intro = 'При выполнении тестового задания я использовал несколько инструментов для структурирования решения и построения удобного представления результата в формате страницы. Ниже перечислены основные сервисы и их роль в подготовке итогового материала.';

const articleLinks = [
  ['Кейс М.Видео-Эльдорадо про ML для выбора локаций', 'https://vc.ru/mvideoeldorado/129503-ekspansiya-na-mashinnom-obuchenii-otkryvaem-magaziny-v-luchshih-lokaciyah-i-razvivaem-onlayn'],
  ['Геоаналитика для выбора локации магазина (Билайн)', 'https://bigdata.beeline.ru/blog/articles/vybor-lokacii-magazina'],
  ['Как геоаналитика помогает искать места для точек, модель Хаффа', 'https://geointellect.com/kak-geoanalitika-pomogaet-iskat-mesta-dlya-torgovyh-tochek/'],
  ['Что такое каннибализация рынка и как её избегать', 'https://priceva.ru/blog/article/chto-takoe-kannibalizatsiya-rynka-vidy-i-sposoby-predotvrashheniya'],
];

it('describes all five tools and knowledge sources', () => {
  render(<ToolsAndKnowledgePage />);

  expect(screen.getByText(intro)).toBeInTheDocument();
  ['Notion', 'GPT Codex', 'Яндекс.Карты API', 'Внешние статьи', 'Оформление'].forEach((heading) => {
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
  expect(screen.getByText(/фиксации идей, разбора кейса/)).toBeInTheDocument();
  expect(screen.getByText(/Вайбкодинг в чистом виде!/)).toBeInTheDocument();
  expect(screen.getByText(/самых простых и доступных источников/)).toBeInTheDocument();
  expect(screen.getByText(/Тема на стыке ритейла и геоаналитики/)).toBeInTheDocument();
  expect(screen.getByText(/generic-интерфейс/)).toBeInTheDocument();
});

it('provides four safe external article links', () => {
  render(<ToolsAndKnowledgePage />);

  articleLinks.forEach(([name, href]) => {
    const link = screen.getByRole('link', { name });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
  expect(screen.getByText(/крупная российская сеть считает трафик, каннибализацию и прогноз оборота/)).toBeInTheDocument();
  expect(screen.getByText(/тепловые карты и данные о трафике/)).toBeInTheDocument();
  expect(screen.getByText(/распределение трафика между несколькими точками/)).toBeInTheDocument();
  expect(screen.getByText(/эффекта каннибализации в ритейле/)).toBeInTheDocument();
});
