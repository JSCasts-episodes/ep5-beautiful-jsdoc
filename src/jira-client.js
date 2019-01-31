const axios = require('axios')

/**
 * Jira client library
 *
 * @example
 * const jira = new Jira({
 *   host: 'yourhost',
 *   user: 'jhn@doe.com',
 *   token: 'secret',
 * })
 *
 * const projects = await jira.projects()
 *
 * @see  https://developer.atlassian.com/cloud/jira/platform/rest/v3
 * @todo  implement all methods
 * @category Jira
 */
class Jira {

  /**
   * @param  {Object} options
   * @param  {String} options.host    host of your jira instance
   * @param  {String} options.user    your username
   * @param  {String} options.token   secret token
   * @param  {Number} options.version api version
   */
  constructor({ host, user, token, version = 3 }) {
    this.version = version
    this.baseClient = new axios.create({
      baseURL: `https://${host}.atlassian.net/rest/api/${this.version}`,
      auth: {
        username: user,
        password: token,
      },
    })
  }

  /**
   * @typedef {Object} Jira~JiraProject
   *
   * @property {String} assigneeType  indicates if project is assigned
   * @property {Object} avatarUrls    project avatars of sizes
   * @property {Object[]} components  list of all components defined in the project
   * @property {String} description   short description of a project
   * @property {String} expand        expanded description
   * @property {String} id            project id
   * @property {Object[]} issueTypes  issue types defined in the project
   * @property {String} key           project key
   * @property {Object} lead          lead person
   * @property {String} name          project name
   * @property {String} projectTypeKey project type
   * @property {Object} roles         list of all roles with the project
   * @property {String} self          url to project details
   * @property {Boolean} simplified   if project is simplified
   * @property {Object[]} versions    list of all versions project has
   */

  /**
   * List of all projects for given category
   * @param  {Object} options
   * @param  {Number} [options.categoryId=1000] category id
   * @return {Promise<Array<Jira~JiraProject>>}  projects returned by the API
   */
  async projects({ categoryId = 1000 }) {
    const maxResults = 200
    const response = await this.baseClient.get('project/search', {
      params: { categoryId, maxResults },
    })
    return response.data.values
  }

  /**
   * Returns project for given key
   * @param  {String} options.projectKey  project key
   * @return {Promise<Jira~JiraProject>}                project returned by the API
   * 
   * @see  https://developer.atlassian.com/cloud/jira/platform/rest/v3#api-api-3-project-get
   */
  async project({ projectKey }) {
    const response = await this.baseClient.get(`project/${projectKey}`, {
      expand: 'issueTypes,lead,description',
    })
    return response.data
  }

  /**
   * @typedef {Object} Jira~JiraIssue
   * @property {Object} fields
   * @property {Object} fields.aggregateprogress progress of an issuse
   * @property {Jira~JiraUser} [fields.assignee] who is assigned to it
   * @property {Jira~JiraUser} fields.creator    who created the issue
   * @property {String} fields.description       description of an issue
   * @property {String} fields.summary           issue summary
   * @property {Jira~JiraEpic} [fields.epic]     sprint epic in which issue resides
   * @property {Object} fields.issuetype         Type of an issue 
   * @property {String} id                       Issue id in jira
   * @property {String} key                      Uniq issue key
   * @property {String} self                     link to the issue details endpoint
   *
   * @see https://developer.atlassian.com/cloud/jira/platform/rest/v3#api-api-3-issue-issueIdOrKey-get
   */


  /**
   * Fetch issues for given project
   * @param  {Object} options
   * @param  {String} options.jql             query written in Jira Query Language 
   * @param  {Array<String>}  [options.fields=['summary', 'status', 'assignee', 'timetracking']] 
   *                                          list non standard fields which should
   *                                          be included into a response
   * @return {Promise<Array<Jira~JiraIssue>>}                    list of issues which match the jql
   */
  async search({ jql, fields = ['summary', 'status', 'assignee', 'timetracking'] }) {
    const response = await this.baseClient.post('search', {
      jql,
      maxResults: 100,
      fields,
    })
    return response.data.issues
  }

  /**
   * @typedef {Object} Jira~JiraUser
   * @property {Object} ActorUser
   * @property {String} ActorUser.accountId
   * @property {String} avatarUrl
   * @property {String} displayName
   * @property {Number} id
   * @property {String} name
   * @property {String} type
   */

  /**
   * Return all users assigned to the project by role
   * @param  {Object} options
   * @param  {String} options.projectKey project key
   * @param  {String} options.role       user role in the project
   * @return {Promise<Array<Jira~JiraUser>>}                 
   */
  async projectRoles({ projectKey, role }) {
    const response = await this.baseClient.get(`project/${projectKey}/role/${role}`)
    return response.data.actors
  }

  /**
   * Return all jira users for given group
   * @param  {Object} options
   * @param  {String} options.groupname name of a group
   * @return {Promise<Jira~JiraUser>}
   */
  async usersByGroup({ groupname }) {
    const response = await this.baseClient.get('group/member', {
      params: { groupname, maxResults: 200, includeInactiveUsers: true },
    })
    return response.data.values
  }

  /**
   * List of project categories defined in your Jira instance
   * @return {Promise<JiraProjectCategory>} [description]
   */
  async categories() {
    await this.baseClient.get('projectCategory')
  }
}

module.exports = Jira
