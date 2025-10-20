export interface CVData {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    version: number
  }
  
  export interface MaterialItem {
    title: string
    content: string
    category: string
  }
  
  export interface MaterialCategory {
    name: string
    items: MaterialItem[]
  }
  
  export interface User {
    id: string
    name: string
    email: string
  }
  
  export interface CVVersion {
    id: string
    cvId: string
    version: number
    content: string
    changes: string
    createdAt: Date
  }
  
  export type NavigationTab = 'CV制作工坊' | 'CV版本迭代' | 'CV储存室' | 'CV参考资料' | '面试热身'
  
  export type WorkshopTab = '制作工坊' | '素材库'