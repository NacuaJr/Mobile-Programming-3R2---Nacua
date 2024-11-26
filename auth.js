import { supabase } from "./utils/supabase";
export const registerUser = async (firstName, lastName, email, password, confirmPassword) => {
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    console.log('Error: ', error.message);
    alert("Registration failed: " + error.message);
  } else {
    alert("Registration successful! Please check your email to verify your account.");
  }
};

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if(data === ""){
    alert("Login failed: Empty field.")
  }
  if (error) {
    console.log('Error: ', error.message);
    alert("Login failed: " + error.message);
    return;
  } else if (!data.user?.email_confirmed_at) {
    alert("Please verify your email before logging in.");
  } else {
    return 1;
  }
};

export const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
  return data.user?.id;
};

