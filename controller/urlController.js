const urlModel = require("../model/urlModel")
//const shortid = require('shortid');


// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const shortUrl = async (req, res) =>{
    try{
       let urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
       let data = req.body
       let host = 'localhost'
       let port = 4000
       let code = data.urlCode
       
       if(!Object.keys(data).length)
       return res.status(400).send({status:false, msg:"Please enter longUrl"})

    //    if(!data.urlCode)
    //    return res.status(400).send({status:false, msg:"please enter urlCode"})
    //    let checkcode = await urlModel.findOne({urlCode:data.urlCode})
    //    if(checkcode) 
    //    return res.status(400).send({status:false, msg:"This urlCode already register please try another code"})

       if(!data.url){
            return res.status(400).send({status:false, msg:"Please enter longurl"})
       }
       let checklongurl = data.url.match(urlRegex)
       if(!checklongurl){
       return res.status(400).send({status:false, msg:"Please enter longurl"})}
       
       const urlCode = generateString(10);
       const shortUrl = `http://${host}:${port}/${urlCode}`
       const longUrl  = data.url
       const done = urlModel.create({ urlCode, longUrl, shortUrl})
       if(done){
            return res.status(201).send({status:true, msg:"short url created"})
       }
       

    }catch(error){
        console.log(error)
        return res.status(400).send({status:false, msg:error.message})

    }
}


const redirectedToUrl = async (req , res) => {
    try {
        const url = req.params.urlCode
        const findUrl = await urlModel.findOne({urlCode:url})
        if(!findUrl){
            return res.status(400).send({status:false, message:"No url found"})
        } else {
           res.status(301).redirect(findUrl.longUrl);
        }
    } catch (error) {
        return res.status(500).send({status:false, error:error.message})
        
    }
}


module.exports.redirectedToUrl= redirectedToUrl
module.exports.shortUrl= shortUrl

