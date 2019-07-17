const isEmpty = string => {
    if (string.trim() === "") return true;
    else return false;
};

//check if it's actually email
const isEmail = email => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
};

exports.validateSignupData = data => {
    let validateErrors = {};
    // validate data
    if (isEmpty(data.email)) validateErrors.email = "Email cannot be empty";
    else if (!isEmail(data.email)) validateErrors.email = "Must be a valid email address";

    if (isEmpty(data.password)) validateErrors.password = "Password cannot be empty";

    if (data.password.length < 6)
        validateErrors.password = "Password have to be at least 6 characters long";

    if (data.password !== data.confirmPassword)
        validateErrors.confirmPassword = "Passwords must match";

    if (isEmpty(data.name)) validateErrors.name = "Name cannot be empty";
    if (isEmpty(data.surname)) validateErrors.surname = "Surname cannot be empty";
    if (isEmpty(data.licenseId)) validateErrors.licenseId = "License number cannot be empty";

    // if (Object.keys(validateErrors).length > 0) return res.status(400).json(validateErrors);

    return {
        validateErrors,
        valid: Object.keys(validateErrors).length === 0 ? true : false
    };
};

exports.validateLoginData = data => {
    let validateErrors = {};

    if (isEmpty(data.email)) validateErrors.email = "Email cannot be empty";
    if (isEmpty(data.password)) validateErrors.password = "Password cannot be empty";

    // if (Object.keys(validateErrors).length > 0) return res.status(400).json(validateErrors);

    return {
        valid: Object.keys(validateErrors).length === 0 ? true : false,
        validateErrors
    };
};
