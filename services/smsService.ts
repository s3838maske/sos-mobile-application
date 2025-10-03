import * as SMS from 'expo-sms';
import { EmergencyContact, User } from '../redux/types';
import { generateSOSMessage } from '../utils/helpers';

// Check if SMS is available on the device
export const isSMSAvailable = async (): Promise<boolean> => {
  try {
    return await SMS.isAvailableAsync();
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
};

// Send SMS to emergency contacts
export const sendSMSToEmergencyContacts = async (
  user: User,
  location: string,
  customMessage?: string
): Promise<boolean> => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      throw new Error('SMS is not available on this device');
    }

    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      throw new Error('No emergency contacts found');
    }

    const phoneNumbers = user.emergencyContacts.map(contact => contact.phone);
    const message = customMessage || generateSOSMessage(user.name, location);

    const result = await SMS.sendSMSAsync(phoneNumbers, message);
    return result.result === 'sent';
  } catch (error) {
    console.error('Error sending SMS to emergency contacts:', error);
    throw error;
  }
};

// Send SMS to helpline
export const sendSMSToHelpline = async (
  location: string,
  user: User,
  helplineNumber: string = '112'
): Promise<boolean> => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      throw new Error('SMS is not available on this device');
    }

    const message = generateSOSMessage(user.name, location);

    const result = await SMS.sendSMSAsync([helplineNumber], message);
    return result.result === 'sent';
  } catch (error) {
    console.error('Error sending SMS to helpline:', error);
    throw error;
  }
};

// Send SMS to specific contact
export const sendSMSToContact = async (
  contact: EmergencyContact,
  message: string
): Promise<boolean> => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      throw new Error('SMS is not available on this device');
    }

    const result = await SMS.sendSMSAsync([contact.phone], message);
    return result.result === 'sent';
  } catch (error) {
    console.error('Error sending SMS to contact:', error);
    throw error;
  }
};

// Send bulk SMS
export const sendBulkSMS = async (
  phoneNumbers: string[],
  message: string
): Promise<boolean> => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      throw new Error('SMS is not available on this device');
    }

    if (phoneNumbers.length === 0) {
      throw new Error('No phone numbers provided');
    }

    const result = await SMS.sendSMSAsync(phoneNumbers, message);
    return result.result === 'sent';
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};

// Format phone number for SMS
export const formatPhoneForSMS = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`; // Assuming US number
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+${cleaned}`;
  }
  
  return phone; // Return original if format is not recognized
};

// Validate phone number for SMS
export const isValidSMSPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};
