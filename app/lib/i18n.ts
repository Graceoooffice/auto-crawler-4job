'use client'

import { profile } from "console"
import build from "next/dist/build"
import BuildLogModal from "../components/UI/BuildLogModal"

export type SupportedLanguage = 'zh' | 'en'

interface Dictionary {
  [key: string]: string | Dictionary
}

export const dictionaries: Record<SupportedLanguage, Dictionary> = {
  zh: {
    app: {
      title: 'Asset Management System',
      subtitle: '财务管理兄系统',
    },
    nav: {
      workshop: 'Assets Analysis',
      history: 'History Records',
      
    },
    editor: {
      title: 'CV 编辑器',
      tip: '在此处编辑和保存你的CV内容。',
      placeholder: '在这里开始编辑你的CV...',
      upload: '上传CV',
      download: '下载CV',
      preview: '预览效果',
    },
    preview: {
      title: '实时预览',
    },
    library: {
      title: '素材库',
      subtitle: '选择合适的模板，快速构建专业简历',
      copy: '复制',
      copied: '已复制',
      insert: '插入到编辑器',
    },
    sidebar: {
      footer1: '© 2024 CV工坊',
      footer2: '让简历制作更简单',
    },
    toggle: {
      zh: '中文',
      en: 'English',
    },
    settings: {
      title: '设置',
      language: '语言',
      theme: '主题',
      notifications: '通知',
      buildLog: '建设日志',
      profile: '个人主页'
    },
    profile: {
      title: '个人主页',
      stats: '使用统计', 
      cvCount: '简历数',
      versionCount: '版本数',
      memberSince: '注册时间',
      practiceCount: '练习次数'
    },
    buildLog: {
      title: '建设日志',
      version: '版本'
    },
    cancel: '取消',
    signout: '退出登录',
    signout_confirm: '你确定要退出登录吗？',
  },
  en: {
    app: {
      title: 'CV Studio',
      subtitle: 'Build your next career stepping stone.',
    },
    nav: {
      workshop: 'Workshop',
      history: 'History Records'
    },
    tabs: {
      workshop: 'Workshop',
      library: 'Library',
    },
    editor: {
      title: 'CV Editor',
      tip: 'Edit and save your CV here.',
      placeholder: 'Start editing your CV here...',
      upload: 'Upload CV',
      download: 'Download CV',
      preview: 'Preview',
    },
    preview: {
      title: 'Live Preview',
    },
    library: {
      title: 'Material Library',
      subtitle: 'Pick templates and snippets to build a professional CV quickly',
      copy: 'Copy',
      copied: 'Copied',
      insert: 'Insert to editor',
    },
    sidebar: {
      footer1: '© 2024 CV Studio',
      footer2: 'Make resume building easier',
    },
    coming: {
      versions: 'Manage and compare different CV versions, track changes',
      storage: 'Save and manage all your CV documents',
      reference: 'Browse great CV templates and writing guides',
      practice: 'Prepare interview questions and practice skills',
      waiting: 'This feature is under development...',
    },
    toggle: {
      zh: '中文',
      en: 'English',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      buildLog: 'Build Log',
      profile: 'Profile'
    },
    profile: {
      title: 'Profile',
      stats: 'Usage Stats',
      cvCount: 'CVs',
      versionCount: 'Versions',
      memberSince: 'Member since',
      practiceCount: 'Practices'
    },
    buildLog: {
      title: 'Build Log',
      version: 'Version'
    },
    cancel: 'Cancel',
    signout: 'Sign out',
    signout_confirm: 'Are you sure you want to sign out?',
  },
}

export function getFromDictionary(dict: Dictionary, path: string): string {
  const segments = path.split('.')
  let current: string | Dictionary | undefined = dict
  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) return path
    current = current[segment]
    if (current == null) return path
  }
  return typeof current === 'string' ? current : path
}

