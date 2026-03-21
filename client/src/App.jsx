import { useDeferredValue, useEffect, useState } from 'react'
import './App.css'
import { buildApiUrl } from './api'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  preferredDate: '',
  budget: '',
  message: '',
  serviceId: '',
}

function formatPrice(value) {
  return `Rs. ${new Intl.NumberFormat('en-IN').format(value)}`
}

function buildQuery(category, search) {
  const params = new URLSearchParams()

  if (category && category !== 'all') {
    params.set('category', category)
  }

  if (search.trim()) {
    params.set('search', search.trim())
  }

  const queryString = params.toString()
  return queryString ? `/api/services?${queryString}` : '/api/services'
}

function App() {
  const [dashboard, setDashboard] = useState(null)
  const [services, setServices] = useState([])
  const [pageError, setPageError] = useState('')
  const [servicesError, setServicesError] = useState('')
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [loadingServices, setLoadingServices] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
    requestId: '',
  })

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      setLoadingDashboard(true)
      setPageError('')

      try {
        const response = await fetch(buildApiUrl('/api/dashboard'))

        if (!response.ok) {
          throw new Error(`Dashboard request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (!ignore) {
          setDashboard(data)
        }
      } catch (error) {
        if (!ignore) {
          setPageError(error.message)
        }
      } finally {
        if (!ignore) {
          setLoadingDashboard(false)
        }
      }
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadServices() {
      setLoadingServices(true)
      setServicesError('')

      try {
        const response = await fetch(buildApiUrl(buildQuery(selectedCategory, deferredSearch)))

        if (!response.ok) {
          throw new Error(`Services request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (!ignore) {
          setServices(data.items)
        }
      } catch (error) {
        if (!ignore) {
          setServicesError(error.message)
          setServices([])
        }
      } finally {
        if (!ignore) {
          setLoadingServices(false)
        }
      }
    }

    loadServices()

    return () => {
      ignore = true
    }
  }, [selectedCategory, deferredSearch])

  const selectedService = dashboard?.catalog.find((service) => service.id === form.serviceId) || null

  function handleChooseService(serviceId) {
    setForm((current) => ({
      ...current,
      serviceId,
    }))
    setSubmitState({
      status: 'idle',
      message: '',
      requestId: '',
    })
  }

  function handleInputChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
      service: '',
      serviceCategory: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitState({
      status: 'submitting',
      message: 'Saving your request...',
      requestId: '',
    })
    setFieldErrors({})

    try {
      const response = await fetch(buildApiUrl('/api/requests'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          serviceCategory: form.serviceId
            ? ''
            : selectedCategory !== 'all'
              ? selectedCategory
              : '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setFieldErrors(data.errors || {})
        throw new Error(data.message || 'Unable to save your request.')
      }

      setSubmitState({
        status: 'success',
        message: data.message,
        requestId: data.request.id,
      })
      setForm((current) => ({
        ...initialForm,
        serviceId: current.serviceId,
      }))
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error.message,
        requestId: '',
      })
    }
  }

  return (
    <div className="page-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">
            {loadingDashboard ? 'Loading platform details...' : dashboard?.hero.eyebrow || 'SevaHub'}
          </p>
          <h1>
            {dashboard?.hero.headline || 'Find trusted help for everyday services without the guesswork.'}
          </h1>
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plumbing, tutoring, delivery..."
            />
          </label>
        </div>

        <div className="category-pills">
          <button
            className={selectedCategory === 'all' ? 'category-pill active' : 'category-pill'}
            type="button"
            onClick={() => setSelectedCategory('all')}
          >
            All services
          </button>

          {(dashboard?.categories || []).map((category) => (
            <button
              className={selectedCategory === category.id ? 'category-pill active' : 'category-pill'}
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
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

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="service-card-top">
                <div>
                  <p className="service-category">{service.categoryLabel}</p>
                  <h3>{service.title}</h3>
                </div>
                {service.featured ? <span className="service-badge">Featured</span> : null}
              </div>

              <p className="service-summary">{service.summary}</p>

              <div className="service-meta">
                <span>{service.city}, {service.area}</span>
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
                  <strong>{formatPrice(service.startingPrice)} / {service.priceUnit}</strong>
                </div>
                <a
                  className="card-action"
                  href="#request"
                  onClick={() => handleChooseService(service.id)}
                >
                  Choose service
                </a>
              </div>
            </article>
          ))}
        </div>

        {!loadingServices && services.length === 0 ? (
          <div className="empty-state">
            <h3>No matches found</h3>
            <p>Try a broader search or switch back to all categories.</p>
          </div>
        ) : null}
      </section>

      <section className="request-panel" id="request">
        <div className="request-copy">
          <p className="section-kicker">Request help</p>
          <h2>Send one request and keep the follow-up simple.</h2>
          <p>
            Pick a provider if you already found the right fit, or leave the selection open and
            use the category filter above to guide your request.
          </p>

          <div className="selected-service-card">
            <span className="selected-label">Selected provider</span>
            <strong>{selectedService?.title || 'No specific service chosen yet'}</strong>
            <p>
              {selectedService
                ? `${selectedService.providerName} in ${selectedService.city} | ${formatPrice(selectedService.startingPrice)} / ${selectedService.priceUnit}`
                : 'You can still submit a category-led request without choosing a specific listing.'}
            </p>
          </div>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Your full name"
            />
            {fieldErrors.name ? <small>{fieldErrors.name}</small> : null}
          </label>

          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
            />
            {fieldErrors.email ? <small>{fieldErrors.email}</small> : null}
          </label>

          <label>
            <span>Phone</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="+91 98xxxxxx12"
            />
            {fieldErrors.phone ? <small>{fieldErrors.phone}</small> : null}
          </label>

          <label>
            <span>Location</span>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleInputChange}
              placeholder="Area or city"
            />
          </label>

          <label>
            <span>Preferred date</span>
            <input
              name="preferredDate"
              type="date"
              value={form.preferredDate}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span>Budget</span>
            <input
              name="budget"
              type="text"
              value={form.budget}
              onChange={handleInputChange}
              placeholder="Example: Rs. 1000"
            />
          </label>

          <label className="form-full">
            <span>Choose a listed service</span>
            <select name="serviceId" value={form.serviceId} onChange={handleInputChange}>
              <option value="">Use selected category instead</option>
              {(dashboard?.catalog || []).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} - {service.city}
                </option>
              ))}
            </select>
            {fieldErrors.service || fieldErrors.serviceCategory ? (
              <small>{fieldErrors.service || fieldErrors.serviceCategory}</small>
            ) : null}
          </label>

          <label className="form-full">
            <span>What do you need help with?</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleInputChange}
              rows="5"
              placeholder="Tell SevaHub what needs to happen, urgency, and any special instructions."
            />
          </label>

          <button className="submit-action" type="submit" disabled={submitState.status === 'submitting'}>
            {submitState.status === 'submitting' ? 'Submitting...' : 'Save request'}
          </button>

          {submitState.message ? (
            <p
              className={
                submitState.status === 'success' ? 'submit-message success' : 'submit-message error'
              }
            >
              {submitState.message}
              {submitState.requestId ? ` Request ID: ${submitState.requestId}` : ''}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  )
}

export default App
