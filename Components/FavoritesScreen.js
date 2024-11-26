import React, {useState} from 'react';
import { Dimensions, View, Text, FlatList, StyleSheet, Image, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFavorites } from '../context/FavoritesContext';
import { getCurrentUserId } from '../api/apicalls'; // Ensure the path is correct
import { supabase } from '../utils/supabase';
export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  
  const [selectedItem, setSelectedItem] = useState(null); // For modal
  const [quantity, setQuantity] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Get the screen width
  const { width } = Dimensions.get('window');

  const openModal = (item) => {
    setSelectedItem(item);
    setQuantity(1); // Reset quantity
    setIsModalVisible(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleAddToCart = async (foodItemId, quantity, price) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        alert('Please log in to add items to the cart.');
        return;
      }
  
      // Check if the food item exists in the food_items table
      const { data: foodItem, error: fetchError } = await supabase
        .from('food_items')
        .select('id')
        .eq('id', foodItemId)
        .single();
  
      if (fetchError || !foodItem) {
        alert('Food item does not exist.');
        return;
      }
  
      const totalPrice = quantity * price;
  
      const { error } = await supabase.from('add_to_cart').insert([
        {
          user_id: userId,
          food_item_id: foodItemId,
          quantity: quantity,
          item_price: price,
          total_price: totalPrice,
        },
      ]);
  
      if (error) {
        console.error('Error adding to cart:', error.message);
        alert('Failed to add item to the cart.');
        return;
      }
  
      alert('Item added to cart successfully!');
    } catch (err) {
      console.error('Unexpected error:', err.message);
      alert('An unexpected error occurred while adding to the cart.');
    }
  };
  
  
  


  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.favoriteCard}>
      <View>
        <Image source={{ uri: item.image }} style={[styles.favoriteImage, { height: width / 2 - 32 }]} />
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoritePrice}>₱{item.price}.00</Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.heartIcon}>
          <Ionicons name="heart" size={24} color="#FF6F61" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
      {selectedItem && (
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
            <Text style={styles.modalTitle}>{selectedItem.name}</Text>
            <Text style={styles.modalPrice}>₱{selectedItem.price}.00</Text>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Total Price */}
            <Text style={styles.totalPrice}>
              Total: ₱{(quantity * selectedItem.price).toFixed(2)}
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.goBackButton} onPress={closeModal}>
                <Text style={styles.buttonText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => handleAddToCart(selectedItem.food_id, quantity, selectedItem.price)}
            >
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
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
    bottom: -30,
    left: 0,
  },
  noFavoritesText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#25242B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#20AB7D'
  },
  modalPrice: {
    fontSize: 16,
    marginBottom: 20,
    color: '#fff'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    color: 'white'
  },
  quantityButton: {
    backgroundColor: '#20AB7D',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    paddingHorizontal: '5%'
  },
  quantityText: {
    color: 'white',
    fontSize: 18,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#20AB7D'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  goBackButton: {
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  purchaseButton: {
    backgroundColor: '#20AB7D',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
