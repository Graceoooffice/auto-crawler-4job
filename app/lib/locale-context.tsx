'use client'

import { createContext, useContext, useMemo, useState, ReactNode, useEffect, useCallback } from 'react'
import { dictionaries, getFromDictionary, SupportedLanguage } from './i18n'

interface LocaleContextValue {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (path: string) => string
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('zh')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('language') as SupportedLanguage | null) : null
    if (saved === 'zh' || saved === 'en') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }, [])

  const t = useMemo(() => {
    const dict = dictionaries[language]
    return (path: string) => getFromDictionary(dict, path)
  }, [language])

  const value: LocaleContextValue = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

