'use client'

import { useState, FC } from 'react';

// Define the data structure for a single job application record.
interface JobApplication {
    title: string;
    company: string;
    date: string;
    status: '已查看' | '邀请面试' | '不合适' | '已投递';
}

/**
 * A utility function to determine the Tailwind CSS class for a given application status.
 * @param status - The status of the job application.
 * @returns A string of Tailwind CSS classes for styling the status badge.
 */
const getStatusClass = (status: JobApplication['status']): string => {
    switch(status) {
        case '已查看': return 'bg-blue-100 text-blue-800';
        case '邀请面试': return 'bg-green-100 text-green-800';
        case '不合适': return 'bg-red-100 text-red-800';
        case '已投递': 
        default: 
            return 'bg-gray-100 text-gray-800';
    }
};


/**
 * BalanceOverview Component
 * This component is responsible for displaying the job scraping interface,
 * handling the API call to the backend scraper, and showing the results.
 * It is a self-contained content component, meant to be placed within a larger page layout.
 */
const BalanceOverview: FC = () => {
    // State to manage the loading status during the API call.
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // State to store the job application records fetched from the API.
    const [results, setResults] = useState<JobApplication[]>([]);
    // State to hold any error messages that occur during the process.
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles the scraping process by calling the backend API endpoint.
     */
    const handleScrape = async () => {
        setIsLoading(true);
        setResults([]); // Clear previous results
        setError(null);   // Clear previous errors

        try {
            // Make a POST request to the Next.js API route.
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // You can pass parameters to your script here if needed.
                // For example: body: JSON.stringify({ platform: 'JobsDB' }),
            });

            // If the server returns an error status (e.g., 4xx, 5xx), handle it.
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '爬取失败，服务器返回错误。');
            }

            // Parse the successful JSON response from the server.
            const data: JobApplication[] = await response.json();
            
            if (data.length === 0) {
                 setError('未找到任何申请记录。');
            } else {
                 setResults(data);
            }

        } catch (err: any) {
            console.error("Scraping process failed:", err);
            setError(err.message || '发生未知错误，请检查控制台或重试。');
        } finally {
            // Ensure the loading state is turned off after the process completes.
            setIsLoading(false);
        }
    };
    
    /**
     * Handles exporting the current results to a CSV file.
     */
    const handleExport = () => {
        if (results.length === 0) return;

        const headers = ['职位名称', '公司', '申请日期', '状态'];
        // Use \uFEFF to ensure correct character encoding in Excel.
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
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full"> 
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">我的申请记录</h1>
            
            {/* --- Controls Section --- */}
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

            {/* --- Status/Feedback Section --- */}
            <div className="text-center p-4 min-h-[120px] flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center">
                        <div className="loader border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
                        <p className="text-blue-600 mt-3 font-medium">正在爬取中，请稍候... (这可能需要1-2分钟)</p>
                    </div>
                )}
                
                {error && !isLoading && (
                    <p className="text-red-600 font-semibold">{error}</p>
                )}

                {!isLoading && !error && results.length === 0 && (
                    <p className="text-gray-500">点击按钮开始爬取您的申请记录。</p>
                )}
            </div>

            {/* --- Results Table Section --- */}
            {results.length > 0 && !isLoading && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">爬取结果</h2>
                        <button onClick={handleExport} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zM9 13a1 1 0 102 0 1 1 0 10-2 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm10-7a1 1 0 10-2 0v4a1 1 0 102 0V3zM7 11a1 1 0 102 0 1 1 0 10-2 0z" clipRule="evenodd" /></svg>
                            导出为 Excel (CSV)
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.company}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
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

export default BalanceOverview;
