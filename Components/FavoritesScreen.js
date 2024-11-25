import React from 'react';
import { Dimensions, View, Text, FlatList, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  
  // Get the screen width
  const { width } = Dimensions.get('window');

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteCard}>
      <Image source={{ uri: item.image }} style={[styles.favoriteImage, { height: width / 2 - 32 }]} />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoritePrice}>₱{item.price}.00</Text>
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.heartIcon}>
        <Ionicons name="heart" size={24} color="#FF6F61" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Favorites</Text>
      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No favorites yet!</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.favoriteList}
          numColumns={2} // Ensures 2 items per row
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25242B',
    padding: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: '7%',
  },
  favoriteList: {
    paddingBottom: 20,
  },
  favoriteCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#20AB7D',
    padding: 10,
    paddingBottom: '9%'
  },
  favoriteImage: {
    width: '100%',
    borderRadius: 8,
  },
  favoriteInfo: {
    marginTop: 10,
    
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  favoritePrice: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 4,
  },
  heartIcon: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  noFavoritesText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
