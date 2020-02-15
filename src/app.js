const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const httpErrors = require('http-errors')

const config = require('./config')
const databaseConnection = require('./database')

const sampleRouter = require('./routes/sampleRouter')

const app = express()

const setupAndStartServer = async () => {
  await databaseConnection()
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(cors())

  // Routes
  app.use(sampleRouter)

  app.use((req, res, next) => {
    next(new httpErrors.NotFound('route not found'))
  })

  app.use((err, req, res) => {
    console.log(err)
    if (!err.status) {
      const isProduction = app.get('env') === 'production'
      return res.status(500).json({
        message: isProduction ? 'internal server error' : err.message
      })
    }
    if (err.status === 400) {
      return res.status(400).json({
        errors: err.message
      })
    }
    return res.status(err.status).json({
      message: err.message
    })
  })

  app.listen(config.PORT || 5000, () => {
    console.log(`server started listening at PORT ${config.PORT || 5000}`)
  })
}

setupAndStartServer()
