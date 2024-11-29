import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import Signup from './screens/Signup';
import Nav from './route/Nav';
import FavoritesScreen from './Components/FavoritesScreen';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { BalanceProvider } from './context/BalanceContext';
import TryPremiumScreen from './Components/TryPremiumScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <FavoritesProvider>
    <CartProvider>
    <BalanceProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoadingScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Nav" component={Nav} options={{ headerShown: false }} />
          <Stack.Screen name="FavoritesScreens" component={FavoritesScreen} options={{headerShown: false}}/>
          <Stack.Screen name="TryPremiumScreen" component={TryPremiumScreen} options={{ title: 'Try Premium', headerShown: true }}
  />
        </Stack.Navigator>
      </NavigationContainer>
    </BalanceProvider>
    </CartProvider>
    </FavoritesProvider>
  );
}
