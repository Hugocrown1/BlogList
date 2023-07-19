const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')
const helper = require('./test_helper')
const Blog = require ('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')


const api = supertest(app)

let token;
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const { username, name, password } = helper.initialUser;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, name, passwordHash });

  token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET, { expiresIn: 60*60})
  
  const blogObjects = helper.initialBlogs.map(blog => {
    blog.user = user._id
    return new Blog(blog)
  })

  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  user.blogs = blogObjects.map(blog => blog._id)
  await user.save()
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

//excercise 4.23
test('a blog cannot be added without a token', async () => {
  const newBlog = {
    title: 'valid blog',
    author: 'Zlatan Ibrahimovic',
    url: 'www.zlatangod.com',
    likes: 55
}


  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    
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
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
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
    .set('Authorization', `bearer ${token}`)
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
  
  //excercise 4.13
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )
  
    const contents = blogsAtEnd.map(r => r.title)
  
    expect(contents).not.toContain(blogToDelete.title)
  })

  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', name: 'Juan', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'hitashi05',
        name: 'Roberto Crown',
        password: 'zapoltiltic9',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen'
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`username` to be unique')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    //excercise 4.16
    test('creation fails with proper statuscode and message if password is invalid', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'juanramirez',
        name: 'Hugo',
        password: 'ch'
      }

      
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(401)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('password missing or invalid')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    //excercise 4.16
    test('creation fails if username is shorter than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'ju',
        name: 'Hugo',
        password: 'chachacha'
      }

      
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
    
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
  })


afterAll(() => {
  mongoose.connection.close()
})