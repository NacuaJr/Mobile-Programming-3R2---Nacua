import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Create context
const FavoritesContext = createContext();

// Provide context to children components
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Listen for auth state changes and set user ID accordingly
  useEffect(() => {
    const fetchUserOnAuthChange = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        setUserId(sessionData.session.user.id);
        fetchFavorites(sessionData.session.user.id);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          fetchFavorites(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setFavorites([]); // Clear favorites on sign-out
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    fetchUserOnAuthChange();
  }, []);

  // Set up a real-time listener for changes in the favorites table
  useEffect(() => {
    if (userId) {
      const subscription = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${userId}` },
          (payload) => {
            console.log('Realtime update:', payload);
            fetchFavorites(userId); // Refetch whenever there's an update
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [userId]);

  // Fetching the favorites for the specific user
  const fetchFavorites = async (currentUserId) => {
    if (!currentUserId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Error fetching favorites:', error.message);
    } else {
      setFavorites(data);
    }
    setLoading(false);
  };

  // Toggle favorite status: add or remove
  // Toggle favorite status: add or remove
  const toggleFavorite = async (item) => {
    if (!userId) {
      console.error('User ID is not available. Cannot toggle favorites.');
      return;
    }
  
    const isFavorite = favorites.some((fav) => fav.food_id === item.food_id);
  
    if (isFavorite) {
      // Find the favorite entry to remove using `food_id` and `user_id`
      const { data: favoriteToRemove } = await supabase
        .from('favorites')
        .select('id')
        .eq('food_id', item.food_id)
        .eq('user_id', userId)
        .single();
  
      if (favoriteToRemove) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteToRemove.id); // Use the primary key to delete
  
        if (error) {
          console.error('Error removing favorite:', error.message);
        } else {
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.food_id !== item.food_id)
          );
        }
      }
    } else {
      // Add to favorites
      const { data, error } = await supabase
        .from('favorites')
        .insert([
          {
            food_id: item.food_id, // Link to the correct food item
            user_id: userId,
            name: item.name,
            price: item.price,
            image: item.image,
          },
        ]);
  
      if (error) {
        console.error('Error adding favorite:', error.message);
      } else if (data && data[0]) {
        setFavorites((prevFavorites) => [...prevFavorites, data[0]]);
      }
    }
  };
  


  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavorites = () => {
  return useContext(FavoritesContext);
};
