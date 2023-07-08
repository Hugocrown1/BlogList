const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require ('../models/blog')


const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
  
  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
  
  
    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
      'Deep Work'
    )
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Zlatan Ibrahimovic',
      url: 'www.zlatangod.com',
      likes: 55
  }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
      
  
    const contents = blogsAtEnd.map(n => n.title)
  
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('blog without title is not added', async () => {
    const newBlog = {
      
      author: 'Compayaso',
      url: 'www.wordle.com',
      likes: 66
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
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