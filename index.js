const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const crypto = require('crypto')

const generateCsrfToken = () => crypto.randomBytes(16).toString('base64')

const mainApp = port => {
  const app = express()

  app.use(cookieParser());
  app.set('view engine', 'ejs')
  app.use(bodyParser.urlencoded({ extended: true }))

  app.get('/', (req, res) => {
    const csrfToken = process.env.CSRF_TOKEN_ENABLED ? generateCsrfToken() : ''

    return res
      .cookie('auth', 'Alice')
      .cookie('csrf-token', csrfToken)
      .render('form', { message: '', csrfToken })
  })

  app.post('/', (req, res) => {
    const csrfToken = process.env.CSRF_TOKEN_ENABLED ? generateCsrfToken() : ''

    if (process.env.CSRF_TOKEN_ENABLED && (!req.cookies['csrf-token'] || req.cookies['csrf-token'] !== req.body['csrf-token'])) {
      console.log('CSRF Token mismatch')
      return res
        .cookie('csrfToken', csrfToken)
        .render('form', { message: `Unauthorised - CSRF Mismatch`, csrfToken })
    }

    if (req.cookies.auth !== 'Alice') {
      console.log('Auth token missing!')
      return res
        .cookie('csrf-token', csrfToken)
        .render('form', { message: `Unauthorised - Missing Auth Token`, csrfToken })
    }

    if (!req.body.film) {
      console.log('validation error')
      return res
        .cookie('csrf-token', csrfToken)
        .render('form', { message: `Missing value`, csrfToken })
    }

    console.log(`${req.cookies.auth}'s favourite film is ${req.body.film}`)
    return res
      .cookie('csrf-token', csrfToken)
      .render('form', { message: `Logged favourite film as: ${req.body.film}`, csrfToken })
  })

  app.listen(port)
  console.log(`Main App started on port ${port}`)
}

const evilApp = port => {
  const app = express()

  app.set('view engine', 'ejs')

  app.get('/', (req, res) => {
    return res.render('evil-form')
  })

  app.listen(port)
  console.log(`Evil App started on port ${port}`)
}

mainApp(3000)
evilApp(4000)
