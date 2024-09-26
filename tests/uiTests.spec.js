import { test, expect } from '@playwright/test'

const siteURL = "https://www.saucedemo.com/"

//before each test, go to the site and login
test.beforeEach(async ({page}) => {
    await page.goto(siteURL)
    await page.locator('[placeholder="Username"]').fill("standard_user")
    await page.locator('[placeholder="Password"]').fill("secret_sauce")
    await page.locator('[name="login-button"]').click()
})

//positive login test, ensure the inventory page is displayed after login
test('Log In Test', async({page}) => {
    await expect(page.url()).toBe("https://www.saucedemo.com/inventory.html")
})

//negative login test, login with bad creds and verify error message is received
test("Bad Login Test", async ({page}) => {
    await page.goto(siteURL)
    await page.locator('[placeholder="Username"]').fill("negative_user")
    await page.locator('[placeholder="Password"]').fill("secret_sauce")
    await page.locator('[name="login-button"]').click()
    await expect(page.locator('[class="error-message-container error"]')).toBeVisible()
    await expect(page.locator('[data-test="error"]')).toHaveText("Epic sadface: Username and password do not match any user in this service")
})

//Login, select the first item, and verify its the expected item
test('Item Page Verification', async ({page}) => {
    await page.locator('[id="item_4_title_link"]').click()
    await expect(page.url()).toBe("https://www.saucedemo.com/inventory-item.html?id=4")
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText("Sauce Labs Backpack")
})

//E2E test. Login, select item, add to cart, checkout, logout
test("E2E Test", async ({page}) => {
    //log in and add to cart
    await expect(page.url()).toBe("https://www.saucedemo.com/inventory.html")
    await expect(page.locator('[id="add-to-cart-sauce-labs-backpack"]')).toHaveText("Add to cart")
    await page.locator('[name="add-to-cart-sauce-labs-backpack"]').click()
    await expect(page.locator('[data-test="shopping-cart-link"]')).toBeVisible()
    await page.locator('[data-test="shopping-cart-link"]').click()
    //verify in the cart page, item is there, and continue to checkout
    await expect(page.url()).toBe("https://www.saucedemo.com/cart.html")
    await expect(page.locator('[id="checkout"]')).toBeVisible()
    await expect( page.locator('[data-test="item-4-title-link"]')).toBeVisible()
    await page.locator('[id="checkout"]').click()
    //verify on the first step of checkout and fill in the buyer options
    await expect(page.url()).toBe("https://www.saucedemo.com/checkout-step-one.html")
    await expect(page.locator('[data-test="title"]')).toHaveText("Checkout: Your Information")
    await page.locator('[placeholder="First Name"]').fill("QA")
    await page.locator('[placeholder="Last Name"]').fill("Guy")
    await page.locator('[placeholder="Zip/Postal Code"]').fill("15211")
    await expect(page.locator('[id="continue"]')).toHaveValue("Continue")
    await page.locator('[id="continue"]').click()
    //on last step of checkout, verify item and finish
    await expect(page.url()).toBe("https://www.saucedemo.com/checkout-step-two.html")
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack')
    await page.locator('[id="finish"]').click()
    await expect(page.locator('[data-test="complete-header"]')).toHaveText("Thank you for your order!")
    //logout
    await page.locator('[id="react-burger-menu-btn"]').click()
    await page.locator('[data-test="logout-sidebar-link"]').click()
    await expect(page.locator('[data-test="login-button"]')).toBeVisible()
})

//add to cart, veify cart with items, remove from cart, verify cart with no items, logout
test("Add And Remove Cart", async ({page}) => {
    //add items to cart and verify the cart icon is reflecting the right number of item
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click()
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText("3")
    await page.locator('[data-test="shopping-cart-link"]').click()
    //verify items are in the cart page, then return to item page
    await expect( page.locator('[data-test="item-4-title-link"]')).toBeVisible()
    await expect( page.locator('[data-test="item-0-title-link"]')).toBeVisible()
    await expect( page.locator('[data-test="item-1-title-link"]')).toBeVisible()
    await page.locator('[data-test="continue-shopping"]').click()
    //verify on page, remove the items, and verify cart does not show the items added
    await expect(page.url()).toBe("https://www.saucedemo.com/inventory.html")
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible()
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click()
    await expect(page.locator('[data-test="remove-sauce-labs-bike-light"]')).toBeVisible()
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click()
    await expect(page.locator('[data-test="remove-sauce-labs-bolt-t-shirt"]')).toBeVisible()
    await page.locator('[data-test="remove-sauce-labs-bolt-t-shirt"]').click()
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden()
    //logout
    await page.locator('[id="react-burger-menu-btn"]').click()
    await page.locator('[data-test="logout-sidebar-link"]').click()
    await expect(page.locator('[data-test="login-button"]')).toBeVisible()
})

