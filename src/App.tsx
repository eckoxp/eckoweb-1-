import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  DatabaseZap,
  Languages,
  Layers3,
  Menu,
  Moon,
  Play,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'

import './index.css'

type Lang = 'en' | 'ar'
type Theme = 'light' | 'dark'
type Page = 'home' | 'works' | 'admin'
type WorkFilter = 'all' | 'websites' | 'apps' | 'designs' | 'media'
type Billing = 'monthly' | 'yearly'
type InquiryStatus = 'new' | 'archived'
type WorkItem = {
  title: string
  category: Exclude<WorkFilter, 'all'>
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
type ContactFormState = {
  name: string
  email: string
  service: string
  details: string
}
type Inquiry = ContactFormState & {
  id: string
  createdAt: string
  status: InquiryStatus
}

const logo = '/uploads/upload_1.png'
const heroBackgroundVideo = '/videos/hero-background'
const dashboardStorageKey = 'ecko-dashboard-content-v2-reset'
const adminSessionKey = 'ecko-dashboard-auth-v2'
const dashboardSubdomain = 'dashboard.qecko-digital-solutions-3wtm.arcada.app'
const mainSiteDomain = 'qecko-digital-solutions-3wtm.arcada.app'
const adminEmail = 'info@eckosa.com'
const adminPassword = '123123123'
const emptyContactForm: ContactFormState = { name: '', email: '', service: '', details: '' }

const arabicDigitMap: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
}

const toEnglishDigits = (value: string) => value.replace(/[٠-٩۰-۹]/g, (digit) => arabicDigitMap[digit] ?? digit)

const createEmptyWork = (): WorkItem => ({ title: '', category: 'websites', date: '', tags: [], description: '', image: '', link: '' })

const createBilingualWorkDraft = (): Record<Lang, WorkItem> => ({
  ar: createEmptyWork(),
  en: createEmptyWork(),
})

const translateDictionary: Record<string, string> = {
  'مواقع إلكترونية': 'Websites',
  'تطبيقات': 'Applications',
  'تصاميم': 'Designs',
  'إنتاج إعلامي': 'Media Production',
  'شهري': 'Monthly',
  'سنوي': 'Yearly',
  'ريال': 'SAR',
  'هوية بصرية': 'Visual identity',
  'موقع شركة': 'Company website',
  'دعم فني': 'Technical support',
}

const fallbackTranslate = (text: string) => {
  let translated = text
  Object.entries(translateDictionary).forEach(([ar, en]) => {
    translated = translated.replaceAll(ar, en)
  })
  return translated
}

