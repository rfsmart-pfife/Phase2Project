import { test, expect } from '@playwright/test'
const fs = require("fs");
const path = require("path")

//URL for the site apis will be hitting
const siteURL = "https://jsonplaceholder.typicode.com"

//GET test, reaches out for the first id
test('API GET Request', async ({request}) => {
    const response = await request.get(`${siteURL}/posts/1`)
    expect(response.status()).toBe(200)
})

//POST test, add another blob of data to posts at the site
test('API POST Request', async ({request}) => {
    const response = await request.post(`${siteURL}/posts`, {
        data : {
            userId: 12,
            title: 'Test Book',
            body: "This my POST test"
        }
    })
    const postResponse = await response.json()
    expect(response.ok())
    expect(postResponse.body).toBe("This my POST test")
    expect(postResponse.userId).toBe(12)
    expect(postResponse.title).toBe("Test Book")
})

//Workflow and artifact tests, reverse the order of the posts and pulls the first 5 to a file
test('Workflow Test', async ({request}) => {
    const response = await request.get(`${siteURL}/posts`)
    let posts = await response.json()
    expect(response.ok())
    posts.forEach((post) => {
        expect(post).toHaveProperty("title")
        expect(post).toHaveProperty("userId")
        expect(post).toHaveProperty("id")
        expect(post).toHaveProperty("body")
    })
    //reverses the posts
    posts.reverse()
    posts.forEach((post) => {
        expect(post).toHaveProperty("title")
        expect(post).toHaveProperty("userId")
        expect(post).toHaveProperty("id")
        expect(post).toHaveProperty("body")
    })
    //slice out the first 5 which is still reversed so last 5
    const lastFive = posts.slice(0, 5)
    lastFive.forEach((post) => {
        expect(post).toHaveProperty("title")
        expect(post).toHaveProperty("userId")
        expect(post).toHaveProperty("id")
        expect(post).toHaveProperty("body")
    })
    // Creats a directory for the file to be written into
    const fileDirectory = path.resolve('./tests/', "Artifacts")
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory)
    }
    const filePath = path.resolve(fileDirectory, "lastFive.json");
    //create the artifact
    fs.writeFile(filePath, JSON.stringify(lastFive), (err) => {
        if (err)
            console.log(err)
          else {
            console.log("File written successfully")
          }
    })
})

