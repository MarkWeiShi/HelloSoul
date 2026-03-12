import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useUserStore } from './store/userStore';
import { usePersonaStore } from './store/personaStore';

const { apiGetMe } = vi.hoisted(() => ({
  apiGetMe: vi.fn(),
}));

vi.mock('./api/base', async () => {
  const actual = await vi.importActual<typeof import('./api/base')>('./api/base');
  return {
    ...actual,
    apiGetMe,
  };
});

describe('App routing guards', () => {
  beforeEach(() => {
    localStorage.clear();
    apiGetMe.mockReset();
    useUserStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    usePersonaStore.setState({
      selectedCharacterId: null,
      relationships: {},
    });
  });

  it('redirects unauthenticated users from chat to login', () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('redirects authenticated users without a selected character to onboarding', () => {
    useUserStore.setState({
      token: null,
      user: { id: 'user_1', email: 'qa@hellosoul.local', username: 'qa_user' },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/chat']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/choose your companion/i)).toBeInTheDocument();
  });

  it('restores the session when a token is present on mount', async () => {
    useUserStore.setState({
      token: 'token_123',
      user: null,
      isAuthenticated: true,
    });
    apiGetMe.mockResolvedValue({
      user: { id: 'user_1', email: 'qa@hellosoul.local', username: 'qa_user' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiGetMe).toHaveBeenCalledTimes(1);
    });
  });
});
