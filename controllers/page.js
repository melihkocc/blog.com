const Blog = require("../models/blog")
const Category = require("../models/category")
const Message = require("../models/message")

exports.getIndex = async (req,res,next) => {
    var giris = req.session.giris;
    delete req.session.giris
    const blogs = await Blog.find().populate("user").populate("categories")
    const carouselBlogs = await Blog.find().sort({date : -1}).limit(5).populate("user")
    const categories = await Category.find();
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("pages/index",{
        giris : giris,
        blogs:blogs,
        carouselBlogs:carouselBlogs,
        categories : categories,
        recentBlogs : recentBlogs,
        mostLikesBlogs : mostLikesBlogs,
        path : "index"
    })
}

exports.getAbout = (req,res,next) => {
    res.render("pages/about",{
        path : "about"
    });
}

exports.getContact = (req,res,next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    var basarili = req.session.basarili;
    delete req.session.basarili;
    res.render("pages/contact",{
        path : "contact",
        errorMessage:errorMessage,
        basarili:basarili
    })
}

exports.postContact = async (req,res,next) => {

    const name = req.body.name
    const lastName = req.body.lastName
    const email = req.body.email
    const message = req.body.message

    if(!name || !lastName || !email || !message){
        req.session.errorMessage = "Lütfen Tüm Alanları Doldurunuz";
        await req.session.save();
        return res.redirect("/contact")
    }

    const newMessage = new Message({
        name : name,
        lastName : lastName,
        email : email,
        message : message
    })
    await newMessage.save()
    req.session.basarili = "Mesajınız Başarıyla Gönderildi. Teşekkür Ederiz!";
    await req.session.save();
    return res.redirect("/contact")
}