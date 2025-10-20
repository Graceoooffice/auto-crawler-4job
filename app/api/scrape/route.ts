import { NextResponse } from 'next/server';
import { spawn } from 'child_process'; // 导入 Node.js 的子进程模块
import path from 'path'; // 导入 Node.js 的路径模块

export async function POST(request: Request) {
    
    // 1. 确定 Python 脚本的绝对路径
    // process.cwd() 指向项目根目录
    const scriptPath = path.resolve(process.cwd(), 'scripts/my_scraper.py');

    // 2. 将执行脚本的逻辑封装在 Promise 中，以便
    //    我们可以 'await' 它的完成
    const runScript = (): Promise<{ data: any, error: string | null }> => {
        return new Promise((resolve, reject) => {
            // 假设您的环境中有 'python3'。
            // 如果是 'python'，请修改这里。
            const pythonProcess = spawn('python3', [scriptPath]);
            
            let stdoutData = '';
            let stderrData = '';

            // 3. 监听 Python 脚本的
            //    标准输出 (stdout)
            pythonProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            // 4. 监听 Python 脚本的
            //    标准错误 (stderr)
            pythonProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            // 5. 监听脚本退出事件
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    // 退出码为 0，表示成功
                    try {
                        // 尝试解析 Python 脚本打印的 JSON
                        const jsonData = JSON.parse(stdoutData);
                        resolve({ data: jsonData, error: null });
                    } catch (e) {
                        // JSON 解析失败
                        reject(new Error(`Python script output is not valid JSON: ${stdoutData}`));
                    }
                } else {
                    // 退出码非 0，表示失败
                    // 将 stderr 的内容作为错误信息
                    reject(new Error(`Python script exited with code ${code}: ${stderrData}`));
                }
            });

            // 处理 spawn 本身的错误 (例如 'python3' 命令未找到)
            pythonProcess.on('error', (err) => {
                reject(new Error(`Failed to start script: ${err.message}`));
            });
        });
    };

    // 6. 执行脚本并返回响应
    try {
        const { data, error } = await runScript();
        
        if (error) {
            // 这种情况理论上在 'close' 事件中被 'reject' 处理了
            // 但作为双重保险
            return NextResponse.json({ error: error }, { status: 500 });
        }
        
        // 成功！将 Python 返回的 JSON 数据
        // 作为 API 响应发送回前端
        return NextResponse.json(data);

    } catch (err: any) {
        console.error("API Route Error:", err);
        // 向前端返回一个标准的错误结构
        return NextResponse.json(
            { error: err.message || 'Failed to execute scraper script.' }, 
            { status: 500 }
        );
    }
}