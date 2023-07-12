const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
  })
  
blogsRouter.post('/', async (request, response, next) => {
  const body = request.body  
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  })

    const savedBlog = await blog.save()
    response.json(savedBlog)
    
  })

  blogsRouter.get('/:id', async (request, response, next) => {
    
      const blog = await Blog.findById(request.params.id)
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
   
  })
  
  //excercise 4.13
  blogsRouter.delete('/:id', async (request, response, next) => {
    
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    
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

    
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true, runValidators: true})
    response.json(updatedBlog)
  })

  module.exports = blogsRouter