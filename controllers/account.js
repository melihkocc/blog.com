const User = require("../models/user")
const bcrypt = require("bcrypt")
const Blog = require("../models/blog")
const cloudinary = require("cloudinary").v2
const Comment = require("../models/comment")
const Category = require("../models/category")
const fs = require("fs")

exports.getRegister = (req,res,next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("account/register",{
        errorMessage : errorMessage,
        path : "register"
    })
}

exports.postRegister = async (req,res,next) => { 
    try {
        const name = req.body.name
        const lastName = req.body.lastName
        const email = req.body.email
        const password = req.body.password

        const user = await User.findOne({email:email})
        
        if(user){
            req.session.errorMessage = "Bu mail hesabı ile daha önceden kayıt olunmuş!",
            await req.session.save();
            return res.redirect("/register")
        }

        const hashedPassword = await bcrypt.hash(password,10)

        if (!hashedPassword) {
            throw new Error("Password hashing failed");
        }

        const newUser = new User({
            name : name,
            lastName:lastName,
            email:email,
            password:hashedPassword
        })
        await newUser.save();
        return res.redirect("/login");
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.getLogin = (req,res,next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage
    res.render("account/login",{
        errorMessage : errorMessage,
        path : "login"
    })
}

exports.postLogin = async (req,res,next) => {

    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.findOne({email : email})

        if(!user){
            req.session.errorMessage = "Bu mail hesabı ile kayıtlı bir kullanıcı bulunamadı!"
            await req.session.save();
            return res.redirect("/login")
        }

        const isSuccess = await bcrypt.compare(password,user.password)

        if(isSuccess){
            req.session.user = user;
            req.session.isAuthenticated = true;
            req.session.giris = "Giriş Yapıldı";
            await req.session.save();
            res.redirect("/")
        }
        else{
            req.session.errorMessage = "Hatalı Parola !";
            await req.session.save();
            return res.redirect("/login")
        }


    } catch (error) {
        console.log(error)
        next(error)
    }
}


exports.getLogout = (req,res,next) => {
    req.session.destroy((err=>{
        if(err){
            console.log(err)
        }
        return res.redirect("/")
    }))
}

exports.getDashboard = async (req,res,next) => {
    const id = req.user._id
    const user = await User.findById(id)
    const blogs = await Blog.find({user:req.user._id}).populate("categories")

    const takipciSayisi = user.takipci.length;
    const takipEdilen = user.takipEdilen.length;

    res.render("account/dashboard",{
        user:user,
        blogs:blogs,
        takipciSayisi:takipciSayisi,
        takipEdilen:takipEdilen,
        path : "dashboard"
    })
}

exports.getTheUser = async (req,res,next) => {
    const id = req.params.userid;
    const user = await User.findById(id);
    const blogs = await Blog.find({user : id}).populate("categories")

    const userFollowUser = req.user ? req.user.takipEdilen.map(followingUser => followingUser.toString()) : [];
    const isFollowedByUser = userFollowUser.includes(id)

    res.render("account/theUser",{
        user : user,
        blogs : blogs,
        isFollowedByUser : isFollowedByUser
    })
}

exports.getProfilPhoto = (req,res,next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("account/add-profilePhoto",{
        errorMessage:errorMessage
    })
}

exports.postProfilPhoto = async (req,res,next) => {
    const id = req.user._id
    const user = await User.findById(id);
    user.name = req.user.name;
    user.lastName = req.user.lastName;
    user.email = req.user.email;
    user.password = req.user.password;

    if(user.image_id != "/images/blog-thumb-04.jpg"){
        await cloudinary.uploader.destroy(user.image_id)
    }

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath,{
        use_filename : true,
        folder : "blogProfilFoto",
    })
    user.url = result.secure_url;
    user.image_id = result.public_id
    user.save()
        .then(()=>{
            fs.unlink(req.files.image.tempFilePath,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect("/dashboard")
                }
            })
        }).catch(err=>console.log(err))

}

exports.postSendMessage = async (req,res,next) => {
    const blogId = req.body.blogid;
    const message = req.body.message;
    const comment = await new Comment({
        user : req.user._id,
        message:message
    })
    await comment.save()
    const blog = await Blog.findOneAndUpdate(
        {_id : blogId},
        {
            $push : {comments : comment},
        },
        {new : true}
    )
    return res.redirect(`/blog/${blogId}`)
}

exports.getFollow = async (req,res,next) => {
    const id = req.params.userid

    const followUser = await User.findOneAndUpdate(
        {_id : id},
        {
            $push : {takipci : req.user._id}
        },
        {new : true}
    )

    const loginUser = await User.findOneAndUpdate(
        {_id : req.user._id},
        {
            $push : {takipEdilen : followUser._id}
        },
        {new : true}
    )

    return res.redirect(`/user/${followUser._id}`)

}

exports.getUnfollow = async (req,res,next) => {

    const id = req.params.userid

    const unfollowUser = await User.findOneAndUpdate(
        {_id : id},
        {
            $pull : {takipci : req.user._id}
        },
        {new : true}
    )

    const loginUser = await User.findOneAndUpdate(
        {_id : req.user._id},
        {
            $pull : {takipEdilen : unfollowUser._id}
        },
        {new : true}
    )

    return res.redirect(`/user/${unfollowUser._id}`)

}

exports.getFollowings = async (req,res,next) => {
    const id = req.user._id
    const user = await User.findById(id).populate("takipEdilen")
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const categories = await Category.find();
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)


    res.render("account/followings",{
        user : user,
        categories : categories,
        recentBlogs : recentBlogs,
        mostLikesBlogs:mostLikesBlogs
    })
}

exports.getFollowers = async (req,res,next) => {
    const id = req.user._id
    const user = await User.findOne({_id : id}).populate("takipci")
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const categories = await Category.find();
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)


    res.render("account/followers",{
        user : user,
        categories : categories,
        recentBlogs : recentBlogs,
        mostLikesBlogs:mostLikesBlogs
    })
}


exports.getUserFollowings = async (req,res,next) => {

    const id = req.params.userid
    const user = await User.findById(id).populate("takipEdilen")
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const categories = await Category.find();
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("account/userFollowings",{
        user : user,
        recentBlogs : recentBlogs,
        categories : categories,
        mostLikesBlogs:mostLikesBlogs
    })

}

exports.getUserFollowers = async (req,res,next) => {

    const id = req.params.userid
    const user = await User.findById(id).populate("takipci")
    const recentBlogs = await Blog.find().sort({date : -1}).limit(3)
    const categories = await Category.find();
    const mostLikesBlogs = await Blog.find().sort({likeSayisi : -1}).limit(3)

    res.render("account/userFollowers",{
        user : user,
        recentBlogs : recentBlogs,
        categories : categories,
        mostLikesBlogs:mostLikesBlogs
    })

}