module.exports = {
  Query: {
    application: async (_source, _args, { dataSources, applicationId }) => 
      dataSources.fusionAPI.getApplication(applicationId),
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
    roles: (user, _args, {applicationId}) => {
      return (user.registrations||[])
        .filter((reg)=>reg.applicationId === applicationId)
        .flatMap(reg => reg.roles)
    },
    registered: (user, _args, {applicationId}) => {
      return (user.registrations||[])
        .some((reg) => reg.applicationId === applicationId)
    }
  },
  Mutation: {
    register: async (_source, {userId}, {dataSources, applicationId}) => {
      await(dataSources.fusionAPI.register(userId, applicationId))
      return dataSources.fusionAPI.getUser(userId)
    },
    unregister: async(_source, {userId}, {dataSources, applicationId}) => {
      await(dataSources.fusionAPI.unregister(userId, applicationId))
      return dataSources.fusionAPI.getUser(userId)
    }
  }
}