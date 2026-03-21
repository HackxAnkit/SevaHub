import { useDeferredValue, useEffect, useState } from 'react'
import './App.css'
import { buildApiUrl } from './api'
import HeroSection from './components/HeroSection'
import CategoryPanel from './components/CategoryPanel'
import RequestPanel from './components/RequestPanel'

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

  const selectedService = dashboard?.catalog?.find((service) => service.id === form.serviceId) || null

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
      <HeroSection loadingDashboard={loadingDashboard} dashboard={dashboard} />

      <CategoryPanel
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={dashboard?.categories || []}
        loadingServices={loadingServices}
        services={services}
        servicesError={servicesError}
        pageError={pageError}
        onChooseService={handleChooseService}
      />

      <RequestPanel
        selectedService={selectedService}
        handleSubmit={handleSubmit}
        form={form}
        handleInputChange={handleInputChange}
        fieldErrors={fieldErrors}
        dashboard={dashboard}
        submitState={submitState}
      />
    </div>
  )
}

export default App
