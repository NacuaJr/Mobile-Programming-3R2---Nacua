import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const TermsOfService = ({ navigation }) => {
  const handleAccept = () => {
    // Navigate to the next screen or perform any action
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.content}>
          Welcome to Tappetite! Please read the following terms carefully as they govern your use of our application.
          {'\n\n'}
          1. **Introduction**: By accessing or using Tappetite, you agree to be bound by these terms.
          {'\n\n'}
          2. **Eligibility**: You must be at least 13 years old to use this app.
          {'\n\n'}
          3. **Usage Rules**: You agree not to misuse our services or use them for illegal purposes.
          {'\n\n'}
          4. **Privacy Policy**: Your personal information will be handled as outlined in our Privacy Policy.
          {'\n\n'}
          5. **Changes to Terms**: Tappetite reserves the right to modify these terms at any time.
          {'\n\n'}
          By using this app, you acknowledge that you have read, understood, and agree to these terms.
        </Text>
      </ScrollView>
      <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#25242B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: '7%',
    color: '#20AB7D'
  },
  scrollView: {
    flex: 1,
    marginVertical: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  acceptButton: {
    backgroundColor: '#20AB7D',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TermsOfService;
