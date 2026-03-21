import ServiceCard from './ServiceCard'
import LoadingSkeleton from './LoadingSkeleton'

function ServiceGrid({ services, loadingServices, onChooseService }) {
  return (
    <>
      <div className="service-grid">
        {loadingServices
          ? Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={`skeleton-${index}`} />)
          : services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onChooseService={onChooseService}
              />
            ))}
      </div>

      {!loadingServices && services.length === 0 ? (
        <div className="empty-state">
          <h3>No matches found</h3>
          <p>Try a broader search or switch back to all categories.</p>
        </div>
      ) : null}
    </>
  )
}

export default ServiceGrid
