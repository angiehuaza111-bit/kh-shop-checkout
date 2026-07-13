import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeProductsScreen } from '../screens/HomeProductsScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { FailureScreen } from '../screens/FailureScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useTheme } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const theme = useTheme();
  const headerOptions = useMemo(
    () => ({
      headerShown: true,
      headerStyle: {
        backgroundColor: theme.colors.background,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: theme.colors.text,
      headerShadowVisible: false,
      headerTitleStyle: {
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.h3,
      },
    }),
    [theme],
  );

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeProductsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ ...headerOptions, title: 'Pagar' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ ...headerOptions, title: 'Pago' }} />
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="Failure" component={FailureScreen} />
      <Stack.Screen name="More" component={MoreScreen} options={{ ...headerOptions, title: 'Menu' }} />
    </Stack.Navigator>
  );
}
