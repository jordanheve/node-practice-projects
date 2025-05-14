import express from 'express'
import cookieParser from 'cookie-parser'
import { PORT, JWT_SECRET } from './config.js'
import { UserRepository } from './user-repository.js'
import { ErrorValidation } from './utils/errorValidation.js'
import jwt from 'jsonwebtoken'
const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  const token = req.cookies.access_token
  let data = null
  req.session = { user: null }
  try {
    data = jwt.verify(token, JWT_SECRET)
    req.session.user = data
  } catch (e) {
    req.session.user = null
  }

  next()
})

app.get('/', (req, res) => {
  try {
    const { user } = req.session
    res.render('index', user)
  } catch (e) {
    console.log(e)
    return res.clearCookie('access_token').render('index')
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' })
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000 // 1 hour
    }
    ).send({ user, token })
  } catch (e) {
    console.log(e)
    if (e instanceof ErrorValidation) {
      res.status(e.statusCode).json({
        message: e.message
      })
    } else {
      res.status(500).json({
        message: 'Internal Server Error'
      })
    }
  }
})

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const id = await UserRepository.create({ username, password })
    res.json({
      message: 'User created successfully',
      user: { id, username }
    })
  } catch (e) {
    if (e instanceof ErrorValidation) {
      res.status(e.statusCode).json({
        message: e.message
      })
    } else {
      res.status(500).json({
        message: 'Internal Server Error'
      })
    }
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('access_token')
  res.redirect('/')
})

app.get('/protected', (req, res) => {
  const { user } = req.session
  if (!user) {
    return res.status(401).send('Unauthorized')
  }
  try {
    res.render('protected', user)
  } catch (e) {
    return res.status(401).send('Unauthorized')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
