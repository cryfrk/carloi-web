interface AdminMetricCard {
  label: string;
  value: string;
  helper: string;
}

interface AdminPlaceholderPanel {
  title: string;
  description: string;
  bullets?: string[];
}

export function AdminPageTemplate({
  eyebrow,
  title,
  description,
  metrics = [],
  panels = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  metrics?: AdminMetricCard[];
  panels?: AdminPlaceholderPanel[];
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-stack">
      <section className="glass-card admin-hero">
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ margin: '10px 0 10px' }}>{title}</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760 }}>
          {description}
        </p>
      </section>

      {metrics.length > 0 ? (
        <section className="admin-metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <div className="muted">{metric.label}</div>
              <strong style={{ display: 'block', fontSize: 26, marginTop: 8 }}>{metric.value}</strong>
              <div className="muted" style={{ marginTop: 10 }}>
                {metric.helper}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {panels.length > 0 ? (
        <section className="admin-panel-grid">
          {panels.map((panel) => (
            <article key={panel.title} className="soft-card admin-panel-card">
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{panel.title}</h3>
              <p className="muted" style={{ marginTop: 0 }}>
                {panel.description}
              </p>
              {panel.bullets?.length ? (
                <ul className="admin-bullet-list">
                  {panel.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {children}
    </div>
  );
}
