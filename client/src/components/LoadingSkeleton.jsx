function LoadingSkeleton() {
  return (
    <article className="service-card skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-subtitle" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-chips">
        <span className="skeleton-chip" />
        <span className="skeleton-chip" />
        <span className="skeleton-chip" />
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-price" />
        <div className="skeleton-button" />
      </div>
    </article>
  )
}

export default LoadingSkeleton
