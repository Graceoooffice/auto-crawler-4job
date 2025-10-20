import sys
import json
import time # 模拟长时间运行的爬虫

def main_scrape_logic():
    """
    这是您真正的爬虫逻辑 (例如使用 Selenium, BeautifulSoup 等)
    """
    # 模拟爬取过程
    time.sleep(5) # 模拟 5 秒钟的爬取时间
    
    # 模拟成功的数据
    scraped_data = [
        { "title": "Real Frontend Developer", "company": "RealTech Inc.", "date": "2025-10-20", "status": "已投递" },
        { "title": "Real Product Manager", "company": "Scraped Solutions", "date": "2025-10-19", "status": "已查看" },
        { "title": "Real Data Analyst", "company": "DataCorp", "date": "2025-10-18", "status": "邀请面试" }
    ]
    
    # 模拟失败的情况：
    # if some_error:
    #     raise Exception("无法登录，Cookie 已过期")
         
    return scraped_data

if __name__ == "__main__":
    try:
        # 1. 执行主逻辑
        data = main_scrape_logic()
        
        # 2. 成功：将结果转换为 JSON 字符串并打印到 stdout
        #    这是 Node.js 将会捕获的数据
        print(json.dumps(data))
        sys.stdout.flush() # 确保缓冲区被清空
        
    except Exception as e:
        # 3. 失败：将错误信息打印到 stderr
        #    这是 Node.js 将会捕获的错误
        print(f"Python Error: {e}", file=sys.stderr)
        sys.stderr.flush() # 确保缓冲区被清空
        
        # 4. 以非零退出码退出，告知 Node.js 发生了错误
        sys.exit(1)