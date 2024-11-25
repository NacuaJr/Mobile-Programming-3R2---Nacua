import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../utils/supabase'; // Assuming you have set up Supabase in utils
import { useFavorites } from '../context/FavoritesContext';

const { width } = Dimensions.get('window');

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { favorites, toggleFavorite } = useFavorites();


  const [selectedItem, setSelectedItem] = useState(null); // For modal
  const [quantity, setQuantity] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch categories and food items when the component mounts
  useEffect(() => {
    fetchCategories();
    fetchFoodItems();
  }, []);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err.message);
      setCategories([]); // Fallback in case of error
    }
  };

  // Fetch food items from Supabase
  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase.from('food_items').select('*');
      if (error) throw error;
      setFoodItems(data || []);
    } catch (err) {
      console.error('Error fetching food items:', err.message);
      setFoodItems([]); // Fallback in case of error
    }
  };

  // Filter food items based on search query and selected category
  const filteredFoodItems = foodItems.filter((item) => {
    if (selectedCategory) {
      return item.category_id === selectedCategory.id;
    }
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Open Modal and set selected item
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

  const handlePurchase = async () => {
    try {
      const totalPrice = quantity * selectedItem.price;

      // Store in table (replace `orders` with your table name)
      const { error } = await supabase.from('orders').insert([
        {
          item_name: selectedItem.name,
          item_price: selectedItem.price,
          quantity: quantity,
          total_price: totalPrice,
          created_at: new Date(),
        },
      ]);

      if (error) throw error;

      console.log('Order placed successfully');
      closeModal(); // Close modal after successful purchase
    } catch (err) {
      console.error('Error placing order:', err.message);
    }
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory?.id === item.id && styles.selectedCategoryCard,
      ]}
      onPress={() => setSelectedCategory(selectedCategory?.id === item.id ? null : item)}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render food item with favorite toggle
  const renderFoodItem = ({ item }) => (
    <TouchableOpacity style={styles.foodCard} onPress={() => openModal(item)}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>₱{item.price}.00</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item)}>
          <Ionicons
            name={favorites.some((fav) => fav.id === item.id) ? 'heart' : 'heart-outline'}
            size={24}
            color="#FF6F61"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome User!</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Food Items Section */}
      <View style={styles.foodContainer}>
        <Text style={styles.sectionTitle}>Order your favourite food!</Text>
        <FlatList
          data={filteredFoodItems}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFoodItem}
          contentContainerStyle={styles.foodList}
        />
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
                <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
                  <Text style={styles.buttonText}>Purchase</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25242B',
    paddingHorizontal: 16,
  },
  header: {
    marginTop: '10%',
    marginBottom: '5%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: '6%',
    color: '#fff'
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  categoriesContainer: {
    marginVertical: 0,
    marginBottom:'5%'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff'
  },
  categoryList: {
    paddingVertical: 8,
    backgroundColor: '#25242B'
  },
  categoryCard: {
    backgroundColor: '#20AB7D', // Dark background for the category card
    padding: 10, // Space inside the card
    alignItems: 'center',
    borderRadius: 12, // Rounded corners
    marginHorizontal: 8, // Space between cards
    width: 80, // Fixed width for consistent layout
  },
  selectedCategoryCard: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryImage: {
    width: 50, // Slightly smaller image to fit the card
    height: 50,
    borderRadius: 8, // Rounded square
    marginBottom: 8, // Space between image and text
  },
  categoryText: {
    fontSize: 12, // Slightly smaller text
    color: '#fff',
    textAlign: 'center', // Center-align text
  },
  foodContainer: {
    flex: 1,
  },
  foodList: {
    paddingBottom: 16,
  },
  foodCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#20AB7D',
    padding: 8,
  },
  foodImage: {
    width: '100%',
    height: width / 2 - 32,
    borderRadius: 8,
  },
  foodInfo: {
    marginTop: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  foodPrice: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 4,
  },
  purchaseButton: {
    position: 'absolute',
    bottom: -3,
    right: 0,
    backgroundColor: '#FF6F61',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 7,
  },
  purchaseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
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

