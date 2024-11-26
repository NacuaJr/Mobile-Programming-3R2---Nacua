import { supabase } from "../utils/supabase";

export const getCurrentUserId = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Error fetching session or session missing:", sessionError?.message);
      return null;
    }
  
    const { user } = sessionData.session;
    return user?.id || null; // Return the user ID if available
  };
  

export const fetchCartItems = async () => {
  try {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('add_to_cart')
      .select(`
        id,
        quantity,
        total_price,
        food_items (
          name,
          price,
          image
        )
      `).eq('user_id', userId);

    if (error) throw error;

    // Map data to include food item details at the top level
    return data.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      total_price: item.total_price,
      name: item.food_items.name,
      price: item.food_items.price,
      image: item.food_items.image,
    }));
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    throw error;
  }
};

export const deleteCartItem = async (id) => {
    const { error } = await supabase
      .from('add_to_cart')
      .delete()
      .eq('id', id);
  
    if (error) {
      throw new Error('Failed to delete item');
    }
  };
  