//Verify Description Matches Item in checkout screens
test("Item Matches Description", async ({page}) => {
    //verify the fleece item desc
    const itemDesc = 'It\'s not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.'
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click()
    await expect(page.locator('[data-test="inventory-list"]')).toContainText(itemDesc)
    //go to to cart and verify the description of the item, then checkout
    await page.locator('[data-test="shopping-cart-link"]').click()
    await expect(page.locator('[data-test="inventory-item-desc"]')).toContainText(itemDesc)
    await page.locator('[id="checkout"]').click()
    //put in checkout data and continue
    await page.locator('[placeholder="First Name"]').fill("QA")
    await page.locator('[placeholder="Last Name"]').fill("Guy")
    await page.locator('[placeholder="Zip/Postal Code"]').fill("15211")
    await page.locator('[id="continue"]').click()
    //verify item description on next page then logout
    await expect(page.locator('[data-test="inventory-item-desc"]')).toContainText(itemDesc)
    await page.locator('[id="react-burger-menu-btn"]').click()
    await page.locator('[data-test="logout-sidebar-link"]').click()
    await expect(page.locator('[data-test="login-button"]')).toBeVisible()
})

//Verify links take user back to the same description page on the various pages where link exists
test("Item Links", async ({page}) => {
    //select the backpack and verify the url link page
    const itemLinkPage = "https://www.saucedemo.com/inventory-item.html?id=4"
    await page.locator('[data-test="item-4-title-link"]').click()
    await expect(page.url()).toBe(itemLinkPage)
    //go back to inventory page and add the item to the cart, go to the cart screen and verify item is there
    await page.locator('[data-test="back-to-products"]').click()
    await expect(page.url()).toBe("https://www.saucedemo.com/inventory.html")
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    await page.locator('[data-test="shopping-cart-link"]').click()
    await expect(page.url()).toBe("https://www.saucedemo.com/cart.html")
    await expect( page.locator('[data-test="item-4-title-link"]')).toBeVisible()
    //click the item on checkout screen and verify the link page, then go back to shopping cart
    await page.locator('[data-test="item-4-title-link"]').click()
    await expect(page.url()).toBe(itemLinkPage)
    await page.locator('[data-test="shopping-cart-link"]').click()
    await expect(page.url()).toBe("https://www.saucedemo.com/cart.html")
    //vefify item on page, check out, fill in info, continue to next checkout screen
    await expect( page.locator('[data-test="item-4-title-link"]')).toBeVisible()
    await page.locator('[id="checkout"]').click()
    await page.locator('[placeholder="First Name"]').fill("QA")
    await page.locator('[placeholder="Last Name"]').fill("Guy")
    await page.locator('[placeholder="Zip/Postal Code"]').fill("15211")
    await page.locator('[id="continue"]').click()
    await expect(page.url()).toBe("https://www.saucedemo.com/checkout-step-two.html")
    //verify item is there, click the link and verify item link page
    await expect( page.locator('[data-test="item-4-title-link"]')).toBeVisible()
    await page.locator('[data-test="item-4-title-link"]').click()
    await expect(page.url()).toBe(itemLinkPage)
    //logout
    await page.locator('[id="react-burger-menu-btn"]').click()
    await page.locator('[data-test="logout-sidebar-link"]').click()
    await expect(page.locator('[data-test="login-button"]')).toBeVisible()
})

//login, add backpack to cart, go to cart, check to see if item is the bike light. expected to fail
test.fail("Expected Failure Test", async ({page}) => {
    await page.locator('[name="add-to-cart-sauce-labs-backpack"]').click()
    await page.locator('[data-test="shopping-cart-link"]').click()
    await expect(page.url().toBe('https://www.saucedemo.com/cart.html'))
    await expect(page.locator('data-test="inventory-item-name"').toHaveText("Sauce Labs Bike Light"))
})