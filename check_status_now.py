# -*- coding: utf-8 -*-
import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright  # type: ignore # pyrefly: ignore

default_profile = os.path.join(os.environ.get("USERPROFILE", os.path.expanduser("~")), ".gemini_web_profile")
screenshot_path = os.path.join(os.getcwd(), "gemini_status.png")

with sync_playwright() as p:
    browser = p.chromium.launch_persistent_context(
        user_data_dir=default_profile,
        channel="chrome",
        headless=True,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox"
        ]
    )
    page = browser.pages[0] if browser.pages else browser.new_page()
    page.goto("https://gemini.google.com/app", timeout=60000, wait_until='domcontentloaded')
    time.sleep(4)
    
    # Chụp ảnh màn hình để kiểm tra trực quan
    page.screenshot(path=screenshot_path)
    print(f"[SCREENSHOT]: {screenshot_path}", flush=True)
    
    print("Page URL:", page.url, flush=True)
    print("Page Title:", page.title(), flush=True)
    
    acc = page.query_selector('a[aria-label*="Google Account"], a[aria-label*="Tài khoản Google"], button[aria-label*="Google Account"]')
    if acc:
        print("[ACCOUNT]:", acc.get_attribute('aria-label'), flush=True)
    else:
        print("[ACCOUNT]: Không tìm thấy nút tài khoản Google", flush=True)
        
    signin = page.query_selector('a[href*="accounts.google.com"]')
    print("[SIGNIN_BUTTON_PRESENT]:", bool(signin), flush=True)
    
    # Kiểm tra model
    model_btn = page.query_selector('[data-test-id="model-switcher-button"], button[aria-haspopup="menu"]')
    if model_btn:
        print("[MODEL_SELECTOR]:", model_btn.inner_text().strip(), flush=True)
    else:
        print("[MODEL_SELECTOR]: Không tìm thấy", flush=True)
        
    # Tìm bất kỳ chữ Advanced nào trên trang
    has_advanced = page.query_selector(':text("Advanced")')
    print("[HAS_ADVANCED_TEXT]:", bool(has_advanced), flush=True)

    browser.close()
