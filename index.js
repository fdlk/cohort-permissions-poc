const express = require("express")
const { auth } = require('express-openid-connect')
const morgan = require("morgan")
const apollo = require("./apollo")

require("dotenv").config()
const app = express()
app.use(morgan("common"))
app.use(express.json())
app.use(auth({
  required: false,
  authorizationParams: {
    response_type: 'code'
  },
}))
app.use('/user', (req, res) => {
  res.send(`hello ${req.openid.user.email}. You have roles ${req.openid.user.roles} on application ${req.openid.user.applicationId}`)
})
apollo.applyMiddleware({ app, cors: {credentials: true, origin: true} })
const port =  process.env.SERVER_PORT || 4000
app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
})