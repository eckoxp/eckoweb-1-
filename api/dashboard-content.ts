import type { VercelRequest, VercelResponse } from '@vercel/node'

type Lang = 'en' | 'ar'
type WorkFilter = 'websites' | 'apps' | 'designs' | 'media'
type WorkItem = {
  title: string
  category: WorkFilter
  date: string
  tags: string[]
  description: string
  image?: string
  link?: string
  empty?: boolean
}
type PlanItem = [string, string, string, string[]]
type DashboardData = {
  works: Record<Lang, WorkItem[]>
  plans: Record<Lang, PlanItem[]>
}

declare global {
  // eslint-disable-next-line no-var
  var __eckoDashboardData: DashboardData | undefined
}

const emptyData: DashboardData = {
  works: { ar: [], en: [] },
  plans: { ar: [], en: [] },
}

const allowedOrigins = new Set([
  'https://dashboard.qecko-digital-solutions-3wtm.arcada.app',
  'https://qecko-digital-solutions-3wtm.arcada.app',
  'https://ecko-digital-solutions.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
])

const isDashboardData = (value: unknown): value is DashboardData => {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<DashboardData>
  return Array.isArray(data.works?.ar) && Array.isArray(data.works?.en) && Array.isArray(data.plans?.ar) && Array.isArray(data.plans?.en)
}

const setCorsHeaders = (request: VercelRequest, response: VercelResponse) => {
  const origin = request.headers.origin
  const allowedOrigin = typeof origin === 'string' && allowedOrigins.has(origin) ? origin : 'https://dashboard.qecko-digital-solutions-3wtm.arcada.app'

  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.setHeader('Cache-Control', 'no-store')
}

export default function handler(request: VercelRequest, response: VercelResponse) {
  setCorsHeaders(request, response)

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (request.method === 'GET') {
    response.status(200).json(globalThis.__eckoDashboardData ?? emptyData)
    return
  }

  if (request.method === 'POST') {
    if (!isDashboardData(request.body)) {
      response.status(400).json({ error: 'Invalid dashboard payload' })
      return
    }

    globalThis.__eckoDashboardData = request.body
    response.status(200).json({ ok: true, data: globalThis.__eckoDashboardData })
    return
  }

  response.setHeader('Allow', 'GET,POST,OPTIONS')
  response.status(405).json({ error: 'Method not allowed' })
}
