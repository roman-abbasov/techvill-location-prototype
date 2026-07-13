import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import App from '../src/App.jsx';

it('switches between assignment and prototype without navigation', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /быстрый и объяснимый/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'Прототип' }));
  expect(screen.getByRole('heading', { name: /потенциал новых точек/i })).toBeInTheDocument();
});
