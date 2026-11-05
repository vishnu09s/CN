const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateGSTNumber = (gst) => {
  const re = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z\d{1}$/;
  return re.test(gst);
};

const validatePAN = (pan) => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan);
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateGSTNumber,
  validatePAN,
};
