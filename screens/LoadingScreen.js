import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    
    setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TAPpetite</Text>
      <ActivityIndicator size="large" color="#20AB7D" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25242B' },
  logo: { fontSize: 30, color: '#20AB7D', fontWeight: 'bold' },
});
