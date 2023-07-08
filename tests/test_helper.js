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

const nonExistingId = async () => {
    const blog = new Blog({ title: 'willremovethissoon', author: 'me', url: 'byebye.com', likes: 1 })
    await blog.save()
    await blog.remove()
  
    return blog._id.toString()
  }
  
  const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
  }
  
  module.exports = {
    initialBlogs, nonExistingId, blogsInDb
  }