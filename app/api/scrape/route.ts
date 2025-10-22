import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
    // 获取前端传来的参数
    const body = await request.json();
    const { email, platform } = body;

    if (!email) {
        return NextResponse.json(
            { error: '请提供邮箱地址' },
            { status: 400 }
        );
    }

    // 根据平台选择不同的脚本
    const scriptName = platform === 'jobsdb' ? 'jobsdb_scraper.py' : 'my_scraper.py';
    const scriptPath = path.resolve(process.cwd(), `scripts/${scriptName}`);

    const runScript = (email: string): Promise<{ data: any, error: string | null }> => {
        return new Promise((resolve, reject) => {
            // 使用虚拟环境的 Python
            const pythonPath = process.env.PYTHON_PATH || path.resolve(process.cwd(), 'venv/bin/python3');
            
            // 将邮箱作为命令行参数传递给 Python
            const pythonProcess = spawn(pythonPath, [scriptPath, email]);
            
            let stdoutData = '';
            let stderrData = '';
            
            // 监听 Python 的实时输出(用于显示登录状态)
            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdoutData += output;
                
                // 尝试解析状态消息并打印到控制台
                try {
                    const lines = output.trim().split('\n');
                    for (const line of lines) {
                        try {
                            const statusMsg = JSON.parse(line);
                            if (statusMsg.status) {
                                console.log('Python Status:', statusMsg);
                            }
                        } catch (e) {
                            // 单行不是 JSON,继续
                        }
                    }
                } catch (e) {
                    // 不是 JSON,继续累积
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
                console.error('Python stderr:', data.toString());
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        // 获取最后一个有效的 JSON 输出
                        const lines = stdoutData.trim().split('\n');
                        const lastLine = lines[lines.length - 1];
                        const jsonData = JSON.parse(lastLine);
                        resolve({ data: jsonData, error: null });
                    } catch (e) {
                        reject(new Error(`Invalid JSON output: ${stdoutData}`));
                    }
                } else {
                    reject(new Error(`Script exited with code ${code}: ${stderrData}`));
                }
            });

            pythonProcess.on('error', (err) => {
                reject(new Error(`Failed to start script: ${err.message}`));
            });
        });
    };

    try {
        const { data, error } = await runScript(email);
        
        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }
        
        return NextResponse.json(data);
        
    } catch (err: any) {
        console.error("API Route Error:", err);
        return NextResponse.json(
            { error: err.message || 'Failed to execute scraper script.' },
            { status: 500 }
        );
    }
}