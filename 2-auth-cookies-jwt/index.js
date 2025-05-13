import express from 'express'
import { PORT } from './config.js'
import { UserRepository } from './user-repository.js'
import { ErrorValidation } from './utils/errorValidation.js'
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/login', (req, res) => {
  res.json({
    message: 'Login Page',
    user: 'Anonymous'
  })
})

app.get('/register', (req, res) => {
  try {
    const { username, password } = req.body
    const id = UserRepository.create({ username, password })
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

app.get('/logout', (req, res) => {
  res.send('Logout Page')
})

app.get('/protected', (req, res) => {
  // protected route
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
