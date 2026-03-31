import { formatPrice } from '../utils/formatters'

function RequestPanel({
  selectedService,
  serviceOptions,
  handleSubmit,
  form,
  handleInputChange,
  fieldErrors,
  submitState,
}) {
  return (
    <section className="request-panel" id="request">
      <div className="request-copy">
        <p className="section-kicker">Request help</p>
        <h2>Send one request and keep the follow-up simple.</h2>
        <p>
          Pick a provider if you already found the right fit, or leave the selection open and use
          the category filter above to guide your request.
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
          <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleInputChange} />
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
            {serviceOptions.map((service) => (
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
          <p className={submitState.status === 'success' ? 'submit-message success' : 'submit-message error'}>
            {submitState.message}
            {submitState.requestId ? ` Request ID: ${submitState.requestId}` : ''}
          </p>
        ) : null}
      </form>
    </section>
  )
}

export default RequestPanel
