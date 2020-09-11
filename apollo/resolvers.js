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
    roles: async (user, _args, {applicationId}) => {
      return (user.registrations||[])
        .filter((reg)=>reg.applicationId === applicationId)
        .flatMap(reg => reg.roles)
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
}