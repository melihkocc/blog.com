const Blog = require("../models/blog");

module.exports = (req, res, next) => {
    // Blogun bulunup bulunmadığını kontrol et
    Blog.findOne({ _id: req.params.blogid })
        .then(blog => {
            // Blog var mı kontrol et
            if (!blog) {
                return res.redirect("/");
            }

            // Kullanıcı oturum açtı mı kontrol et
            if (!req.user) {
                return res.redirect("/");
            }

            // Kullanıcının blogu düzenleme yetkisi var mı kontrol et
            if (blog.user && blog.user._id.toString() === req.user._id.toString()) {
                next();
            } else {
                return res.redirect("/");
            }
        })
        .catch(err => {
            console.error("Blog bulma hatası:", err);
            return res.redirect("/");
        });
};
