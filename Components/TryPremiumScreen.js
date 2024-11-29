import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TryPremiumScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Try Premium</Text>
        <Text style={styles.content}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          bibendum, magna id auctor facilisis, velit quam luctus arcu, non
          posuere ligula purus nec enim. Quisque euismod orci ut libero
          pellentesque, et convallis turpis interdum. Pellentesque habitant
          morbi tristique senectus et netus et malesuada fames ac turpis
          egestas.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25242B',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#20AB7D',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
  },
});

export default TryPremiumScreen;
