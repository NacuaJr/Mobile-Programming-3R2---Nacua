import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { useBalance } from '../context/BalanceContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const { balance, setBalance } = useBalance();
  const [password, setPassword] = useState('');
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [senderId, setSenderId] = useState('');
  const [receiverStudentId, setReceiverStudentId] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to log out. Please try again.');
        return;
      }
      navigation.replace('LoginScreen');
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred during logout.');
    }
  };

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
            .maybeSingle();

          if (error) throw new Error(error.message);
          if (!data) {
            Alert.alert('Warning', 'No user data found.');
            return;
          }
          setUserData(data);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user information.');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchReceiverStudentId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('student_id')
          .eq('id', user.id)
          .single();
  
        if (error) {
          Alert.alert('Error', 'Failed to fetch receiver student ID.');
        } else {
          setReceiverStudentId(data.student_id);
        }
      } else {
        Alert.alert('Error', 'Failed to fetch logged-in user ID.');
      }
    };
  
    fetchReceiverStudentId();
  }, []);
  
  const handleSendMoney = async () => {
    const amountValue = parseFloat(amount);
  
    if (isNaN(amountValue) || amountValue <= 0) {
      setModalVisible(false)
      Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0.');
      return;
    }
  
    if (amountValue > balance) {
      setModalVisible(false)
      Alert.alert('Insufficient Balance', 'You do not have enough balance to complete this transaction.');
      return;
    }
  
    try {
      // Get the current user's session and email
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      const userEmail = session?.session?.user?.email;
  
      if (!userId || !userEmail) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }
  
      // Validate the password via Supabase authentication
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail, // Provide the email from the session
        password: password,
      });
  
      if (authError) {
        setModalVisible(false)
        Alert.alert('Error', 'Incorrect password. Please try again.');
        return;
      }
      const { data: userData, error: userError } = await supabase
      .from('users')
      .select('student_id')
      .eq('id', userId)
      .single();
  
    if (userError || !userData) {
      Alert.alert('Error', 'Unable to fetch user data.');
      return;
    }
  
    if (userData.student_id === recipientId) {
      setModalVisible(false);
      Alert.alert('Alert', 'You cannot send money to your own account.');
      return;
    }
  
      // Fetch recipient balance
      const { data: recipientData, error: recipientError } = await supabase
        .from('users')
        .select('balance')
        .eq('student_id', recipientId)
        .single();
  
      if (recipientError) {
        setModalVisible(false);
        Alert.alert('Error', 'Recipient not found.');
        return;
      }
  
      // Update sender's balance
      const { error: senderError } = await supabase
        .from('users')
        .update({ balance: balance - amountValue })
        .eq('id', userId);
  
      if (senderError) {
        Alert.alert('Error', 'Failed to update sender\'s balance.');
        return;
      }
  
      // Update recipient's balance
      const { error: recipientUpdateError } = await supabase
        .from('users')
        .update({ balance: recipientData.balance + amountValue })
        .eq('student_id', recipientId);
  
      if (recipientUpdateError) {
        setModalVisible(false);
        Alert.alert('Error', 'Failed to update recipient\'s balance.');
        return;
      }
  
      setBalance(balance - amountValue);
      Alert.alert('Success', `₱${amountValue.toFixed(2)} sent successfully to Student ID: ${recipientId}`);
      setModalVisible(false);
      setRecipientId('');
      setAmount('');
      setPassword(''); // Reset the password field
    } catch (err) {
      setModalVisible(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  

  const handleReceiveMoney = async () => {
    setIsModalVisible(true);
    setReceiveModalVisible(false);
    try {
       // Step 0: Prevent receiving money from self
      if (receiverStudentId === senderId) {
        setIsModalVisible(false);
        Alert.alert('Alert', 'You cannot receive money from your own account.');
        return;
      }

      // Step 1: Trigger RFID reading on the ESP32
      const response = await axios.get('http://192.168.1.18/trigger_rfid'); // Replace with your ESP32 IP
  
      if (response.data.success) {
        const rfidUid = response.data.uid;
        const parsedAmount = parseFloat(amount);
  
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          setIsModalVisible(false)
          Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0.');
          return;
        }
  
        // Step 2: Insert the transaction into the database
        const { error: transactionError } = await supabase.from('transactions').insert([
          {
            receiver_student_id: receiverStudentId,
            depositor_student_id: senderId,
            amount: parsedAmount,
            card_read: true,
            rfid_uid: rfidUid,
          },
        ]);

        if (transactionError) {
          setIsModalVisible(false);
          Alert.alert('Error', 'Sender ID not found. Please verify and try again.');
          return;
        }
  
        // Step 3: Update balances
        // Fetch current user's balance
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('balance')
          .eq('student_id', receiverStudentId)
          .single();
  
        if (currentUserError) {
          setIsModalVisible(false);
          Alert.alert('Error', 'Failed to fetch your balance.');
          return;
        }
        // Fetch sender's balance
        const { data: senderData, error: senderError } = await supabase
        .from('users')
        .select('balance')
          .eq('student_id', senderId)
          .single();
  
        
  
        // Update current user's balance
        const updatedReceiverBalance = currentUserData.balance + parsedAmount;
        const { error: updateReceiverError } = await supabase
          .from('users')
          .update({ balance: updatedReceiverBalance })
          .eq('student_id', receiverStudentId);
  
        if (updateReceiverError) {
          isModalVisible(false);
          Alert.alert('Error', 'Failed to update your balance.');
          return;
        }
  
        // Update sender's balance
        const updatedSenderBalance = senderData.balance - parsedAmount;
        const { error: updateSenderError } = await supabase
          .from('users')
          .update({ balance: updatedSenderBalance })
          .eq('student_id', senderId);
  
        if (updateSenderError) {
          isModalVisible(false)
          Alert.alert('Error', 'Failed to update sender\'s balance.');
          return;
        }
  
        Alert.alert('Success', `RFID scanned: ${rfidUid}. Transaction of ₱${parsedAmount.toFixed(2)} completed.`);
        setBalance(balance + parsedAmount);
        setReceiveModalVisible(false);
        setAmount('');
        setSenderId('');
        setIsModalVisible(false);
      } else {
        Alert.alert('Error', 'RFID scanning failed. Please try again.');
      }
    } catch (err) {
      isModalVisible(false);
      Alert.alert('Error', 'Failed to connect to the ESP32.');
    }
  };
  
  
  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: userData.profile_picture }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {userData.first_name} {userData.last_name}
        </Text>
        <Text style={styles.userRole}>Student</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Total Balance:</Text>
        <Text style={styles.balanceValue}>₱ {balance.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.paymentButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.paymentButtonText}>Send Money</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.paymentButton}
        onPress={() => setReceiveModalVisible(true)}
      >
        <Text style={styles.buttonText}>Receive Money</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Money</Text>
            <Text style={{color: '#FFF'}}>Current Balance: ₱{balance.toFixed(2)}</Text>
            <Text style={{ color: '#FFF', alignSelf: 'flex-start' }}>Recipient Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Student ID"
              placeholderTextColor="#676569" // Changes placeholder text color to white
              value={recipientId}
              onChangeText={setRecipientId}
            />

            <Text style={{ color: '#FFF', alignSelf: 'flex-start' }}>Amount to Send</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#676569" // Changes placeholder text color to white
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={{ color: '#FFF', alignSelf: 'flex-start' }}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#676569"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

           <View style={styles.modalButtons}>
           <TouchableOpacity
            style={[styles.button, styles.goBackButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Go Back</Text>
           </TouchableOpacity>
           <TouchableOpacity
            style={[styles.button, styles.sendButton]}
            onPress={handleSendMoney}
           >
            <Text style={styles.buttonText}>Send Money</Text>
           </TouchableOpacity>
           </View>
          </View>
        </View>
      </Modal>

      <Modal
  animationType="slide"
  transparent={true}
  visible={receiveModalVisible}
  onRequestClose={() => setReceiveModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Receive Money</Text>

      <Text style={{ color: '#FFF', alignSelf: 'flex-start' }}>Sender Student ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Sender Student ID"
        placeholderTextColor="#676569"
        value={senderId}
        onChangeText={setSenderId}
      />

      <Text style={{ color: '#FFF', alignSelf: 'flex-start' }}>Amount to Receive</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        placeholderTextColor="#676569"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.button, styles.goBackButton]}
          onPress={() => setReceiveModalVisible(false)}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.receiveButton]}
          onPress={handleReceiveMoney}
        >
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>

      </View>
    </View>
  </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)} // Optional close action
      >
        <View style={styles.modalBackground}>
          <View style={styles.waitmodalContainer}>
            <ActivityIndicator size="large" color="#20AB7D" />
            <Text style={styles.modalText}>Please scan your card...</Text>
          </View>
        </View>
      </Modal>


      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('TryPremiumScreen')}
        >
          <Ionicons name="star-outline" size={20} color="#FFF" />
          <Text style={styles.menuText}>Try Premium</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
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
    marginTop: '25%',
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
    marginTop: '3%',
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
    color: '#FFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#25242B',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#20AB7D'
  },
  input: {
    width: '100%',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    color: '#fff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // Ensures space between buttons
    width: '100%',                    // Ensures buttons take the full width of the container
    marginTop: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',  // Buttons take up 48% of the container's width (leaving space between them)
    marginVertical: 8,
  },
  sendButton: {
    backgroundColor: '#20AB7D',  // Green color for Send Money
  },
  goBackButton: {
    backgroundColor: '#F44336',  // Red color for Go Back
  },
  receiveButton : {
    backgroundColor: '#20AB7D'
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitmodalContainer: {
    backgroundColor: '#25242B', // White background for modal content
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%', // Adjust width of modal
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow blur radius for iOS
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    color: '#20AB7D', // Dark text color for readability
    textAlign: 'center', // Center-align text
  },
});

export default Profile;

