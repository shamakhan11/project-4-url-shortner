const express = require('express')
const router = express.Router();

const shorturlcontroller = require("../controller/urlController")




router.post("/url/shorten",shorturlcontroller.shortUrl)

router.get("/:urlCode",shorturlcontroller.FetchUrl)

module.exports = router