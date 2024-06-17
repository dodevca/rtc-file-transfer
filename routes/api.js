const express       = require('express')
const router        = express.Router()
const redis         = require('redis')
const generateOTP   = (length) => {  
    let digits  = '0123456789' 
    let OTP     = ''

    for(let i = 0; i < length; i++) { 
        OTP += digits[Math.floor(Math.random() * digits.length)] 
    }

    return OTP 
}

router.get('/send', async(req, res) => {
    const client    = redis.createClient()
    let code        = ''
    let exists      = true

    await client.connect()

    do {
        code    = generateOTP(6)
        exists  = await client.exists(code)
    } while(exists)

    await client.set(code , JSON.stringify({ active: true }), {EX: 5 * 60})
    
    res.json({ code })
})

router.get('/cancel', async(req, res) => {
    const code = req.query.code

    if(code == '' || code == undefined)
        res.json('Invalid or expired code')
    
    const client = redis.createClient()

    await client.connect()
    
    const exists = await client.exists(code)
    
    if(exists)
        await client.del(code)

    res.json(code)
})

module.exports = router