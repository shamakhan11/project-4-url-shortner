const urlModel = require("../model/urlModel")
const redis = require("redis");
const { promisify } = require("util");
const { json } = require("express/lib/response");


const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

//Redis Connection 
const redisClient = redis.createClient(
    11570,
    "redis-11570.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("ehBqDLZYo8lUseKNlWgsYCGOIbwVJoJ1", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);






// declare all characters
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const shortUrl = async (req, res) => {
    try {
        let urlRegex = /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1}|)?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/
        let data = req.body
        let host = 'localhost'
        let port = 3000
        let longUrl = data.longUrl


        if (!Object.keys(data).length)
            return res.status(400).send({ status: false, msg: "Please enter longUrl" })

        let checklongurl = longUrl.match(urlRegex)
        if (!checklongurl) {
            return res.status(400).send({ status: false, msg: "Please enter longurl" })
        }


        let dataFromCached = await GET_ASYNC(`${checklongurl}`)
        if (dataFromCached) {
             console.log("fromRedis")
            return res.status(200).send({ status: true, data:JSON.parse(dataFromCached)})
        }


            const foundedUrl = await urlModel.findOne({ longUrl: longUrl }).select({ urlCode: 1, longUrl: 1, shortUrl: 1, _id: 0 })
            if (foundedUrl) {
                return res.status(200).send({ status: true, data: foundedUrl })
            }

            const urlCode = generateString(10).toLowerCase()
            const shortUrl = `http://${host}:${port}/${urlCode}`

            const createdData = await urlModel.create({ urlCode, longUrl, shortUrl })
            const selectedData = await urlModel.findOne(createdData).select({ urlCode: 1, longUrl: 1, shortUrl: 1, _id: 0 })


            await SET_ASYNC(`${selectedData.longUrl}`, JSON.stringify(selectedData))

            await SET_ASYNC(`${selectedData.urlCode}`,selectedData.longUrl)

            res.status(201).send({ status: true, data: selectedData })

        }catch (error) {
            console.log(error)
            return res.status(400).send({ status: false, msg: error.message })
        }
    }



const FetchUrl = async (req, res) => {
        try {
            const urlCode = req.params.urlCode
            if(!isValid (urlCode) ){
                return res.status(400).send({status:false, message:"enter  url code"})
            }
            if(urlCode.length !==10){
                return res.status(400).send({status:false, message:"enter the valid 10 digit url code"})
            }
            
            let longUrlFromcached = await GET_ASYNC(`${urlCode}`)
            if (longUrlFromcached) {
                 console.log("fromRedis")
                 return res.status(302).redirect(longUrlFromcached);
            }
    

                const findUrl = await urlModel.findOne({ urlCode: urlCode })
                if(!findUrl){
                    return res.status(404).send({status:false, message:"url not found"})
                }

                if (findUrl) {
                    await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl))
                    return res.status(302).redirect(findUrl.longUrl);
                }
             
        } catch (error) {
            console.log(error)
            return res.status(500).send({ status: false, error: error.message })
        }
    }


    module.exports.shortUrl = shortUrl
    module.exports.FetchUrl = FetchUrl

