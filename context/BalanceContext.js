import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async (userId) => {
      try {
        // Fetch the balance from the users table
        const { data, error } = await supabase
          .from('users')
          .select('balance')
          .eq('id', userId)
          .single();

        if (error) throw new Error(error.message);

        console.log('Fetched balance:', data);
        setBalance(data.balance);
      } catch (err) {
        console.error('Error fetching balance:', err.message);
      } finally {
        setLoading(false); // Set loading to false after the fetch attempt
      }
    };

    // Check for session changes or an active session on app load
    const checkSession = async () => {
      setLoading(true); // Start loading
      const { data: sessionData } = await supabase.auth.getSession();

      const userId = sessionData?.session?.user?.id;
      if (userId) {
        await fetchBalance(userId); // Fetch balance if user is authenticated
      } else {
        setLoading(false); // No session, stop loading
      }
    };

    // Listen for auth state changes to handle login/logout events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        fetchBalance(session.user.id); // Fetch balance on login
      } else {
        setBalance(0); // Reset balance on logout
        setLoading(false);
      }
    });

    checkSession(); // Check session on component mount

    return () => {

    };
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, loading }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
