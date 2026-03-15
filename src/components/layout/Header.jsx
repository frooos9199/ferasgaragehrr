import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { FiMenu, FiUser } from 'react-icons/fi'

const LANGS = [
  { code: 'ar', label: 'ع', dir: 'rtl' },
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'bn', label: 'বা', dir: 'ltr' },
  { code: 'hi', label: 'हि', dir: 'ltr' },
]

export default function Header({ onMenuClick }) {
  const { i18n } = useTranslation()
  const { userData } = useAuth()

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    const lang = LANGS.find(l => l.code === code)
    document.documentElement.dir = lang.dir
    document.documentElement.lang = code
  }

  return (
    <header className="h-14 bg-hrr-gray border-b border-hrr-silver/10 flex items-center justify-between px-3 md:px-6 sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden text-hrr-silver hover:text-white text-xl p-2">
        <FiMenu />
      </button>

      <div className="lg:flex-1" />

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-0.5 bg-hrr-steel rounded-lg p-0.5">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-bold transition-all ${
                i18n.language === l.code
                  ? 'bg-hrr-red text-white'
                  : 'text-hrr-silver hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-hrr-silver">
          <FiUser />
          <span className="hidden md:inline">{userData?.name}</span>
          <span className="badge bg-hrr-red/20 text-hrr-red text-xs">{userData?.role}</span>
        </div>
      </div>
    </header>
  )
}
