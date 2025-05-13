export class ErrorValidation extends Error {
  constructor (message, statusCode) {
    super(message)
    this.name = 'ErrorValidation'
    this.statusCode = statusCode
  }
}
