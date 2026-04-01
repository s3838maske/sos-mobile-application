import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FormTextInput from '../../components/FormTextInput';
import { User } from '../../../redux/types';
import {
  validateEmail,
  validateName,
  validatePhoneNumber,
} from '../../../utils/validations';

interface ProfileCardProps {
  user: User | null;
  isEditing: boolean;
  onUpdate: (data: Partial<User>) => void;
}

export default function ProfileCard({ user, isEditing, onUpdate }: ProfileCardProps) {
  type ProfileFormData = {
    name: string;
    email: string;
    phone: string;
  };

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user, reset]);

  const handleSave = (data: ProfileFormData) => {
    onUpdate({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    });
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="white" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          {isEditing ? (
            <FormTextInput
              control={control}
              name="name"
              placeholder="Enter your full name"
              rules={{
                validate: (value) =>
                  validateName(value).isValid ||
                  validateName(value).error ||
                  'Invalid name',
              }}
            />
          ) : (
            <Text style={styles.fieldValue}>{user?.name || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          {isEditing ? (
            <FormTextInput
              control={control}
              name="email"
              placeholder="Enter your email"
              rules={{
                validate: (value) =>
                  validateEmail(value).isValid ||
                  validateEmail(value).error ||
                  'Invalid email',
              }}
              inputProps={{
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }}
            />
          ) : (
            <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          {isEditing ? (
            <FormTextInput
              control={control}
              name="phone"
              placeholder="Enter your phone number"
              rules={{
                validate: (value) =>
                  validatePhoneNumber(value).isValid ||
                  validatePhoneNumber(value).error ||
                  'Invalid phone number',
              }}
              inputProps={{ keyboardType: 'phone-pad' }}
            />
          ) : (
            <Text style={styles.fieldValue}>{user?.phone || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Member Since</Text>
          <Text style={styles.fieldValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(handleSave)}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  field: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
