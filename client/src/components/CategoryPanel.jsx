import ServiceGrid from './ServiceGrid'

function CategoryPanel({
  search,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  loadingServices,
  services,
  servicesError,
  pageError,
  onChooseService,
}) {
  return (
    <section className="category-panel" id="services">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Browse categories</p>
          <h2>Search providers by what you need today</h2>
        </div>
        <label className="search-field">
          <span className="sr-only">Search services</span>
          <input
            type="search"
            name="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search plumbing, tutoring, delivery..."
          />
        </label>
      </div>

      <div className="category-pills">
        <button
          className={selectedCategory === 'all' ? 'category-pill active' : 'category-pill'}
          type="button"
          onClick={() => onSelectCategory('all')}
        >
          All services
        </button>

        {categories.map((category) => (
          <button
            className={selectedCategory === category.id ? 'category-pill active' : 'category-pill'}
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
          >
            {category.label} <span>{category.count}</span>
          </button>
        ))}
      </div>

      <div className="results-header">
        <p>
          {loadingServices
            ? 'Refreshing the catalogue...'
            : `${services.length} service${services.length === 1 ? '' : 's'} ready to book`}
        </p>
        {servicesError ? <p className="inline-error">{servicesError}</p> : null}
        {pageError ? <p className="inline-error">{pageError}</p> : null}
      </div>

      <ServiceGrid
        services={services}
        loadingServices={loadingServices}
        onChooseService={onChooseService}
      />
    </section>
  )
}

export default CategoryPanel
