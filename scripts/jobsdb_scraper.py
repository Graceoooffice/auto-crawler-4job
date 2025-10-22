import sys
import json
import time
import pickle
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill

# 配置常量
COOKIES_FILE = "jobsdb_cookies.pkl"
EXCEL_OUTPUT_DIR = "scraped_data"
JOBSDB_URL = "https://hk.jobsdb.com"
LOGIN_URL = f"{JOBSDB_URL}/profile/login"

def setup_driver():
    """初始化 Chrome WebDriver"""
    options = webdriver.ChromeOptions()
    # 生产环境取消注释以下行
    # options.add_argument('--headless')  # 无头模式
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def save_cookies(driver, filepath=COOKIES_FILE):
    """保存 cookies 到文件"""
    with open(filepath, 'wb') as f:
        pickle.dump(driver.get_cookies(), f)

def load_cookies(driver, filepath=COOKIES_FILE):
    """从文件加载 cookies"""
    if not os.path.exists(filepath):
        return False
    try:
        with open(filepath, 'rb') as f:
            cookies = pickle.load(f)
            for cookie in cookies:
                driver.add_cookie(cookie)
        return True
    except:
        return False

def wait_for_email_verification(driver, timeout=300):
    """
    等待用户完成邮箱验证登录
    timeout: 最多等待时间(秒),默认5分钟
    """
    print(json.dumps({
        "status": "waiting_verification",
        "message": "请检查邮箱并点击验证链接完成登录"
    }))
    sys.stdout.flush()
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            # 检查是否跳转到已登录页面(通常是个人中心或首页)
            current_url = driver.current_url
            
            # 尝试查找登录后才有的元素
            if "login" not in current_url.lower():
                # 尝试找到用户头像或用户菜单
                try:
                    driver.find_element(By.CSS_SELECTOR, "[data-automation='user-menu'], .user-profile, [aria-label*='profile']")
                    print(json.dumps({
                        "status": "login_success",
                        "message": "登录成功!"
                    }))
                    sys.stdout.flush()
                    return True
                except NoSuchElementException:
                    pass
            
            time.sleep(2)  # 每2秒检查一次
        except Exception as e:
            time.sleep(2)
            continue
    
    return False

def login_to_jobsdb(driver, email):
    """
    处理 JobsDB 登录流程
    """
    try:
        driver.get(LOGIN_URL)
        time.sleep(3)
        
        # 尝试先加载已保存的 cookies
        if load_cookies(driver):
            driver.refresh()
            time.sleep(2)
            
            # 检查是否已登录
            if "login" not in driver.current_url.lower():
                print(json.dumps({
                    "status": "login_success",
                    "message": "使用保存的session登录成功"
                }))
                sys.stdout.flush()
                return True
        
        # 需要重新登录
        print(json.dumps({
            "status": "login_required",
            "message": "正在启动登录流程..."
        }))
        sys.stdout.flush()
        
        # 查找邮箱输入框
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email'], #emailAddress"))
        )
        email_input.clear()
        email_input.send_keys(email)
        
        # 点击继续/登录按钮
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], button[data-automation='submitButton']")
        submit_button.click()
        
        time.sleep(3)
        
        # 等待邮箱验证
        if wait_for_email_verification(driver):
            save_cookies(driver)
            return True
        else:
            raise Exception("登录超时,请确认已点击邮箱验证链接")
            
    except Exception as e:
        raise Exception(f"登录失败: {str(e)}")

def scrape_application_history(driver):
    """
    爬取投递记录
    """
    applications = []
    
    try:
        # 导航到申请历史页面
        # 注意: 需要根据实际的 JobsDB URL 结构调整
        driver.get(f"{JOBSDB_URL}/profile/job-applications")
        time.sleep(3)
        
        # 等待页面加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-automation='job-list'], .job-card, .application-item"))
        )
        
        # 滚动加载所有内容
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        # 查找所有职位卡片 (需要根据实际HTML结构调整选择器)
        job_cards = driver.find_elements(By.CSS_SELECTOR, "[data-automation='job-card'], .job-card, .application-item, [class*='application']")
        
        for card in job_cards:
            try:
                # 提取职位信息 (选择器需要根据实际页面调整)
                title = card.find_element(By.CSS_SELECTOR, "h3, .job-title, [data-automation='job-title']").text
                company = card.find_element(By.CSS_SELECTOR, ".company-name, [data-automation='company-name']").text
                
                # 尝试获取投递日期
                try:
                    date = card.find_element(By.CSS_SELECTOR, ".date, .apply-date, time").text
                except:
                    date = "未知"
                
                # 尝试获取状态
                try:
                    status = card.find_element(By.CSS_SELECTOR, ".status, [data-automation='status']").text
                except:
                    status = "已投递"
                
                # 尝试获取职位链接
                try:
                    link = card.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
                except:
                    link = ""
                
                applications.append({
                    "title": title,
                    "company": company,
                    "date": date,
                    "status": status,
                    "link": link
                })
                
            except Exception as e:
                # 跳过无法解析的卡片
                continue
        
        if not applications:
            raise Exception("未找到任何投递记录,请确认页面选择器是否正确")
        
        return applications
        
    except TimeoutException:
        raise Exception("页面加载超时,请检查网络连接")
    except Exception as e:
        raise Exception(f"爬取失败: {str(e)}")

def save_to_excel(data, filename=None):
    """
    将数据保存为 Excel 文件
    """
    if not os.path.exists(EXCEL_OUTPUT_DIR):
        os.makedirs(EXCEL_OUTPUT_DIR)
    
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"jobsdb_applications_{timestamp}.xlsx"
    
    filepath = os.path.join(EXCEL_OUTPUT_DIR, filename)
    
    wb = Workbook()
    ws = wb.active
    ws.title = "投递记录"
    
    # 设置表头
    headers = ["职位名称", "公司名称", "投递日期", "状态", "职位链接"]
    ws.append(headers)
    
    # 美化表头
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")
    
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
    
    # 添加数据
    for item in data:
        ws.append([
            item.get("title", ""),
            item.get("company", ""),
            item.get("date", ""),
            item.get("status", ""),
            item.get("link", "")
        ])
    
    # 调整列宽
    ws.column_dimensions['A'].width = 40
    ws.column_dimensions['B'].width = 30
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 50
    
    wb.save(filepath)
    return filepath

def main_scrape_logic():
    """
    主爬虫逻辑
    """
    driver = None
    
    try:
        # 从命令行参数获取邮箱 (可选)
        email = sys.argv[1] if len(sys.argv) > 1 else "your-email@example.com"
        
        # 初始化浏览器
        driver = setup_driver()
        
        # 登录
        login_to_jobsdb(driver, email)
        
        # 爬取数据
        print(json.dumps({
            "status": "scraping",
            "message": "正在爬取投递记录..."
        }))
        sys.stdout.flush()
        
        applications = scrape_application_history(driver)
        
        # 保存到 Excel
        excel_path = save_to_excel(applications)
        
        return {
            "success": True,
            "count": len(applications),
            "data": applications,
            "excel_path": excel_path,
            "message": f"成功爬取 {len(applications)} 条记录"
        }
        
    except Exception as e:
        raise Exception(f"爬取过程出错: {str(e)}")
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    try:
        result = main_scrape_logic()
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        print(f"Python Error: {e}", file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)