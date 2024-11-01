import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ListePhoto from './vues/listePhoto';
import AjoutPhoto from './vues/ajoutPhoto';
import ListeBoard from './vues/listeBoard';
import AjoutBoard from './vues/ajoutBoard';
import DetailBoard from './vues/detailBoard';
import { AppContext } from './store/appContext';
import { useState } from 'react';
import Login from './vues/login';
import Register from './vues/register';
import BoardSettings from './vues/boardSettings';

const TabA = createMaterialBottomTabNavigator();
const TabP = createMaterialBottomTabNavigator();
const TabC = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavAlbum = () => {
  return (
    <TabA.Navigator>
      <TabA.Screen name="listeBoard" component={ListeBoard} />
      <TabA.Screen name="ajoutBoard" component={AjoutBoard} />
    </TabA.Navigator>
  )
}

const TabNavPhoto = () => {
  return (
    <TabP.Navigator>
      <TabP.Screen name="listePhoto" component={ListePhoto} />
      <TabP.Screen name="ajoutPhoto" component={AjoutPhoto} />
    </TabP.Navigator>
  )
}

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Album" component={TabNavAlbum} />
      <Stack.Screen name="Photos" component={TabNavPhoto} />
      <Stack.Screen name="DetailBoard" component={DetailBoard} />
      <Stack.Screen name="BoardSettings" component={BoardSettings} />
    </Stack.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState({})
  const [album, setAlbum] = useState(null)
  const [refresh, setRefresh] = useState(false)
  return (
    <AppContext.Provider value={{ user, setUser, album, setAlbum, refresh, setRefresh }}>
      <NavigationContainer>
        {user.email ?
          <MainStack />
          :
          <TabC.Navigator>
            <TabC.Screen name="login" component={Login} />
            <TabC.Screen name="register" component={Register} />
          </TabC.Navigator>
        }
      </NavigationContainer>
    </AppContext.Provider>
  );
}
