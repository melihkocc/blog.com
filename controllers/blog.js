const Category = require("../models/category") 
const cloudinary = require("cloudinary").v2
const Blog = require("../models/blog")
const fs = require("fs")
const Comment = require("../models/comment")
const User = require("../models/user")

exports.getAddBlog = async (req,res,next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    const categories = await Category.find();
    res.render("blog/add-blog",{
        errorMessage:errorMessage,
        categories:categories
    })
}

exports.postAddBlog = async (req,res,next) => {
    const name = req.body.name;
    const content = req.body.content;
    const categoryids = req.body.categoryids;
    const user = req.user;

    try {
        if (!name || !content) {
            req.session.errorMessage = "Lütfen Tüm alanları doldurun"
            await req.session.save()
            return res.redirect("/add-blog")
          }

        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath,{
            use_filename : true,
            folder : "blogResim",
        })

        const blog = new Blog({
            name : name,
            content : content,
            user : user,
            categories : categoryids,
            url : result.secure_url,
            image_id : result.public_id,
        })

        blog.save()
        .then(()=>{
            fs.unlink(req.files.image.tempFilePath,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect("/")
                }
            })
        })
    }catch (error) {
        console.log(error)
        next(error)
    }
}

exports.getDeleteBlog = async (req,res,next) => {
    const id = req.params.blogid
    Blog.findOne({_id : id}).populate("user")
        .then( async (blog)=>{
            await cloudinary.uploader.destroy(blog.image_id)
            await Blog.deleteOne({_id : id})
            return res.redirect("/dashboard")
        })
        .catch(err=>console.log(err))
}

exports.getTheBlog = async (req,res,next) => {
    const id = req.params.blogid
    const blog = await Blog.findById(id).populate("user").populate("categories")
    const comments = await Comment.find({_id : blog.comments}).populate("user")
    const categories = await Category.find();
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)

    const userLikedBlogs = req.user ? req.user.myLikesBlog.map(like => like.toString()) : [];
    const isLikedByUser = userLikedBlogs.includes(id)

    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("blog/theBlog",{
        blog:blog,
        categories:categories,
        comments : comments,
        isLikedByUser : isLikedByUser,
        recentBlogs:recentBlogs,
        mostLikesBlogs:mostLikesBlogs
    })
}

exports.getLikeBlog = async (req,res,next) => {
    const blogId = req.params.blogid

    const user = await User.findOneAndUpdate(
        {_id : req.user._id},
        {
            $push : {myLikesBlog : blogId}
        },
        {new : true}
    )
    
    const blog = await Blog.findOne({_id : blogId},"likeSayisi")
    const LIKESAYISI = blog.likeSayisi;

    const update = { likeSayisi : LIKESAYISI+1 };
    await Blog.findOneAndUpdate({_id : blogId},update)


    return res.redirect(`/blog/${blogId}`)
}

exports.getRemoveLikeBlog = async (req,res,next) => {
    const blogId = req.params.blogid

    const user = await User.findOneAndUpdate(
        {_id : req.user._id},
        {
            $pull : {myLikesBlog : blogId}
        },
        {new : true}
    )

    const blog = await Blog.findOne({_id : blogId},"likeSayisi")
    const LIKESAYISI = blog.likeSayisi;

    const update = { likeSayisi : LIKESAYISI-1 };
    await Blog.findOneAndUpdate({_id : blogId},update)


    return res.redirect(`/blog/${blogId}`)
}


exports.getMyLikesBlogs = async (req,res,next) => {
    const id = req.user._id
    const user = await User.findById(id).populate({
        path : "myLikesBlog",
        populate : {
            path : "categories",
            model : "Category"
        }
    })
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const categories = await Category.find();
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("blog/my-like-blog",{
        user : user,
        categories : categories,
        recentBlogs:recentBlogs,
        mostLikesBlogs:mostLikesBlogs,
        path : "myLikesBlog"
    })
}


exports.getFollowingsBlog = async (req,res,next) => {

    const loginUser = await User.findById(req.user._id,"takipEdilen")

    const followingsUser = await User.find({_id : loginUser.takipEdilen})
    const blogs = await Blog.find({ user : followingsUser}).populate("user").populate("categories")
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const categories = await Category.find();
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("blog/followingsBlogs",{
        blogs : blogs,
        recentBlogs:recentBlogs,
        categories : categories,
        mostLikesBlogs:mostLikesBlogs,
        path : "followingsBlog"
    })

}