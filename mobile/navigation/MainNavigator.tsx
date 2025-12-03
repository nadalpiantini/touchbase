import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/main/DashboardScreen';
import ClassesScreen from '../screens/main/ClassesScreen';
import ModulesScreen from '../screens/main/ModulesScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ModulePlayerScreen from '../screens/module/ModulePlayerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ModulesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ModulesList" 
        component={ModulesScreen}
        options={{ title: 'Modules' }}
      />
      <Stack.Screen 
        name="ModulePlayer" 
        component={ModulePlayerScreen}
        options={{ title: 'Module' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#1a3a5c',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Classes" 
        component={ClassesScreen}
        options={{ title: 'Classes' }}
      />
      <Tab.Screen 
        name="Modules" 
        component={ModulesStack}
        options={{ title: 'Modules', headerShown: false }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
