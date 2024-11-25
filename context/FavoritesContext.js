import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
// Create context
const FavoritesContext = createContext();

// Provide context to children components
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the favorites from Supabase when the app starts
  // FavoritesContext.js
  useEffect(() => {
    // Fetch initial data
    fetchFavorites();
  
    // Set up a real-time listener
    const subscription = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'favorites' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchFavorites(); // Refetch whenever there's an update
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  


  // Fetching the favorites
  const fetchFavorites = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('favorites').select('*');
    if (error) {
      console.error('Error fetching favorites:', error.message);
    } else {
      setFavorites(data);
    }
    setLoading(false);
  };

  // Add to favorites in Supabase
  const addFavorite = async (item) => {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ id: item.id, name: item.name, price: item.price, image: item.image }]);
  
    if (error) {
      console.error('Error adding favorite:', error.message);
    } else if (data && data[0]) {
      setFavorites((prevFavorites) => {
        // Ensure we update state properly to trigger a re-render
        return [...prevFavorites, data[0]];
      });
    }
  };
  
  const removeFavorite = async (item) => {
    const { error } = await supabase.from('favorites').delete().eq('id', item.id);
  
    if (error) {
      console.error('Error removing favorite:', error.message);
    } else {
      setFavorites((prevFavorites) => {
        // Filter out the removed favorite from the state
        return prevFavorites.filter((fav) => fav.id !== item.id);
      });
    }
  };
  

  // Toggle favorite status: add or remove
  // Toggle favorite status: add or remove
const toggleFavorite = async (item) => {
  const isFavorite = favorites.some((fav) => fav.id === item.id);
  
  if (isFavorite) {
    // If it's already a favorite, remove it
    const { error } = await supabase.from('favorites').delete().eq('id', item.id);

    if (error) {
      console.error('Error removing favorite:', error.message);
    } else {
      // Remove from local state
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== item.id));
    }
  } else {
    // If it's not a favorite, add it
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ id: item.id, name: item.name, price: item.price, image: item.image }]);

    if (error) {
      console.error('Error adding favorite:', error.message);
    } else if (data && data[0]) {
      // Add to local state
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
