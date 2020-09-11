const { RESTDataSource } = require('apollo-datasource-rest')

class FusionAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = `${process.env.ISSUER_BASE_URL}api/`
  }

  async searchUsers(queryString) {
    return this.get('user/search', {queryString})
  }

  async getUser(userId) {
    const response = await this.get(`user/${userId}`)
    console.log(response)
    return response.user
  }

  async getRegistrations(userId, applicationId) {
    return this.get(`user/registration/${userId}/${applicationId}`)
  }

  async getApplication(applicationId) {
    const response = await this.get(`application/${applicationId}`)
    return response.application
  }

  async register(userId, applicationId) {
    return this.post(`user/registration/${userId}`, {
      registration: {
        applicationId
      }
  })
  }

  async unregister(userId, applicationId) {
    return this.delete(`user/registration/${userId}/${applicationId}`)
  }

  willSendRequest(request) {
    request.headers.set('Authorization', this.context.token)
  }
}

module.exports = FusionAPI