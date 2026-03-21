import { formatPrice } from '../utils/formatters'

function ServiceCard({ service, onChooseService }) {
  return (
    <article className="service-card">
      <div className="service-card-top">
        <div>
          <p className="service-category">{service.categoryLabel}</p>
          <h3>{service.title}</h3>
        </div>
        {service.featured ? <span className="service-badge">Featured</span> : null}
      </div>

      <p className="service-summary">{service.summary}</p>

      <div className="service-meta">
        <span>
          {service.city}, {service.area}
        </span>
        <span>{service.responseTime} response</span>
        <span>{service.availability}</span>
      </div>

      <div className="service-rating">
        <strong>{service.rating}/5</strong>
        <span>{service.reviews} reviews</span>
      </div>

      <div className="service-tags">
        {service.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="service-footer">
        <div>
          <p className="price-label">Starting at</p>
          <strong>
            {formatPrice(service.startingPrice)} / {service.priceUnit}
          </strong>
        </div>
        <a className="card-action" href="#request" onClick={() => onChooseService(service.id)}>
          Choose service
        </a>
      </div>
    </article>
  )
}

export default ServiceCard
