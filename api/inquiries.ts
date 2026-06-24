import type { VercelRequest, VercelResponse } from '@vercel/node'

type InquiryStatus = 'new' | 'archived'
type Inquiry = {
  id: string
  createdAt: string
  name: string
  email: string
  service: string
  details: string
  status: InquiryStatus
}

declare global {
  // eslint-disable-next-line no-var
  var __eckoInquiries: Inquiry[] | undefined
}

const allowedOrigins = new Set([
  'https://dashboard.qecko-digital-solutions-3wtm.arcada.app',
  'https://qecko-digital-solutions-3wtm.arcada.app',
  'https://ecko-digital-solutions.vercel.app',
  'http://localhost:5173',
])

const setCorsHeaders = (request: VercelRequest, response: VercelResponse) => {
  const origin = request.headers.origin
  const allowedOrigin = typeof origin === 'string' && allowedOrigins.has(origin) ? origin : 'https://dashboard.qecko-digital-solutions-3wtm.arcada.app'

  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.setHeader('Cache-Control', 'no-store')
}

const getInquiries = () => {
  if (!globalThis.__eckoInquiries) globalThis.__eckoInquiries = []
  return globalThis.__eckoInquiries
}

const cleanText = (value: unknown) => (typeof value === 'string' ? value.trim().slice(0, 4000) : '')

export default function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(request, response)

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (request.method === 'GET') {
    response.status(200).json({ inquiries: getInquiries().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) })
    return
  }

  if (request.method === 'POST') {
    const name = cleanText(request.body?.name)
    const email = cleanText(request.body?.email)
    const service = cleanText(request.body?.service)
    const details = cleanText(request.body?.details)

    if (!name || !email || !service || !details) {
      response.status(400).json({ error: 'Missing required inquiry fields' })
      return
    }

    const inquiry: Inquiry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      name,
      email,
      service,
      details,
      status: 'new',
    }

    getInquiries().unshift(inquiry)
    response.status(201).json({ ok: true, inquiry })
    return
  }

  if (request.method === 'PATCH') {
    const id = cleanText(request.body?.id)
    const status = cleanText(request.body?.status) as InquiryStatus

    if (!id || !['new', 'archived'].includes(status)) {
      response.status(400).json({ error: 'Invalid archive payload' })
      return
    }

    const inquiry = getInquiries().find((item) => item.id === id)
    if (!inquiry) {
      response.status(404).json({ error: 'Inquiry not found' })
      return
    }

    inquiry.status = status
    response.status(200).json({ ok: true, inquiry })
    return
  }

  if (request.method === 'DELETE') {
    const id = cleanText(request.query.id)
    if (!id) {
      response.status(400).json({ error: 'Missing inquiry id' })
      return
    }

    globalThis.__eckoInquiries = getInquiries().filter((item) => item.id !== id)
    response.status(200).json({ ok: true })
    return
  }

  response.setHeader('Allow', 'GET,POST,PATCH,DELETE,OPTIONS')
  response.status(405).json({ error: 'Method not allowed' })
}