const translateArabicToEnglish = async (text: string) => {
  const cleanText = text.trim()
  if (!cleanText) return ''

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`,
    )
    const payload = await response.json()
    const translated = Array.isArray(payload?.[0]) ? payload[0].map((part: unknown[]) => part?.[0] ?? '').join('') : ''
    return translated || fallbackTranslate(cleanText)
  } catch {
    return fallbackTranslate(cleanText)
  }
}

const copy = {
  en: {
    nav: ['Home', 'Services', 'Works', 'Dashboard', 'Pricing', 'Contact'],
    pill: 'ecko company profile — technology, marketing, and innovation',
    heroTitle: 'Your partner for digital transformation and smart growth.',
    heroText:
      'ecko is a Saudi digital solutions company that combines strategy, creative design, software development, digital marketing, automation, and AI to help brands launch, operate, and scale with confidence.',
    primary: 'Request a consultation',
    secondary: 'Explore our profile',
    stats: [
      ['70+', 'Websites & apps'],
      ['20K+', 'Videos & designs'],
      ['24/7', 'Technical support'],
    ],
    servicesTitle: 'Our core services',
    servicesText:
      'Focused digital services for applications, websites, private systems, media production, and design.',
    pricingTitle: 'Engagement options',
    ctaTitle: 'Let’s build your digital presence with ecko.',
    ctaText: 'Share your goals and we will recommend the right mix of branding, software, marketing, automation, and support.',
    contactTitle: 'Start with ecko',
    form: ['Full name', 'Work email', 'Service needed', 'Tell us about your business'],
    send: 'Send inquiry',
    footer: 'Branding, websites, software, marketing, automation, and AI solutions.',
    labels: ['Services', 'Engagement', 'Profile', 'Contact'],
    email: 'info@eckosa.com',
    location: 'Saudi Arabia • GCC • Remote worldwide',
  },
  ar: {
    nav: ['الرئيسية', 'الخدمات', 'أعمالنا', 'لوحة التحكم', 'الباقات', 'تواصل'],
    pill: 'بروفايل ecko — تقنية وتسويق وابتكار',
    heroTitle: 'شريكك للتحول الرقمي والنمو الذكي.',
    heroText:
      'ecko شركة سعودية للحلول الرقمية تجمع بين الاستراتيجية والتصميم الإبداعي وتطوير البرمجيات والتسويق الرقمي والأتمتة والذكاء الاصطناعي لمساعدة العلامات على الانطلاق والتشغيل والتوسع بثقة.',
    primary: 'اطلب استشارة',
    secondary: 'استعرض البروفايل',
    stats: [
      ['70+', 'موقع وتطبيق'],
      ['20K+', 'فيديو وتصميم'],
      ['24/7', 'دعم فني'],
    ],
    servicesTitle: 'خدماتنا الأساسية',
    servicesText:
      'خدمات رقمية مركزة تشمل برمجة التطبيقات ومواقع الويب والأنظمة الخاصة والإنتاج الإعلامي والتصميم.',
    pricingTitle: 'خيارات التعاون',
    ctaTitle: 'لنصنع حضورك الرقمي.',
    ctaText: 'شاركنا أهدافك وسنقترح المزيج الأنسب من الهوية والبرمجة والتسويق والأتمتة والدعم.',
    contactTitle: 'ابدأ',
    form: ['الاسم الكامل', 'البريد الإلكتروني للعمل', 'الخدمة المطلوبة', 'حدثنا عن نشاطك'],
    send: 'إرسال الاستفسار',
    footer: 'هوية، مواقع، برمجيات، تسويق، أتمتة، وحلول ذكاء اصطناعي.',
    labels: ['الخدمات', 'التعاون', 'البروفايل', 'تواصل'],
    email: 'info@eckosa.com',
    location: 'السعودية • الخليج • عن بُعد عالميًا',
  },
}

const serviceData = {
  en: [
    ['Mobile App Development', 'iOS and Android apps, customer portals, booking journeys, and scalable mobile experiences.', Layers3],
    ['Websites & Landing Pages', 'Corporate websites, landing pages, SEO-ready structures, and conversion-focused experiences.', Code2],
    ['Custom Systems', 'Private dashboards, CRMs, internal portals, workflow systems, and business integrations.', DatabaseZap],
    ['Media Production', 'Production planning, campaign content, video direction, reels, and social media creative assets.', Play],
    ['Design & Branding', 'Brand identities, UI/UX screens, presentations, social templates, and campaign visuals.', Sparkles],
    ['Digital Marketing & AI', 'Campaign strategy, performance reporting, automation, chatbots, and AI-powered workflows.', BrainCircuit],
  ],
  ar: [
    ['برمجة التطبيقات', 'تطبيقات iOS و Android وبوابات العملاء ورحلات الحجز وتجارب جوال قابلة للتوسع.', Layers3],
    ['مواقع الويب وصفحات الهبوط', 'مواقع شركات وصفحات تسويقية وبنية صديقة لمحركات البحث وتجارب تركز على التحويل.', Code2],
    ['الأنظمة الخاصة', 'لوحات تحكم وأنظمة CRM وبوابات داخلية وأنظمة سير عمل وتكاملات للأعمال.', DatabaseZap],
    ['الإنتاج الإعلامي', 'تخطيط إنتاج ومحتوى حملات وإخراج فيديو ومقاطع قصيرة ومواد إبداعية للسوشيال.', Play],
    ['التصميم والهوية', 'هويات بصرية وواجهات UI/UX وعروض تقديمية وقوالب سوشيال ومواد حملات.', Sparkles],
    ['التسويق الرقمي والذكاء الاصطناعي', 'استراتيجيات حملات وتقارير أداء وأتمتة ومحادثات ذكية وسير عمل مدعوم بالذكاء الاصطناعي.', BrainCircuit],
  ],
}

const stackedServices = {
  en: [
    ['Mobile App Development', 'iOS and Android apps, customer portals, booking journeys, and scalable mobile experiences.', Layers3, '📱', 'bg-[#d4edda]'],
    ['Websites & Landing Pages', 'Corporate websites, marketing pages, SEO-friendly structures, and conversion-focused experiences.', Code2, '💻', 'bg-[#fdf5d1]'],
    ['Custom Systems', 'Dashboards, CRM systems, internal portals, workflow tools, and business integrations.', DatabaseZap, '⚙️', 'bg-[#e0d8f5]'],
    ['Media Production', 'Campaign videos, reels, creative direction, production planning, and social media assets.', Play, '🎬', 'bg-[#ffd8cc]'],
    ['Design & Branding', 'Visual identities, UI/UX screens, brand systems, presentations, and social templates.', Sparkles, '🎨', 'bg-[#d9f3ff]'],
    ['Digital Marketing & AI', 'Performance campaigns, reporting, automation, chatbots, and AI-powered growth workflows.', BrainCircuit, '🚀', 'bg-[#f2dcff]'],
  ],
  ar: [
    ['برمجة التطبيقات', 'تطبيقات iOS و Android وبوابات العملاء ورحلات الحجز وتجارب جوال قابلة للتوسع.', Layers3, '📱', 'bg-[#d4edda]'],
    ['مواقع الويب وصفحات الهبوط', 'مواقع شركات وصفحات تسويقية وبنية صديقة لمحركات البحث وتجارب تركز على التحويل.', Code2, '💻', 'bg-[#fdf5d1]'],
    ['الأنظمة الخاصة', 'لوحات تحكم وأنظمة CRM وبوابات داخلية وأنظمة سير عمل وتكاملات للأعمال.', DatabaseZap, '⚙️', 'bg-[#e0d8f5]'],
    ['الإنتاج الإعلامي', 'فيديوهات حملات ومقاطع قصيرة وإخراج إبداعي وتخطيط إنتاج ومواد للسوشيال.', Play, '🎬', 'bg-[#ffd8cc]'],
    ['التصميم والهوية', 'هويات بصرية وواجهات UI/UX وأنظمة علامات وعروض تقديمية وقوالب سوشيال.', Sparkles, '🎨', 'bg-[#d9f3ff]'],
    ['التسويق الرقمي والذكاء الاصطناعي', 'حملات أداء وتقارير وأتمتة ومحادثات ذكية وسير عمل مدعوم بالذكاء الاصطناعي.', BrainCircuit, '🚀', 'bg-[#f2dcff]'],
  ],
}

const plans = {
  en: [
    [
      'Start',
      'Essential website care and light monthly updates',
      'Monthly: SAR 890|Yearly: SAR 8,900',
      [
        'Unlimited technical support within fair usage + one active task at a time',
        'Weekly backup',
        'Add up to one page monthly',
        'Simple edits for text, images, and formatting + unlimited small tasks',
      ],
    ],
    [
      'Growth',
      'Advanced support for growing websites and active updates',
      'Monthly: SAR 1,290|Yearly: SAR 15,390',
      [
        'Unlimited support + two active tasks at the same time',
        'Weekly backup',
        'Up to two pages monthly',
        'Edits + adding new elements inside pages',
        'Monthly speed optimization',
      ],
    ],
    [
      'Scale',
      'Professional care for high-priority and evolving digital platforms',
      'Monthly: SAR 1,890|Yearly: SAR 22,590',
      [
        'Unlimited support + three to four active tasks at the same time',
        'Weekly backup + external storage',
        'Up to four pages monthly',
        'Unlimited edits + adding page features + UX improvements',
        'Continuous optimization, live monitoring, and technical consulting',
      ],
    ],
  ],
  ar: [
    [
      'Start الأساسية',
      'رعاية أساسية للموقع وتحديثات شهرية خفيفة',
      'شهري: 890 ريال|سنوي: 8900 ريال',
      [
        'دعم فني غير محدود ضمن الاستخدام العادل',
        'نسخة احتياطية أسبوعية',
        'إضافة صفحة واحدة كحد أقصى شهريًا',
        'تعديلات بسيطة للنصوص والصور والتنسيق + غير محدودة للمهام الصغيرة',
      ],
    ],
    [
      'Growth المتقدمة',
      'دعم متقدم للمواقع النشطة والتحديثات المستمرة',
      'شهري: 1290 ريال|سنوي: 15390 ريال',
      [
        'دعم غير محدود',
        'نسخة احتياطية أسبوعية',
        'حتى 2 صفحات شهريًا',
        'تعديلات + إضافة عناصر جديدة داخل الصفحات',
        'تحسين سرعة شهري',
      ],
    ],
    [
      'Scale الاحترافية',
      'رعاية احترافية للمنصات المهمة والمتطورة',
      'شهري: 1890 ريال|سنوي: 22590 ريال',
      [
        'دعم غير محدود',
        'نسخة احتياطية أسبوعية + تخزين خارجي',
        'حتى 4 صفحات شهريًا',
        'تعديلات غير محدودة + إضافة ميزات داخل الصفحات + تحسين UX',
        'تحسين مستمر + مراقبة لحظية + استشارات تقنية',
      ],
    ],
  ],
}

const billingCopy = {
  en: {
    monthly: 'Monthly',
    yearly: 'Yearly',
    save: 'Annual billing gives you a better long-term value',
    included: 'What’s included',
    popular: 'Most Popular',
  },
  ar: {
    monthly: 'شهري',
    yearly: 'سنوي',
    save: 'الدفع السنوي يمنحك قيمة أفضل على المدى الطويل',
    included: 'المميزات المشمولة',
    popular: 'الأكثر طلبًا',
  },
}

const splitPlanPrice = (price: string) => {
  const [monthlyRaw = '', yearlyRaw = ''] = price.split('|')
  return {
    monthly: monthlyRaw.replace(/^Monthly:\s*|^Yearly:\s*|^شهري:\s*|^سنوي:\s*/i, '').trim(),
    yearly: yearlyRaw.replace(/^Monthly:\s*|^Yearly:\s*|^شهري:\s*|^سنوي:\s*/i, '').trim(),
  }
}

const composePlanPrice = (monthly: string, yearly: string) => `شهري: ${monthly}|سنوي: ${yearly}`

const getPlanPriceByBilling = (price: string, billing: Billing) => {
  const prices = splitPlanPrice(price)
  return billing === 'monthly' ? prices.monthly : prices.yearly || prices.monthly
}

const worksCopy = {
  en: {
    eyebrow: 'Our Works',
    title: 'Selected work inspired by Eskelah’s portfolio structure.',
    text: 'A case-study style page with large editorial spacing, service tags, project overview, dates, and narrative descriptions.',
    overview: 'Project overview',
    noItems: 'No items found.',
    contact: 'Contact us',
    back: 'Back to home',
    filterLabel: 'Filter works',
  },
  ar: {
    eyebrow: 'أعمالنــا',
    title: 'نماذج مختارة من أعمالنا',
    text: 'تفاصيل، نتائج، وأثر',
    overview: 'نظرة عن المشروع',
    noItems: 'No items found.',
    contact: 'تواصل معنا',
    back: 'العودة للرئيسية',
    filterLabel: 'فلترة الأعمال',
  },
}

const workFilters: Record<Lang, Array<{ key: WorkFilter; label: string }>> = {
  en: [
    { key: 'all', label: 'All' },
    { key: 'websites', label: 'Websites' },
    { key: 'apps', label: 'Apps' },
    { key: 'designs', label: 'Designs' },
    { key: 'media', label: 'Media' },
  ],
  ar: [
    { key: 'all', label: 'الكل' },
    { key: 'websites', label: 'مواقع إلكترونية' },
    { key: 'apps', label: 'تطبيقات' },
    { key: 'designs', label: 'تصاميم' },
    { key: 'media', label: 'إنتاج إعلامي' },
  ],
}

const legacyDummyWorks = {
  en: [
    {
      title: 'Manafe’ — New Investment Benefits',
      category: 'websites',
      date: 'Oct 2025',
      tags: ['Production & Execution', 'Creative Communication', 'Strategy'],
      description:
        'A marketing and digital presence management project. In December 2024, the Saudi Commission for Health Specialties organized a national graduation ceremony for more than 10,000 health practitioners at Al Awwal Park. Eskelah managed the full communication and creative campaign, including the strategic idea and the verbal identity “The biggest picture for the biggest impact”.',
    },
    {
      title: 'Visual Media Management & Creative Production',
      category: 'designs',
      date: 'Feb 2024',
      tags: ['Production & Execution', 'Creative Communication', 'Strategy'],
      description:
        'Eskelah managed the platforms of air navigation services with varied creative outputs for the aviation sector, including daily content, audience engagement, campaign concepts for global and local days, and continuous account updates guided by the brand’s visual and verbal identity.',
    },
    {
      title: 'Manafe’ — Hear the Voice',
      category: 'apps',
      date: 'Apr 2021',
      tags: ['Production & Execution', 'Creative Communication', 'Strategy'],
      description: '',
      empty: true,
    },
    {
      title: 'Afaq Academy for Culture and Arts',
      category: 'websites',
      date: 'Nov 2025',
      tags: ['Production & Execution', 'Creative Communication', 'Strategy', 'Media Buying & Management'],
      description: 'Text content about the academy and the project.',
    },
    {
      title: 'National Day — A Nation Backed by Its People',
      category: 'designs',
      date: 'Oct 2025',
      tags: ['Production & Execution', 'Creative Communication'],
      description:
        'In collaboration with the Ministry of Communications and Information Technology, an advertising film was produced for Saudi National Day with a distinctive creative idea highlighting the ministry’s presence.',
    },
  ],
  ar: [
    {
      title: 'منافــــــع  الاستثمــــار الجديـــد',
      category: 'websites',
      date: 'Oct 2025',
      tags: ['الإنتاج والتنفيذ', 'الاتصــال الإبداعــي', 'الاستراتيجية'],
      description:
        'الحملــــة التسويقيـة وإدارة التواجـــــد الرقمــــــي. في ديسمبر 2024، نظّمت الهيئة السعودية للتخصصات الصحية حفل تخريج وطني لأكثر من 10,000 ممارس صحي في ملعب الأول بارك، وتولّت إسكلة إدارة الحملة الاتصالية والإبداعية بشكل كامل. شمل الدور بناء الفكرة الاستراتيجية، وصناعة الشعار اللفظي "أكبر صورة لأكبر أثر"، الذي يرمز إلى التقاء الخريجين في صورة جماعية تعبّر عن أثرهم في مستقبل الرعاية الصحية.',
    },
    {
      title: 'إدارة الإعلام المرئي والإنتاج الإبداعي',
      category: 'designs',
      date: 'Feb 2024',
      tags: ['الإنتاج والتنفيذ', 'الاتصــال الإبداعــي', 'الاستراتيجية'],
      description:
        'فى إسكلة نفخر بإدارتنا لمنصات خدمات الملاحة الجوية وتقديم خدمات ومخرجات مختلفة ومتنوعة لإثراء مجال الطيران، حيث عملنا على حملات إبداعية مختلفة بناءً على أهم الأيام العالمية والمحلية في المجال، بالإضافة للمنشورات اليومية والتفاعل مع الجمهور والرد على الاستفسارات والتحديث المستمر للحسابات.',
    },
    {
      title: 'منافــــــع  اسمـع الصـوت',
      category: 'apps',
      date: 'Apr 2021',
      tags: ['الإنتاج والتنفيذ', 'الاتصــال الإبداعــي', 'الاستراتيجية'],
      description: '',
      empty: true,
    },
    {
      title: 'أكاديمية آفاق للثقافة والفنون',
      category: 'websites',
      date: 'Nov 2025',
      tags: ['الإنتاج والتنفيذ', 'الاتصــال الإبداعــي', 'الاستراتيجية', 'شراء وإدارة المساحات الإعلانية'],
      description: 'محتوى نصي عن الاكاديمية والمشروع.',
    },
    {
      title: 'اليـــوم الوطني  وطـــن خلفه عيالـــــه',
      category: 'designs',
      date: 'Oct 2025',
      tags: ['الإنتاج والتنفيذ', 'الاتصــال الإبداعــي'],
      description:
        'بالتعاون مع وزارة الاتصالات وتقنية المعلومات، تم إنتاج فيلم إعلاني لليوم الوطني السعودي، والذي تضمن فكرة إبداعية مميزة تبرز حضور الوزارة.',
    },
  ],
}

const defaultDashboardData: DashboardData = {
  works: { ar: [], en: [] },
  plans: { ar: [], en: [] },
}

const getDashboardApiUrl = () => {
  if (typeof window === 'undefined') return '/api/dashboard-content'

  if (window.location.hostname === dashboardSubdomain) {
    return `${window.location.protocol}//${mainSiteDomain}/api/dashboard-content`
  }

  if (window.location.hostname.startsWith('dashboard.')) {
    return `${window.location.protocol}//${window.location.hostname.replace(/^dashboard\./, '')}/api/dashboard-content`
  }

  return '/api/dashboard-content'
}

