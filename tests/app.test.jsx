import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import App from '../src/App.jsx';

const disclaimer = 'Это концептуальное решение, основанное на моём общем понимании ритейла, изученных открытых источниках и экспертизе в качестве менеджера проектов. Я не располагаю внутренней информацией о том, какие данные, системы и процессы использует Техвилл на практике, как распределены зоны ответственности между отделами. Предложенный мною подход стоит воспринимать как гипотезу, которую нужно уточнять и корректировать вместе с командой на старте проекта.';

it('shows the conceptual disclaimer before the project content', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Важно о концепции' })).toBeInTheDocument();
  expect(screen.getByText(disclaimer)).toBeInTheDocument();
});

it('renders the approved branding and exactly the ten source sections', () => {
  render(<App />);

  expect(screen.getByRole('img', { name: 'Техвилл' })).toBeInTheDocument();
  expect(screen.getByText('Аббасов Роман Русланович: тестовое задание для AI-команды Техвилл')).toBeInTheDocument();

  [
    'Суть задачи',
    'Что должен уметь сервис',
    'Как мерить успех',
    'Какие данные использовать',
    'Как это будет выглядеть',
    'Как это может работать (без глубоких технических деталей)',
    'Этапы проекта',
    'Роль Project Manager AI',
    'Риски',
    'Итог',
  ].forEach((heading) => {
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  expect(screen.queryByText('AI location intelligence')).not.toBeInTheDocument();
  expect(screen.queryByText('PM AI · demo')).not.toBeInTheDocument();
  expect(screen.queryByText(/Что я изучил, готовя это задание/i)).not.toBeInTheDocument();
});

it('switches between assignment and prototype without navigation', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Быстрый и объяснимый/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'Прототип' }));
  expect(screen.getByRole('heading', { name: /Потенциал новых точек/i })).toBeInTheDocument();
});
