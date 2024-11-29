import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useBalance } from '../context/BalanceContext';

const BalanceCard = () => {
  const { balance } = useBalance();

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>₱{balance.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      position: 'absolute', // Makes the component floating
      top: 0, // Adjust distance from the top
      right: 5, // Adjust distance from the right
      backgroundColor: '#fff',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      alignItems: 'center',
    },
    label: {
      fontSize: 12,
      color: '#555',
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#222',
    },
  });

export default BalanceCard;