const getInquiriesApiUrl = () => {
  if (typeof window === 'undefined') return '/api/inquiries'

  if (window.location.hostname === dashboardSubdomain) {
    return `${window.location.protocol}//${mainSiteDomain}/api/inquiries`
  }

  if (window.location.hostname.startsWith('dashboard.')) {
    return `${window.location.protocol}//${window.location.hostname.replace(/^dashboard\./, '')}/api/inquiries`
  }

  return '/api/inquiries'
}

const loadDashboardData = (): DashboardData => {
  if (typeof window === 'undefined') return defaultDashboardData

  try {
    const saved = window.localStorage.getItem(dashboardStorageKey)
    if (!saved) return defaultDashboardData
    const parsed = JSON.parse(saved) as Partial<DashboardData>
    return {
      works: {
        ar: Array.isArray(parsed.works?.ar) ? parsed.works.ar : defaultDashboardData.works.ar,
        en: Array.isArray(parsed.works?.en) ? parsed.works.en : defaultDashboardData.works.en,
      },
      plans: {
        ar: Array.isArray(parsed.plans?.ar) ? parsed.plans.ar : defaultDashboardData.plans.ar,
        en: Array.isArray(parsed.plans?.en) ? parsed.plans.en : defaultDashboardData.plans.en,
      },
    }
  } catch {
    return defaultDashboardData
  }
}

const splitCountUpValue = (value: string) => {
  const parts: Array<string | number> = []
  let lastIndex = 0

  value.replace(/\d+/g, (match, index) => {
    if (index > lastIndex) parts.push(value.slice(lastIndex, index))
    parts.push(Number(match))
    lastIndex = index + match.length
    return match
  })

  if (lastIndex < value.length) parts.push(value.slice(lastIndex))
  return parts
}

