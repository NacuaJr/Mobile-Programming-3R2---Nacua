import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../utils/supabase';

const AddToCart = () => {
  const { cartItems, fetchCartItems } = useCart();

  // Calculate total price
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('add_to_cart')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing item:', error.message);
        Alert.alert('Error', 'Failed to remove item from cart.');
        return;
      }

      fetchCartItems(); // Refresh cart items after deletion
      Alert.alert('Success', 'Item removed from cart.');
    } catch (err) {
      console.error('Unexpected error:', err.message);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const proceedHandler = () => {
    Alert.alert('Proceed', 'Proceeding to checkout...');
    // Add your logic to handle proceeding to checkout here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty!</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                {/* Trash Bin */}
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id)}
                  style={styles.trashButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF6F61" />
                </TouchableOpacity>

                <Image
                  source={{ uri: item.food_items.image }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.food_items.name}</Text>
                  <Text style={styles.itemQuantity}>
                    Quantity: {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    Price: ₱{item.item_price.toFixed(2)}
                  </Text>
                </View>

                {/* Item Total Price in Bottom-Right */}
                <Text style={styles.itemTotal}>
                  Total: ₱{item.total_price.toFixed(2)}
                </Text>
              </View>
            )}
          />

          {/* Total Amount and Proceed Button */}
          <View style={styles.footer}>
            <Text style={styles.totalText}>
              Total Amount: ₱{totalAmount.toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.proceedButton} onPress={proceedHandler}>
              <Text style={styles.proceedButtonText}>Purchase</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#25242B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    marginTop: '5%'
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20AB7D',
    padding: 12, // Increased padding
    borderRadius: 10, // Slightly larger border radius
    marginBottom: 12, // Adjusted spacing between cards
    position: 'relative',
  },
  trashButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  itemImage: {
    width: 80, // Increased width
    height: 80, // Increased height
    borderRadius: 8,
    marginRight: 10, // Slightly more spacing from text
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15, // Slightly larger font
    fontWeight: 'bold',
    color: '#fff',
  },
  itemQuantity: {
    fontSize: 14, // Increased font size for better readability
    color: '#fff',
  },
  itemPrice: {
    fontSize: 14, // Increased font size for better readability
    color: '#fff',
  },
  itemTotal: {
    fontSize: 13, // Increased font size for visibility
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20, // Slightly larger font for emphasis
    fontWeight: 'bold',
    color: '#fff',
  },
  proceedButton: {
    backgroundColor: '#20AB7D',
    paddingVertical: 14, // Slightly larger button height
    paddingHorizontal: 20, // Slightly wider button
    borderRadius: 10, // Larger border radius
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 18, // Larger font for the button text
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddToCart;
