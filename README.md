# aj-validator
Simple and extensible validator library for node.js.

### Installation
<pre>npm install aj-validator</pre>

### ES6
<pre>import validator from 'aj-validator'</pre>

### No ES6
<pre>var validator = require('aj-validator');</pre>

### Basic usage
```
let is_valid = validator.email('aj@mail.com');
console.log(is_valid); // true
```

### Validate multiple fields
```
api.post('/user', (req, res) => {
  
  // validationRules expect to be an object with: 
  // key = field_to_validate
  // value = rules_separate_by_pipe:rule_parameters 
  
  let validationRules = {
    username: 'required|email|min:6',
    name: 'required|min:2',
    description: 'required|max:255'
  };
  
  let is_valid = validator.validate(req.body, validationRules);
  console.log(is_valid); // true|false

  let errors = validator.getErrors(); // Retriving validation errors
  console.log(errors); // {name: ["required"], username: ["Invalid Email provided", "Less than 6 characters are not allowed"]}

});
```

### Create custom validators
```
// customValidator expect to be an object with: 
// name = Validator name
// message = Message to display in case validation fails
  
let customValidator = {
  name: 'custom',
  message: 'Message to display in case validation fails'
};

// .make() method expect 2 parameters:
// customValidator object {name: '', message: ''}
// fn callback passing value(string) to validate and parameters(array)
// Should return true|false

validator.make(customValidator, (val, ruleParams) => val.length >= ruleParams );

let validationRules = {
  username: 'required|custom',
  name: 'required|min:2',
};

let is_valid = validator.validate(req.body, validationRules);
console.log(is_valid); // true|false
```

### Customize messages to display
```
let customMessages = {
  'required':'Message to be display only on fields if required rule fail',
  'required.username': 'Message to be displayed only on username field if required rule fail',
};

let validationRules = {
  username: 'required|email|min:6',
  name: 'required|min:2'
};

let fieldsToValidate = {
  name: '',
  username: ''
};

let is_valid = validator.validate(fieldsToValidate, validationRules, customMessages);
console.log(is_valid); // true|false

let errors = validator.getErrors(); // Retriving validation errors
console.log(errors); // {name: ["Message to be display only on fields if required rule fail"], 
                         username: [Message to be displayed only on username field if required rule fail]}
```

### Validators built-in

Validator | Parameter | Description
--------- | --------- | ----------- 
required  | none      | The field under validation must be present in the input data and not empty
email     | none      | The field under validation must be formatted as an e-mail address
max       | integer   | The field under validation must be less than or equal to a maximum value
min       | integer   | The field under validation must have a minimum value
json      | none      | The field under validation must be a valid JSON string
url       | none      | The field under validation must be a valid URL
date      | none      | The field under validation must be a valid date according to javascript Date object
integer   | none      | The field under validation must be an integer
