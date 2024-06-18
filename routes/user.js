const express = require('express')
const router  = express.Router()

router.get('/', (req, res) => {
  res.json({
    'meta'      : {
      'title'       : 'User - SatSet',
      'description' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    'contents'  : {
    }
  })
})

router.get('/login', (req, res) => {
  res.json({
    'meta'      : {
      'title'       : 'Log In - SatSet',
      'description' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    'contents'  : {
    }
  })
})

router.get('/signup', (req, res) => {
  res.json({
    'meta'      : {
      'title'       : 'Sign Up - SatSet',
      'description' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    'contents'  : {
    }
  })
})

router.get('/logout', (req, res) => {
  res.json({
    'meta'      : {
      'title'       : 'Log Out - SatSet',
      'description' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    'contents'  : {
    }
  })
})

module.exports = router