// Validation functions for form inputs

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validate email
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Validate password
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 50) {
    return { isValid: false, error: 'Password must be less than 50 characters' };
  }
  
  return { isValid: true };
};

// Validate confirm password
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// Validate name
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: 'Name can only contain letters and spaces' };
  }
  
  return { isValid: true };
};

// Validate phone number
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const cleanedPhone = phone.replace(/\D/g, '');
  
  if (cleanedPhone.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }
  
  if (cleanedPhone.length > 15) {
    return { isValid: false, error: 'Phone number must be less than 15 digits' };
  }
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

// Validate emergency contact
export const validateEmergencyContact = (name: string, phone: string): ValidationResult => {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  const phoneValidation = validatePhoneNumber(phone);
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }
  
  return { isValid: true };
};

// Validate location coordinates
export const validateLocation = (latitude: number, longitude: number): ValidationResult => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { isValid: false, error: 'Invalid location coordinates' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { isValid: true };
};

// Validate SOS message
export const validateSOSMessage = (message: string): ValidationResult => {
  if (!message.trim()) {
    return { isValid: false, error: 'SOS message is required' };
  }
  
  if (message.trim().length < 10) {
    return { isValid: false, error: 'SOS message must be at least 10 characters long' };
  }
  
  if (message.trim().length > 500) {
    return { isValid: false, error: 'SOS message must be less than 500 characters' };
  }
  
  return { isValid: true };
};

// Validate form data
export const validateForm = (formData: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const validation = rules[field](value);
    
    if (!validation.isValid && validation.error) {
      errors[field] = validation.error;
    }
  });
  
  return errors;
};

// Check if form is valid
export const isFormValid = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length === 0;
};
