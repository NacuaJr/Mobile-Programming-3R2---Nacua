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
import { useBalance } from '../context/BalanceContext';
import BalanceCard from './BalanceCard';

const AddToCart = () => {
  const { cartItems, fetchCartItems } = useCart();
  const { balance, setBalance } = useBalance(); // Access balance from context
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

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
    } catch (err) {
      console.error('Unexpected error:', err.message);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handlePurchase = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty!');
      return;
    }

    try {
      const { data: userSession, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !userSession?.session?.user?.id) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const userId = userSession.session.user.id;

      // Fetch the user's current balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) throw new Error(userError.message);

      const currentBalance = userData.balance;

      if (currentBalance < totalAmount) {
        Alert.alert('Error', 'Insufficient balance to complete the purchase.');
        return;
      }

      // Deduct balance
      const updatedBalance = currentBalance - totalAmount;

      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: updatedBalance })
        .eq('id', userId);

      if (balanceError) throw new Error(balanceError.message);

      // Update the local balance state
      setBalance(updatedBalance); // This ensures the updated balance is displayed immediately

      // Store purchases in the purchases table
      const purchaseData = cartItems.map((item) => ({
        user_id: userId,
        food_item_id: item.food_items.id,
        quantity: item.quantity,
        total_price: item.total_price,
        purchased_at: new Date(),
      }));

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert(purchaseData);

      if (purchaseError) throw new Error(purchaseError.message);

      // Clear cart
      const { error: cartError } = await supabase
        .from('add_to_cart')
        .delete()
        .eq('user_id', userId);

      if (cartError) throw new Error(cartError.message);

      Alert.alert('Success', 'Purchase completed successfully!');
      fetchCartItems(); // Refresh cart items
    } catch (err) {
      console.error('Error processing purchase:', err.message);
      Alert.alert('Error', 'An error occurred while processing your purchase.');
    }
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
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id)}
                  style={styles.trashButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF6F61" />
                </TouchableOpacity>

                <Image source={{ uri: item.food_items.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.food_items.name}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    Price: ₱{item.item_price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  Total: ₱{item.total_price.toFixed(2)}
                </Text>
              </View>
            )}
          />
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalText}>
                Total Amount: ₱{totalAmount.toFixed(2)}
              </Text>
              <Text style={styles.balanceText}>
                Current Balance: ₱{balance.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity style={styles.proceedButton} onPress={handlePurchase}>
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    position: 'relative',
  },
  trashButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#fff',
  },
  itemPrice: {
    fontSize: 14,
    color: '#fff',
  },
  itemTotal: {
    fontSize: 13,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceText: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
  proceedButton: {
    backgroundColor: '#20AB7D',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddToCart;
