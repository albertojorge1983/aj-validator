/*!
 * aj-validator
 * Copyright(c) 2018 Aj
 */
"use strict";

let setData = Symbol();
let setRules = Symbol();
let setMessage = Symbol();

class Validator {
  constructor() {
    this.data = {};
    this.msg = {};
    this.rules = {};
    this.errors = {};
  }

  /**
   * Set data to be validated.
   *
   * @param {object} [data]
   */

  [setData](data) {
    try {
      if (!data || typeof data !== 'object')
        throw new Error("Data to validate is required")

      this.data = data;
    } catch (e) {
      throw e.message
    }
  }

  /**
   * Set rules to validate.
   *
   * @param {object} [rules]
   */

  [setRules](rules) {
    try {
      if (!rules || typeof rules !== 'object')
        throw new Error("Rules to validate are required")

      for (let field in rules) {
        this.rules[field] = rules[field].split("|");
      }
    } catch (e) {
      throw e.message
    }
  }

  /**
   * Get list of errors after validation.
   *
   * @return {object}
   */

  getErrors() {
    return this.errors;
  }

  /**
   * Record errors for each failed validation.
   *
   * @param {string} [field]
   * @param {string} [rule]
   * @param {string} [msg]
   */

  recordError(field, rule, msg) {
    if (this.errors.hasOwnProperty(field))
      this.errors[field].push(msg);
    else
      this.errors[field] = [msg];
  }

  /**
   * Get message to be displayed for each rule.
   *
   * @param {string} [prop]
   * @param {string} [rule]
   * @param {array} [params]
   * @return {string}
   */

  getMessage(prop, rule, params) {
    let msg = '';

    for (const key in this.msg) {
      if (this.msg.hasOwnProperty(`${rule}`))
        msg = this.msg[`${rule}`];

      if (this.msg.hasOwnProperty(`${rule}.${prop}`))
        msg = this.msg[`${rule}.${prop}`];
    }

    if (msg === '') {
      switch (rule) {
        case 'required':
          msg = 'Field is required'
          break;
        case 'email':
          msg = 'Invalid Email provided'
          break;
        case 'max':
          msg = `More than ${params[0]} characters are not allowed`
          break;
        case 'min':
          msg = `Less than ${params[0]} characters are not allowed`
          break;
        case 'json':
          msg = 'Invalid Json provided'
          break;
        case 'url':
          msg = 'Invalid URL provided'
          break;
        case 'date':
          msg = 'Invalid Date provided'
          break;
        case 'integer':
          msg = 'Data provided is not type [integer]'
          break;
        case 'regex':
          msg = 'Data provided do not match regular expression'
          break;
        default:
          msg = 'No data provided to validator'
      }
    }

    return msg
  }

  /**
   * Set custom messages to be displayed.
   *
   * @param {object} [msg]
   * @return
   */

  [setMessage](msg = {}) {
    if (Object.keys(this.msg).length === 0) {
      this.msg = msg;
    } else {
      for (const prop in msg) {
        this.msg[prop] = msg[prop]
      }
    }
  }

  /**
   * Get parameters from each rule defined.
   *
   * @param {string} [rule]
   * @return {object}
   */

  getParams(rule) {
    let params = {};
    let method;

    if (rule.indexOf(':') !== -1) {
      method = rule.split(':');
      rule = method[0];
      method.shift();
    }

    params.rule = rule;
    params.data = method || [];

    return params;
  }

  /**
   * Validate data using each rule defined.
   *
   * @param {object} [data]
   * @param {object} [rules]
   * @return {boolean}
   */

  validate(data, rules, msg) {
    this.errors = {};
    this[setData](data);
    this[setRules](rules);
    this[setMessage](msg);

    for (const prop in this.rules) {
      this.rules[prop].forEach(rule => {
        if (this.data.hasOwnProperty(prop) && this.data[prop] !== '') {
          try {
            let params = this.getParams(rule);
            let is_valid = this[params.rule](this.data[prop], params.data);

            if (!is_valid) {
              let msg = this.getMessage(prop, params.rule, params.data);
              this.recordError(prop, params.rule, msg);
            }
          } catch (error) {
            throw error
            // throw `Sorry, the rule: ${rule} is not supported at the moment`
          }
        } else {
          if (rule === 'required') {
            let params = this.getParams(rule);
            let msg = this.getMessage(prop, params.rule);
            this.recordError(prop, params.rule, msg);
          }
        }
      });
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Required field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  required(val, params) {
    return val.length > 0
  }

  /**
   * Email field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  email(val, params) {
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(val);
  }

  /**
   * Max length field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  max(val, params) {
    return val.length <= Number(params[0])
  }

  /**
   * Min length field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  min(val, params) {
    return val.length >= Number(params[0])
  }

  /**
   * JSON field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  json(val, params) {
    try {
      JSON.parse(val);
    } catch (e) {
      return false;
    }

    return true;
  }

  /**
   * URL field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  url(val, params) {
    let regex = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/
    return regex.test(val);
  }

  /**
   * Date field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  date(val, params) {
    var intDate = Date.parse(val);
    if (isNaN(intDate)) {
      return false
    }
    return true;
  }

  /**
   * Integer field validator
   *
   * @param {string} [val]
   * @param {array} [params]
   * @return {boolean}
   */

  integer(val, params) {
    let regex = /^(?:-?(?:[0-9][0-9]*)(?:\.?0+)?)$/
    return regex.test(val);
  }

  /**
   * Define custom method validator.
   *
   * @param {object} [validator]
   * @param {function} [fn]
   * @return {function}
   */

  make(validator, fn) {
    try {
      if (!validator || typeof validator !== 'object')
        throw 'Need to pass and object with rule name and message properties as parameter';

      if (!validator.name || validator.name === '')
        throw 'Validator name is required';

      if (!validator.message || validator.message === '')
        throw 'Input specific description about your validation';

      this.msg[validator.name] = validator.message;

      return this[validator.name] = fn;

    } catch (error) {
      throw error
    }
  }

}

module.exports = new Validator();
