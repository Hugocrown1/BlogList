const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
// const User = require('../models/user')
// const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')



blogsRouter.get('/', async (request, response) => {
  //excercise 4.17
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
    response.json(blogs)
  })
  
blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body  


  //excercise 4.22
  const user = request.user

  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog)
    
  })

  blogsRouter.get('/:id', async (request, response, next) => {
    
      const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1})
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
   
  })
  
  //excercise 4.13 & 4.21
  blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
    
    //excercise 4.22
    const user = request.user
    

    const blog = await Blog.findById(request.params.id)

    if(blog.user.toString() === user._id.toString()){
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'cannot delete blogs from other users' })
    }
    
    
  })

  //excercise 4.14
  blogsRouter.put('/:id', async (request, response, next) => {
    const {body} = request

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true, runValidators: true}).populate('user', { username: 1, name: 1})
    response.json(updatedBlog)
  })

  module.exports = blogsRouter