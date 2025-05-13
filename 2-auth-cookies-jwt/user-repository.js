import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import DBLocal from 'db-local'
import { ErrorValidation } from './utils/errorValidation.js'
const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: 'string', required: true },
  username: { type: 'string', required: true, unique: true },
  password: { type: 'string', required: true }
})

export class UserRepository {
  static create ({ username, password }) {
    if (typeof username !== 'string') throw new ErrorValidation('username must be a string', 400)
    if (typeof password !== 'string') throw new ErrorValidation('password must be a string', 400)
    if (username.length < 3) throw new ErrorValidation('username must be at least 3 characters long', 400)
    if (password.length < 6) throw new ErrorValidation('password must be at least 6 characters long', 400)

    const user = User.findOne({ username })
    if (user) throw new ErrorValidation('username already exists', 400)

    const id = crypto.randomUUID()
    const hashedPassword = bcrypt.hashSync(password, 10)
    User.create({ _id: id, username, hashedPassword }).save()
    return id
  }

  static login ({ username, password }) {
    // validations
  }
}
