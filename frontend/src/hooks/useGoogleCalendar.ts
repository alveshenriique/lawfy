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

const STORAGE_KEY = '@Lawfy:googleToken';

export function useGoogleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
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
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        setSavedToken(null);
        setIsConnected(false);
        setEvents([]);
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar eventos');

      const data = await response.json();
      setEvents(data.items ?? []);
      setIsConnected(true);
    } catch (err) {
      setError('Não foi possível carregar os eventos do Google Calendar.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect ANTES do useGoogleLogin para manter ordem dos hooks
  useEffect(() => {
    if (savedToken) {
      fetchEvents(savedToken);
    }
  }, [savedToken, fetchEvents]);

  const login = useGoogleLogin({
    scope: GOOGLE_CONFIG.scopes,
    onSuccess: (response) => {
      localStorage.setItem(STORAGE_KEY, response.access_token);
      setSavedToken(response.access_token);
      fetchEvents(response.access_token);
    },
    onError: () => {
      setError('Não foi possível conectar ao Google Calendar.');
    },
  });

  function disconnect() {
    localStorage.removeItem(STORAGE_KEY);
    setSavedToken(null);
    setEvents([]);
    setIsConnected(false);
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
    login,
    disconnect,
    formatEventDate,
  };
}