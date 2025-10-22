'use client'

import { useState, FC } from 'react';

// 更新数据结构以匹配后端返回
interface JobApplication {
    title: string;
    company: string;
    date: string;
    status: string;  // 改为 string 以支持更多状态
    link?: string;   // 新增职位链接
}

// API 响应结构
interface ScraperResponse {
    success?: boolean;
    count?: number;
    data?: JobApplication[];
    excel_path?: string;
    message?: string;
    status?: string;  // 用于接收登录状态消息
    error?: string;
}

/**
 * 获取状态对应的样式类
 */
const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('查看') || statusLower.includes('viewed')) {
        return 'bg-blue-100 text-blue-800';
    }
    if (statusLower.includes('面试') || statusLower.includes('interview')) {
        return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('拒绝') || statusLower.includes('不合适') || statusLower.includes('reject')) {
        return 'bg-red-100 text-red-800';
    }
    if (statusLower.includes('已投递') || statusLower.includes('applied')) {
        return 'bg-gray-100 text-gray-800';
    }
    // 默认样式
    return 'bg-purple-100 text-purple-800';
};

const BalanceOverview: FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<JobApplication[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    
    // 新增状态：邮箱输入和选中的平台
    const [email, setEmail] = useState<string>('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('jobsdb');
    const [excelPath, setExcelPath] = useState<string>('');

    /**
     * 处理爬取过程
     */
    const handleScrape = async () => {
        // 验证邮箱
        if (!email || !email.includes('@')) {
            setError('请输入有效的邮箱地址');
            return;
        }

        setIsLoading(true);
        setResults([]);
        setError(null);
        setStatusMessage('正在初始化爬虫...');
        setExcelPath('');

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email,
                    platform: selectedPlatform 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '爬取失败，服务器返回错误。');
            }

            const data: ScraperResponse = await response.json();
            
            // 处理不同的响应状态
            if (data.status === 'waiting_verification') {
                setStatusMessage('⏳ 请检查您的邮箱并点击验证链接完成登录');
            } else if (data.status === 'login_success') {
                setStatusMessage('✅ 登录成功！正在爬取数据...');
            } else if (data.status === 'scraping') {
                setStatusMessage('🔍 正在爬取投递记录...');
            }
            
            // 处理最终结果
            if (data.success && data.data) {
                if (data.data.length === 0) {
                    setError('未找到任何申请记录。请确认您在该平台有投递记录。');
                } else {
                    setResults(data.data);
                    setStatusMessage(`✅ ${data.message || `成功爬取 ${data.count} 条记录`}`);
                    if (data.excel_path) {
                        setExcelPath(data.excel_path);
                    }
                }
            } else if (data.error) {
                throw new Error(data.error);
            } else if (Array.isArray(data)) {
                // 兼容旧的返回格式（直接返回数组）
                setResults(data);
                setStatusMessage(`✅ 成功爬取 ${data.length} 条记录`);
            }

        } catch (err: any) {
            console.error("Scraping process failed:", err);
            setError(err.message || '发生未知错误，请检查控制台或重试。');
            setStatusMessage('');
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * 导出为 CSV
     */
    const handleExport = () => {
        if (results.length === 0) return;

        const headers = ['职位名称', '公司', '申请日期', '状态', '职位链接'];
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += headers.join(',') + '\r\n';

        results.forEach(row => {
            const values = [
                `"${row.title.replace(/"/g, '""')}"`,  // 处理标题中的引号
                `"${row.company.replace(/"/g, '""')}"`,
                row.date,
                row.status,
                row.link || ''
            ];
            csvContent += values.join(',') + '\r\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `job_applications_${selectedPlatform}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full"> 
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">我的申请记录</h1>
            
            {/* --- 邮箱输入和平台选择区域 --- */}
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                {/* 邮箱输入 */}
                <div>
                    <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
                        登录邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input 
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入您在 JobsDB 注册的邮箱"
                        disabled={isLoading}
                        className="block w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        💡 提示: 爬取开始后，您需要检查邮箱并点击验证链接完成登录
                    </p>
                </div>

                {/* 平台选择和爬取按钮 */}
                <div className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-grow w-full sm:w-auto">
                        <label htmlFor="website-select" className="block text-sm font-medium text-gray-700 mb-1">
                            选择目标网站
                        </label>
                        <select 
                            id="website-select" 
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            disabled={isLoading}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="jobsdb">JobsDB (香港)</option>
                            <option value="linkedin" disabled>LinkedIn (即将支持)</option>
                            <option value="boss" disabled>Boss直聘 (即将支持)</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleScrape} 
                        disabled={isLoading || !email}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {isLoading ? '爬取中...' : '开始爬取'}
                    </button>
                </div>
            </div>

            {/* --- 状态显示区域 --- */}
            <div className="text-center p-4 min-h-[120px] flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center">
                        <div className="loader border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
                        <p className="text-blue-600 mt-3 font-medium">
                            {statusMessage || '正在初始化...'}
                        </p>
                        {statusMessage.includes('邮箱') && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
                                <p className="text-sm text-yellow-800">
                                    <strong>📧 需要您的操作:</strong><br/>
                                    1. 打开您的邮箱<br/>
                                    2. 查找来自 JobsDB 的验证邮件<br/>
                                    3. 点击邮件中的验证链接<br/>
                                    4. 等待自动完成登录
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {error && !isLoading && (
                    <div className="text-center">
                        <p className="text-red-600 font-semibold mb-2">{error}</p>
                        <button 
                            onClick={() => setError(null)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            清除错误
                        </button>
                    </div>
                )}

                {!isLoading && !error && results.length === 0 && !statusMessage && (
                    <p className="text-gray-500">请输入邮箱并选择平台，然后点击"开始爬取"按钮。</p>
                )}
                
                {!isLoading && statusMessage && results.length === 0 && !error && (
                    <p className="text-green-600 font-medium">{statusMessage}</p>
                )}
            </div>

            {/* --- 结果表格区域 --- */}
            {results.length > 0 && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700">爬取结果</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                共找到 {results.length} 条申请记录
                                {excelPath && <span className="ml-2">📄 Excel 文件已保存</span>}
                            </p>
                        </div>
                        <button 
                            onClick={handleExport} 
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            导出为 CSV
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto bg-white rounded-lg shadow border">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职位名称</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请日期</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.company}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {item.link && (
                                                <a 
                                                    href={item.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    查看详情 →
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {excelPath && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                ✅ Excel 文件已保存到服务器: <code className="bg-green-100 px-2 py-1 rounded">{excelPath}</code>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BalanceOverview;