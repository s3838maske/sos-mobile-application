import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addEmergencyContact,
  refreshUserData,
  removeEmergencyContact,
  updateEmergencyContact,
  updateUserProfile,
} from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { EmergencyContact as EmergencyContactType } from '../../redux/types';
import EmergencyContacts from '../profile/components/EmergencyContacts';
import ProfileCard from '../profile/components/ProfileCard';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  // Refresh user data when component mounts
  useEffect(() => {
    if (user?.uid) {
      dispatch(refreshUserData(user.uid));
    }
  }, []);

  const handleSaveProfile = async (updatedData: any) => {
    try {
      if (user) {
        await dispatch(updateUserProfile({
          ...user,
          ...updatedData,
        })).unwrap();
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile Update Error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleAddEmergencyContact = async (contact: EmergencyContactType) => {
    try {
      if (user?.uid) {
        await dispatch(addEmergencyContact({
          userId: user.uid,
          contact
        })).unwrap();
        Alert.alert('Success', 'Emergency contact added successfully!');
      }
    } catch (error) {
      console.error('Add Contact Error:', error);
      Alert.alert('Error', 'Failed to add emergency contact. Please try again.');
    }
  };

  const handleRemoveEmergencyContact = async (index: number) => {
    try {
      if (user?.uid) {
        await dispatch(removeEmergencyContact({
          userId: user.uid,
          contactIndex: index
        })).unwrap();
        Alert.alert('Success', 'Emergency contact removed successfully!');
      }
    } catch (error) {
      console.error('Remove Contact Error:', error);
      Alert.alert('Error', 'Failed to remove emergency contact. Please try again.');
    }
  };

  const handleUpdateEmergencyContact = async (index: number, updatedContact: EmergencyContactType) => {
    try {
      if (user?.uid) {
        await dispatch(updateEmergencyContact({
          userId: user.uid,
          contactIndex: index,
          contact: updatedContact
        })).unwrap();
        Alert.alert('Success', 'Emergency contact updated successfully!');
      }
    } catch (error) {
      console.error('Update Contact Error:', error);
      Alert.alert('Error', 'Failed to update emergency contact. Please try again.');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and emergency contacts</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileSection}>
        <ProfileCard
          user={user}
          isEditing={isEditing}
          onUpdate={handleSaveProfile}
        />
      </View>

      {/* Emergency Contacts */}
      <View style={styles.emergencySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowEmergencyContacts(true)}
          >
            <Text style={styles.addButtonText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : user.emergencyContacts && user.emergencyContacts.length > 0 ? (
          <View style={styles.contactsList}>
            {user.emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelation}>{contact.relation}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setShowEmergencyContacts(true);
                    }}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Remove Contact',
                        `Are you sure you want to remove ${contact.name}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => handleRemoveEmergencyContact(index)
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noContacts}>
            <Text style={styles.noContactsText}>
              No emergency contacts added yet
            </Text>
            <Text style={styles.noContactsSubtext}>
              Add emergency contacts to receive SOS alerts
            </Text>
          </View>
        )}
      </View>

      {/* App Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Location Services</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Shake Detection</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto SOS</Text>
          <Text style={styles.settingValue}>Disabled</Text>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>App Information</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2024.10.03</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Emergency Contacts Modal */}
      <Modal
        visible={showEmergencyContacts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmergencyContacts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Manage Emergency Contacts</Text>
              <TouchableOpacity
                onPress={() => setShowEmergencyContacts(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#e74c3c" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            ) : (
              <EmergencyContacts
                contacts={user.emergencyContacts || []}
                isEditing={true}
                onAdd={handleAddEmergencyContact}
                onRemove={handleRemoveEmergencyContact}
                onUpdate={handleUpdateEmergencyContact}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f8c8d',
  },
  contactsList: {
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  contactActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noContacts: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noContactsText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  noContactsSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  settingValue: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  modalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
});
