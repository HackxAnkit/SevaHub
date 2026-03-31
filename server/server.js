const fs = require('fs/promises')
const { existsSync } = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const app = express()
const services = require('./data/services.json')
const Request = require('./models/Request')

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT) || 5000
const requestsFilePath = path.resolve(__dirname, 'data', 'requests.json')
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist')
const clientIndexPath = path.join(clientDistPath, 'index.html')

const categoryDetails = {
  'home-repair': {
    label: 'Home Repair',
    description: 'Fast fixes for plumbing, electrical, and appliance issues.',
  },
  tutoring: {
    label: 'Tutoring',
    description: 'One-on-one academic support and language coaching.',
  },
  delivery: {
    label: 'Delivery',
    description: 'Same-day pickups for groceries, parcels, and medicine.',
  },
  wellness: {
    label: 'Wellness',
    description: 'In-home care, mobility support, and recovery sessions.',
  },
  'business-support': {
    label: 'Business Support',
    description: 'Flexible admin, catalog, and digital operations help.',
  },
}

const allowedOrigins = (
  process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173']
).map((origin) => origin.trim()).filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`))
  },
  credentials: true,
}))
app.use(express.json())

function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

function getMongoStatus() {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected'
    case 2:
      return 'connecting'
    case 3:
      return 'disconnecting'
    default:
      return process.env.MONGO_URI ? 'unavailable' : 'not-configured'
  }
}

function getActiveStorage() {
  return isMongoConnected() ? 'mongodb' : 'local-json'
}

async function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not set. Using local JSON storage for requests.')
    return
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB connected!')
  } catch (error) {
    console.error('MongoDB error:', error.message)
  }
}

async function ensureRequestsFile() {
  await fs.mkdir(path.dirname(requestsFilePath), { recursive: true })

  if (!existsSync(requestsFilePath)) {
    await fs.writeFile(requestsFilePath, '[]\n')
  }
}

async function readRequestsFromFile() {
  await ensureRequestsFile()
  const raw = await fs.readFile(requestsFilePath, 'utf8')
  return JSON.parse(raw || '[]')
}

async function writeRequestsToFile(requests) {
  await ensureRequestsFile()
  await fs.writeFile(requestsFilePath, `${JSON.stringify(requests, null, 2)}\n`)
}

function toRequestResponse(request) {
  const createdAt = request.createdAt instanceof Date
    ? request.createdAt.toISOString()
    : request.createdAt

  return {
    id: request.requestId || request.id,
    createdAt,
    status: request.status,
    name: request.name,
    email: request.email,
    phone: request.phone,
    location: request.location,
    message: request.message,
    preferredDate: request.preferredDate,
    budget: request.budget,
    serviceId: request.serviceId,
    serviceTitle: request.serviceTitle,
    serviceCategory: request.serviceCategory,
  }
}

async function getRequestCount() {
  if (isMongoConnected()) {
    return Request.countDocuments()
  }

  const requests = await readRequestsFromFile()
  return requests.length
}

async function getRecentRequests(limit = 10) {
  if (isMongoConnected()) {
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return requests.map(toRequestResponse)
  }

  const requests = await readRequestsFromFile()
  return requests.slice(-limit).reverse().map(toRequestResponse)
}

async function createRequestRecord(payload, selectedService) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const createdAt = new Date()
  const baseRecord = {
    requestId,
    createdAt,
    status: 'new',
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    location: payload.location,
    message: payload.message,
    preferredDate: payload.preferredDate,
    budget: payload.budget,
    serviceId: selectedService?.id || null,
    serviceTitle: selectedService?.title || null,
    serviceCategory: selectedService?.category || payload.serviceCategory,
  }

  if (isMongoConnected()) {
    const request = await Request.create(baseRecord)
    return toRequestResponse(request.toObject())
  }

  const requests = await readRequestsFromFile()
  const fileRecord = {
    id: requestId,
    createdAt: createdAt.toISOString(),
    status: baseRecord.status,
    name: baseRecord.name,
    email: baseRecord.email,
    phone: baseRecord.phone,
    location: baseRecord.location,
    message: baseRecord.message,
    preferredDate: baseRecord.preferredDate,
    budget: baseRecord.budget,
    serviceId: baseRecord.serviceId,
    serviceTitle: baseRecord.serviceTitle,
    serviceCategory: baseRecord.serviceCategory,
  }

  requests.push(fileRecord)
  await writeRequestsToFile(requests)
  return toRequestResponse(fileRecord)
}

function toServiceResponse(service) {
  return {
    ...service,
    categoryLabel: categoryDetails[service.category]?.label || service.category,
  }
}

function getFilteredServices(filters = {}) {
  const category = filters.category?.trim().toLowerCase() || ''
  const search = filters.search?.trim().toLowerCase() || ''
  const featuredOnly = filters.featured === 'true'

  return services
    .filter((service) => {
      if (category && category !== 'all' && service.category !== category) {
        return false
      }

      if (featuredOnly && !service.featured) {
        return false
      }

      if (!search) {
        return true
      }

      const searchableContent = [
        service.title,
        service.providerName,
        service.city,
        service.area,
        service.summary,
        ...(service.tags || []),
      ].join(' ').toLowerCase()

      return searchableContent.includes(search)
    })
    .sort((left, right) => {
      if (left.featured !== right.featured) {
        return Number(right.featured) - Number(left.featured)
      }

      if (left.rating !== right.rating) {
        return right.rating - left.rating
      }

      return left.startingPrice - right.startingPrice
    })
    .map(toServiceResponse)
}

function buildCategories() {
  return Object.entries(categoryDetails).map(([id, details]) => ({
    id,
    ...details,
    count: services.filter((service) => service.category === id).length,
  }))
}

function buildStats(requestCount) {
  const totalRating = services.reduce((sum, service) => sum + service.rating, 0)
  const uniqueCities = new Set(services.map((service) => service.city))
  const sameDaySlots = services.filter((service) => service.availability === 'Same day').length
  const storageDetail = isMongoConnected()
    ? 'Stored in MongoDB as requests are submitted'
    : 'Stored locally while MongoDB is unavailable'

  return [
    {
      label: 'Verified providers',
      value: String(services.length),
      detail: 'Curated demo providers ready to browse now',
    },
    {
      label: 'Average rating',
      value: `${(totalRating / services.length).toFixed(1)}/5`,
      detail: 'Pulled from provider review snapshots',
    },
    {
      label: 'Cities active',
      value: String(uniqueCities.size),
      detail: 'Live catalogue across metro neighborhoods',
    },
    {
      label: 'Requests captured',
      value: String(requestCount),
      detail: storageDetail,
    },
    {
      label: 'Same-day options',
      value: String(sameDaySlots),
      detail: 'Ideal for urgent household and errand tasks',
    },
  ]
}

function buildHealthPayload() {
  return {
    status: 'ok',
    api: 'available',
    mongo: getMongoStatus(),
    storage: getActiveStorage(),
    frontendBuilt: existsSync(clientIndexPath),
  }
}

function buildDashboard(requestCount) {
  const categories = buildCategories()
  const catalogue = services.map(toServiceResponse)
  const requestStorage = isMongoConnected()
    ? 'New requests are written to MongoDB immediately.'
    : 'Requests fall back to a local JSON file until MongoDB is available.'

  return {
    hero: {
      eyebrow: 'Trust-first local services',
      headline: 'Find the right person for home, study, delivery, and care in minutes.',
      description:
        'SevaHub now ships as a working full-stack demo with searchable providers, live API filters, and a request intake flow that works without extra infrastructure.',
    },
    categories,
    featuredServices: catalogue.filter((service) => service.featured).slice(0, 3),
    catalogue,
    stats: buildStats(requestCount),
    trustPoints: [
      'Provider cards highlight ratings, response windows, and pricing upfront.',
      requestStorage,
      'The live health card shows whether requests are using MongoDB or local fallback storage.',
    ],
    status: buildHealthPayload(),
  }
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function validateRequestPayload(payload) {
  const errors = {}
  const selectedService = payload.serviceId
    ? services.find((service) => service.id === payload.serviceId)
    : null

  if (!payload.name || payload.name.length < 2) {
    errors.name = 'Please enter your name.'
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  const digits = payload.phone.replace(/\D/g, '')
  if (digits.length < 10) {
    errors.phone = 'Please enter a phone number with at least 10 digits.'
  }

  if (!selectedService && !payload.serviceCategory) {
    errors.service = 'Choose a service or category before submitting.'
  }

  if (payload.serviceCategory && !categoryDetails[payload.serviceCategory]) {
    errors.serviceCategory = 'Select a valid category.'
  }

  return {
    errors,
    selectedService,
  }
}

app.get('/api/health', (req, res) => {
  res.json(buildHealthPayload())
})

app.get('/health', (req, res) => {
  res.json(buildHealthPayload())
})

app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    ...buildHealthPayload(),
  })
})

app.get('/api/categories', (req, res) => {
  res.json({
    items: buildCategories(),
  })
})

app.get('/api/services', (req, res) => {
  const items = getFilteredServices(req.query)

  res.json({
    items,
    total: items.length,
    filters: {
      category: req.query.category || 'all',
      search: req.query.search || '',
      featured: req.query.featured === 'true',
    },
  })
})

app.get('/api/services/:serviceId', (req, res) => {
  const service = services.find((entry) => entry.id === req.params.serviceId)

  if (!service) {
    res.status(404).json({ message: 'Service not found.' })
    return
  }

  res.json({
    item: toServiceResponse(service),
  })
})

app.get('/api/dashboard', async (req, res, next) => {
  try {
    const requestCount = await getRequestCount()
    res.json(buildDashboard(requestCount))
  } catch (error) {
    next(error)
  }
})

app.get('/api/requests', async (req, res, next) => {
  try {
    const [total, items] = await Promise.all([
      getRequestCount(),
      getRecentRequests(),
    ])

    res.json({
      total,
      items,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/requests', async (req, res, next) => {
  try {
    const payload = {
      name: sanitizeText(req.body.name),
      email: sanitizeText(req.body.email),
      phone: sanitizeText(req.body.phone),
      location: sanitizeText(req.body.location),
      message: sanitizeText(req.body.message),
      preferredDate: sanitizeText(req.body.preferredDate),
      budget: sanitizeText(req.body.budget),
      serviceId: sanitizeText(req.body.serviceId),
      serviceCategory: sanitizeText(req.body.serviceCategory),
    }

    const { errors, selectedService } = validateRequestPayload(payload)

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        message: 'Please fix the highlighted fields.',
        errors,
      })
      return
    }

    const requestRecord = await createRequestRecord(payload, selectedService)

    res.status(201).json({
      message: 'Your request has been saved. A provider can now follow up.',
      request: requestRecord,
    })
  } catch (error) {
    next(error)
  }
})

if (existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath))

  app.get(/^\/(?!api(?:\/|$)|health$|test$).*/, (req, res) => {
    res.sendFile(clientIndexPath)
  })
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'SevaHub backend is running. Build the client to serve the frontend here.',
      ...buildHealthPayload(),
    })
  })
}

app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({
    message: 'Something went wrong on the server.',
  })
})

async function startServer() {
  await ensureRequestsFile()
  await connectToDatabase()

  return new Promise((resolve) => {
    const server = app.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`)
      console.log(`MongoDB status: ${getMongoStatus()}`)
      resolve(server)
    })
  })
}

if (require.main === module) {
  startServer()
}

module.exports = {
  app,
  startServer,
}
