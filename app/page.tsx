'use client'
import { useLocale } from './lib/locale-context'
import { useState, useEffect, FC } from 'react'
import Image from 'next/image'
import Sidebar from './components/Layout/Sidebar'
import BalanceOverview from '@/components/dashboard/JobScraperPage'
// 移除 next-auth 相关的导入：
// import { signOut, useSession } from 'next-auth/react' 

export type NavigationItem = '财务仪表盘' | '历史记录' | '财务趋势'

// 模拟的用户信息类型（用于演示）
type UserSession = {
    name: string;
    email: string;
    image: string;
};

// 模拟的用户数据
const DEMO_USER: UserSession = {
    name: "演示用户",
    email: "demo@example.com",
    image: "/default-avatar.png", // 请确保您有这个默认图片
};

// 登录视图组件
const LoginView: FC<{ onLoginSuccess: (user: UserSession) => void }> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        // 演示登录逻辑
        if (email === 'demo@example.com' && password === 'password123') {
            setError('');
            // 登录成功，传入模拟用户信息
            onLoginSuccess(DEMO_USER); 
        } else {
            setError('邮箱或密码错误，请检查。');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">工作申请记录爬取工具</h1>
                    <p className="text-gray-500 mt-2">登录以开始管理您的申请记录</p>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md mb-6" role="alert">
                    <p className="font-bold">演示说明</p>
                    <p>这是一个前端功能演示，请输入以下Demo账户信息登录。</p>
                    <p className="mt-2">账户: <code className="bg-blue-100 p-1 rounded">demo@example.com</code></p>
                    <p>密码: <code className="bg-blue-100 p-1 rounded">password123</code></p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">邮箱账户</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                            placeholder="请输入您的邮箱" 
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">密码</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                            placeholder="请输入您的密码" 
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button 
                        onClick={handleLogin}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        登 录
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function Home() {
    // 使用状态来管理登录状态和用户信息
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [sessionUser, setSessionUser] = useState<UserSession | null>(null)

    const [activeTab, setActiveTab] = useState<NavigationItem>('财务仪表盘')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [logoutModalOpen, setLogoutModalOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [buildLogOpen, setBuildLogOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const { t } = useLocale()
    // 移除 next-auth 的 useSession
    // const { data: session } = useSession() 

    const handleOpenSettings = () => {
        setSettingsOpen(true);
    };

    const handleOpenBuildLog = () => {
        setSettingsOpen(false);
        setBuildLogOpen(true);
    };

    const handleOpenProfile = () => {
        setSettingsOpen(false);
        setProfileOpen(true);
    };

    const handleLoginSuccess = (user: UserSession) => {
        setSessionUser(user);
        setIsLoggedIn(true);
    }

    const handleLogout = () => {
        setIsLoggedIn(false);
        setSessionUser(null);
        // 重置状态
        setActiveTab('财务仪表盘');
        setLogoutModalOpen(false);
        // ... 其他状态重置
    }

    // 处理移动端侧边栏
    useEffect(() => {
        const handleResize = () => {
            // 只有登录后才处理侧边栏逻辑
            if (isLoggedIn && window.innerWidth >= 768) {
                setIsSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isLoggedIn]) // 依赖 isLoggedIn

    const renderMainContent = () => {
        switch (activeTab) {
            case '财务仪表盘':
                return <BalanceOverview />
            // 其他 Tab 的内容...
            default:
                return <div className="p-4">内容待添加: {activeTab}</div>
        }
    }

    // 未登录时，显示登录视图
    if (!isLoggedIn) {
        return <LoginView onLoginSuccess={handleLoginSuccess} />
    }

    // 已登录时，显示 Dashboard
    return (
        <div className="flex h-screen">
            {/* 移动端遮罩 */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            {/* 侧边栏 */}
            <div className={`fixed md:relative z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300`}>
                <Sidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab}
                    onClose={() => setIsSidebarOpen(false)}
                    setBuildLogOpen={setBuildLogOpen}
                    setProfileOpen={setProfileOpen}
                />
            </div>
            {/* 主内容区域 */}
            <main className="flex-1 overflow-hidden">
                {/* 顶部条：桌面侧边栏切换 + 用户信息 + 认证入口 */}
                <div className="hidden md:flex items-center justify-between bg-white/80 backdrop-blur border-b border-gray-200 p-3">
                    <div /> {/* 左侧占位 */}
                    <div className="flex items-center gap-4">
                        {/* 使用本地状态的 sessionUser 替换 next-auth 的 session */}
                        {sessionUser && ( 
                            <div className="flex items-center gap-2">
                                <Image
                                    src={sessionUser.image || '/default-avatar.png'}
                                    alt="avatar"
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover border"
                                />
                                <span className="text-gray-800 font-medium">{sessionUser.name || sessionUser.email}</span>
                            </div>
                        )}
                        <button
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                            onClick={() => setLogoutModalOpen(true)}
                        >
                            {t('signout') || '登出'}
                        </button>
                    </div>
                </div>
                {/* 移动端顶部导航 */}
                <div className="md:hidden bg-white/80 backdrop-blur border-b border-gray-200 p-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex items-center space-x-2 text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span className="font-medium">CV工坊</span>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100vh-56px)] md:h-[calc(100vh-52px)]"> 
                    {/* 添加 padding 和 overflow 处理 */}
                    {renderMainContent()}
                </div>
            </main>
        </div>
    )
}