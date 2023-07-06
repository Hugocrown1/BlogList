const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let likesSum = 0;
    blogs.forEach(blog => likesSum += blog.likes)
    return likesSum
}

const favoriteBlog = (blogs) => {

    if(blogs.length === 0) {
        return null
    }

    let bestBlog = blogs[0];
    blogs.forEach(blog => {
        if(blog.likes > bestBlog.likes){
            bestBlog = blog
        }})

    return {
        title: bestBlog.title,
        author: bestBlog.author,
        likes: bestBlog.likes
    }
}

const mostBlogs = (blogs) => {
    if(blogs.length === 0){
        return null
    }

    const blogsPerAuthor = _.groupBy(blogs, 'author')

    const authorWithMostBlogs = _.maxBy(_.keys(blogsPerAuthor), author => blogsPerAuthor[author].length)

    const blogsQuantity = blogsPerAuthor[authorWithMostBlogs].length

    return {
        author: authorWithMostBlogs,
        blogs: blogsQuantity
    }
}

const mostLikes = (blogs) => {
    if(blogs.length === 0){
        return null
    }

    const blogsPerAuthor = _.groupBy(blogs, 'author')

    const likesPerAuthor = _.mapValues(blogsPerAuthor, blogs => _.sumBy(blogs, 'likes'))

    const authorWithMostLikes = _.maxBy(_.keys(likesPerAuthor), author => likesPerAuthor[author])
    
    return {
        author: authorWithMostLikes,
        likes: likesPerAuthor[authorWithMostLikes]
    }


}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}