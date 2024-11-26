import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Create the CartContext
export const CartContext = createContext();

// Custom hook to access the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// CartProvider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!authUser) {
      setCartItems([]); // Clear cart if no user
      return;
    }

    try {
      const { data, error } = await supabase
        .from('add_to_cart')
        .select('*, food_items(*)')
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error fetching cart items:', error.message);
        setCartItems([]); // Handle error by clearing cart
        return;
      }

      setCartItems(data || []);
    } catch (err) {
      console.error('Unexpected error fetching cart items:', err.message);
    }
  };

  // Auth state listener
  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user); // Set user
    };

    fetchAuthUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => {
      // No need to remove the subscription here
    };
  }, []);

  // Real-time listener for cart updates
  useEffect(() => {
    if (!authUser) return;

    fetchCartItems();

    const channel = supabase
      .channel('realtime:cart')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'add_to_cart' },
        (payload) => {
          console.log('Cart table changed:', payload);
          fetchCartItems();
        }
      )
      .subscribe();

    // Cleanup function for real-time listener
    return () => {
      console.log('Removing real-time channel subscription.');
      channel.unsubscribe(); // Unsubscribe from the real-time channel
    };
  }, [authUser]);

  return (
    <CartContext.Provider value={{ cartItems, fetchCartItems }}>
      {children}
    </CartContext.Provider>
  );
};
