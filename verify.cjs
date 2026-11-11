const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto('http://127.0.0.1:8765/');
    assert.equal(await page.title(), 'Dance Africa — Move with the continent');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByRole('button', {name:'Menu',exact:true}).click();
    assert.equal(await page.getByRole('button', {name:'Menu',exact:true}).getAttribute('aria-expanded'), 'true');
    await page.getByRole('link', {name:'Discover',exact:true}).click();
    assert.equal(await page.getByRole('button', {name:'Menu',exact:true}).getAttribute('aria-expanded'), 'false');
    await page.getByRole('button', {name:'Schools',exact:true}).click();
    assert.equal(await page.locator('[data-audience]:visible').count(),1);
    await page.getByRole('button', {name:'Prepare a school listing'}).click();
    assert(await page.getByRole('dialog').isVisible());
    await page.getByRole('button', {name:'Download my request'}).click();
    assert.equal(await page.locator('#request-form').evaluate(f => f.checkValidity()),false);
    await page.getByLabel('Your name or organisation').fill('Test studio');
    await page.getByLabel('Email for your request').fill('studio@example.test');
    await page.getByLabel('City and country').fill('Windhoek, Namibia');
    await page.getByLabel('Tell us about it').fill('A test dance class request');
    await page.getByLabel('I have permission').check();
    const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Download my request'}).click();
    assert.equal((await download).suggestedFilename(),'dance-africa-request.json');
    await page.keyboard.press('Escape'); assert.equal(await page.getByRole('dialog').isVisible(),false);
    await page.goto('http://127.0.0.1:8765/portal.html');
    await page.getByLabel('Campaign title').fill('<img src=x onerror=alert(1)>');
    await page.getByLabel('Planned date').fill('2026-12-01');
    await page.getByLabel('Draft content').fill('Original creator spotlight');
    await page.getByRole('button',{name:'Save draft locally'}).click();
    assert.equal(await page.locator('#draft-count').innerText(),'1');
    assert.equal(await page.locator('.draft img').count(),0);
    await page.reload(); assert.equal(await page.locator('#draft-count').innerText(),'1');
    await page.getByRole('button',{name:'Ready for review',exact:true}).click();
    await page.getByRole('button',{name:'Approve locally',exact:true}).click();
    assert.equal(await page.locator('.draft .status').innerText(),'Approved locally');
    const exported = page.waitForEvent('download'); await page.getByRole('button',{name:'Export drafts'}).click();
    assert.equal((await exported).suggestedFilename(),'dance-africa-editorial-drafts.json');
    page.once('dialog',d=>d.accept()); await page.getByRole('button',{name:'Delete draft:'}).click();
    assert.equal(await page.locator('#draft-count').innerText(),'0');
    await page.getByRole('link',{name:'Privacy and local data'}).click();
    assert.equal(await page.title(),'Privacy — Dance Africa');
    for(const width of [390,768,1440]) {
      await page.setViewportSize({width,height:900}); await page.goto('http://127.0.0.1:8765/');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`overflow at ${width}`);
    }
    await page.screenshot({path:'../dance-africa-home.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: mobile menu, filters, required fields, request download, dialog, draft persistence, safe text rendering, local review/approval, export, delete, privacy and 3 viewport widths.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
