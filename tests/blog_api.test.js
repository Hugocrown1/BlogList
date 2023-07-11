const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require ('../models/blog')


const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

//excercise 4.8
test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

//excercise 4.9
test('the blogs identifier property is called id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach((blog) => {
    expect(blog.id).toBeDefined()
  })
})

//excercise 4.10
test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'valid blog',
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
      'valid blog'
    )
  })

  //excercise 4.11
test('likes property is 0 by default', async () => {
  const newBlog = {
    title: 'Cristiano the goat',
    author: 'Will Smith',
    url: 'www.factos.com'
  }

  await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  const likes = blogsAtEnd.map(n => n.likes)

  expect(likes[likes.length - 1]).toEqual(0)



})

//excercise 4.12
test('blog without title and url is not added', async () => {
  const newBlog = {
    author: 'Compayaso',
    likes: 66
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})
  

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
  
  
    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
      'Deep Work'
    )
  })

  

  

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
  
    const blogToView = blogsAtStart[0]
    
  
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
  
    expect(resultBlog.body).toEqual(processedBlogToView)
  })
  
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )
  
    const contents = blogsAtEnd.map(r => r.title)
  
    expect(contents).not.toContain(blogToDelete.title)
  })


afterAll(() => {
  mongoose.connection.close()
})