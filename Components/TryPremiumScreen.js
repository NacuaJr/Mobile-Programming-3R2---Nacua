import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const features = [
  {
    id: '1',
    icon: 'cash-outline', // Ionicons icon
    title: 'Free cash-in, no convenience fee.',
  },
  {
    id: '2',
    icon: 'timer-outline', // Ionicons icon
    title: 'Priority order, your order comes first.',
  },
  {
    id: '3',
    icon: 'restaurant-outline', // Ionicons icon
    title: 'Meal plan, plan what you want to eat.',
  },
];

const TryPremiumScreen = () => {
  const handleSubscribe = () => {
    console.log('Subscribe button pressed');
  };

  const renderFeature = ({ item }) => (
    <View style={styles.featureItem}>
      <Ionicons name={item.icon} size={24} color="#20AB7D" style={styles.featureIcon} />
      <Text style={styles.featureText}>{item.title}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#C4C4C4" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription Preview</Text>
        <Text style={styles.headerSubtitle}>
          Discover top features during your dining and improve experience.
        </Text>
      </View>

      <View style={styles.promotion}>
        <Text style={styles.promotionTitle}>Skip the line. Subscribe Now.</Text>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Discover New Features.</Text>
        <FlatList
          data={features}
          renderItem={renderFeature}
          keyExtractor={(item) => item.id}
          style={styles.featuresList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25242B',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: '7%'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C4C4C4',
  },
  promotion: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#1E1D24',
    borderRadius: 10,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  subscribeButton: {
    backgroundColor: '#20AB7D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresSection: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  featuresList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  featureIcon: {
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
});

export default TryPremiumScreen;
