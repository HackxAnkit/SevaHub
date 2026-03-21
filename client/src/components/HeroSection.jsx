function HeroSection({ loadingDashboard, dashboard }) {
  return (
    <header className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">
          {loadingDashboard ? 'Loading platform details...' : dashboard?.hero.eyebrow || 'SevaHub'}
        </p>
        <h1>{dashboard?.hero.headline || 'Find trusted help for everyday services without the guesswork.'}</h1>
        <p className="hero-lead">
          {dashboard?.hero.description ||
            'Browse providers, filter by category, and send a real request from the same interface.'}
        </p>

        <div className="hero-actions">
          <a className="primary-action" href="#services">
            Explore services
          </a>
          <a className="secondary-action" href="#request">
            Send a request
          </a>
        </div>

        <div className="stat-grid">
          {(dashboard?.stats || []).map((stat) => (
            <article className="stat-card" key={stat.label}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <p>{stat.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <aside className="hero-side">
        <section className="status-card">
          <p className="section-kicker">Platform status</p>
          <h2>Working with or without infrastructure extras</h2>
          <div className="status-list">
            <div>
              <span className="status-label">API</span>
              <strong>{dashboard?.status.api || 'checking'}</strong>
            </div>
            <div>
              <span className="status-label">MongoDB</span>
              <strong>{dashboard?.status.mongo || 'checking'}</strong>
            </div>
            <div>
              <span className="status-label">Request storage</span>
              <strong>{dashboard?.status.storage || 'checking'}</strong>
            </div>
          </div>
        </section>

        <section className="trust-card">
          <p className="section-kicker">Why this demo feels real</p>
          <ul>
            {(dashboard?.trustPoints || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      </aside>
    </header>
  )
}

export default HeroSection
