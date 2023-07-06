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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}