import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import DBLocal from 'db-local'
import { ErrorValidation } from './utils/errorValidation.js'
import { SALT_ROUNDS } from './config.js'
const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: 'string', required: true },
  username: { type: 'string', required: true, unique: true },
  password: { type: 'string', required: true }
})

export class UserRepository {
  static async create ({ username, password }) {
    // validations
    Validation.username(username)
    Validation.password(password)
    const user = User.findOne({ username })
    if (user) throw new ErrorValidation('username already exists', 400)

    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    User.create({ _id: id, username, password: hashedPassword }).save()
    return id
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)
    const user = User.findOne({ username })
    if (!user) throw new ErrorValidation('username does not exists', 404)

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new ErrorValidation('password is incorrect', 401)

    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }
}
class Validation {
  static username (username) {
    if (typeof username !== 'string') throw new ErrorValidation('username must be a string', 400)
    if (username.length < 3) throw new ErrorValidation('username must be at least 3 characters long', 400)
  }

  static password (password) {
    if (typeof password !== 'string') throw new ErrorValidation('password must be a string', 400)
    if (password.length < 6) throw new ErrorValidation('password must be at least 6 characters long', 400)
  }
}
