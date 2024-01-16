const Category = require("../models/category")
const Blog = require("../models/blog")
const Message = require("../models/message")


exports.getAddCategory = (req,res,next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage
    res.render("category/add-category",{
        errorMessage:errorMessage,
    })
}

exports.postAddCategory = async (req,res,next) => {

    const name = req.body.name
    const category = await Category.findOne({name:name})
    if(category){
        req.session.errorMessage = "Bu kategori zaten mevcut"
        await req.session.save()
        return res.redirect("/add-category")
    }else{
        const newCategory = new Category({
            name:name
        })
        await newCategory.save()
        return res.redirect("/categories")
    }
}


exports.getAdmin = (req,res,next) => {
    res.render("category/admin",{
        path : "admin"
    })
}

exports.getCategories = async (req,res,next) => {

    const categories = await Category.find();

    res.render("category/categories",{
        categories : categories
    })  
}

exports.getEditCategory = async (req,res,next) => {
    const id = req.params.categoryid
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage
    const category = await Category.findById(id);
    res.render("category/edit-category",{
        category : category,
        errorMessage:errorMessage
    })

}

exports.postEditCategory = async (req,res,next) => {

    const id = req.body.id
    const name = req.body.name
    const category = await Category.findById(id)
    if(name == ""){
        req.session.errorMessage = "Name kısmını boş bırakamazsınız";
        await req.session.save()
        return res.redirect(`/edit-category/${category._id}`)
    }else{
        category.name = name
        await category.save()
        return res.redirect("/categories")
    }
}

exports.getTheCategoryPage = async (req,res,next) => {

    const id = req.params.categoryid;
    const category = await Category.findById(id)
    const categories = await Category.find();
    const blogs = await Blog.find({categories : id}).populate("user").populate("categories")
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("category/theCategory",{
        categories:categories,
        category:category,
        blogs:blogs,
        recentBlogs:recentBlogs,
        mostLikesBlogs:mostLikesBlogs
    })

}

exports.getMessages = async (req,res,next) => {

    const messages = await Message.find();
    res.render("category/messages",{
        messages:messages
    })

}