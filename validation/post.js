const validator = require("validator");
const isEmpty = require("./isempty");

module.exports = function validatePostInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : "";

  if (validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  }

  return { errors, isValid: isEmpty(errors) };
};
