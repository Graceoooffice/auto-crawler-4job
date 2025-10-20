import { FileText, Code, Archive, BookOpen, MessageCircle, X, Rss, Settings } from 'lucide-react'
import { useLocale } from '../../lib/locale-context'
import { NavigationItem } from '../../page'
import { ComponentType } from 'react'
import { useState, useEffect, useRef } from 'react'
import SettingsDropdown from '../UI/SettingsDropdown'

interface SidebarProps {
  activeTab: NavigationItem
  setActiveTab: (tab: NavigationItem) => void
  onClose?: () => void
  setBuildLogOpen?: (open: boolean) => void
  setProfileOpen?: (open: boolean) => void
}

// ----------------------------------------------------
// 步骤 1 & 2: 更新侧边栏项目列表
// ----------------------------------------------------
const sidebarItems: { name: NavigationItem; icon: ComponentType<{ size?: number; className?: string }>; color: string }[] = [
  { name: '财务仪表盘', icon: FileText, color: 'text-blue-600' },
  // 新增一个历史记录项目，假设它的 NavigationItem 名称为 '历史记录'
  //{ name: '历史记录', icon: BookOpen, color: 'text-purple-600' }, 
]

export default function Sidebar({ activeTab, setActiveTab, onClose, setBuildLogOpen, setProfileOpen }: SidebarProps) {
  const { t, language, setLanguage } = useLocale()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (tab: NavigationItem) => {
    setActiveTab(tab)
    onClose?.()
  }

  // 点击外部关闭设置菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-64 h-full bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-xl">
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200 bg-white/80">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Rss size={16} />
              </span>
              <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t('app.subtitle')}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {/* 语言切换 */}
        <div className="mt-4 flex items-center gap-2">
          <button
            className={`px-2 py-1 text-xs rounded-md ${language === 'zh' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setLanguage('zh')}
          >
            {t('toggle.zh')}
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setLanguage('en')}
          >
            {t('toggle.en')}
          </button>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          
          return (
            <button
              key={item.name}
              onClick={() => handleTabClick(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-700'}`}>
                <Icon size={18} className={isActive ? 'text-white' : item.color} />
              </span>
              <span>
                {/* 步骤 3: 新增历史记录的显示文本处理 */}
                {
                  item.name === '财务仪表盘' ? t('nav.workshop') :
                  //item.name === '历史记录' ? t('nav.history') : // <-- 新增这一行
                  t('nav.practice')
                }
              </span>
            </button>
          )
        })}
      </nav>

      {/* 底部信息 */}
      <div className="absolute bottom-0 w-64 border-t border-gray-200 bg-white/70 backdrop-blur">
        <div className="p-4 pb-14">
          <div className="text-xs text-gray-500 text-center">
            <p>{t('sidebar.footer1')}</p>
            <p>{t('sidebar.footer2')}</p>
          </div>
        </div>
      </div>

      {/* 设置按钮和下拉菜单 */}
      <div ref={settingsRef} className="absolute bottom-4 left-4">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            isSettingsOpen ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label={t('settings.title') || '设置'}
        >
          <Settings size={16} className="text-gray-600" />
        </button>
        <SettingsDropdown 
          isOpen={isSettingsOpen}
          onOpenBuildLog={() => {
            setIsSettingsOpen(false)
            setBuildLogOpen?.(true)
          }}
          onOpenProfile={() => {
            setIsSettingsOpen(false)
            setProfileOpen?.(true)
          }}
        />
      </div>
    </div>
  )
}