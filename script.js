const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
const User = require("./models/user");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
/// DOTENV CONFİG START
const dotenv = require("dotenv")
dotenv.config();
/// DOTENV CONFİG END


const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET,
})

/// pug kurulum START
app.set("view engine","pug");
app.set("views","./views")
/// pug kurulum END

/// public dosyaları dahil et
app.use(express.static(path.join(__dirname  ,"public")));
app.use(bodyParser.urlencoded({extended:false}));
app.use(fileUpload({useTempFiles:true}))
/// session Start

var store = new mongodbStore({
    uri : `mongodb+srv://${databaseUser}:${databasePassword}@cluster0.b1laklu.mongodb.net/`,
    collection : "mySessions"
})

app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    store : store,
    cookie : {maxAge : 3*60*60*1000}        /// 3 saat sonra bitecek authentication
}))

/// session End

/// req.user yapma START
app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (user) {
            req.user = user;
        }

        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
});
/// req.user yapma END


const sendAuthentication = require("./middlewares/sendAuthentication")
const isAdmin = require("./middlewares/isAdmin")
const authenticationEngelleme = require("./middlewares/authenticationEngelleme")

/// Router tanımlama START
const pageRouter = require("./routes/page")
const accountRouter = require("./routes/account")
const categoryRouter = require("./routes/category")
const blogRouter = require("./routes/blog")
/// Router tanımlama END

app.use("/",sendAuthentication,pageRouter)
app.use("/",sendAuthentication,accountRouter)
app.use("/",sendAuthentication,categoryRouter)
app.use("/",sendAuthentication,blogRouter)
const errorController = require("./controllers/error")
app.use("/",errorController.get404)

const port = process.env.PORT || 3000;

mongoose.connect(`mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.b1laklu.mongodb.net/`)
    .then(()=>{
        console.log("Connected")
        app.listen(port)
    })
    .catch(err=>console.log(err))