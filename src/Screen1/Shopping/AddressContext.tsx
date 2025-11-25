import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { getBackendUrl } from '../../../src/util/backendConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

interface AddressContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  fetchAddresses: () => Promise<void>;
  fetchUserProfileForAddress: () => Promise<void>;
  loading: boolean;
}

export const AddressContext = createContext<AddressContextType>({
  addresses: [],
  defaultAddress: null,
  addAddress: async () => {},
  updateAddress: async () => {},
  deleteAddress: async () => {},
  setDefaultAddress: async () => {},
  fetchAddresses: async () => {},
  fetchUserProfileForAddress: async () => {},
  loading: true,
});

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0] || null;

  useEffect(() => {
    initializeAddressData();
  }, []);

const initializeAddressData = async () => {
  try {
    await Promise.all([fetchAddresses(), fetchUserProfileForAddress()]);
  } catch (error) {
    console.error('Error initializing address data:', error);
    // Continue execution even if there's an error
  } finally {
    setLoading(false);
  }
};

  const fetchUserProfileForAddress = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      const backendUrl = getBackendUrl();

      if (!token) {
        // Try to get from AsyncStorage
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const user = JSON.parse(storedProfile);
          await createAddressFromProfile(user);
        }
        return;
      }

      const response = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const user = response.data.user;
        await createAddressFromProfile(user);
        
        // Store profile for future use
        await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error fetching user profile for address:', error);
      // Try to get from AsyncStorage as fallback
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        const user = JSON.parse(storedProfile);
        await createAddressFromProfile(user);
      }
    }
  };

  const createAddressFromProfile = async (user: any) => {
    if (user.address && addresses.length === 0) {
      const profileAddress: Address = {
        id: 'profile-' + Date.now(),
        name: user.name || 'User',
        phone: user.phoneNumber || user.altMobile || '',
        addressLine1: user.address,
        city: extractCityFromAddress(user.address),
        state: extractStateFromAddress(user.address),
        pincode: extractPincodeFromAddress(user.address) || '000000',
        country: 'India',
        isDefault: true,
      };
      
      setAddresses([profileAddress]);
      
      // Also store in AsyncStorage for shopping components
      await AsyncStorage.setItem('shippingAddress', JSON.stringify(profileAddress));
    }
  };


  // Replace the fetchAddresses function in AddressContext.tsx with this version
const fetchAddresses = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
    const backendUrl = getBackendUrl();
    
    if (!token) {
      console.log('No auth token found for fetching addresses');
      return;
    }
    
    // Try to get user ID from token or profile
    const userProfile = await AsyncStorage.getItem('userProfile');
    let userId = null;
    
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      userId = profile.id || profile._id || profile.userId;
    }
    
    if (!userId) {
      console.log('No user ID found for fetching addresses');
      return;
    }
    
    try {
      const response = await axios.get(`${backendUrl}/api/addresses/${userId}`);
      
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (apiError) {
      // If the API endpoint doesn't exist (404), just continue with empty addresses
      if (apiError.response && apiError.response.status === 404) {
        console.log('Address API endpoint not found, continuing with empty addresses');
        return;
      }
      // For other errors, log but don't crash
      console.error('Error fetching addresses:', apiError);
    }
  } catch (error) {
    console.error('Unexpected error in fetchAddresses:', error);
  }
};


  const addAddress = async (newAddress: Omit<Address, 'id'>) => {
    try {
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      const backendUrl = getBackendUrl();
      
      const address: Address = {
        ...newAddress,
        id: Date.now().toString(),
      };

      if (token) {
        // Save to backend
        const response = await axios.post(
          `${backendUrl}/api/users/addresses`,
          address,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setAddresses(prev => [...prev, response.data.data]);
        }
      } else {
        // Save locally
        setAddresses(prev => [...prev, address]);
      }
      
      // Update stored shipping address if this is default
      if (address.isDefault) {
        await AsyncStorage.setItem('shippingAddress', JSON.stringify(address));
      }
      
      Alert.alert('Success', 'Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Failed to add address');
    }
  };

  const updateAddress = async (id: string, updatedAddress: Partial<Address>) => {
    try {
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      
      if (token) {
        const backendUrl = getBackendUrl();
        const response = await axios.put(
          `${backendUrl}/api/users/addresses/${id}`,
          updatedAddress,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setAddresses(prev => 
            prev.map(addr => 
              addr.id === id ? { ...addr, ...response.data.data } : addr
            )
          );
        }
      } else {
        setAddresses(prev => 
          prev.map(addr => 
            addr.id === id ? { ...addr, ...updatedAddress } : addr
          )
        );
      }
      
      // Update stored shipping address if this is default
      const updated = addresses.find(addr => addr.id === id);
      if (updated?.isDefault) {
        await AsyncStorage.setItem('shippingAddress', JSON.stringify({
          ...updated,
          ...updatedAddress
        }));
      }
      
      Alert.alert('Success', 'Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Failed to update address');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      if (addresses.length <= 1) {
        Alert.alert('Error', 'You must have at least one address');
        return;
      }
      
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      
      if (token) {
        const backendUrl = getBackendUrl();
        await axios.delete(
          `${backendUrl}/api/users/addresses/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      
      Alert.alert('Success', 'Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      Alert.alert('Error', 'Failed to delete address');
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      
      if (token) {
        const backendUrl = getBackendUrl();
        await axios.patch(
          `${backendUrl}/api/users/addresses/${id}/set-default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      
      setAddresses(updatedAddresses);
      
      // Update stored shipping address
      const newDefault = updatedAddresses.find(addr => addr.id === id);
      if (newDefault) {
        await AsyncStorage.setItem('shippingAddress', JSON.stringify(newDefault));
      }
      
      Alert.alert('Success', 'Default address updated successfully');
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  return (
    <AddressContext.Provider value={{
      addresses,
      defaultAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      fetchAddresses,
      fetchUserProfileForAddress,
      loading,
    }}>
      {children}
    </AddressContext.Provider>
  );
};

// Helper functions
const extractCityFromAddress = (address: string): string => {
  const cityMatch = address.match(/(\w+)(?=\s*\d{6}|$)/);
  return cityMatch ? cityMatch[1] : 'City';
};

const extractStateFromAddress = (address: string): string => {
  const stateMatch = address.match(/(Maharashtra|Karnataka|Tamil Nadu|Delhi|Kerala|Gujarat)/i);
  return stateMatch ? stateMatch[1] : 'State';
};

const extractPincodeFromAddress = (address: string): string | null => {
  const pincodeMatch = address.match(/\b\d{6}\b/);
  return pincodeMatch ? pincodeMatch[0] : null;
};

export const useAddress = () => useContext(AddressContext);