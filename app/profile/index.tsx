import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signOutUser, updateUserProfile } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import EmergencyContacts from './components/EmergencyContacts';
import ProfileCard from './components/ProfileCard';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            dispatch(signOutUser());
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      await dispatch(updateUserProfile(updatedData)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleAddEmergencyContact = (contact: any) => {
    if (!user) return;
    
    const updatedContacts = [...(user.emergencyContacts || []), contact];
    handleUpdateProfile({ emergencyContacts: updatedContacts });
  };

  const handleRemoveEmergencyContact = (index: number) => {
    if (!user) return;
    
    const updatedContacts = user.emergencyContacts.filter((_, i) => i !== index);
    handleUpdateProfile({ emergencyContacts: updatedContacts });
  };

  const handleUpdateEmergencyContact = (index: number, updatedContact: any) => {
    if (!user) return;
    
    const updatedContacts = user.emergencyContacts.map((contact, i) => 
      i === index ? updatedContact : contact
    );
    handleUpdateProfile({ emergencyContacts: updatedContacts });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Ionicons 
            name={isEditing ? "checkmark" : "create-outline"} 
            size={24} 
            color="#e74c3c" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <ProfileCard
          user={user}
          isEditing={isEditing}
          onUpdate={handleUpdateProfile}
        />

        {/* Emergency Contacts */}
        <EmergencyContacts
          contacts={user?.emergencyContacts || []}
          isEditing={isEditing}
          onAdd={handleAddEmergencyContact}
          onRemove={handleRemoveEmergencyContact}
          onUpdate={handleUpdateEmergencyContact}
        />

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#2c3e50" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield-outline" size={24} color="#2c3e50" />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#2c3e50" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
            <Text style={[styles.settingText, { color: '#e74c3c' }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
  },
});
