import { useState, useCallback, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { GOOGLE_CONFIG } from '../config/google';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  htmlLink: string;
}

const TOKEN_KEY = '@Lawfy:googleToken';
const EXPIRY_KEY = '@Lawfy:googleTokenExpiry';
const FIVE_MINUTES = 5 * 60 * 1000;

function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(EXPIRY_KEY);
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt) - FIVE_MINUTES;
}

export function useGoogleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const fetchEvents = useCallback(async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const hoje = new Date().toISOString();
      const em30dias = new Date();
      em30dias.setDate(em30dias.getDate() + 30);

      const params = new URLSearchParams({
        timeMin: hoje,
        timeMax: em30dias.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '10',
      });

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 401) {
        setIsConnected(false);
        setIsExpired(true);
        setEvents([]);
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar eventos');

      const data = await response.json();
      setEvents(data.items ?? []);
      setIsConnected(true);
      setIsExpired(false);
    } catch (err) {
      setError('Não foi possível carregar os eventos do Google Calendar.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  function saveToken(accessToken: string, expiresIn: number) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(EXPIRY_KEY, String(expiresAt));
    setSavedToken(accessToken);
    setIsExpired(false);
  }

  // Tentativa de reautenticação silenciosa (sem popup)
  const silentLogin = useGoogleLogin({
    scope: GOOGLE_CONFIG.scopes,
    prompt: 'none',
    onSuccess: (response) => {
      saveToken(response.access_token, response.expires_in ?? 3600);
      fetchEvents(response.access_token);
    },
    onError: () => {
      // Silenciosa falhou — mostra botão de reconexão manual
      setIsExpired(true);
      setIsConnected(false);
    },
  });

  const login = useGoogleLogin({
    scope: GOOGLE_CONFIG.scopes,
    onSuccess: (response) => {
      saveToken(response.access_token, response.expires_in ?? 3600);
      fetchEvents(response.access_token);
    },
    onError: () => {
      setError('Não foi possível conectar ao Google Calendar.');
    },
  });

  useEffect(() => {
    if (!savedToken) return;

    if (isTokenExpired()) {
      // Tenta reautenticar silenciosamente primeiro
      silentLogin();
    } else {
      fetchEvents(savedToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function disconnect() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setSavedToken(null);
    setEvents([]);
    setIsConnected(false);
    setIsExpired(false);
    setError(null);
  }

  function formatEventDate(event: CalendarEvent): string {
    const dateStr = event.start.dateTime ?? event.start.date ?? '';
    if (!dateStr) return '—';

    const date = new Date(dateStr);
    if (event.start.dateTime) {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('pt-BR');
  }

  return {
    events,
    loading,
    error,
    isConnected,
    isExpired,
    login,
    disconnect,
    formatEventDate,
  };
}
