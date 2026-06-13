import { useLog } from './LogContext';

export function RequestLog() {
  const { entries, clear } = useLog();

  return (
    <div className="log">
      <div className="log__head">
        <h2 className="panel__title">GraphQL traffic — Frontend → Gateway → Microservices</h2>
        {entries.length > 0 && (
          <button className="btn-link" onClick={clear}>
            clear
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <div className="log-empty">
          No requests yet. Every action above (login, items query, createOrder, etc.) sends a GraphQL
          operation to the Apollo Gateway at localhost:4000, which routes it to the relevant
          microservice subgraph. Entries will appear here as you interact with the app.
        </div>
      ) : (
        <div className="log__entries">
          {entries.map((entry) => (
            <div className={`log-entry ${entry.result === 'error' ? 'error' : ''}`} key={entry.id}>
              <div className="log-entry__top">
                <span>
                  <span className={`log-entry__op ${entry.type}`}>{entry.type}</span> {entry.operation}
                </span>
                <span>{entry.time}</span>
              </div>
              {entry.variables !== undefined && (
                <div className="log-entry__detail">vars: {JSON.stringify(entry.variables)}</div>
              )}
              <div className="log-entry__detail">{entry.result === 'error' ? 'error: ' : '→ '}{entry.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
