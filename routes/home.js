const express = require('express')
const router  = express.Router()

router.get('/', (req, res) => {
  res.render('home', {
    'meta'      : {
      'title'       : 'Satset - File Transfer',
      'description' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    'contents'  : {
      'code'        : req.query.code ?? null,
      'tabActive'   : req.query.code == null ? 'send' : 'receive'
    }
  })
})

module.exports = router