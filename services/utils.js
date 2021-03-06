'use strict'
let readYaml = require('read-yaml')
var _l = require('lodash')

class UtilsService {

  constructor () {
    // let fieldConfigFn = '/Users/j9/Desktop/metadata-explorer-api/configs/fieldConfig.yaml'
    let fieldConfigFn = '/var/www/open-metadata-API/configs/fieldConfig.yaml'
    this.fieldConfigs = this.readConfigs(fieldConfigFn)
    let socrataConfigFn = this.fieldConfigs.socrata_config_fn
    this.socrataConfigs = this.readConfigs(socrataConfigFn)
    this.socrataConfigs.password_ascii = new Buffer(this.socrataConfigs.password, 'base64').toString('ascii')
  }

  readConfigs (fn) {
    return readYaml.sync(fn)
  }

  getFieldList (datasetName) {
    let fields = this.fieldConfigs.fbfs[datasetName]['fields']
    let toRemove = this.fieldConfigs.fbfs[datasetName]['removeFields']
    if (toRemove) {
      fields = fields.filter(function (el) {
        return !toRemove.includes(el)
      })
    }
    return fields
  }

  getRequestOptions (fbf, datasetname, qryOtherStuff) {
    return {
      'method': 'GET',
      'auth': {
        'username': this.socrataConfigs.username,
        'password': this.socrataConfigs.password_ascii
      },
      'uri': this.makeQry(fbf, datasetname, qryOtherStuff),
      'json': true
    }
  }

  mapKeys (results, keyMapp) {
    return results.map(function (obj) {
      return _l.mapKeys(obj, function (value, key) {
        if (_l.has(keyMapp, key)) {
          return keyMapp[key]
        } else {
          return key
        }
      })
    })
  }

  makeQry (fbf, datasetName, qryOtherStuff) {
    let baseUrl = this.fieldConfigs.baseUrl
    let metaFbf = this.fieldConfigs.fbfs[datasetName]['fbf']
    let fields = this.fieldConfigs.fbfs[datasetName]['fields']
    let idField = this.fieldConfigs.fbfs[datasetName]['idField']
    let qryParams = this.fieldConfigs.fbfs[datasetName]['qryParams']
    fields = fields.join()
    let qry = baseUrl + metaFbf + '.json'
    if (qryOtherStuff) {
      qry = qry + '?$query=SELECT%20' + fields + '%20WHERE%20'
      qry = qry + '%20' + qryOtherStuff
      if (qryParams) {
        qry = qry + ' ' + qryParams
      }
    } else {
      qry = qry + '?$query=SELECT%20' + fields + '%20WHERE%20' + idField + '%20=%27'
      qry = qry + fbf + '%27'
      if (qryParams) {
        qry = qry + '%20' + qryParams
      }
    }
    // console.log('*****')
    // console.log(qry)
    // console.log('*****')
    return qry
  }

 }

module.exports = new UtilsService()
