const { RESTDataSource } = require('apollo-datasource-rest')

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

  async getApplication(applicationId) {
    const response = await this.get(`application/${applicationId}`)
    return response.application
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
    request.headers.set('Authorization', this.context.token)
  }
}

module.exports = FusionAPI