function CountUpText({ value, duration = 1600 }: { value: string; duration?: number }) {
  const [progress, setProgress] = useState(0)
  const parts = useMemo(() => splitCountUpValue(toEnglishDigits(value)), [value])

  useEffect(() => {
    let frame = 0
    const start = performance.now()

    const animate = (now: number) => {
      const rawProgress = Math.min((now - start) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3)
      setProgress(easedProgress)

      if (rawProgress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    setProgress(0)
    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return (
    <span data-number>
      {parts.map((part, index) =>
        typeof part === 'number' ? Math.round(part * progress).toLocaleString('en-US') : <span key={`${part}-${index}`}>{part}</span>,
      )}
    </span>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [theme, setTheme] = useState<Theme>('dark')
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<Page>(() => {
    if (typeof window === 'undefined') return 'home'
    return window.location.hostname.startsWith('dashboard.') || window.location.search.includes('dashboard=true') ? 'admin' : 'home'
  })
  const [workFilter, setWorkFilter] = useState<WorkFilter>('all')
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [dashboardData, setDashboardData] = useState<DashboardData>(() => loadDashboardData())
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null)
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null)
  const [workDrafts, setWorkDrafts] = useState<Record<Lang, WorkItem>>(() => createBilingualWorkDraft())
  const [planDraft, setPlanDraft] = useState<PlanItem>(['', '', '', []])
  const [planMonthlyPrice, setPlanMonthlyPrice] = useState('')
  const [planYearlyPrice, setPlanYearlyPrice] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [adminAuthed, setAdminAuthed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(adminSessionKey) === 'true'
  })
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [contactForm, setContactForm] = useState<ContactFormState>(emptyContactForm)
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiriesLoading, setInquiriesLoading] = useState(false)
  const t = copy[lang]
  const w = worksCopy[lang]
  const b = billingCopy[lang]
  const rtl = lang === 'ar'

  const themeClass = `${theme === 'dark' ? 'dark' : ''} ${rtl ? 'font-arabic' : 'font-english'}`
  const navTargets = ['home', 'services', 'works', 'admin', 'pricing', 'contact']

  const year = useMemo(() => new Date().getFullYear(), [])
  const workDraft = workDrafts.ar
  const visibleWorks = useMemo(
    () => (dashboardData.works[lang].length > 0 ? dashboardData.works[lang] : (legacyDummyWorks[lang] as WorkItem[])),
    [dashboardData.works, lang],
  )
  const visiblePlans = useMemo(
    () => (dashboardData.plans[lang].length > 0 ? dashboardData.plans[lang] : plans[lang]),
    [dashboardData.plans, lang],
  )
  const filteredWorks = useMemo(
    () => visibleWorks.filter((work) => workFilter === 'all' || work.category === workFilter),
    [visibleWorks, workFilter],
  )

  useEffect(() => {
    window.localStorage.setItem(dashboardStorageKey, JSON.stringify(dashboardData))
  }, [dashboardData])

  useEffect(() => {
    fetch(getDashboardApiUrl(), { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: DashboardData | null) => {
        if (!payload?.works || !payload?.plans) return
        setDashboardData({
          works: {
            ar: Array.isArray(payload.works.ar) ? payload.works.ar : [],
            en: Array.isArray(payload.works.en) ? payload.works.en : [],
          },
          plans: {
            ar: Array.isArray(payload.plans.ar) ? payload.plans.ar : [],
            en: Array.isArray(payload.plans.en) ? payload.plans.en : [],
          },
        })
      })
      .catch(() => undefined)
  }, [])

  const loadInquiries = async () => {
    setInquiriesLoading(true)
    try {
      const response = await fetch(getInquiriesApiUrl(), { credentials: 'include' })
      const payload = await response.json()
      setInquiries(Array.isArray(payload.inquiries) ? payload.inquiries : [])
    } catch {
      setInquiries([])
    } finally {
      setInquiriesLoading(false)
    }
  }

  useEffect(() => {
    if (page === 'admin' && adminAuthed) {
      loadInquiries()
    }
  }, [page, adminAuthed])

  useEffect(() => {
    if (page !== 'admin' || !adminAuthed) return

    fetch(getDashboardApiUrl(), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dashboardData),
    }).catch(() => undefined)
  }, [dashboardData, page, adminAuthed])

  useEffect(() => {
    if (lang !== 'ar') return

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []

    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      if (/[٠-٩۰-۹]/.test(node.nodeValue ?? '')) {
        textNodes.push(node)
      }
    }

    textNodes.forEach((node) => {
      node.nodeValue = toEnglishDigits(node.nodeValue ?? '')
    })
  }, [lang, page, workFilter, billing])

  useEffect(() => {
    const root = document.querySelector('main')
    if (!root) return

    const elements = Array.from(
      root.querySelectorAll<HTMLElement>(
        'section h1, section h2, section h3, section p, section article, section form, section img:not([alt=""]), section .grid > div, section .flex > div',
      ),
    ).filter((element) => {
      const className = element.className.toString()
      return (
        !element.closest('header') &&
        !element.closest('nav') &&
        !element.closest('.ecko-3d-scene') &&
        !className.includes('absolute') &&
        !className.includes('fixed')
      )
    })

    elements.forEach((element, index) => {
      element.classList.add('reveal-item')
      element.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [page, lang, workFilter, billing, dashboardData])

  const scrollTo = (id: string) => {
    if (id === 'admin') {
      setSelectedWork(null)
      setPage('admin')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setOpen(false)
      return
    }
    if (id === 'works') {
      setSelectedWork(null)
      setPage('works')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setOpen(false)
      return
    }
    setSelectedWork(null)
    setPage('home')
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    setOpen(false)
  }

  const startNewWork = () => {
    setEditingWorkIndex(null)
    setWorkDrafts(createBilingualWorkDraft())
  }

  const updateWorkDraft = (language: Lang, updates: Partial<WorkItem>) => {
    setWorkDrafts((current) => ({
      ...current,
      [language]: { ...current[language], ...updates },
    }))
  }

  const updateArabicWorkDraft = (updates: Partial<WorkItem>) => updateWorkDraft('ar', updates)

  const uploadWorkImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const image = String(reader.result)
      setWorkDrafts((current) => ({
        ar: { ...current.ar, image },
        en: { ...current.en, image },
      }))
    }
    reader.readAsDataURL(file)
  }

  const editWork = (index: number) => {
    setEditingWorkIndex(index)
    const arWork = dashboardData.works.ar[index] ?? createEmptyWork()
    setWorkDrafts({
      ar: { ...arWork, tags: [...arWork.tags] },
      en: createEmptyWork(),
    })
  }

  const saveWork = async () => {
    if (!workDrafts.ar.title.trim()) return
    setIsTranslating(true)
    const arWork = workDrafts.ar
    const enWork: WorkItem = {
      ...arWork,
      title: await translateArabicToEnglish(arWork.title),
      description: await translateArabicToEnglish(arWork.description),
      tags: await Promise.all(arWork.tags.map((tag) => translateArabicToEnglish(tag))),
      date: fallbackTranslate(arWork.date),
    }
    setDashboardData((current) => {
      const nextArWorks = [...current.works.ar]
      const nextEnWorks = [...current.works.en]

      if (editingWorkIndex === null) {
        nextArWorks.unshift(arWork)
        nextEnWorks.unshift(enWork)
      } else {
        nextArWorks[editingWorkIndex] = arWork
        nextEnWorks[editingWorkIndex] = enWork
      }

      return { ...current, works: { ar: nextArWorks, en: nextEnWorks } }
    })
    setIsTranslating(false)
    startNewWork()
  }

  const deleteWork = (index: number) => {
    setDashboardData((current) => ({
      ...current,
      works: {
        ar: current.works.ar.filter((_, itemIndex) => itemIndex !== index),
        en: current.works.en.filter((_, itemIndex) => itemIndex !== index),
      },
    }))
    startNewWork()
  }

  const startNewPlan = () => {
    setEditingPlanIndex(null)
    setPlanDraft(['', '', '', []])
    setPlanMonthlyPrice('')
    setPlanYearlyPrice('')
  }

  const editPlan = (index: number) => {
    setEditingPlanIndex(index)
    const plan = dashboardData.plans.ar[index]
    const prices = splitPlanPrice(plan[2])
    setPlanDraft([plan[0], plan[1], plan[2], [...plan[3]]])
    setPlanMonthlyPrice(prices.monthly)
    setPlanYearlyPrice(prices.yearly)
  }

  const savePlan = async () => {
    if (!planDraft[0].trim()) return
    setIsTranslating(true)
    const arPrice = composePlanPrice(planMonthlyPrice.trim(), planYearlyPrice.trim())
    const enPlan: PlanItem = [
      await translateArabicToEnglish(planDraft[0]),
      await translateArabicToEnglish(planDraft[1]),
      fallbackTranslate(arPrice),
      await Promise.all(planDraft[3].map((feature) => translateArabicToEnglish(feature))),
    ]
    const arPlan: PlanItem = [planDraft[0], planDraft[1], arPrice, planDraft[3]]
    setDashboardData((current) => {
      const nextArPlans = [...current.plans.ar]
      const nextEnPlans = [...current.plans.en]
      if (editingPlanIndex === null) {
        nextArPlans.push(arPlan)
        nextEnPlans.push(enPlan)
      } else {
        nextArPlans[editingPlanIndex] = arPlan
        nextEnPlans[editingPlanIndex] = enPlan
      }
      return { ...current, plans: { ar: nextArPlans, en: nextEnPlans } }
    })
    setIsTranslating(false)
    startNewPlan()
  }

  const deletePlan = (index: number) => {
    setDashboardData((current) => ({
      ...current,
      plans: {
        ar: current.plans.ar.filter((_, itemIndex) => itemIndex !== index),
        en: current.plans.en.filter((_, itemIndex) => itemIndex !== index),
      },
    }))
    startNewPlan()
  }

  const resetDashboard = () => {
    setDashboardData(defaultDashboardData)
    startNewWork()
    startNewPlan()
  }

  const loginToDashboard = () => {
    if (loginEmail.trim().toLowerCase() === adminEmail && loginPassword === adminPassword) {
      window.sessionStorage.setItem(adminSessionKey, 'true')
      setAdminAuthed(true)
      setLoginError('')
      setLoginPassword('')
      return
    }

    setLoginError(rtl ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.')
  }

  const logoutFromDashboard = () => {
    window.sessionStorage.removeItem(adminSessionKey)
    setAdminAuthed(false)
    setLoginEmail('')
    setLoginPassword('')
    setLoginError('')
  }

  const updateInquiryStatus = async (id: string, status: InquiryStatus) => {
    await fetch(getInquiriesApiUrl(), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await loadInquiries()
  }

  const deleteInquiry = async (id: string) => {
    await fetch(`${getInquiriesApiUrl()}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await loadInquiries()
  }

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContactStatus('sending')

    try {
      const response = await fetch(getInquiriesApiUrl(), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      if (!response.ok) throw new Error('Failed to submit inquiry')

      setContactForm(emptyContactForm)
      setContactStatus('success')
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div className={themeClass} dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'ar-u-nu-latn' : 'en'}>
      <main className="min-h-screen overflow-x-hidden bg-[#f7f6ff] text-slate-950 transition-colors duration-500 dark:bg-[#07071a] dark:text-white">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-32 start-1/2 h-96 w-96 rounded-full bg-[#443db8]/20 blur-3xl" />
          <div className="absolute bottom-20 end-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
          <div className="ecko-3d-scene absolute inset-0 overflow-hidden">
            <div className="ecko-cube ecko-cube-one">
              <span />
              <span />
              <span />
            </div>
            <div className="ecko-cube ecko-cube-two">
              <span />
              <span />
              <span />
            </div>
            <div className="ecko-grid-3d" />
          </div>
        </div>

        <header className="fixed inset-x-0 top-0 z-50 px-4 py-4">
          <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/75 px-4 py-3 shadow-[0_20px_80px_rgba(68,61,184,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#101026]/75">
            <button onClick={() => scrollTo('home')} className="flex items-center gap-3">
              <img src={logo} alt="ecko" className="h-7 w-auto sm:h-8 dark:brightness-0 dark:invert" />
            </button>
            <div className="hidden items-center gap-1 lg:flex">
              {t.nav.map((item, index) => (
                <button
                  key={item}
                  onClick={() => scrollTo(navTargets[index])}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#443db8] hover:text-white dark:text-slate-300"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold dark:border-white/10 dark:bg-white/10"
                aria-label="Switch language"
              >
                <Languages size={17} /> {lang === 'en' ? 'AR' : 'EN'}
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#443db8] text-white shadow-lg shadow-[#443db8]/25"
                aria-label="Switch theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white lg:hidden dark:bg-white dark:text-slate-950">
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
          {open && (
            <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/60 bg-white/95 p-3 shadow-2xl dark:border-white/10 dark:bg-[#101026] lg:hidden">
              {t.nav.map((item, index) => (
                <button key={item} onClick={() => scrollTo(navTargets[index])} className="block w-full rounded-2xl px-4 py-3 text-start font-semibold hover:bg-[#443db8] hover:text-white">
                  {item}
                </button>
              ))}
            </div>
          )}
        </header>

        {page === 'admin' ? (
          !adminAuthed ? (
            <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-32">
              <div className="w-full max-w-xl rounded-[2.5rem] border border-white/70 bg-white/85 p-8 shadow-2xl shadow-[#443db8]/15 backdrop-blur-xl dark:border-white/10 dark:bg-[#101026]/85 sm:p-10">
                <span className="text-sm font-black uppercase tracking-[.35em] text-[#443db8] dark:text-cyan-300">Dashboard Login</span>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{rtl ? 'تسجيل الدخول للوحة التحكم' : 'Dashboard Access'}</h1>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                  {rtl ? 'أدخل البريد الإلكتروني وكلمة المرور للوصول إلى إدارة المحتوى.' : 'Enter the email and password to manage website content.'}
                </p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    loginToDashboard()
                  }}
                  className="mt-8 grid gap-4"
                >
                  <input
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    type="email"
                    autoComplete="username"
                    placeholder={rtl ? 'البريد الإلكتروني' : 'Email address'}
                    className="rounded-2xl border border-slate-200 bg-white/60 px-5 py-4 outline-none transition focus:border-[#443db8] dark:border-white/10 dark:bg-white/5"
                  />
                  <input
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder={rtl ? 'كلمة المرور' : 'Password'}
                    className="rounded-2xl border border-slate-200 bg-white/60 px-5 py-4 outline-none transition focus:border-[#443db8] dark:border-white/10 dark:bg-white/5"
                  />
                  {loginError && <div className="rounded-2xl bg-red-500/10 px-5 py-3 font-bold text-red-500">{loginError}</div>}
                  <button className="rounded-full bg-[#443db8] px-6 py-4 font-black text-white shadow-xl shadow-[#443db8]/25">
                    {rtl ? 'دخول لوحة التحكم' : 'Login to dashboard'}
                  </button>
                  <button type="button" onClick={() => scrollTo('home')} className="rounded-full bg-slate-100 px-6 py-4 font-black text-slate-700 dark:bg-white/10 dark:text-white">
                    {rtl ? 'العودة للموقع' : 'Back to website'}
                  </button>
                </form>
              </div>
            </section>
          ) : (
          <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-32 lg:pt-40">
            <div className="mb-8 overflow-hidden rounded-[2.6rem] border border-white/10 bg-[#0f1028] p-7 text-white shadow-2xl shadow-[#443db8]/20 sm:p-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <span className="text-sm font-black uppercase tracking-[.35em] text-cyan-300">Dashboard</span>
                  <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">لوحة تحكم ecko</h1>
                  <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">
                    إدخال عربي فقط، ترجمة إنجليزية تلقائية عند الحفظ، ومساحات أوسع لإدارة الأعمال والباقات بعد تصفير البيانات.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={resetDashboard} className="rounded-full bg-red-500 px-5 py-3 font-black text-white">تصفير البيانات</button>
                  <button onClick={logoutFromDashboard} className="rounded-full bg-white px-5 py-3 font-black text-slate-950">تسجيل الخروج</button>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/10 p-5"><div className="text-4xl font-black">{dashboardData.works.ar.length}</div><div className="mt-1 text-white/60">مشروع حالي</div></div>
                <div className="rounded-3xl bg-white/10 p-5"><div className="text-4xl font-black">{dashboardData.plans.ar.length}</div><div className="mt-1 text-white/60">باقة حالية</div></div>
                <div className="rounded-3xl bg-white/10 p-5"><div className="text-4xl font-black">{inquiries.filter((inquiry) => inquiry.status === 'new').length}</div><div className="mt-1 text-white/60">استفسار جديد</div></div>
              </div>
            </div>

            <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-2xl shadow-[#443db8]/10 dark:bg-white/5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <span className="text-sm font-black uppercase tracking-[.25em] text-[#443db8] dark:text-cyan-300">Inquiries</span>
                  <h2 className="mt-2 text-3xl font-black">{rtl ? 'تواصل معنا' : 'Contact inquiries'}</h2>
                </div>
                <button onClick={loadInquiries} className="rounded-full bg-[#443db8] px-5 py-3 font-black text-white">
                  {inquiriesLoading ? (rtl ? 'جارٍ التحديث...' : 'Refreshing...') : (rtl ? 'تحديث' : 'Refresh')}
                </button>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[900px] border-separate border-spacing-y-3 text-start">
                  <thead>
                    <tr className="text-sm text-slate-500 dark:text-slate-400">
                      <th className="px-4 py-2 text-start font-black">{rtl ? 'التاريخ/الوقت' : 'Date/Time'}</th>
                      <th className="px-4 py-2 text-start font-black">{rtl ? 'الاسم' : 'Name'}</th>
                      <th className="px-4 py-2 text-start font-black">{rtl ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th className="px-4 py-2 text-start font-black">{rtl ? 'الخدمة' : 'Service'}</th>
                      <th className="px-4 py-2 text-start font-black">{rtl ? 'تفاصيل النشاط' : 'Business details'}</th>
                      <th className="px-4 py-2 text-start font-black">{rtl ? 'الإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="rounded-2xl bg-slate-50 text-sm dark:bg-white/5">
                        <td className="rounded-s-2xl px-4 py-4 font-bold text-slate-600 dark:text-slate-300">{new Date(inquiry.createdAt).toLocaleString(rtl ? 'ar-SA-u-nu-latn' : 'en-US')}</td>
                        <td className="px-4 py-4 font-black">{inquiry.name}</td>
                        <td className="px-4 py-4 font-bold text-[#443db8] dark:text-cyan-300">{inquiry.email}</td>
                        <td className="px-4 py-4 font-bold">{inquiry.service}</td>
                        <td className="max-w-xs px-4 py-4 leading-6 text-slate-600 dark:text-slate-300">{inquiry.details}</td>
                        <td className="rounded-e-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {inquiry.status === 'new' ? (
                              <button onClick={() => updateInquiryStatus(inquiry.id, 'archived')} className="rounded-full bg-emerald-500/10 px-4 py-2 font-black text-emerald-600">
                                {rtl ? 'أرشفة' : 'Archive'}
                              </button>
                            ) : (
                              <button onClick={() => updateInquiryStatus(inquiry.id, 'new')} className="rounded-full bg-amber-500/10 px-4 py-2 font-black text-amber-600">
                                {rtl ? 'استرجاع' : 'Restore'}
                              </button>
                            )}
                            <button onClick={() => deleteInquiry(inquiry.id)} className="rounded-full bg-red-500/10 px-4 py-2 font-black text-red-500">
                              {rtl ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {inquiries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="rounded-2xl bg-slate-50 px-4 py-10 text-center font-black text-slate-500 dark:bg-white/5 dark:text-slate-400">
                          {rtl ? 'لا توجد رسائل حتى الآن.' : 'No inquiries yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
              <div className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-[#443db8]/10 dark:bg-white/5">
                <h2 className="text-3xl font-black">{rtl ? 'إدارة الأعمال' : 'Manage Works'}</h2>
                <div className="mt-4 rounded-2xl bg-[#443db8]/5 p-4 text-sm font-bold leading-7 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  أدخل بيانات المشروع بالعربية فقط. عند الضغط على الحفظ تتم ترجمة العنوان والوصف والتصنيفات تلقائيًا وحفظ النسختين في قاعدة بيانات الموقع المحلية.
                </div>
                <div className="mt-6 grid gap-4">
                  <input value={workDraft.title} onChange={(e) => updateArabicWorkDraft({ title: e.target.value })} placeholder="عنوان العمل بالعربية" className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select value={workDraft.category} onChange={(e) => updateArabicWorkDraft({ category: e.target.value as WorkItem['category'] })} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10">
                      <option value="websites">Websites</option>
                      <option value="apps">Apps</option>
                      <option value="designs">Designs</option>
                      <option value="media">Media</option>
                    </select>
                    <input value={workDraft.date} onChange={(e) => updateArabicWorkDraft({ date: e.target.value })} placeholder="Oct 2025" className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  </div>
                  <input value={workDraft.tags.join(', ')} onChange={(e) => updateArabicWorkDraft({ tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} placeholder="تصنيفات عربية مفصولة بفاصلة" className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <input value={workDraft.link ?? ''} onChange={(e) => updateArabicWorkDraft({ link: e.target.value })} placeholder="رابط المشروع عند الضغط" className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <label className="cursor-pointer rounded-2xl border border-dashed border-[#443db8]/40 bg-[#443db8]/5 p-5 text-center font-black text-[#443db8] transition hover:bg-[#443db8] hover:text-white dark:border-cyan-300/30 dark:bg-white/5 dark:text-cyan-200">
                    {workDraft.image ? (rtl ? 'تغيير صورة المشروع' : 'Change project image') : (rtl ? 'رفع صورة المشروع' : 'Upload project image')}
                    <input type="file" accept="image/*" onChange={uploadWorkImage} className="hidden" />
                  </label>
                  {workDraft.image && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                      <img src={workDraft.image} alt="" className="h-44 w-full object-cover" />
                    </div>
                  )}
                  <textarea value={workDraft.description} onChange={(e) => updateArabicWorkDraft({ description: e.target.value })} placeholder="وصف العمل بالعربية" rows={5} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <div className="flex gap-3">
                    <button disabled={isTranslating} onClick={saveWork} className="flex-1 rounded-full bg-[#443db8] px-6 py-4 font-black text-white disabled:opacity-60">{isTranslating ? 'جارٍ الترجمة والحفظ...' : editingWorkIndex === null ? 'إضافة العمل' : 'حفظ التعديل'}</button>
                    <button onClick={startNewWork} className="rounded-full bg-slate-100 px-6 py-4 font-black text-slate-700 dark:bg-white/10 dark:text-white">{rtl ? 'جديد' : 'New'}</button>
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {dashboardData.works.ar.map((work, index) => (
                    <div key={`${work.title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="font-black">{work.title}</div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => editWork(index)} className="rounded-full bg-[#443db8]/10 px-4 py-2 text-sm font-black text-[#443db8]">{rtl ? 'تعديل' : 'Edit'}</button>
                        <button onClick={() => deleteWork(index)} className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-black text-red-500">{rtl ? 'حذف' : 'Delete'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-[#443db8]/10 dark:bg-white/5">
                <h2 className="text-3xl font-black">{rtl ? 'إدارة الباقات' : 'Manage Packages'}</h2>
                <div className="mt-6 grid gap-4">
                  <input value={planDraft[0]} onChange={(e) => setPlanDraft([e.target.value, planDraft[1], planDraft[2], planDraft[3]])} placeholder={rtl ? 'اسم الباقة' : 'Plan name'} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <input value={planDraft[1]} onChange={(e) => setPlanDraft([planDraft[0], e.target.value, planDraft[2], planDraft[3]])} placeholder={rtl ? 'وصف الباقة' : 'Plan description'} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input value={planMonthlyPrice} onChange={(e) => setPlanMonthlyPrice(e.target.value)} placeholder={rtl ? 'سعر الباقة الشهرية مثال: 890 ريال' : 'Monthly package price'} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                    <input value={planYearlyPrice} onChange={(e) => setPlanYearlyPrice(e.target.value)} placeholder={rtl ? 'سعر الباقة السنوية مثال: 8900 ريال' : 'Yearly package price'} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  </div>
                  <textarea value={planDraft[3].join('\n')} onChange={(e) => setPlanDraft([planDraft[0], planDraft[1], planDraft[2], e.target.value.split('\n').map((item) => item.trim()).filter(Boolean)])} placeholder={rtl ? 'المميزات، كل ميزة في سطر' : 'Features, one per line'} rows={6} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none dark:border-white/10" />
                  <div className="flex gap-3">
                    <button onClick={savePlan} className="flex-1 rounded-full bg-[#443db8] px-6 py-4 font-black text-white">{editingPlanIndex === null ? (rtl ? 'إضافة باقة' : 'Add package') : (rtl ? 'حفظ التعديل' : 'Save changes')}</button>
                    <button onClick={startNewPlan} className="rounded-full bg-slate-100 px-6 py-4 font-black text-slate-700 dark:bg-white/10 dark:text-white">{rtl ? 'جديد' : 'New'}</button>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  {dashboardData.plans.ar.map((plan, index) => (
                    <div key={`${plan[0]}-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                      <div className="font-black">{plan[0]}</div>
                      <div className="mt-3 grid gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-white/10">{rtl ? 'شهري' : 'Monthly'}: {splitPlanPrice(plan[2]).monthly}</div>
                        <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-white/10">{rtl ? 'سنوي' : 'Yearly'}: {splitPlanPrice(plan[2]).yearly}</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => editPlan(index)} className="rounded-full bg-[#443db8]/10 px-4 py-2 text-sm font-black text-[#443db8]">{rtl ? 'تعديل' : 'Edit'}</button>
                        <button onClick={() => deletePlan(index)} className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-black text-red-500">{rtl ? 'حذف' : 'Delete'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          )
        ) : page === 'works' ? (
          <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-32 lg:pt-40">
            <div className="mb-12 grid gap-8 border-b border-slate-200 pb-10 dark:border-white/10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div className="max-w-4xl">
                <span className="text-sm font-black uppercase tracking-[.35em] text-[#443db8] dark:text-cyan-300">{w.eyebrow}</span>
                <h1 className="mt-5 text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl">{w.title}</h1>
              </div>
              <div className="lg:text-end">
                <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">{w.text}</p>
                <button onClick={() => scrollTo('home')} className="mt-6 rounded-full border border-slate-200 bg-white px-7 py-4 font-black text-slate-950 transition hover:bg-[#443db8] hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-white">
                  {w.back}
                </button>
              </div>
            </div>

            <div className="sticky top-24 z-20 mb-10 rounded-[2rem] border border-white/70 bg-white/85 p-3 shadow-2xl shadow-[#443db8]/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#101026]/85">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="px-3 text-sm font-black text-slate-500 dark:text-slate-400">{w.filterLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {workFilters[lang].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setWorkFilter(filter.key)}
                      className={`rounded-full px-5 py-3 text-sm font-black transition ${
                        workFilter === filter.key
                          ? 'bg-[#443db8] text-white shadow-lg shadow-[#443db8]/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-950 hover:text-white dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-950'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="works-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredWorks.map((work, index) => (
                <motion.article
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55 }}
                  key={`${work.title}-${work.date}`}
                  onClick={() => setSelectedWork(work)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedWork(work)
                    }
                  }}
                  className="work-card group block cursor-pointer overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-[#443db8]/5 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#443db8]/15 focus:outline-none focus:ring-4 focus:ring-[#443db8]/20 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-950 text-white dark:bg-[#101026]">
                    {work.image ? (
                      <img src={work.image} alt={work.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(68,61,184,.75),transparent_34%),radial-gradient(circle_at_80%_75%,rgba(34,211,238,.38),transparent_34%),linear-gradient(135deg,#0f1028,#19133d)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                    <div className="absolute start-5 top-5 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[.22em] backdrop-blur">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute end-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black text-[#443db8] shadow-lg">
                      {workFilters[lang].find((filter) => filter.key === work.category)?.label ?? work.category}
                    </div>
                    <div className="work-card-preview absolute inset-x-0 bottom-0 translate-y-0 p-6 opacity-100 transition duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <p className="line-clamp-3 text-sm leading-6 text-white/80">{work.empty ? w.noItems : work.description}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-5 flex items-center justify-between gap-4 text-sm font-black text-slate-400">
                      <span>{work.date}</span>
                      <span>{work.tags[0]}</span>
                    </div>
                    <h2 className="min-h-20 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{work.title}</h2>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/10">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{w.overview}</span>
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#443db8] text-white transition group-hover:scale-110">
                        <ArrowRight className={rtl ? 'rotate-180' : ''} size={18} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
              {filteredWorks.length === 0 && (
                <div className="rounded-[2.4rem] border border-dashed border-[#443db8]/30 bg-white/70 p-12 text-center shadow-xl shadow-[#443db8]/5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-2xl font-black text-slate-500 dark:text-slate-400">{w.noItems}</p>
                </div>
              )}
            </div>

            <div className="works-mobile-list grid gap-5 sm:hidden">
              {filteredWorks.map((work, index) => (
                <article
                  key={`mobile-${work.title}-${work.date}-${index}`}
                  onClick={() => setSelectedWork(work)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedWork(work)
                    }
                  }}
                  className="work-card-mobile overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white shadow-xl shadow-[#443db8]/5 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-slate-950 text-white">
                    {work.image ? (
                      <img src={work.image} alt={work.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(68,61,184,.75),transparent_34%),radial-gradient(circle_at_80%_75%,rgba(34,211,238,.38),transparent_34%),linear-gradient(135deg,#0f1028,#19133d)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                    <div className="absolute start-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-[.18em] backdrop-blur">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute end-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#443db8] shadow-lg">
                      {workFilters[lang].find((filter) => filter.key === work.category)?.label ?? work.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-black text-slate-400">
                      <span>{work.date}</span>
                      <span>{work.tags[0]}</span>
                    </div>
                    <h2 className="text-2xl font-black leading-tight">{work.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{work.empty ? w.noItems : work.description}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{w.overview}</span>
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#443db8] text-white">
                        <ArrowRight className={rtl ? 'rotate-180' : ''} size={17} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
              {filteredWorks.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-[#443db8]/30 bg-white/70 p-8 text-center shadow-xl shadow-[#443db8]/5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-black text-slate-500 dark:text-slate-400">{w.noItems}</p>
                </div>
              )}
            </div>

            <div className="mt-14 rounded-[2.5rem] bg-[#443db8] p-8 text-white sm:p-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-3xl font-black sm:text-4xl">{t.ctaTitle}</h2>
                  <p className="mt-3 text-white/70">{t.ctaText}</p>
                </div>
                <button onClick={() => scrollTo('contact')} className="rounded-full bg-white px-7 py-4 font-black text-[#443db8]">{w.contact}</button>
              </div>
            </div>
            {selectedWork && (
              <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/75 px-4 py-6 backdrop-blur-md" onClick={() => setSelectedWork(null)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={(event) => event.stopPropagation()}
                  className="flex h-[72vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl dark:bg-[#101026] dark:text-white"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#101026] sm:px-7">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#443db8]/10 px-3 py-1 text-xs font-black text-[#443db8] dark:bg-cyan-300/10 dark:text-cyan-200">{selectedWork.date}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">{workFilters[lang].find((filter) => filter.key === selectedWork.category)?.label ?? selectedWork.category}</span>
                      </div>
                      <h2 className="truncate text-xl font-black sm:text-2xl">{selectedWork.title}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedWork(null)}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-xl transition hover:scale-105 dark:bg-white dark:text-slate-950"
                      aria-label="Close work details"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 bg-slate-100 dark:bg-slate-950">
                    {selectedWork.link ? (
                      <iframe
                        src={selectedWork.link}
                        title={selectedWork.title}
                        className="h-full w-full border-0 bg-white"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="grid h-full place-items-center p-6 text-center">
                        <div className="max-w-2xl rounded-[2rem] bg-white p-8 shadow-xl dark:bg-white/5">
                          <div className="mb-5 flex flex-wrap justify-center gap-3">
                            {selectedWork.tags.map((tag) => (
                              <span key={tag} className="rounded-full border border-[#443db8]/20 bg-[#443db8]/5 px-4 py-2 text-sm font-black text-[#443db8] dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-xl leading-10 text-slate-600 dark:text-slate-300">
                            {selectedWork.empty ? w.noItems : selectedWork.description || (rtl ? 'لا يوجد رابط خارجي لهذا العمل حاليًا.' : 'No external link is available for this work yet.')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </section>
        ) : (
          <>
        <section id="home" className="relative z-10 min-h-screen overflow-hidden px-5 pb-20 pt-32 text-slate-950 dark:text-white lg:pb-28 lg:pt-40">
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-95 blur-[1px] dark:opacity-90"
            src={heroBackgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f7f6ff]/50 via-[#f7f6ff]/25 to-[#f7f6ff]/10 dark:from-[#07071a]/45 dark:via-[#07071a]/35 dark:to-[#07071a]/20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f7f6ff]/15 via-[#f7f6ff]/30 to-[#f7f6ff]/70 dark:from-[#07071a]/20 dark:via-[#07071a]/35 dark:to-[#07071a]/70" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(68,61,184,0.08),transparent_32%),radial-gradient(circle_at_80%_35%,rgba(34,211,238,0.06),transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              {t.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-200">
              {t.heroText}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button onClick={() => scrollTo('contact')} className="group inline-flex items-center gap-3 rounded-full bg-[#443db8] px-7 py-4 font-extrabold text-white shadow-2xl shadow-[#443db8]/25 transition hover:-translate-y-1 hover:bg-[#352ea0]">
                {t.primary} <ArrowRight className={rtl ? 'rotate-180' : ''} size={18} />
              </button>
              <button onClick={() => window.open('https://drive.google.com/file/d/16_jJvKmjb5C_kDLpaN7xdQOMH6ohVRy3/view?usp=sharing', '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-7 py-4 font-extrabold text-slate-950 backdrop-blur transition hover:-translate-y-1 hover:border-[#443db8] dark:border-white/10 dark:bg-white/10 dark:text-white">
                <Play size={18} /> {t.secondary}
              </button>
            </div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
              {t.stats.map(([num, label]) => (
                <div key={label} className="rounded-[1.6rem] border border-white bg-white/70 p-4 shadow-xl shadow-[#443db8]/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <div className="text-2xl font-black text-[#443db8] dark:text-cyan-300"><CountUpText value={num} /></div>
                  <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          </div>
          <button onClick={() => scrollTo('services')} className="scroll-bottom-indicator" aria-label={rtl ? 'مرر للأسفل' : 'Scroll down'}>
            <span className="scroll-bottom-dot" />
          </button>
        </section>

        <section id="services" className="relative z-10 overflow-hidden bg-black text-white dark:bg-white dark:text-slate-950">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-70">
            <div className="absolute -top-24 start-1/4 h-80 w-80 rounded-full bg-[#443db8]/30 blur-3xl dark:bg-[#443db8]/10" />
            <div className="absolute bottom-0 end-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
          </div>

          <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[.9fr_1.1fr]">
            <div className={rtl ? 'text-right' : 'text-left'}>
              <span className="text-lg font-black text-[#7fd9e6] dark:text-[#443db8]">{t.labels[0]}</span>
              <h2 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">{t.servicesTitle}</h2>
              <p className="mt-8 max-w-3xl text-xl font-semibold leading-10 text-white/75 dark:text-slate-600">{t.servicesText}</p>
            </div>

            <div className="mx-auto flex w-full max-w-2xl flex-col items-center pt-10 pb-28">
              {stackedServices[lang].map(([title, desc, Icon, emoji, color], index) => (
                <motion.article
                  key={title as string}
                  initial={{ opacity: 0, y: 35, rotate: index % 2 === 0 ? -2 : 2 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -18, rotate: index % 2 === 0 ? -1.8 : 1.8, scale: 1.025 }}
                  className={`relative flex min-h-28 w-[94%] items-center justify-between rounded-[1.6rem] p-5 text-slate-950 shadow-[0_18px_45px_rgba(0,0,0,.35)] transition sm:p-6 ${color as string}`}
                  style={{ marginBottom: index === stackedServices[lang].length - 1 ? 0 : '-34px', zIndex: index + 1 }}
                >
                  <div className="flex-1 pe-5">
                    <h3 className="text-xl font-black sm:text-2xl">{title as string}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">{desc as string}</p>
                  </div>
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-lg sm:h-20 sm:w-20 sm:text-4xl">
                    <span>{emoji as string}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="text-sm font-black uppercase tracking-[.3em] text-[#443db8] dark:text-cyan-300">{t.labels[1]}</span>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{t.pricingTitle}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{b.save}</p>
            <div className="mt-8 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-xl shadow-[#443db8]/10 dark:border-white/10 dark:bg-white/10">
              {(['monthly', 'yearly'] as Billing[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setBilling(option)}
                  className={`rounded-full px-7 py-3 text-sm font-black transition ${billing === option ? 'bg-[#443db8] text-white shadow-lg shadow-[#443db8]/25' : 'text-slate-500 hover:text-[#443db8] dark:text-slate-300'}`}
                >
                  {b[option]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {visiblePlans.map(([name, desc, price, features], i) => (
              <motion.div
                whileHover={{ y: -10, scale: 1.01 }}
                key={name as string}
                className={`relative overflow-hidden rounded-[2.4rem] border p-7 shadow-2xl transition ${i === 1 ? 'border-[#443db8] bg-slate-950 text-white shadow-[#443db8]/25 dark:bg-[#443db8]' : 'border-white bg-white shadow-[#443db8]/10 dark:border-white/10 dark:bg-white/5'}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,.18),transparent_34%),linear-gradient(135deg,rgba(68,61,184,.12),transparent_45%)]" />
                {i === 1 && <div className="absolute end-6 top-6 rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950">{b.popular}</div>}
                <div className="relative">
                <div className={`mb-8 grid h-16 w-16 place-items-center rounded-2xl ${i === 1 ? 'bg-white text-[#443db8]' : 'bg-[#443db8]/10 text-[#443db8] dark:bg-white/10 dark:text-cyan-300'}`}>
                  <Sparkles />
                </div>
                <h3 className="text-3xl font-black">{name as string}</h3>
                <p className={`mt-3 min-h-14 leading-7 ${i === 1 ? 'text-white/70' : 'text-slate-500 dark:text-slate-300'}`}>{desc as string}</p>
                <div className="mt-8 border-y border-slate-200 py-7 dark:border-white/10">
                  <div className="text-4xl font-black sm:text-5xl">
                    {getPlanPriceByBilling(price as string, billing)}
                  </div>
                  <div className={`mt-2 text-sm font-black ${i === 1 ? 'text-cyan-200' : 'text-[#443db8] dark:text-cyan-300'}`}>{billing === 'monthly' ? b.monthly : b.yearly}</div>
                </div>
                <div className="mt-8 text-sm font-black uppercase tracking-[.2em] text-slate-400">{b.included}</div>
                <div className="mt-5 space-y-4">
                  {(features as string[]).map((feature) => (
                    <div key={feature} className="flex items-center gap-3 font-bold">
                      <span className={`grid h-6 w-6 place-items-center rounded-full ${i === 1 ? 'bg-white text-[#443db8]' : 'bg-[#443db8]/10 text-[#443db8] dark:bg-white/10 dark:text-cyan-300'}`}><Check size={15} /></span>
                      {feature}
                    </div>
                  ))}
                </div>
                <button onClick={() => scrollTo('contact')} className={`mt-9 w-full rounded-full px-6 py-4 font-black ${i === 1 ? 'bg-white text-[#443db8]' : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'}`}>{t.primary}</button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
          <div className="grid overflow-hidden rounded-[3rem] bg-[#443db8] text-white lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <span className="text-sm font-black uppercase tracking-[.3em] text-cyan-200">{t.labels[3]}</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t.ctaTitle}</h2>
              <p className="mt-6 text-lg leading-8 text-white/75">{t.ctaText}</p>
              <div className="mt-10 rounded-[2rem] bg-white/10 p-6">
                <h3 className="text-2xl font-black">{t.email}</h3>
                <p className="mt-2 text-white/70">{t.location}</p>
              </div>
            </div>
            <form onSubmit={submitContactForm} className="bg-white p-8 text-slate-950 dark:bg-[#11112b] dark:text-white sm:p-12">
              <h3 className="mb-6 text-3xl font-black">{t.contactTitle}</h3>
              <div className="grid gap-4">
                <input value={contactForm.name} onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))} required placeholder={t.form[0]} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none transition focus:border-[#443db8] dark:border-white/10" />
                <input value={contactForm.email} onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))} required type="email" placeholder={t.form[1]} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none transition focus:border-[#443db8] dark:border-white/10" />
                <input value={contactForm.service} onChange={(event) => setContactForm((current) => ({ ...current, service: event.target.value }))} required placeholder={t.form[2]} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none transition focus:border-[#443db8] dark:border-white/10" />
                <textarea value={contactForm.details} onChange={(event) => setContactForm((current) => ({ ...current, details: event.target.value }))} required placeholder={t.form[3]} rows={5} className="rounded-2xl border border-slate-200 bg-transparent px-5 py-4 outline-none transition focus:border-[#443db8] dark:border-white/10" />
                {contactStatus === 'success' && <div className="rounded-2xl bg-emerald-500/10 px-5 py-3 font-black text-emerald-600">{rtl ? 'تم إرسال الاستفسار وحفظه بنجاح.' : 'Your inquiry has been submitted and saved successfully.'}</div>}
                {contactStatus === 'error' && <div className="rounded-2xl bg-red-500/10 px-5 py-3 font-black text-red-500">{rtl ? 'حدث خطأ أثناء الإرسال، حاول مرة أخرى.' : 'Something went wrong. Please try again.'}</div>}
                <button disabled={contactStatus === 'sending'} className="rounded-full bg-[#443db8] px-7 py-4 font-black text-white disabled:opacity-60">{contactStatus === 'sending' ? (rtl ? 'جارٍ الإرسال...' : 'Sending...') : t.send}</button>
              </div>
            </form>
          </div>
        </section>
          </>
        )}

        <footer className="relative z-10 block w-full border-t border-slate-200/70 px-5 py-8 dark:border-white/10" dir="ltr">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <img src={logo} alt="ecko" className="h-8 w-auto shrink-0 sm:h-9 dark:brightness-0 dark:invert" />
            <p className="text-center text-sm font-semibold leading-7 text-slate-500 dark:text-slate-400 sm:text-right" dir="rtl">
              © 2026 ecko. هوية، مواقع، برمجيات، تسويق، أتمتة، وحلول ذكاء اصطناعي.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
