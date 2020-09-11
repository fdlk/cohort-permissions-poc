const { ApolloServer } = require('apollo-server-express')
const resolvers = require("./resolvers")
const FusionAPI = require("./FusionAPI")
const fs = require("fs")
const path = require("path")
const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8")

const dataSources = () => ({
  fusionAPI: new FusionAPI()
})

const context = ({ req }) => ({
  token: process.env.FUSION_API_TOKEN,
  ...req.openid.user
})

const apollo = new ApolloServer({ typeDefs, resolvers, dataSources, context })

module.exports = apollo