import asyncio
from pyppeteer import launch

async def main():
    browser = await launch(headless=True, args=['--no-sandbox'])
    page = await browser.newPage()
    page.on('console', lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on('pageerror', lambda err: print(f"PAGE_ERROR: {err.message}"))

    await page.goto('http://localhost:8080')
    await asyncio.sleep(1)

    print("Clicking register...")
    await page.evaluate("""() => {
        document.querySelector('.reg-open-btn').click();
    }""")
    await asyncio.sleep(1)

    print("Filling form...")
    await page.evaluate("""() => {
        document.getElementById('reg-name').value = "Test";
        document.getElementById('reg-usn').value = "1DA22CS045";
        document.getElementById('reg-branch').value = "CSE";
        document.getElementById('reg-section').value = "A";
        document.getElementById('reg-email').value = "test@test.com";
        document.getElementById('reg-phone').value = "9876543210";
        document.getElementById('reg-utr').value = "123412341234";
    }""")
    
    # Simulate file upload for required fields
    # Just skipping file upload to see validation error?
    print("Clicking submit...")
    await page.evaluate("""() => {
        document.getElementById('reg-submit-btn').click();
    }""")
    await asyncio.sleep(2)

    await browser.close()

asyncio.run(main())
