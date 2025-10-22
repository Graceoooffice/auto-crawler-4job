import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
# 不再需要从 webdriver_manager 导入任何东西

# 假设 chromedriver.exe 位于当前脚本的目录下
CHROME_DRIVER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chromedriver.exe")

try:
    # 1. 创建 Service 对象，直接指定手动下载的驱动路径
    # 注意：我们不再调用 .install()
    service = Service(CHROME_DRIVER_PATH)
    
    # 2. 启动 Driver
    driver = webdriver.Chrome(service=service)
    
    driver.get("https://www.google.com")
    print("✅ Selenium 和 ChromeDriver 配置成功!")
    driver.quit()
    
except FileNotFoundError:
    print(f"❌ 错误：未找到驱动文件。请确保 chromedriver.exe 文件在以下路径: {CHROME_DRIVER_PATH}")
except Exception as e:
    print(f"❌ 启动失败: {e}")