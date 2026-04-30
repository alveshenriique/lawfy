import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { Calendar, RefreshCw } from 'lucide-react';

export function GoogleCalendarWidget() {
  const { events, loading, error, isConnected, isExpired, login, disconnect, formatEventDate } = useGoogleCalendar();

  return (
    <div className="calendar-widget">
      {!isConnected ? (
        <div className="calendar-widget-empty">
          <Calendar size={32} className="calendar-widget-empty-icon" />
          {isExpired ? (
            <>
              <p className="calendar-widget-empty-title">Sessão expirada</p>
              <p className="calendar-widget-empty-subtitle">
                Sua conexão com o Google Calendar expirou. Reconecte para continuar vendo sua agenda.
              </p>
            </>
          ) : (
            <>
              <p className="calendar-widget-empty-title">Agenda não conectada</p>
              <p className="calendar-widget-empty-subtitle">
                Conecte seu Google Calendar para ver seus próximos compromissos
              </p>
            </>
          )}
          <button className="btn-table-edit" onClick={() => login()}>
            {isExpired ? 'Reconectar Google Calendar' : 'Conectar Google Calendar'}
          </button>
        </div>
      ) : (
        <div>
          <div className="calendar-widget-header">
            <div className="calendar-widget-header-left">
              <Calendar size={16} className="calendar-widget-icon" />
              <span className="calendar-widget-title">Próximos Compromissos</span>
            </div>
            <button className="calendar-widget-disconnect" onClick={disconnect}>
              Desconectar
            </button>
          </div>

          {loading && (
            <div className="calendar-widget-loading">
              <RefreshCw size={14} className="animate-spin" />
              Carregando eventos...
            </div>
          )}

          {error && !loading && (
            <p className="calendar-widget-error">{error}</p>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="calendar-widget-empty-events">
              Nenhum compromisso nos próximos 30 dias.
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <ul className="calendar-event-list">
              {events.map(event => (
                <li key={event.id} className="calendar-event-item">
                  <div className="calendar-event-date">
                    {formatEventDate(event)}
                  </div>
                  <div className="calendar-event-info">
                    <p className="calendar-event-title">{event.summary}</p>
                    {event.location && (
                      <p className="calendar-event-location">{event.location}</p>
                    )}
                  </div>
                  <button
                    className="calendar-event-link"
                    onClick={() => window.open(event.htmlLink, '_blank')}
                  >
                    ↗
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}