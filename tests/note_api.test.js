const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require ('../models/blog')
const initialBlogs = [
    {
        title: 'Atomic Habits',
        author: 'James Clear',
        url: 'www.atomichabits.com',
        likes: 21
    },

    {
        title: 'Deep Work',
        author: 'Cal Newport',
        url: 'www.calnew.com',
        likes: 55
    }
]
beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
  })

const api = supertest(app)

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
  
    expect(response.body).toHaveLength(initialBlogs.length)
  })
  
  test('a specific note is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
  
  
    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
      'Deep Work'
    )
  })

// test('blogs are returned as json', async () => {
//   await api
//     .get('/api/blogs')
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
// }, 100000)

// test('there are two blogs', async () => {
//     const response = await api.get('/api/blogs')
  
//     expect(response.body).toHaveLength(2)
//   })
  
//   test('the first note is about HTTP methods', async () => {
//     const response = await api.get('/api/blogs')
  
//     expect(response.body[0].content).toBe('HTML is easy')
//   })

afterAll(() => {
  mongoose.connection.close()
})