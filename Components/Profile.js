import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { useBalance } from '../context/BalanceContext';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';

const Profile = ({navigation}) => {

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error('Supabase logout error:', error);
        Alert.alert('Error', 'Failed to log out. Please try again.');
        return;
      }
  
      // Optional: Clear any context or cached data here, if applicable
      // Redirect to login screen
      navigation.replace('LoginScreen'); // Replace 'LoginScreen' with your actual screen name
    } catch (err) {
      console.error('Unexpected logout error:', err);
      Alert.alert('Error', 'An unexpected error occurred during logout.');
    }
  };
  
  
  const [userData, setUserData] = useState(null);
  const { balance } = useBalance();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;

        if (userId) {
          const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, profile_picture')
            .eq('id', userId)
            .single();

          if (error) throw new Error(error.message);
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        Alert.alert('Error', 'Failed to fetch user information.');
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: userData.profile_picture,
          }} // Fallback to a placeholder image if no profile picture
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {userData.first_name} {userData.last_name}
        </Text>
        <Text style={styles.userRole}>Student</Text>
      </View>

      {/* Total Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Total Balance:</Text>
        <Text style={styles.balanceValue}>₱ {balance.toFixed(2)}</Text>
      </View>

      {/* Button for Payments */}
      <TouchableOpacity style={styles.paymentButton}>
        <Text style={styles.paymentButtonText}>Receive Payment</Text>
      </TouchableOpacity>

      {/* Navigation Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}  onPress={() => navigation.navigate('TryPremiumScreen')}>
          <Ionicons name="star-outline" size={20} color="#FFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Try Premium</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={20} color="#FFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Log Out</Text>
        </TouchableOpacity>
      </View> 

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: '25%'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userRole: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 4,
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#25242B',
    borderRadius: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#20AB7D',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentButton: {
    backgroundColor: '#20AB7D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    width: '70%',
    alignSelf: 'center',
    marginTop: '5%'
  },
  paymentButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  menu: {
    width: '100%',
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 70,
    paddingVertical: 15,
    borderBottomColor: '#1C1C1E',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1D',
  },
  loadingText: {
    fontSize: 18,
    color: '#AAA',
  },
  menuIcon: {
    marginRight: 10, // Space between icon and text
  },
});

export default Profile;
