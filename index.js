const { ApolloServer, gql } = require('apollo-server-express')
const { RESTDataSource } = require('apollo-datasource-rest')
const express = require("express")
const morgan = require("morgan")
require("dotenv").config()

class FusionAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.FUSION_API_URL
  }

  async searchUsers(queryString) {
    return this.get('user/search', {queryString})
  }

  async getRegistrations(userId, applicationId) {
    return this.get(`user/registration/${userId}/${applicationId}`)
  }

  async register(userId, applicationId, roles) {
    return this.post(`user/registration/${userId}`, {
      registration: {
          applicationId,
          roles
      }
  })
  }

  async unregister(userId, applicationId) {
    return this.delete(`user/registration/${userId}/${applicationId}`)
  }

  async updateRoles(userId, applicationId, roles) {
    return this.put(`user/registration/${userId}`, {
      registration: {
          applicationId,
          roles
      }
  })
  }

  willSendRequest(request) {
    request.headers.set('Authorization', this.context.token);
  }
}

const typeDefs = gql`
  type User {
    id: String!
    email: String!
    firstName: String
    lastName: String
    registrations: [Registration]
  }

  type Registration {
    id: String!
    applicationId: String!
    roles: [String]
  }

  type Query {
    registeredUsers(applicationId: String): [User]
    users(searchQuery: String): [User]
  }

  type Mutation {
    register(userId: String, applicationId: String, roles: [String]): Registration
    updateRoles(userId: String, applicationId: String, roles: [String]): Registration
    unregister(userId: String, applicationId: String): String
  }
`

const resolvers = {
  Query: {
    registeredUsers: async (_source, {applicationId}, { dataSources }) => {
      const response = await dataSources.fusionAPI.searchUsers(`registrations.applicationId:${applicationId}`)
      return response.users
    },
    users: async (_source, {searchQuery}, { dataSources }) => {
      const response = await dataSources.fusionAPI.searchUsers(searchQuery)
      return response.users
    },
  },
  Mutation: {
    register: async (_source, {userId, applicationId, roles}, {dataSources}) => {
      const response = await(dataSources.fusionAPI.register(userId, applicationId, roles))
      console.log(response)
      return response.registration
    },
    updateRoles: async (_source, {userId, applicationId, roles}, {dataSources}) => {
      const response = await(dataSources.fusionAPI.updateRoles(userId, applicationId, roles))
      console.log(response)
      return response.registration
    },
    unregister: async(_source, {userId, applicationId}, {dataSources}) => {
      await(dataSources.fusionAPI.unregister(userId, applicationId))
      return "OK"
    }
  }
};

const dataSources = () => ({
  fusionAPI: new FusionAPI()
})

const context = ({ req }) => {
  const authHeader = req.headers.authorization || ''
  // console.log(authHeader)
  return { token: process.env.FUSION_API_TOKEN }
}

const app = express()
app.use(morgan("common"))
app.use(express.json())

const apollo = new ApolloServer({ typeDefs, resolvers, dataSources, context });
apollo.applyMiddleware({ app });

const port =  process.env.SERVER_PORT || 4000
app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
})