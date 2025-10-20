'use client'
import { useState, FC } from 'react'

// 定义申请记录的数据类型
interface JobApplication {
    title: string;
    company: string;
    date: string;
    status: '已查看' | '邀请面试' | '不合适' | '已投递';
}

// 模拟的爬取数据
const fakeScrapedData: JobApplication[] = [
    { title: '前端开发工程师', company: '未来科技有限公司', date: '2025-10-18', status: '已查看' },
    { title: '产品经理', company: '创新互动', date: '2025-10-15', status: '已投递' },
    { title: 'UI/UX 设计师', company: '数字浪潮集团', date: '2025-10-12', status: '邀请面试' },
    { title: '数据分析师', company: '智慧数据', date: '2025-10-10', status: '不合适' },
    { title: 'Java后端工程师', company: '云端服务有限公司', date: '2025-10-05', status: '已投递' }
];

// 
// 移除了 LoginView、UserSession、DEMO_USER，因为这些由 page.tsx 管理
// 

// 
// 移除了 Home (default export)，因为这个文件现在只导出内容组件
//

// 这个组件就是 page.tsx 中 <BalanceOverview /> 实际渲染的内容
// 我们将原先的 DashboardView 重命名为 BalanceOverview 并设为默认导出
// 我们移除了它内部的 Sidebar、Header 和整个 h-screen 布局，只保留内容卡片
//
const BalanceOverview: FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<JobApplication[]>([]);

    const handleScrape = () => {
        setIsLoading(true);
        setResults([]);
        setTimeout(() => {
            setResults(fakeScrapedData);
            setIsLoading(false);
        }, 2500); // 模拟2.5秒的加载时间
    };
    
    const handleExport = () => {
        if (results.length === 0) return;

        const headers = ['职位名称', '公司', '申请日期', '状态'];
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += headers.join(',') + '\r\n';

        results.forEach(row => {
            const values = [row.title, row.company, row.date, row.status];
            csvContent += values.join(',') + '\r\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'job_application_history.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusClass = (status: JobApplication['status']) => {
        switch(status) {
            case '已查看': return 'bg-blue-100 text-blue-800';
            case '邀请面试': return 'bg-green-100 text-green-800';
            case '不合适': return 'bg-red-100 text-red-800';
            case '已投递': default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    // 返回的只是主内容区域的内部
    // page.tsx 会提供 p-4 / p-8 的 padding
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full"> 
            <h1 className="text-3xl font-bold text-gray-800 mb-6">我的申请记录</h1>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor="website-select" className="block text-sm font-medium text-gray-700">选择目标网站</label>
                    <select id="website-select" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option>JobsDB</option>
                        <option>LinkedIn (模拟)</option>
                        <option>Boss直聘 (模拟)</option>
                    </select>
                </div>
                <button 
                    onClick={handleScrape} 
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    {isLoading ? '爬取中...' : '爬取历史投递记录'}
                </button>
            </div>

            <div className="text-center p-4 min-h-[120px] flex items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="loader border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
                        <p className="text-blue-600 mt-3">正在爬取中，请稍候... (模拟过程)</p>
                    </div>
                ) : (
                    results.length === 0 && <p className="text-gray-500">点击按钮开始爬取您的申请记录。</p>
                )}
            </div>

            {results.length > 0 && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">爬取结果</h2>
                        <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 3.293a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            导出为 Excel (CSV)
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职位名称</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请日期</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.company}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// 将这个内容组件作为默认导出
export default BalanceOverview;