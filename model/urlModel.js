const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    urlCode: { type:String, required:true ,unique:true, lowercase:true, trim:true }, 
    longUrl: {type:String,required:true}, 
    shortUrl: {type:String,required:true, unique:true} 
},{timestamps:true})

const urlModel = mongoose.model('URL', UrlSchema)

module.exports = urlModel