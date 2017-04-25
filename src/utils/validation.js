export const isEmpty = value => value === undefined || value === null || value === '';
const join = (rules) => (value, data) => rules.map(rule => rule(value, data)).filter(error => !!error)[0 /* first error */ ];

export function email(value) {
  // Let's not start a debate on email regex. This is just for an example app!
  if (!isEmpty(value) && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return 'Invalid email address';
  }
}

export function required(value) {
  if (isEmpty(value)) {
    return 'Required';
  }
}

export function notEmptyArr(value) {
  if (isEmpty(value) || value.length === 0) {
    return 'Required';
  }
}


export function minLength(min) {
  return value => {
    if (!isEmpty(value) && value.length < min) {
      return `Must be at least ${min} characters`;
    }
  };
}

export function maxLength(max) {
  return value => {
    if (!isEmpty(value) && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
  };
}

export function integer(value) {
  if (!Number.isInteger(Number(value))) {
    return 'Must be an integer';
  }
}

export function oneOf(enumeration) {
  return value => {
    if (!~enumeration.indexOf(value)) {
      return `Must be one of: ${enumeration.join(', ')}`;
    }
  };
}

export function match(field, errorText) {
  return (value, data) => {
    if (data) {
      if (value !== data[field]) {
        return errorText || 'Do not match';
      }
    }
  };
}

export function alphanumeric(value) {
  if (!isEmpty(value) && !/^[A-Za-z0-9-]+$/.test(value)) {
    return 'Name should match ^[A-Za-z0-9-]+$ pattern';
  }
}

export function ipOrEmpty(value) {
  if (!isEmpty(value) && !/\b(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}\b/.test(value)) {
    return "Node's IP address should match ip v4 pattern or be empty";
  }
}

export function ipWithPort(value) {
  if (!/\b(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(:\d{1,5})\b/.test(value)) {
    return "Address should match ip v4 pattern with port, ex. 123.34.56.78:2375";
  }
}

export function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value), 10) === value && !isNaN(parseInt(value, 10));
}

export function createValidator(rules) {
  return (data = {}) => {
    const errors = {};
    Object.keys(rules).forEach((key) => {
      const rule = join([].concat(rules[key])); // concat enables both functions and arrays of functions
      const error = rule(data[key], data);
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };
}
