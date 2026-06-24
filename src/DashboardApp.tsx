import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import { Moon, Sun, LogOut, RefreshCw, Trash2, Edit2, X, Plus } from 'lucide-react'
import './index.css'

type Lang = 'en' | 'ar'
type Theme = 'light' | 'dark'
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
type ContactFormState = {
  name: string
  email: string
  service: string
  details: string
}
type Inquiry = ContactFormState & {
  id: string
  createdAt: string
  status: 'new' | 'archived'
}

const dashboardStorageKey = 'ecko-dashboard-content-v2'
const dashboardAuthKey = 'ecko-dashboard-auth-token'
const dashboardAdminEmail = 'info@eckosa.com'
const dashboardAdminPassword = 'admin123456'

const translateDictionary: Record<string, string> = {
  'مواقع إلكترونية': 'Websites',
  'تطبيقات': 'Applications',
  'تصاميم': 'Designs',
  'إنتاج إعلامي': 'Media Production',
  'شهري': 'Monthly',
  'سنوي': 'Yearly',
  'ريال': 'SAR',
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

const dashboardCopy = {
  en: {
    title: 'Dashboard',
    subtitle: 'Ecko Content Management',
    welcome: 'Welcome to Ecko Dashboard',
    login: 'Dashboard Login',
    email: 'Email',
    password: 'Password',
    loginButton: 'Sign In',
    invalidCredentials: 'Invalid email or password',
    logout: 'Logout',
    resetData: 'Reset Data',
    confirm: 'Are you sure?',
    inquiries: 'Contact Inquiries',
    manageWorks: 'Manage Works',
    managePlans: 'Manage Plans',
    date: 'Date/Time',
    name: 'Name',
    service: 'Service',
    details: 'Business Details',
    actions: 'Actions',
    archive: 'Archive',
    restore: 'Restore',
    delete: 'Delete',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    noInquiries: 'No inquiries yet',
    newInquiry: 'New Inquiry',
    archivedInquiry: 'Archived Inquiry',
    addWork: 'Add Work',
    editWork: 'Edit',
    deleteWork: 'Delete',
    saveWork: 'Save Work',
    newWork: 'New',
    workTitle: 'Work Title (Arabic)',
    workCategory: 'Category',
    workDate: 'Date (e.g., Oct 2025)',
    workTags: 'Tags (comma separated)',
    workLink: 'Project Link',
    workImage: 'Upload Project Image',
    changeImage: 'Change Image',
    workDescription: 'Work Description (Arabic)',
    saving: 'Saving...',
    planName: 'Plan Name (Arabic)',
    planDescription: 'Plan Description (Arabic)',
    monthlyPrice: 'Monthly Price',
    yearlyPrice: 'Yearly Price',
    planFeatures: 'Features (one per line)',
    addPlan: 'Add Plan',
    editPlan: 'Edit',
    deletePlan: 'Delete',
    savePlan: 'Save Plan',
    monthly: 'Monthly',
    yearly: 'Yearly',
  },
  ar: {
    title: 'لوحة التحكم',
    subtitle: 'إدارة محتوى إيكو',
    welcome: 'أهلاً بك في لوحة تحكم إيكو',
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginButton: 'دخول',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    logout: 'تسجيل الخروج',
    resetData: 'تصفير البيانات',
    confirm: 'هل أنت متأكد؟',
    inquiries: 'رسائل التواصل',
    manageWorks: 'إدارة الأعمال',
    managePlans: 'إدارة الباقات',
    date: 'التاريخ/الوقت',
    name: 'الاسم',
    service: 'الخدمة',
    details: 'تفاصيل النشاط',
    actions: 'الإجراءات',
    archive: 'أرشفة',
    restore: 'استرجاع',
    delete: 'حذف',
    refresh: 'تحديث',
    refreshing: 'جارٍ التحديث...',
    noInquiries: 'لا توجد رسائل حتى الآن',
    newInquiry: 'استفسار جديد',
    archivedInquiry: 'استفسار مؤرشف',
    addWork: 'إضافة عمل',
    editWork: 'تعديل',
    deleteWork: 'حذف',
    saveWork: 'حفظ العمل',
    newWork: 'جديد',
    workTitle: 'عنوان العمل',
    workCategory: 'التصنيف',
    workDate: 'التاريخ (مثال: أكتوبر 2025)',
    workTags: 'الكلمات المفتاحية',
    workLink: 'رابط المشروع',
    workImage: 'رفع صورة المشروع',
    changeImage: 'تغيير الصورة',
    workDescription: 'وصف العمل',
    saving: 'جارٍ الحفظ...',
    planName: 'اسم الباقة',
    planDescription: 'وصف الباقة',
    monthlyPrice: 'السعر الشهري',
    yearlyPrice: 'السعر السنوي',
    planFeatures: 'المميزات',
    addPlan: 'إضافة باقة',
    editPlan: 'تعديل',
    deletePlan: 'حذف',
    savePlan: 'حفظ الباقة',
    monthly: 'شهري',
    yearly: 'سنوي',
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

function DashboardApp() {
  const [lang, setLang] = useState<Lang>('ar')
  const [theme, setTheme] = useState<Theme>('dark')
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData>({ works: { ar: [], en: [] }, plans: { ar: [], en: [] } })
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiriesLoading, setInquiriesLoading] = useState(false)
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null)
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null)
  const [workDraft, setWorkDraft] = useState<WorkItem>({ title: '', category: 'websites', date: '', tags: [], description: '' })
  const [planDraft, setPlanDraft] = useState<PlanItem>(['', '', '', []])
  const [planMonthlyPrice, setPlanMonthlyPrice] = useState('')
  const [planYearlyPrice, setPlanYearlyPrice] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const t = dashboardCopy[lang]
  const rtl = lang === 'ar'
  const themeClass = `${theme === 'dark' ? 'dark' : ''} ${rtl ? 'font-arabic' : 'font-english'}`

  // Load authentication state
  useEffect(() => {
    const auth = window.sessionStorage.getItem(dashboardAuthKey)
    if (auth === 'true') setAuthenticated(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard-content', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    }
  }

  const loadInquiries = async () => {
    setInquiriesLoading(true)
    try {
      const response = await fetch('/api/inquiries', { credentials: 'include' })
      const payload = await response.json()
      setInquiries(Array.isArray(payload.inquiries) ? payload.inquiries : [])
    } catch {
      setInquiries([])
    } finally {
      setInquiriesLoading(false)
    }
  }

  const handleLogin = () => {
    if (email.trim().toLowerCase() === dashboardAdminEmail && password === dashboardAdminPassword) {
      window.sessionStorage.setItem(dashboardAuthKey, 'true')
      setAuthenticated(true)
      setLoginError('')
      setPassword('')
      loadInquiries()
      loadDashboardData()
    } else {
      setLoginError(t.invalidCredentials)
    }
  }

  const handleLogout = () => {
    window.sessionStorage.removeItem(dashboardAuthKey)
    setAuthenticated(false)
    setEmail('')
    setPassword('')
  }

  const saveDashboardData = async () => {
    try {
      await fetch('/api/dashboard-content', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardData),
      })
    } catch (err) {
      console.error('Failed to save dashboard data:', err)
    }
  }

  const saveWork = async () => {
    if (!workDraft.title.trim()) return
    setIsTranslating(true)
    try {
      const enTitle = await translateArabicToEnglish(workDraft.title)
      const enDescription = await translateArabicToEnglish(workDraft.description)
      const enTags = await Promise.all(workDraft.tags.map(tag => translateArabicToEnglish(tag)))

      const enWork: WorkItem = {
        ...workDraft,
        title: enTitle,
        description: enDescription,
        tags: enTags,
      }

      setDashboardData((prev) => {
        const newWorks = [...prev.works.ar]
        const newEnWorks = [...prev.works.en]
        if (editingWorkIndex === null) {
          newWorks.unshift(workDraft)
          newEnWorks.unshift(enWork)
        } else {
          newWorks[editingWorkIndex] = workDraft
          newEnWorks[editingWorkIndex] = enWork
        }
        return {
          ...prev,
          works: { ar: newWorks, en: newEnWorks },
        }
      })
      setWorkDraft({ title: '', category: 'websites', date: '', tags: [], description: '' })
      setEditingWorkIndex(null)
    } finally {
      setIsTranslating(false)
    }
  }

  const deleteWork = (index: number) => {
    if (window.confirm(t.confirm)) {
      setDashboardData((prev) => ({
        ...prev,
        works: {
          ar: prev.works.ar.filter((_, i) => i !== index),
          en: prev.works.en.filter((_, i) => i !== index),
        },
      }))
    }
  }

  const savePlan = async () => {
    if (!planDraft[0].trim()) return
    setIsTranslating(true)
    try {
      const arPrice = composePlanPrice(planMonthlyPrice.trim(), planYearlyPrice.trim())
      const enName = await translateArabicToEnglish(planDraft[0])
      const enDesc = await translateArabicToEnglish(planDraft[1])
      const enFeatures = await Promise.all(planDraft[3].map(f => translateArabicToEnglish(f)))

      const enPlan: PlanItem = [enName, enDesc, fallbackTranslate(arPrice), enFeatures]
      const arPlan: PlanItem = [planDraft[0], planDraft[1], arPrice, planDraft[3]]

      setDashboardData((prev) => {
        const newPlans = [...prev.plans.ar]
        const newEnPlans = [...prev.plans.en]
        if (editingPlanIndex === null) {
          newPlans.push(arPlan)
          newEnPlans.push(enPlan)
        } else {
          newPlans[editingPlanIndex] = arPlan
          newEnPlans[editingPlanIndex] = enPlan
        }
        return { ...prev, plans: { ar: newPlans, en: newEnPlans } }
      })
      setPlanDraft(['', '', '', []])
      setPlanMonthlyPrice('')
      setPlanYearlyPrice('')
      setEditingPlanIndex(null)
    } finally {
      setIsTranslating(false)
    }
  }

  const deletePlan = (index: number) => {
    if (window.confirm(t.confirm)) {
      setDashboardData((prev) => ({
        ...prev,
        plans: {
          ar: prev.plans.ar.filter((_, i) => i !== index),
          en: prev.plans.en.filter((_, i) => i !== index),
        },
      }))
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setWorkDraft({ ...workDraft, image: String(reader.result) })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!authenticated) {
    return (
      <div className={themeClass} dir={rtl ? 'rtl' : 'ltr'}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-50 dark:to-slate-100 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-300 dark:bg-white/50">
            <h1 className="text-3xl font-black text-white dark:text-slate-950">{t.login}</h1>
            <p className="mt-2 text-slate-400 dark:text-slate-600">{t.welcome}</p>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="mt-8 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-300 dark:bg-white/50 dark:text-slate-950 dark:placeholder-slate-600"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-300 dark:bg-white/50 dark:text-slate-950 dark:placeholder-slate-600"
              />
              {loginError && <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">{loginError}</div>}
              <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-3 font-black text-white hover:bg-blue-700 transition">
                {t.loginButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={themeClass} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">{t.title}</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                  className="rounded-lg bg-slate-200 px-3 py-2 font-black text-slate-950 dark:bg-slate-800 dark:text-white"
                >
                  {lang === 'en' ? 'AR' : 'EN'}
                </button>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="grid h-10 w-10 place-items-center rounded-lg bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-500 px-4 py-2 font-black text-white hover:bg-red-600 transition flex items-center gap-2"
                >
                  <LogOut size={16} /> {t.logout}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Inquiries Section */}
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{t.inquiries}</h2>
              <button
                onClick={loadInquiries}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-black text-white hover:bg-blue-700 transition"
              >
                <RefreshCw size={16} /> {inquiriesLoading ? t.refreshing : t.refresh}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-2 text-left font-black">{t.date}</th>
                    <th className="px-4 py-2 text-left font-black">{t.name}</th>
                    <th className="px-4 py-2 text-left font-black">{t.service}</th>
                    <th className="px-4 py-2 text-left font-black">{t.details}</th>
                    <th className="px-4 py-2 text-left font-black">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length > 0 ? (
                    inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(inquiry.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{inquiry.name}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{inquiry.service}</td>
                        <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300 truncate">{inquiry.details}</td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-black">
                            {inquiry.status === 'new' ? t.archive : t.restore}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        {t.noInquiries}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Works and Plans Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Works Section */}
            <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-800">
              <h2 className="mb-6 text-2xl font-black text-slate-950 dark:text-white">{t.manageWorks}</h2>
              <div className="space-y-4">
                <input
                  value={workDraft.title}
                  onChange={(e) => setWorkDraft({ ...workDraft, title: e.target.value })}
                  placeholder={t.workTitle}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <select
                  value={workDraft.category}
                  onChange={(e) => setWorkDraft({ ...workDraft, category: e.target.value as WorkFilter })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="websites">Websites</option>
                  <option value="apps">Apps</option>
                  <option value="designs">Designs</option>
                  <option value="media">Media</option>
                </select>
                <input
                  value={workDraft.date}
                  onChange={(e) => setWorkDraft({ ...workDraft, date: e.target.value })}
                  placeholder={t.workDate}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <input
                  value={workDraft.tags.join(', ')}
                  onChange={(e) => setWorkDraft({ ...workDraft, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder={t.workTags}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <input
                  value={workDraft.link || ''}
                  onChange={(e) => setWorkDraft({ ...workDraft, link: e.target.value })}
                  placeholder={t.workLink}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <label className="block cursor-pointer rounded-lg border-2 border-dashed border-blue-500 bg-blue-50 p-4 text-center font-black text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30">
                  {workDraft.image ? t.changeImage : t.workImage}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {workDraft.image && <img src={workDraft.image} alt="preview" className="h-32 w-full rounded-lg object-cover" />}
                <textarea
                  value={workDraft.description}
                  onChange={(e) => setWorkDraft({ ...workDraft, description: e.target.value })}
                  placeholder={t.workDescription}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <button
                  onClick={saveWork}
                  disabled={isTranslating}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 font-black text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isTranslating ? t.saving : t.saveWork}
                </button>
              </div>
              <div className="mt-6 space-y-2">
                {dashboardData.works.ar.map((work, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <span className="font-bold text-slate-950 dark:text-white">{work.title}</span>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400"><Edit2 size={16} /></button>
                      <button onClick={() => deleteWork(idx)} className="text-red-600 hover:text-red-700 dark:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Plans Section */}
            <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-950 dark:border dark:border-slate-800">
              <h2 className="mb-6 text-2xl font-black text-slate-950 dark:text-white">{t.managePlans}</h2>
              <div className="space-y-4">
                <input
                  value={planDraft[0]}
                  onChange={(e) => setPlanDraft([e.target.value, planDraft[1], planDraft[2], planDraft[3]])}
                  placeholder={t.planName}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <textarea
                  value={planDraft[1]}
                  onChange={(e) => setPlanDraft([planDraft[0], e.target.value, planDraft[2], planDraft[3]])}
                  placeholder={t.planDescription}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={planMonthlyPrice}
                    onChange={(e) => setPlanMonthlyPrice(e.target.value)}
                    placeholder={t.monthlyPrice}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                  />
                  <input
                    value={planYearlyPrice}
                    onChange={(e) => setPlanYearlyPrice(e.target.value)}
                    placeholder={t.yearlyPrice}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                  />
                </div>
                <textarea
                  value={planDraft[3].join('\n')}
                  onChange={(e) => setPlanDraft([planDraft[0], planDraft[1], planDraft[2], e.target.value.split('\n').map(f => f.trim()).filter(Boolean)])}
                  placeholder={t.planFeatures}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
                />
                <button
                  onClick={savePlan}
                  disabled={isTranslating}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 font-black text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isTranslating ? t.saving : t.savePlan}
                </button>
              </div>
              <div className="mt-6 space-y-2">
                {dashboardData.plans.ar.map((plan, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <span className="font-bold text-slate-950 dark:text-white">{plan[0]}</span>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400"><Edit2 size={16} /></button>
                      <button onClick={() => deletePlan(idx)} className="text-red-600 hover:text-red-700 dark:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardApp
