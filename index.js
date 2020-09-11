const { ApolloServer, gql } = require('apollo-server-express')
const { RESTDataSource } = require('apollo-datasource-rest')
const express = require("express")
const { auth } = require('express-openid-connect')
const morgan = require("morgan")

require("dotenv").config()

class FusionAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `${process.env.ISSUER_BASE_URL}api/`
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
    roles: [String]
  }

  type Query {
    applicationId: String
    registeredUsers: [User]
    users(searchQuery: String): [User]
  }

  type Registration {
    id: String!
    applicationId: String!
    roles: [String]
  }

  type Mutation {
    register(userId: String, roles: [String]): Registration
    updateRoles(userId: String, roles: [String]): Registration
    unregister(userId: String): String
  }
`

const resolvers = {
  Query: {
    applicationId: (_source, _args, { applicationId }) => applicationId,
    registeredUsers: async (_source, _args, { dataSources, applicationId }) => {
      const response = await dataSources.fusionAPI.searchUsers(`registrations.applicationId:${applicationId}`)
      return response.users
    },
    users: async (_source, {searchQuery}, { dataSources }) => {
      const response = await dataSources.fusionAPI.searchUsers(searchQuery)
      return response.users
    },
  },
  User: {
    roles: async (user, _args, {applicationId}) => {
      console.log("roles resolver", user)
      return user.registrations.filter((reg)=>reg.applicationId === applicationId).flatMap(reg => reg.roles)
    }
  },
  Mutation: {
    register: async (_source, {userId, roles}, {dataSources, applicationId}) => {
      const response = await(dataSources.fusionAPI.register(userId, applicationId, roles))
      return response.registration
    },
    updateRoles: async (_source, {userId, roles}, {dataSources, applicationId}) => {
      const response = await(dataSources.fusionAPI.updateRoles(userId, applicationId, roles))
      return response.registration
    },
    unregister: async(_source, {userId}, {dataSources, applicationId}) => {
      await(dataSources.fusionAPI.unregister(userId, applicationId))
      return "OK"
    }
  }
};

const dataSources = () => ({
  fusionAPI: new FusionAPI()
})

const context = ({ req }) => {
  const result = {
    token: process.env.FUSION_API_TOKEN,
    ...req.openid.user
  }
  console.log(result)
  return result
}

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
  console.log(req.openid.user)
  res.send(`hello ${req.openid.user.email}. You have roles ${req.openid.user.roles} on application ${req.openid.user.applicationId}`)
})

const apollo = new ApolloServer({ typeDefs, resolvers, dataSources, context })
apollo.applyMiddleware({ app, cors: {credentials: true, origin: true} })
const port =  process.env.SERVER_PORT || 4000
app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
})