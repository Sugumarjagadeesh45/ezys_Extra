const customMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  Switch,
  Modal,
  TextInput,
  PermissionsAndroid,
  Platform,
  Image,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  AppState
} from 'react-native';
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import socket from '../../socket';
import haversine from 'haversine-distance';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendUrl } from '../../util/backendConfig';
import BikeIcon from '../../../assets001/bike.svg';
import LorryIcon from '../../../assets001/lorry.svg';
import TaxiIcon from '../../../assets001/taxi.svg';
import SearchingAnimation from '../../constants/SearchingAnimation';

const RideTypeSelector = ({ selectedRideType, setSelectedRideType, estimatedPrice, distance, dynamicPrices }) => {
  const renderVehicleIcon = (type: string, size: number = 24, color: string = '#333333') => {
    switch (type) {
      case 'port':
        return <LorryIcon width={size} height={size} fill={color} />;
      case 'taxi':
        return <TaxiIcon width={size} height={size} fill={color} />;
      case 'bike':
        return <BikeIcon width={size} height={size} fill={color} />;
      default:
        return <TaxiIcon width={size} height={size} fill={color} />;
    }
  };
  return (
    <View style={styles.rideTypeContainer}>
      <TouchableOpacity
        style={[
          styles.rideTypeButton,
          selectedRideType === 'port' && styles.selectedRideTypeButton,
        ]}
        onPress={() => setSelectedRideType('port')}
        activeOpacity={0.7}
      >
        <View style={styles.rideIconContainer}>
          {renderVehicleIcon('port', 24, selectedRideType === 'port' ? '#FFFFFF' : '#333333')}
        </View>
        <View style={styles.rideInfoContainer}>
          <Text style={[
            styles.rideTypeText,
            selectedRideType === 'port' && styles.selectedRideTypeText,
          ]}>CarGo Porter</Text>
          <Text style={[
            styles.rideDetailsText,
            selectedRideType === 'port' && styles.selectedRideDetailsText,
          ]}>Max 5 ton</Text>
          <Text style={styles.ridePriceText}>
            {dynamicPrices.port > 0 ? `₹${dynamicPrices.port}/km` : 'Loading...'}
          </Text>
        </View>
        {selectedRideType === 'port' && (
          <View style={styles.checkmarkContainer}>
            <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.rideTypeButton,
          selectedRideType === 'taxi' && styles.selectedRideTypeButton,
        ]}
        onPress={() => setSelectedRideType('taxi')}
        activeOpacity={0.7}
      >
        <View style={styles.rideIconContainer}>
          {renderVehicleIcon('taxi', 24, selectedRideType === 'taxi' ? '#FFFFFF' : '#333333')}
        </View>
        <View style={styles.rideInfoContainer}>
          <Text style={[
            styles.rideTypeText,
            selectedRideType === 'taxi' && styles.selectedRideTypeText,
          ]}>Taxi</Text>
          <Text style={[
            styles.rideDetailsText,
            selectedRideType === 'taxi' && styles.selectedRideDetailsText,
          ]}>4 seats</Text>
          <Text style={styles.ridePriceText}>
            {dynamicPrices.taxi > 0 ? `₹${dynamicPrices.taxi}/km` : 'Loading...'}
          </Text>
        </View>
        {selectedRideType === 'taxi' && (
          <View style={styles.checkmarkContainer}>
            <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.rideTypeButton,
          selectedRideType === 'bike' && styles.selectedRideTypeButton,
        ]}
        onPress={() => setSelectedRideType('bike')}
        activeOpacity={0.7}
      >
        <View style={styles.rideIconContainer}>
          {renderVehicleIcon('bike', 24, selectedRideType === 'bike' ? '#FFFFFF' : '#333333')}
        </View>
        <View style={styles.rideInfoContainer}>
          <Text style={[
            styles.rideTypeText,
            selectedRideType === 'bike' && styles.selectedRideTypeText,
          ]}>Motorcycle</Text>
          <Text style={[
            styles.rideDetailsText,
            selectedRideType === 'bike' && styles.selectedRideDetailsText,
          ]}>1 person</Text>
          <Text style={styles.ridePriceText}>
            {dynamicPrices.bike > 0 ? `₹${dynamicPrices.bike}/km` : 'Loading...'}
          </Text>
        </View>
        {selectedRideType === 'bike' && (
          <View style={styles.checkmarkContainer}>
            <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

interface LocationType {
  latitude: number;
  longitude: number;
}

interface SuggestionType {
  id: string;
  name: string;
  address: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface DriverType {
  driverId: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  vehicleType: string;
  status?: string;
  driverMobile?: string;
  _lastUpdate?: number;
  _isActiveDriver?: boolean;
}

interface TaxiContentProps {
  loadingLocation?: boolean;
  currentLocation: LocationType | null;
  lastSavedLocation: LocationType | null;
  pickup: string;
  dropoff: string;
  handlePickupChange: (text: string) => void;
  handleDropoffChange: (text: string) => void;
}

const TaxiContent: React.FC<TaxiContentProps> = ({
  loadingLocation: propLoadingLocation,
  currentLocation: propCurrentLocation,
  lastSavedLocation: propLastSavedLocation,
  pickup,
  dropoff,
  handlePickupChange: propHandlePickupChange,
  handleDropoffChange: propHandleDropoffChange,
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedRideType, setSelectedRideType] = useState<string>('taxi');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [wantReturn, setWantReturn] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [travelTime, setTravelTime] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [pickupLocation, setPickupLocation] = useState<LocationType | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationType | null>(null);
  const [routeCoords, setRouteCoords] = useState<LocationType[]>([]);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "onTheWay" | "arrived" | "started" | "completed">("idle");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<LocationType | null>(null);
  const [displayedDriverLocation, setDisplayedDriverLocation] = useState<LocationType | null>(null);
  const [travelledKm, setTravelledKm] = useState(0);
  const [lastCoord, setLastCoord] = useState<LocationType | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverType[]>([]);
  const [nearbyDriversCount, setNearbyDriversCount] = useState<number>(0);
  const [pickupSuggestions, setPickupSuggestions] = useState<SuggestionType[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<SuggestionType[]>([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [dropoffLoading, setDropoffLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [pickupCache, setPickupCache] = useState<Record<string, SuggestionType[]>>({});
  const [dropoffCache, setDropoffCache] = useState<Record<string, SuggestionType[]>>({});
  const [isPickupCurrent, setIsPickupCurrent] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [driverArrivedAlertShown, setDriverArrivedAlertShown] = useState(false);
  const [rideCompletedAlertShown, setRideCompletedAlertShown] = useState(false);
  const [acceptedDriver, setAcceptedDriver] = useState<DriverType | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [driverMobile, setDriverMobile] = useState<string | null>(null);
  const [bookedAt, setBookedAt] = useState<Date | null>(null);
  const [showPickupMapModal, setShowPickupMapModal] = useState(false);
  const [showDropoffMapModal, setShowDropoffMapModal] = useState(false);
  const [showRouteDetailsModal, setShowRouteDetailsModal] = useState(false);
  const [dynamicPrices, setDynamicPrices] = useState({
    bike: 0,
    taxi: 0,
    port: 0,
  });
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billDetails, setBillDetails] = useState({
    distance: '0 km',
    travelTime: '0 mins',
    charge: 0,
    driverName: '',
    vehicleType: ''
  });
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [showDropoffSelector, setShowDropoffSelector] = useState(false);
  const [realTimeNavigationActive, setRealTimeNavigationActive] = useState(false);
  const [showLocationOverlay, setShowLocationOverlay] = useState(true);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [showSearchingPopup, setShowSearchingPopup] = useState(false);
  const [mapNeedsRefresh, setMapNeedsRefresh] = useState(false);
  const [hasClosedSearching, setHasClosedSearching] = useState(false);
  const [hidePickupAndUserLocation, setHidePickupAndUserLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  const [bookedPickupLocation, setBookedPickupLocation] = useState<LocationType | null>(null);
  const [bookingOTP, setBookingOTP] = useState<string>('');
  const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastPolylineUpdateLocation, setLastPolylineUpdateLocation] = useState<LocationType | null>(null);
  const [smoothRouteCoords, setSmoothRouteCoords] = useState<LocationType[]>([]);
  const [routeUpdateInProgress, setRouteUpdateInProgress] = useState(false);
  const [otpVerifiedAlertShown, setOtpVerifiedAlertShown] = useState(false);

  // Refs for state used in socket handlers
  const dropoffLocationRef = useRef(dropoffLocation);
  const rideStatusRef = useRef(rideStatus);
  const realTimeNavigationActiveRef = useRef(realTimeNavigationActive);
  const currentRideIdRef = useRef(currentRideId);
  const acceptedDriverRef = useRef(acceptedDriver);
  const pickupLocationRef = useRef(pickupLocation);
  const bookedPickupLocationRef = useRef(bookedPickupLocation);
  const driverArrivedAlertShownRef = useRef(driverArrivedAlertShown);
  const rideCompletedAlertShownRef = useRef(rideCompletedAlertShown);
  const selectedRideTypeRef = useRef(selectedRideType);
  const travelledKmRef = useRef(travelledKm);
  const hasClosedSearchingRef = useRef(hasClosedSearching);
  const isMountedRef = useRef(isMounted);
  const driverLocationRef = useRef<LocationType | null>(null);
  const displayedDriverLocationRef = useRef<LocationType | null>(null);
  const userInteractedWithMapRef = useRef(userInteractedWithMap);
  const lastPolylineUpdateLocationRef = useRef<LocationType | null>(null);
  const routeUpdateInProgressRef = useRef(routeUpdateInProgress);
  const smoothRouteCoordsRef = useRef<LocationType[]>([]);
  const otpVerifiedAlertShownRef = useRef(otpVerifiedAlertShown);
  
  // Update refs when state changes
  useEffect(() => {
    dropoffLocationRef.current = dropoffLocation;
  }, [dropoffLocation]);
  useEffect(() => {
    rideStatusRef.current = rideStatus;
  }, [rideStatus]);
  useEffect(() => {
    realTimeNavigationActiveRef.current = realTimeNavigationActive;
  }, [realTimeNavigationActive]);
  useEffect(() => {
    currentRideIdRef.current = currentRideId;
  }, [currentRideId]);
  useEffect(() => {
    acceptedDriverRef.current = acceptedDriver;
  }, [acceptedDriver]);
  useEffect(() => {
    pickupLocationRef.current = pickupLocation;
  }, [pickupLocation]);
  useEffect(() => {
    bookedPickupLocationRef.current = bookedPickupLocation;
  }, [bookedPickupLocation]);
  useEffect(() => {
    driverArrivedAlertShownRef.current = driverArrivedAlertShown;
  }, [driverArrivedAlertShown]);
  useEffect(() => {
    rideCompletedAlertShownRef.current = rideCompletedAlertShown;
  }, [rideCompletedAlertShown]);
  useEffect(() => {
    selectedRideTypeRef.current = selectedRideType;
  }, [selectedRideType]);
  useEffect(() => {
    travelledKmRef.current = travelledKm;
  }, [travelledKm]);
  useEffect(() => {
    hasClosedSearchingRef.current = hasClosedSearching;
  }, [hasClosedSearching]);
  useEffect(() => {
    isMountedRef.current = isMounted;
  }, [isMounted]);
  useEffect(() => {
    driverLocationRef.current = driverLocation;
  }, [driverLocation]);
  useEffect(() => {
    displayedDriverLocationRef.current = displayedDriverLocation;
  }, [displayedDriverLocation]);
  useEffect(() => {
    userInteractedWithMapRef.current = userInteractedWithMap;
  }, [userInteractedWithMap]);
  useEffect(() => {
    lastPolylineUpdateLocationRef.current = lastPolylineUpdateLocation;
  }, [lastPolylineUpdateLocation]);
  useEffect(() => {
    routeUpdateInProgressRef.current = routeUpdateInProgress;
  }, [routeUpdateInProgress]);
  useEffect(() => {
    smoothRouteCoordsRef.current = smoothRouteCoords;
  }, [smoothRouteCoords]);
  useEffect(() => {
    otpVerifiedAlertShownRef.current = otpVerifiedAlertShown;
  }, [otpVerifiedAlertShown]);
  
  const pickupDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const dropoffDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const regionChangeTimer = useRef<NodeJS.Timeout | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView | null>(null);
  const driverMarkerRef = useRef<any>(null);
  
  const fallbackLocation: LocationType = {
    latitude: 11.3312971,
    longitude: 77.7167303,
  };
  const [currentMapRegion, setCurrentMapRegion] = useState<Region | null>(null);
  
  // Track component mount status
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      if (pickupDebounceTimer.current) clearTimeout(pickupDebounceTimer.current);
      if (dropoffDebounceTimer.current) clearTimeout(dropoffDebounceTimer.current);
      if (regionChangeTimer.current) clearTimeout(regionChangeTimer.current);
    };
  }, []);
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Refresh ride data when app comes to foreground
        refreshRideData();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [appState]);
  
  // Refresh ride data when app comes to foreground
  const refreshRideData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const savedRideId = await AsyncStorage.getItem('currentRideId');
      if (savedRideId) {
        console.log('🔄 Refreshing ride data for:', savedRideId);
        socket.emit('getRideStatus', { rideId: savedRideId });
        
        if (acceptedDriverRef.current) {
          socket.emit('requestDriverLocation', { 
            rideId: savedRideId,
            driverId: acceptedDriverRef.current.driverId 
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing ride data:', error);
    }
  }, []);
  
  // Render vehicle icon function using SVG
  const renderVehicleIcon = (type: 'bike' | 'taxi' | 'port', size: number = 24, color: string = '#000000') => {
    switch (type) {
      case 'bike': 
        return <BikeIcon width={size} height={size} fill={color} />;
      case 'taxi': 
        return <TaxiIcon width={size} height={size} fill={color} />;
      case 'port': 
        return <LorryIcon width={size} height={size} fill={color} />;
      default: 
        return <TaxiIcon width={size} height={size} fill={color} />;
    }
  };
  
  // Distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };
  
  const calculateDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    return distanceKm * 1000;
  };
  
  // Real-time route calculation function
  const fetchRealTimeRoute = async (driverLocation: LocationType, dropoffLocation: LocationType) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${driverLocation.longitude},${driverLocation.latitude};${dropoffLocation.longitude},${dropoffLocation.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.code === "Ok" && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => ({ 
          latitude: lat, 
          longitude: lng 
        }));
       
        const currentDistance = (data.routes[0].distance / 1000).toFixed(2);
        const currentTime = Math.round(data.routes[0].duration / 60);
        
        console.log(`✅ Real-time Route Calculated FROM DRIVER POSITION`);
        console.log(`📏 REMAINING Distance: ${currentDistance} km`);
        console.log(`📊 Route Points: ${coords.length}`);
        
        return {
          coords,
          distance: currentDistance,
          time: currentTime
        };
      }
    } catch (error) {
      console.error('❌ Real-time route calculation failed:', error);
    }
    return null;
  };

  // Enhanced Continuous Driver Animation with Speed-Based Timing
  const animateDriverMarker = useCallback((latitude, longitude, heading = 0) => {
    if (!driverMarkerRef.current || !isMountedRef.current) return;

    const newCoordinate = { latitude, longitude };

    // Calculate driver movement distance for speed estimation
    const prev = displayedDriverLocation;
    let distanceMoved = 0;
    if (prev) {
      const R = 6371e3;
      const φ1 = prev.latitude * Math.PI / 180;
      const φ2 = latitude * Math.PI / 180;
      const Δφ = (latitude - prev.latitude) * Math.PI / 180;
      const Δλ = (longitude - prev.longitude) * Math.PI / 180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceMoved = R * c; // meters
    }

    // Calculate speed in km/h for animation timing
    const timeDiff = 2; // Assume 2 seconds between updates
    const speedKmh = distanceMoved > 0 ? (distanceMoved / 1000) / (timeDiff / 3600) : 0;
    setCurrentSpeed(speedKmh);

    // Dynamic animation duration based on speed - CONTINUOUS MOVEMENT
    let animationDuration = 2000; // Base 2 seconds for smooth continuous movement
    
    if (speedKmh > 0) {
      if (speedKmh < 10) animationDuration = 3000; // slow movement - longer duration
      else if (speedKmh < 30) animationDuration = 2000; // medium movement
      else if (speedKmh < 60) animationDuration = 1500; // fast movement
      else animationDuration = 1000; // very fast movement
    }

    console.log(`🚗 Driver Speed: ${speedKmh.toFixed(1)} km/h | Animation: ${animationDuration}ms`);

    // Update displayed location immediately for smooth animation
    setDisplayedDriverLocation(newCoordinate);

    // Animate marker (Android)
    if (Platform.OS === 'android' && driverMarkerRef.current) {
      driverMarkerRef.current.animateMarkerToCoordinate(newCoordinate, animationDuration);
    }

    console.log(`📍 Driver location animated: [${newCoordinate.latitude.toFixed(5)}, ${newCoordinate.longitude.toFixed(5)}]`);
  }, [displayedDriverLocation]);

  // Smooth Polyline Animation Function
  const animatePolylineSmoothly = useCallback((newCoords: LocationType[]) => {
    if (!isMountedRef.current || newCoords.length === 0) return;

    console.log('🔄 Starting smooth polyline animation');

    // Use immediate update for smooth transition
    setRouteCoords(newCoords);
    
    console.log('✅ Smooth polyline animation completed');

  }, []);

  // Progressive Route Update Animation
  const animateRouteProgressiveUpdate = useCallback((oldCoords: LocationType[], newCoords: LocationType[]) => {
    if (!isMountedRef.current) return;

    console.log('🔄 Starting progressive route update animation');

    // Immediate smooth update without progressive steps
    setRouteCoords(newCoords);
    
    console.log('✅ Progressive route animation completed');

  }, []);

  // Bounce Animation for Driver Marker (when driver arrives)
  const animateDriverBounce = useCallback(() => {
    if (!driverMarkerRef.current || !isMountedRef.current) return;

    console.log('🎯 Starting driver bounce animation');

    // Create a simple bounce effect by temporarily scaling
    const bounceAnim = new Animated.Value(1);

    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Enhanced Real-time Route Update with Smooth Animation
  const updateRouteWithAnimation = useCallback(async (driverLoc: LocationType, dropoffLoc: LocationType) => {
    if (!isMountedRef.current || routeUpdateInProgressRef.current) return;

    try {
      console.log('🔄 Fetching route with smooth animation');
      setRouteUpdateInProgress(true);
      
      const routeData = await fetchRealTimeRoute(driverLoc, dropoffLoc);
      
      if (routeData && isMountedRef.current) {
        console.log(`✅ Route fetched: ${routeData.coords.length} points`);
        
        // Get current route coordinates for smooth transition
        const currentCoords = routeCoords;
        
        if (currentCoords.length > 0) {
          // Use immediate update to prevent blinking
          animateRouteProgressiveUpdate(currentCoords, routeData.coords);
        } else {
          // Use smooth polyline animation for new route
          animatePolylineSmoothly(routeData.coords);
        }
        
        setDistance(routeData.distance + " km");
        setTravelTime(routeData.time + " mins");
        await AsyncStorage.setItem("rideRouteCoords", JSON.stringify(routeData.coords));
      }
    } catch (error) {
      console.error('❌ Error updating route with animation:', error);
    } finally {
      setRouteUpdateInProgress(false);
    }
  }, [routeCoords, animateRouteProgressiveUpdate, animatePolylineSmoothly]);

  // Smooth Map Following Animation with Zoom Limits
  const animateMapToDriver = useCallback((driverCoord: LocationType, duration: number = 500) => {
    if (!mapRef.current || !isMountedRef.current || userInteractedWithMapRef.current) return;

    console.log('🗺️ Animating map to follow driver');

    // Apply zoom limits
    const latitudeDelta = Math.max(0.01, Math.min(0.1, 0.015)); // 1km to 10km range
    const longitudeDelta = Math.max(0.01, Math.min(0.1, 0.015)); // 1km to 10km range

    mapRef.current.animateToRegion(
      {
        latitude: driverCoord.latitude,
        longitude: driverCoord.longitude,
        latitudeDelta,
        longitudeDelta
      },
      duration
    );
  }, []);

  // Enhanced Driver Location Handler with Continuous Animation
  const handleDriverLocationUpdateWithAnimations = useCallback(async (data: any) => {
    if (!isMountedRef.current) return;

    const driverCoords = { latitude: data.lat, longitude: data.lng };

    // Update driver location immediately for real-time response
    setDriverLocation(driverCoords);

    // Animate driver marker with continuous movement
    animateDriverMarker(data.lat, data.lng, data.heading || 0);

    // Animate map to follow driver (if user hasn't interacted)
    animateMapToDriver(driverCoords, 400);

    // Update route with smooth animation during active navigation
    if (rideStatusRef.current === "started" && realTimeNavigationActiveRef.current && dropoffLocationRef.current) {
      // Only update route if driver has moved significantly or it's been a while since last update
      const shouldUpdateRoute = !lastPolylineUpdateLocationRef.current || 
        calculateDistanceInMeters(
          driverCoords.latitude,
          driverCoords.longitude,
          lastPolylineUpdateLocationRef.current.latitude,
          lastPolylineUpdateLocationRef.current.longitude
        ) > 50; // Update every 50 meters for smoother updates

      if (shouldUpdateRoute) {
        setLastPolylineUpdateLocation(driverCoords);
        await updateRouteWithAnimation(driverCoords, dropoffLocationRef.current);
      }
    }

    // Trigger bounce animation when driver arrives at pickup
    if (bookedPickupLocationRef.current && 
        rideStatusRef.current === "onTheWay" && 
        acceptedDriverRef.current && 
        data.driverId === acceptedDriverRef.current.driverId) {
      
      const distanceToPickup = calculateDistanceInMeters(
        driverCoords.latitude,
        driverCoords.longitude,
        bookedPickupLocationRef.current.latitude,
        bookedPickupLocationRef.current.longitude
      );
      
      if (distanceToPickup <= 50 && !driverArrivedAlertShownRef.current) {
        animateDriverBounce();
      }
    }

    console.log(`📍 Driver location animated continuously: [${driverCoords.latitude.toFixed(5)}, ${driverCoords.longitude.toFixed(5)}]`);
  }, [animateDriverMarker, animateMapToDriver, updateRouteWithAnimation, animateDriverBounce]);

  // CRITICAL FIX: Continuous driver location updates with smooth animation
  useEffect(() => {
    let componentMounted = true;
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE = 1000; // Update every 1 second for continuous movement

    const handleDriverLiveLocationUpdate = async (data: any) => {
      if (!componentMounted || !isMountedRef.current) return;
      
      const now = Date.now();
      if (now - lastUpdateTime < UPDATE_THROTTLE) return;
      lastUpdateTime = now;

      // Validate data freshness
      if (data.timestamp) {
        const dataAge = now - data.timestamp;
        if (dataAge > 10000) return;
      }

      if (!currentRideIdRef.current && (rideStatusRef.current === "completed" || rideStatusRef.current === "ended")) {
        return;
      }

      if (currentRideIdRef.current) {
        if (!acceptedDriverRef.current || data.driverId !== acceptedDriverRef.current.driverId) {
          return;
        }
      }

      // Use enhanced animation handler for continuous smooth animation
      await handleDriverLocationUpdateWithAnimations(data);

      // Save to AsyncStorage
      await AsyncStorage.setItem('driverLocation', JSON.stringify({ latitude: data.lat, longitude: data.lng }));
      await AsyncStorage.setItem('driverLocationTimestamp', Date.now().toString());

      // Update nearby drivers - FIXED: Only update if not in active ride to prevent unwanted markers
      if (!currentRideIdRef.current || !acceptedDriverRef.current) {
        setNearbyDrivers((prev) => {
          if (!componentMounted || !isMountedRef.current) return prev;
          const driverIndex = prev.findIndex(d => d.driverId === data.driverId);
          if (driverIndex !== -1) {
            const updatedDrivers = [...prev];
            updatedDrivers[driverIndex] = {
              ...updatedDrivers[driverIndex],
              location: { coordinates: [data.lng, data.lat] },
              status: data.status || updatedDrivers[driverIndex].status,
              vehicleType: selectedRideTypeRef.current,
              _lastUpdate: Date.now(),
            };
            return updatedDrivers;
          }
          return prev;
        });
      }

      // Check arrival conditions
      if (bookedPickupLocationRef.current && rideStatusRef.current === "onTheWay" && acceptedDriverRef.current && data.driverId === acceptedDriverRef.current.driverId) {
        const distanceToPickup = calculateDistanceInMeters(
          data.lat,
          data.lng,
          bookedPickupLocationRef.current.latitude,
          bookedPickupLocationRef.current.longitude
        );
        
        if (distanceToPickup <= 50 && !driverArrivedAlertShownRef.current) {
          setRideStatus("arrived");
          setDriverArrivedAlertShown(true);
          setShowOTPInput(true);
          animateDriverBounce();
        }
      }

      if (dropoffLocationRef.current && rideStatusRef.current === "started" && acceptedDriverRef.current && data.driverId === acceptedDriverRef.current.driverId) {
        const distanceToDropoff = calculateDistanceInMeters(
          data.lat,
          data.lng,
          dropoffLocationRef.current.latitude,
          dropoffLocationRef.current.longitude
        );
       
        if (distanceToDropoff <= 50 && !rideCompletedAlertShownRef.current) {
          socket.emit("driverReachedDestination", {
            rideId: currentRideIdRef.current,
            driverId: data.driverId,
            distance: travelledKmRef.current.toFixed(2),
          });
          setRideCompletedAlertShown(true);
        }
      }
    };

    socket.on("driverLiveLocationUpdate", handleDriverLiveLocationUpdate);
    return () => {
      componentMounted = false;
      socket.off("driverLiveLocationUpdate", handleDriverLiveLocationUpdate);
    };
  }, [handleDriverLocationUpdateWithAnimations, animateDriverBounce]);

  // Add pulse animation to active driver marker
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (currentRideId && acceptedDriver && rideStatus === "started") {
      // Start pulse animation for active driver
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop pulse animation
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }
  }, [currentRideId, acceptedDriver, rideStatus, pulseAnimation]);

  // Enhanced function to determine which drivers to show on map - FIXED TO PREVENT UNWANTED MARKERS
  const getDriversToShow = useCallback(() => {
    if (!isMountedRef.current) return [];

    // During active ride, show ONLY the accepted driver
    if (currentRideId && acceptedDriver) {
      console.log('🚗 ACTIVE RIDE: Showing only accepted driver with live updates');  
      
      // If we have displayed driver location, use that for smooth animation
      if (displayedDriverLocation && acceptedDriver.driverId) {
        return [{ 
          ...acceptedDriver, 
          location: { coordinates: [displayedDriverLocation.longitude, displayedDriverLocation.latitude] },
          vehicleType: selectedRideType,
          _isActiveDriver: true 
        }];
      }
      
      // Fallback to driver location from accepted driver data
      if (acceptedDriver.driverId) {
        return [{ 
          ...acceptedDriver, 
          vehicleType: selectedRideType,
          _isActiveDriver: true 
        }];
      }
      return [];
    }
    
    console.log('🔄 NO ACTIVE RIDE: Showing filtered nearby drivers');
    
    // Filter valid drivers for non-active ride state
    // FIXED: Added additional filtering to prevent unwanted red markers
    return nearbyDrivers
      .filter(driver => 
        driver && 
        driver.driverId && 
        driver.location && 
        driver.location.coordinates && 
        driver.location.coordinates.length === 2 &&
        driver.location.coordinates[0] !== 0 && 
        driver.location.coordinates[1] !== 0 &&
        // Additional filter: Only show drivers with proper status
        (!driver.status || ["Live", "online", "available"].includes(driver.status))
      )
      .slice(0, 15); // Limit to prevent too many markers
  }, [nearbyDrivers, currentRideId, acceptedDriver, selectedRideType, displayedDriverLocation]);

  // Fetch nearby drivers - FIXED TO PREVENT UNWANTED MARKERS
  const fetchNearbyDrivers = (latitude: number, longitude: number) => {
    if (!isMountedRef.current) return;
    
    console.log(`📍 Fetching nearby drivers for lat: ${latitude}, lng: ${longitude}`);
    
    // Don't fetch nearby drivers during active ride to prevent unwanted markers
    if (currentRideId && acceptedDriver) {
      console.log('🚗 Active ride - Skipping nearby drivers fetch');
      return;
    }
    
    if (socket && socketConnected) {
      socket.emit("requestNearbyDrivers", {
        latitude,
        longitude,
        radius: currentRideId ? 20000 : 10000,
        vehicleType: selectedRideType,
        requireLiveLocation: true
      });
    } else {
      console.log("Socket not connected, attempting to reconnect...");
      socket.connect();
      socket.once("connect", () => {
        if (!isMountedRef.current) return;
        socket.emit("requestNearbyDrivers", {
          latitude,
          longitude,
          radius: currentRideId ? 20000 : 10000,
          vehicleType: selectedRideType,
          requireLiveLocation: true
        });
      });
    }
  };
  
  // Handle nearby drivers response - FIXED TO PREVENT UNWANTED RED MARKERS
  useEffect(() => {
    const handleNearbyDriversResponse = (data: { drivers: DriverType[] }) => {
      if (!isMountedRef.current) return;
     
      console.log('📍 Received nearby drivers response:', data.drivers.length, 'drivers');
      
      if (!location) {
        console.log("❌ No location available, can't process drivers");
        return;
      }
     
      // CRITICAL FIX: During active ride, ignore nearby drivers to prevent unwanted markers
      if (currentRideId && acceptedDriver) {
        console.log('🚗 Active ride - IGNORING nearby drivers to prevent unwanted markers');
        setNearbyDrivers([]);
        setNearbyDriversCount(0);
        return;
      }
     
      const filteredDrivers = data.drivers
        .filter(driver => {
          // Enhanced filtering to prevent unwanted markers
          if (!driver || !driver.driverId || !driver.location || !driver.location.coordinates) {
            return false;
          }
          
          if (driver.status && !["Live", "online", "onRide", "available"].includes(driver.status)) {
            return false;
          }
         
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            driver.location.coordinates[1],
            driver.location.coordinates[0]
          );
          return distance <= 10;
        })
        .sort((a, b) => {
          const distA = calculateDistance(location.latitude, location.longitude, a.location.coordinates[1], a.location.coordinates[0]);
          const distB = calculateDistance(location.latitude, location.longitude, b.location.coordinates[1], b.location.coordinates[0]);
          return distA - distB;
        })
        .slice(0, 10)
        .map(driver => ({ ...driver, vehicleType: selectedRideType }));
     
      console.log('✅ Filtered drivers count:', filteredDrivers.length);
      setNearbyDrivers(filteredDrivers);
      setNearbyDriversCount(filteredDrivers.length);
    };
   
    socket.on("nearbyDriversResponse", handleNearbyDriversResponse);
    return () => {
      socket.off("nearbyDriversResponse", handleNearbyDriversResponse);
    };
  }, [location, socketConnected, currentRideId, acceptedDriver, selectedRideType]);
  
  // Clear and refetch drivers on vehicle type change
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (rideStatus === "idle" && location) {
      console.log(`🔄 Vehicle type changed to ${selectedRideType} - Clearing and refetching drivers`);
      setNearbyDrivers([]);
      setNearbyDriversCount(0);
      fetchNearbyDrivers(location.latitude, location.longitude);
    }
  }, [selectedRideType, rideStatus, location]);
  
  // Request location on component mount
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const requestLocation = async () => {
      setIsLoadingLocation(true);
      
      if (propCurrentLocation) {
        console.log(`Using current location from props:`, propCurrentLocation);
        setLocation(propCurrentLocation);
        global.currentLocation = propCurrentLocation;
        fetchNearbyDrivers(propCurrentLocation.latitude, propCurrentLocation.longitude);
        setIsLoadingLocation(false);
        return;
      }
      
      if (propLastSavedLocation) {
        console.log(`Using last saved location from props:`, propLastSavedLocation);
        setLocation(propLastSavedLocation);
        global.currentLocation = propLastSavedLocation;
        fetchNearbyDrivers(propLastSavedLocation.latitude, propLastSavedLocation.longitude);
        setIsLoadingLocation(false);
        return;
      }
      
      console.log(`Using fallback location:`, fallbackLocation);
      setLocation(fallbackLocation);
      global.currentLocation = fallbackLocation;
      fetchNearbyDrivers(fallbackLocation.latitude, fallbackLocation.longitude);
      setIsLoadingLocation(false);
     
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`Location permission denied`);
          Alert.alert("Permission Denied", "Location permission is required to proceed.");
          return;
        }
      }
     
      Geolocation.getCurrentPosition(
        (pos) => {
          if (!isMountedRef.current) return;
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          console.log(`Live location fetched successfully:`, loc);
          setLocation(loc);
          global.currentLocation = loc;
          fetchNearbyDrivers(loc.latitude, loc.longitude);
        },
        (err) => {
          console.log(`Location error:`, err.code, err.message);
          Alert.alert("Location Error", "Could not fetch location. Please try again or check your GPS settings.");
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000, distanceFilter: 10 }
      );
    };
    
    requestLocation();
  }, [propCurrentLocation, propLastSavedLocation]);
  
  // Socket connection handlers
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleConnect = async () => {
      console.log("Socket connected");
      setSocketConnected(true);
      if (location) fetchNearbyDrivers(location.latitude, location.longitude);
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          socket.emit('registerUser', { userId });
          console.log('👤 User registered with socket:', userId);
        }
      } catch (error) {
        console.error('Error registering user with socket:', error);
      }
    };
   
    const handleDisconnect = () => { 
      console.log("Socket disconnected"); 
      setSocketConnected(false); 
    };
   
    const handleConnectError = (error: Error) => { 
      console.error("Socket connection error:", error); 
      setSocketConnected(false); 
    };
   
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
   
    setSocketConnected(socket.connected);
  
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [location]);
  
  // Location update interval - only update if ride is idle or searching
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const interval = setInterval(() => {
      if (location && (rideStatus === "idle" || rideStatus === "searching")) {
        Geolocation.getCurrentPosition(
          (pos) => {
            if (!isMountedRef.current) return;
            const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setLocation(newLoc);
            
            // Only update pickup location if it's current location and ride is not booked
            if (isPickupCurrent && !currentRideId && dropoffLocation) {
              setPickupLocation(newLoc);
              fetchRoute(newLoc, dropoffLocation);
            }
            
            fetchNearbyDrivers(newLoc.latitude, newLoc.longitude);
          },
          (err) => { console.error("Live location error:", err); },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [rideStatus, isPickupCurrent, dropoffLocation, location, socketConnected, currentRideId]);
  
  // Enhanced real-time polyline updates - only for driver to dropoff after OTP verification
  useEffect(() => {
    if (rideStatus === "started" && displayedDriverLocation && dropoffLocation && realTimeNavigationActive) {
      console.log('🎯 STARTING REAL-TIME ROUTE UPDATES');
      
      let updateCount = 0;
      const updateRoute = async () => {
        if (displayedDriverLocationRef.current && isMountedRef.current) {
          console.log(`📡 Real-time route update #${++updateCount}...`);
          
          const routeData = await fetchRealTimeRoute(displayedDriverLocationRef.current, dropoffLocation);
          if (routeData && isMountedRef.current) {
            console.log(`✅ Real-time route updated: ${routeData.coords.length} points, ${routeData.distance} km remaining`);
            
            // Use smooth update without blinking
            setRouteCoords(routeData.coords);
            setDistance(routeData.distance + " km");
            setTravelTime(routeData.time + " mins");
            await AsyncStorage.setItem("rideRouteCoords", JSON.stringify(routeData.coords));
          }
        }
      };
      
      // Initial update
      updateRoute();
      
      // Set up interval for updates (every 5 seconds for better performance)
      const routeUpdateInterval = setInterval(updateRoute, 5000);
      
      return () => {
        console.log('🛑 STOPPING REAL-TIME ROUTE UPDATES');
        clearInterval(routeUpdateInterval);
      };
    }
  }, [rideStatus, displayedDriverLocation, dropoffLocation, realTimeNavigationActive]);
  
  // OTP Verified handler with real-time navigation activation - OPTIMIZED
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleOtpVerified = async (data: any) => {
      console.log('✅ OTP Verified by driver - ACTIVATING REAL-TIME NAVIGATION:', data);
      
      if (data.rideId === currentRideId && !otpVerifiedAlertShownRef.current) {
        setRideStatus("started");
        setRealTimeNavigationActive(true);
        setShowLocationOverlay(false);
        setHidePickupAndUserLocation(true);
        setOtpVerifiedAlertShown(true);
        
        // Show professional OTP verified alert
        Alert.alert(
          "OTP Verified Successfully!",
          "Your ride is starting now.",
          [{ text: "OK", onPress: () => console.log("OTP alert closed") }],
          { 
            cancelable: true,
            onDismiss: () => console.log("OTP alert dismissed")
          }
        );
        
        // Hide OTP input after verification
        setShowOTPInput(false);
        
        await AsyncStorage.setItem('hidePickupAndUserLocation', 'true');
        
        console.log('🎯 REAL-TIME NAVIGATION ACTIVATED');
        
        // Request immediate driver location
        if (acceptedDriver) {
          socket.emit('requestDriverLocation', { 
            rideId: currentRideId,
            driverId: acceptedDriver.driverId,
            priority: 'high'
          });
        }
       
        // Fetch initial live route immediately
        if (driverLocation && dropoffLocation) {
          console.log('🚀 FETCHING INITIAL LIVE ROUTE');
          const routeData = await fetchRealTimeRoute(driverLocation, dropoffLocation);
          if (routeData) {
            console.log(`✅ Initial live route: ${routeData.coords.length} points`);
            setRouteCoords(routeData.coords);
            setDistance(routeData.distance + " km");
            setTravelTime(routeData.time + " mins");
            await AsyncStorage.setItem("rideRouteCoords", JSON.stringify(routeData.coords));
          }
        }
      }
    };
    
    socket.on("otpVerified", handleOtpVerified);
    socket.on("rideStarted", handleOtpVerified);
    socket.on("driverStartedRide", handleOtpVerified);
    
    return () => {
      socket.off("otpVerified", handleOtpVerified);
      socket.off("rideStarted", handleOtpVerified);
      socket.off("driverStartedRide", handleOtpVerified);
    };
  }, [currentRideId, driverLocation, dropoffLocation, acceptedDriver]);
  
  // Driver arrival polling
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    let intervalId;
    if (rideStatus === "onTheWay" && bookedPickupLocation && driverLocation && !driverArrivedAlertShown) {
      intervalId = setInterval(() => {
        if (driverLocation && bookedPickupLocation && isMountedRef.current) {
          const distanceToPickup = calculateDistanceInMeters(
            driverLocation.latitude,
            driverLocation.longitude,
            bookedPickupLocation.latitude,
            bookedPickupLocation.longitude
          );
          console.log(`📍 Polling driver distance to pickup: ${distanceToPickup.toFixed(1)} meters`);
          if (distanceToPickup <= 50) {
            console.log('🚨 DRIVER ARRIVED ALERT TRIGGERED FROM POLLING');
            setRideStatus("arrived");
            setDriverArrivedAlertShown(true);
            setShowOTPInput(true);
            clearInterval(intervalId);
          }
        }
      }, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [rideStatus, bookedPickupLocation, driverLocation, driverArrivedAlertShown, acceptedDriver]);
  
  // ENHANCED: Ride completed handler with immediate map cleanup
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleRideCompleted = async (data: any) => {
      try {
        console.log("🎉 Ride completed event received - Showing bill immediately");
        setRideStatus("completed");
        setRealTimeNavigationActive(false);
        setShowOTPInput(false);
        setHidePickupAndUserLocation(false);
        setOtpVerifiedAlertShown(false);
        
        const finalDistance = data?.distance || travelledKm || 0;
        const finalTime = data?.travelTime || travelTime || "0 min";
        let finalCharge = data?.charge || finalDistance * (dynamicPrices[selectedRideType] || 0);
        if (finalDistance === 0) finalCharge = 0;
        
        setBillDetails({
          distance: `${finalDistance.toFixed(2)} km`,
          travelTime: finalTime,
          charge: finalCharge,
          driverName: acceptedDriver?.name || "Driver",
          vehicleType: acceptedDriver?.vehicleType || selectedRideType,
        });
        
        setShowBillModal(true);
        console.log('💰 Bill modal shown automatically');

        // CRITICAL: Clear all ride-related visual data immediately
        console.log('🧹 Clearing all visual ride data from map');
        setRouteCoords([]);
        setDriverLocation(null);
        setDisplayedDriverLocation(null);
        setPickupLocation(null);
        setDropoffLocation(null);
        setBookedPickupLocation(null);
        setDistance('');
        setTravelTime('');
        setEstimatedPrice(null);
        setAcceptedDriver(null);
        setDriverId(null);
        setDriverName(null);
        setDriverMobile(null);
        setTravelledKm(0);
        setLastCoord(null);
        setNearbyDrivers([]);
        setNearbyDriversCount(0);
        setApiError(null);
        setLastPolylineUpdateLocation(null);
        setSmoothRouteCoords([]);
        
        // Force map remount to clear all markers and routes
        setMapKey(prevKey => prevKey + 1);
        
        // Clear AsyncStorage for visual elements
        await AsyncStorage.multiRemove([
          'rideRouteCoords',
          'driverLocation',
          'driverLocationTimestamp',
          'ridePickupLocation',
          'rideDropoffLocation',
          'bookedPickupLocation'
        ]);
      } catch (error) {
        console.error('❌ Error in handleRideCompleted:', error);
      }
    };
    
    socket.on("rideCompleted", handleRideCompleted);
    return () => {
      socket.off("rideCompleted", handleRideCompleted);
    };
  }, [travelledKm, travelTime, acceptedDriver, selectedRideType, dynamicPrices]);
  
  // Ride status update handler
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleRideStatusUpdate = async (data: any) => {
      console.log('📋 Ride status update received:', data);
      if (data.rideId === currentRideId && data.status === 'completed') {
        console.log('🔄 Ride completion handled by rideCompleted event');
      }
    };
   
    socket.on("rideStatusUpdate", handleRideStatusUpdate);
    return () => {
      socket.off("rideStatusUpdate", handleRideStatusUpdate);
    };
  }, [currentRideId]);
  
  // Driver offline handler
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const healthCheckInterval = setInterval(() => {
      if (!socket.connected) {
        console.log('🔌 Socket disconnected, attempting reconnection...');
        socket.connect();
      }
      
      if (currentRideId && acceptedDriver) {
        socket.emit('requestDriverLocation', { 
          rideId: currentRideId,
          driverId: acceptedDriver.driverId 
        });
      }
    }, 5000);
    
    return () => clearInterval(healthCheckInterval);
  }, [currentRideId, acceptedDriver]);
  
  // Driver status update handler
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleDriverStatusUpdate = (data: { driverId: string; status: string }) => {
      console.log(`Driver ${data.driverId} status updated to: ${data.status}`);
      if (currentRideId && acceptedDriver && data.driverId === acceptedDriver.driverId) {
        console.log('Keeping accepted driver status as onTheWay');
        return;
      }
      
      if (data.status === "offline") {
        setNearbyDrivers(prev => prev.filter(driver => driver.driverId !== data.driverId));
        setNearbyDriversCount(prev => Math.max(0, prev - 1));
        return;
      }
      
      setNearbyDrivers(prev => prev.map(driver =>
        driver.driverId === data.driverId ? { ...driver, status: data.status } : driver
      ));
    };
   
    socket.on("driverStatusUpdate", handleDriverStatusUpdate);
    return () => socket.off("driverStatusUpdate", handleDriverStatusUpdate);
  }, [currentRideId, acceptedDriver]);
  
  // Calculate distance from start
  const calculateDistanceFromStart = useCallback(() => {
    if (!bookedAt) return 0;
    const now = new Date();
    const timeDiff = (now.getTime() - bookedAt.getTime()) / 1000 / 60;
    const averageSpeed = 30;
    const distance = (averageSpeed * timeDiff) / 60;
    return Math.max(0, distance);
  }, [bookedAt]);
  
  // Recover ride data on component mount
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const recoverRideData = async () => {
      try {
        const savedRideId = await AsyncStorage.getItem('currentRideId');
        const savedDriverData = await AsyncStorage.getItem('acceptedDriver');
        const savedRideStatus = await AsyncStorage.getItem('rideStatus');
        const savedBookedAt = await AsyncStorage.getItem('bookedAt');
        const savedBookingOTP = await AsyncStorage.getItem('bookingOTP');
        const savedPickup = await AsyncStorage.getItem('ridePickup');
        const savedDropoff = await AsyncStorage.getItem('rideDropoff');
        const savedPickupLoc = await AsyncStorage.getItem('ridePickupLocation');
        const savedBookedPickupLoc = await AsyncStorage.getItem('bookedPickupLocation');
        const savedDropoffLoc = await AsyncStorage.getItem('rideDropoffLocation');
        const savedRoute = await AsyncStorage.getItem('rideRouteCoords');
        const savedDist = await AsyncStorage.getItem('rideDistance');
        const savedTime = await AsyncStorage.getItem('rideTravelTime');
        const savedType = await AsyncStorage.getItem('rideSelectedType');
        const savedReturn = await AsyncStorage.getItem('rideWantReturn');
        const savedPrice = await AsyncStorage.getItem('rideEstimatedPrice');
        const savedHidePickupUser = await AsyncStorage.getItem('hidePickupAndUserLocation');
        const savedDriverLocation = await AsyncStorage.getItem('driverLocation');
       
        if (savedRideId) {
          console.log('🔄 Recovering ride data from storage:', savedRideId);
          setCurrentRideId(savedRideId);
         
          if (savedRideStatus) {
            const status = savedRideStatus as any;
            setRideStatus(status);
            
            if (status === "started") {
              setRealTimeNavigationActive(true);
              setShowLocationOverlay(false);
              console.log('🎯 Restored real-time navigation state');
            }
            
            if (status === 'searching') {
              setShowSearchingPopup(false);
              setHasClosedSearching(true);
              setShowOTPInput(true);
            }
          }
          
          if (savedHidePickupUser === 'true') {
            setHidePickupAndUserLocation(true);
          }
          
          if (savedBookingOTP) {
            setBookingOTP(savedBookingOTP);
          }
          if (savedBookedAt) {
            setBookedAt(new Date(savedBookedAt));
          }
         
          if (savedDriverData) {
            const driverData = JSON.parse(savedDriverData);
            setAcceptedDriver(driverData);
            setDriverName(driverData.name);
            setDriverMobile(driverData.driverMobile);
            
            if (savedDriverLocation) {
              const driverLoc = JSON.parse(savedDriverLocation);
              setDriverLocation(driverLoc);
              console.log('📍 Restored driver location:', driverLoc);
            } else if (driverData.location?.coordinates) {
              const driverLoc = {
                latitude: driverData.location.coordinates[1],
                longitude: driverData.location.coordinates[0]
              };
              setDriverLocation(driverLoc);
              console.log('📍 Using driver data location:', driverLoc);
            }
           
            if (savedRideStatus === 'onTheWay') {
              setShowOTPInput(true);
            } else if (savedRideStatus === 'arrived') {
              setShowOTPInput(true);
            } else if (savedRideStatus === 'started') {
              setShowOTPInput(false); // Hide OTP input after verification
              setRealTimeNavigationActive(true);
              setShowLocationOverlay(false);
            } else if (savedRideStatus === 'searching') {
              const bookedTime = savedBookedAt ? new Date(savedBookedAt) : new Date();
              setBookedAt(bookedTime);
              
              setShowSearchingPopup(false);
              setHasClosedSearching(true);
              setShowOTPInput(true);
              
              const pollInterval = setInterval(() => {
                if (savedRideId && isMountedRef.current) {
                  socket.emit('getRideStatus', { rideId: savedRideId });
                }
              }, 5000);
              AsyncStorage.setItem('statusPollInterval', pollInterval.toString());
             
              const acceptanceTimeout = setTimeout(() => {
                if (savedRideStatus === "searching") {
                  Alert.alert(
                    "No Driver Available",
                    "No driver has accepted your ride yet. Please try again or wait longer.",
                    [{ text: "OK", onPress: () => setRideStatus("idle") }]
                  );
                }
              }, 60000);
              AsyncStorage.setItem('acceptanceTimeout', acceptanceTimeout.toString());
            }
          }
         
          if (savedPickup) {
            propHandlePickupChange(savedPickup);
          }
          if (savedDropoff) {
            propHandleDropoffChange(savedDropoff);
          }
          
          if (savedPickupLoc) {
            const pickupLoc = JSON.parse(savedPickupLoc);
            setPickupLocation(pickupLoc);
            console.log('📍 Restored pickup location:', pickupLoc);
          }
          
          if (savedBookedPickupLoc) {
            const bookedPickupLoc = JSON.parse(savedBookedPickupLoc);
            setBookedPickupLocation(bookedPickupLoc);
            console.log('📍 Restored booked pickup location:', bookedPickupLoc);
          }
          
          if (savedDropoffLoc) {
            const dropoffLoc = JSON.parse(savedDropoffLoc);
            setDropoffLocation(dropoffLoc);
            console.log('📍 Restored dropoff location:', dropoffLoc);
          }
          
          if (savedRoute) {
            const restoredRoute = JSON.parse(savedRoute);
            console.log('🔄 Restored route with', restoredRoute.length, 'coordinates');
            setRouteCoords(restoredRoute);
            
            setTimeout(() => {
              if (mapRef.current && isMountedRef.current) {
                fitMapToMarkers();
              }
            }, 1000);
          }
          
          if (savedDist) setDistance(savedDist);
          if (savedTime) setTravelTime(savedTime);
          if (savedType) setSelectedRideType(savedType);
          if (savedReturn) setWantReturn(savedReturn === 'true');
          if (savedPrice) setEstimatedPrice(parseFloat(savedPrice));
         
          socket.emit('getRideStatus', { rideId: savedRideId });
          socket.emit('requestDriverLocation', { rideId: savedRideId });
        }
      } catch (error) {
        console.error('Error recovering ride data:', error);
      }
    };
    
    recoverRideData();
  }, []);
  
  // Save ride status to AsyncStorage
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (currentRideId) {
      AsyncStorage.setItem('rideStatus', rideStatus);
    }
  }, [rideStatus, currentRideId]);
  
  // Save booking OTP
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (bookingOTP && currentRideId) {
      AsyncStorage.setItem('bookingOTP', bookingOTP);
    }
  }, [bookingOTP, currentRideId]);
  
  // Process ride acceptance
  const processRideAcceptance = useCallback((data: any) => {
    if (!isMountedRef.current) return;
    
    console.log('🎯 PROCESSING RIDE ACCEPTANCE:', data.rideId, data.driverId);
 
    if (!data.rideId || !data.driverId) {
      console.error('❌ Invalid ride acceptance data:', data);
      return;
    }
 
    AsyncStorage.getItem('statusPollInterval').then(id => {
      if (id) {
        clearInterval(parseInt(id));
        AsyncStorage.removeItem('statusPollInterval');
      }
    });
 
    setRideStatus("onTheWay");
    setDriverId(data.driverId);
    setDriverName(data.driverName || 'Driver');
    setDriverMobile(data.driverMobile || 'N/A');
    setCurrentRideId(data.rideId);
 
    const acceptedDriverData: DriverType = {
      driverId: data.driverId,
      name: data.driverName || 'Driver',
      driverMobile: data.driverMobile || 'N/A',
      location: {
        coordinates: [data.driverLng || 0, data.driverLat || 0]
      },
      vehicleType: data.vehicleType || selectedRideType,
      status: "onTheWay"
    };
 
    console.log('👨‍💼 Setting accepted driver:', acceptedDriverData);
    setAcceptedDriver(acceptedDriverData);
 
    // CRITICAL FIX: Clear nearby drivers to prevent unwanted markers during active ride
    setNearbyDrivers([]);
    setNearbyDriversCount(0);
 
    if (data.driverLat && data.driverLng) {
      const driverLoc = {
        latitude: data.driverLat,
        longitude: data.driverLng
      };
      setDriverLocation(driverLoc);
      AsyncStorage.setItem('driverLocation', JSON.stringify(driverLoc));
      console.log('📍 Initial driver location set and saved:', driverLoc);
    }
 
    AsyncStorage.setItem('currentRideId', data.rideId);
    AsyncStorage.setItem('acceptedDriver', JSON.stringify(acceptedDriverData));
    AsyncStorage.setItem('rideStatus', 'onTheWay');
    
    if (pickupLocation) {
      AsyncStorage.setItem('ridePickupLocation', JSON.stringify(pickupLocation));
    }
    if (dropoffLocation) {
      AsyncStorage.setItem('rideDropoffLocation', JSON.stringify(dropoffLocation));
    }
    if (routeCoords.length > 0) {
      AsyncStorage.setItem('rideRouteCoords', JSON.stringify(routeCoords));
    }
    
    console.log('✅ Ride acceptance processed and saved successfully for:', data.rideId);
    
    setShowSearchingPopup(false);
    setShowOTPInput(true);
  }, [selectedRideType, pickupLocation, dropoffLocation, routeCoords]);
  
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const saveInterval = setInterval(async () => {
      try {
        const stateBatch: [string, string][] = [];
        
        if (pickupLocation) {
          stateBatch.push(['ridePickupLocation', JSON.stringify(pickupLocation)]);
        }
        if (dropoffLocation) {
          stateBatch.push(['rideDropoffLocation', JSON.stringify(dropoffLocation)]);
        }
        if (bookedPickupLocation) {
          stateBatch.push(['bookedPickupLocation', JSON.stringify(bookedPickupLocation)]);
        }
        if (driverLocation) {
          stateBatch.push(['driverLocation', JSON.stringify(driverLocation)]);
        }
        if (routeCoords.length > 0) {
          stateBatch.push(['rideRouteCoords', JSON.stringify(routeCoords)]);
        }
        if (distance) {
          stateBatch.push(['rideDistance', distance]);
        }
        if (travelTime) {
          stateBatch.push(['rideTravelTime', travelTime]);
        }
        
        if (stateBatch.length > 0) {
          await AsyncStorage.multiSet(stateBatch);
          console.log('💾 Auto-saved ride state');
        }
      } catch (error) {
        console.error('Error auto-saving state:', error);
      }
    }, 5000);
    
    return () => clearInterval(saveInterval);
  }, [currentRideId, rideStatus, pickupLocation, dropoffLocation, bookedPickupLocation, driverLocation, routeCoords, distance, travelTime]);
  
  // Global ride acceptance listener
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    console.log('🎯 Setting up GLOBAL ride acceptance listener');
    
    const handleRideAccepted = (data: any) => {
      console.log('🚨 ===== USER APP: RIDE ACCEPTED ====');
      console.log('📦 Acceptance data:', data);
      console.log('🚨 ===== END ACCEPTANCE DATA ====');
      processRideAcceptance(data);
    };
   
    socket.on("rideAccepted", handleRideAccepted);
    socket.on("rideAcceptedBroadcast", async (data) => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (data.targetUserId === userId) {
          handleRideAccepted(data);
        }
      } catch (error) {
        console.error('Error checking user ID:', error);
      }
    });
   
    return () => {
      socket.off("rideAccepted", handleRideAccepted);
      socket.off("rideAcceptedBroadcast", handleRideAccepted);
    };
  }, [processRideAcceptance]);
  
  // Critical socket event handlers
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    console.log('🔌 Setting up CRITICAL socket event handlers');
   
    const handleDriverDataResponse = (data: any) => {
      console.log('🚗 Driver data received:', data);
      if (data.success) {
        processRideAcceptance(data);
      }
    };
   
    const handleRideStatusResponse = (data: any) => {
      console.log('📋 Ride status received:', data);
      if (data.driverId) {
        processRideAcceptance(data);
      }
    };
   
    const handleBackupRideAccepted = (data: any) => {
      console.log('🔄 Backup ride acceptance:', data);
      processRideAcceptance(data);
    };
   
    socket.on("driverDataResponse", handleDriverDataResponse);
    socket.on("rideStatusResponse", handleRideStatusResponse);
    socket.on("backupRideAccepted", handleBackupRideAccepted);
   
    return () => {
      socket.off("driverDataResponse", handleDriverDataResponse);
      socket.off("rideStatusResponse", handleRideStatusResponse);
      socket.off("backupRideAccepted", handleBackupRideAccepted);
    };
  }, [selectedRideType]);
  
  // Comprehensive socket debugger
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    console.log('🔍 Starting comprehensive socket debugging');
   
    const debugAllEvents = (eventName: string, data: any) => {
      if (eventName.includes('ride') || eventName.includes('driver') || eventName.includes('Room')) {
        console.log(`📡 SOCKET EVENT [${eventName}]:`, data);
      }
    };
   
    const debugRideAccepted = (data: any) => {
      console.log('🚨🚨🚨 RIDE ACCEPTED EVENT RECEIVED 🚨🚨🚨');
      console.log('📦 Data:', JSON.stringify(data, null, 2));
      console.log('🔍 Current state:', {
        currentRideId,
        rideStatus,
        hasAcceptedDriver: !!acceptedDriver
      });
      processRideAcceptance(data);
    };
   
    const handleConnect = () => {
      console.log('✅ Socket connected - ID:', socket.id);
      setSocketConnected(true);
    };
   
    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
    };
   
    socket.onAny(debugAllEvents);
    socket.on("rideAccepted", debugRideAccepted);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
   
    console.log('🔍 Socket debuggers activated');
    return () => {
      socket.offAny(debugAllEvents);
      socket.off("rideAccepted", debugRideAccepted);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [currentRideId, rideStatus, acceptedDriver, processRideAcceptance]);
  
  // User location tracking
  const sendUserLocationUpdate = useCallback(async (latitude, longitude) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId || !currentRideId) {
        console.log('❌ Cannot send location: Missing userId or rideId');
        return;
      }
     
      console.log(`📍 SENDING USER LOCATION UPDATE: ${latitude}, ${longitude} for ride ${currentRideId}`);
      socket.emit('userLocationUpdate', {
        userId,
        rideId: currentRideId,
        latitude,
        longitude,
        timestamp: Date.now()
      });
     
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const backendUrl = getBackendUrl();
        await axios.post(`${backendUrl}/api/users/save-location`, {
          latitude,
          longitude,
          rideId: currentRideId
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      console.log('✅ User location update sent successfully');
    } catch (error) {
      console.error('❌ Error sending user location update:', error);
    }
  }, [currentRideId]);
  
  // Continuous location tracking during active rides
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    let locationInterval;
    if ((rideStatus === "onTheWay" || rideStatus === "arrived" || rideStatus === "started") && location) {
      console.log('🔄 Starting continuous user location tracking');
      locationInterval = setInterval(() => {
        if (location && isMountedRef.current) {
          sendUserLocationUpdate(location.latitude, location.longitude);
        }
      }, 5000);
    }
    
    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
        console.log('🛑 Stopped user location tracking');
      }
    };
  }, [rideStatus, location, sendUserLocationUpdate]);
  
  // Update existing location interval
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const interval = setInterval(() => {
      if (location && (rideStatus === "idle" || rideStatus === "searching" || rideStatus === "onTheWay" || rideStatus === "arrived" || rideStatus === "started") && isMountedRef.current) {
        Geolocation.getCurrentPosition(
          (pos) => {
            const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setLocation(newLoc);
            if (rideStatus === "onTheWay" || rideStatus === "arrived" || rideStatus === "started") {
              sendUserLocationUpdate(newLoc.latitude, newLoc.longitude);
            }
            // Only update pickup location if it's current location and ride is not booked
            if (isPickupCurrent && !currentRideId && dropoffLocation) {
              setPickupLocation(newLoc);
              fetchRoute(newLoc, dropoffLocation);
            }
            fetchNearbyDrivers(newLoc.latitude, newLoc.longitude);
          },
          (err) => { console.error("Live location error:", err); },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [rideStatus, isPickupCurrent, dropoffLocation, location, socketConnected, sendUserLocationUpdate, currentRideId]);
  
  // Request more frequent driver updates
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (location && socketConnected) {
      const interval = setInterval(() => {
        fetchNearbyDrivers(location.latitude, location.longitude);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [location, socketConnected, selectedRideType]);
  
  // Manual ride status polling
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (currentRideId && rideStatus === "searching") {
      console.log('🔄 Starting backup polling for ride:', currentRideId);
      const pollInterval = setInterval(() => {
        if (currentRideId && isMountedRef.current) {
          console.log('📡 Polling ride status for:', currentRideId);
          socket.emit('getRideStatus', { rideId: currentRideId }, (data) => {
            if (data.driverId) {
              processRideAcceptance(data);
            } else if (bookedAt && (new Date().getTime() - bookedAt.getTime() > 60000) && rideStatus === "searching") {
              console.log('⏰ No driver found after 60s');
              Alert.alert(
                "No Driver Available",
                "No driver has accepted your ride yet. Please try again or wait longer.",
                [{ text: "OK", onPress: () => setRideStatus("idle") }]
              );
              clearInterval(pollInterval);
              AsyncStorage.removeItem('statusPollInterval');
            }
          });
        }
      }, 3000);
     
      AsyncStorage.setItem('statusPollInterval', pollInterval.toString());
      return () => {
        clearInterval(pollInterval);
        AsyncStorage.removeItem('statusPollInterval');
      };
    }
  }, [currentRideId, rideStatus, bookedAt]);
  
  // Ensure user joins their room
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const registerUserRoom = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId && socket.connected) {
          console.log('👤 Registering user with socket room:', userId);
          socket.emit('registerUser', { userId });
          socket.emit('joinRoom', { userId });
        }
      } catch (error) {
        console.error('Error registering user room:', error);
      }
    };
   
    socket.on('connect', registerUserRoom);
    registerUserRoom();
   
    const interval = setInterval(registerUserRoom, 5000);
    return () => {
      socket.off('connect', registerUserRoom);
      clearInterval(interval);
    };
  }, []);
  
  // Socket recovery
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleReconnect = async () => {
      console.log('🔌 Socket reconnected, recovering state...');
      setSocketConnected(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          socket.emit('registerUser', { userId });
          console.log('👤 User re-registered after reconnect:', userId);
        }
        const currentRideId = await AsyncStorage.getItem('currentRideId');
        if (currentRideId) {
          socket.emit('getRideStatus', { rideId: currentRideId });
          console.log('🔄 Requesting status for current ride:', currentRideId);
        }
      } catch (error) {
        console.error('Error during socket recovery:', error);
      }
    };
   
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("connect", handleReconnect);
    };
  }, []);
  
  // Fetch route with retry
  const fetchRoute = async (pickupCoord: LocationType, dropCoord: LocationType, retryCount = 0) => {
    if (!isMountedRef.current) return;
    
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoord.longitude},${pickupCoord.latitude};${dropCoord.longitude},${dropCoord.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.code === "Ok" && data.routes.length > 0 && data.routes[0].geometry.coordinates.length >= 2) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
        setDistance((data.routes[0].distance / 1000).toFixed(2) + " km");
        setTravelTime(Math.round(data.routes[0].duration / 60) + " mins");
        
        await AsyncStorage.setItem('rideRouteCoords', JSON.stringify(coords));
        await AsyncStorage.setItem('rideDistance', (data.routes[0].distance / 1000).toFixed(2) + " km");
        await AsyncStorage.setItem('rideTravelTime', Math.round(data.routes[0].duration / 60) + " mins");
      } else {
        throw new Error("Invalid route data");
      }
    } catch (err) {
      console.error(err);
      if (retryCount < 3 && isMountedRef.current) {
        console.log(`Retrying route fetch (${retryCount + 1}/3)`);
        setTimeout(() => fetchRoute(pickupCoord, dropCoord, retryCount + 1), 1000);
      } else {
        setRouteCoords([]);
        setApiError("Network error fetching route");
        Alert.alert("Route Error", "Failed to fetch route after retries. Please check your internet or try different locations.");
      }
    }
  };
  
  // Enhanced map region handling with zoom limits
  const fitMapToMarkers = useCallback(() => {
    if (!mapRef.current || !isMountedRef.current) return;
    
    const markers = [];
    // Use booked pickup location if available, otherwise use current pickup location
    if (bookedPickupLocation && !hidePickupAndUserLocation) {
      markers.push({
        latitude: bookedPickupLocation.latitude,
        longitude: bookedPickupLocation.longitude,
      });
    } else if (pickupLocation && !hidePickupAndUserLocation) {
      markers.push({
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
      });
    }
    if (dropoffLocation) {
      markers.push({
        latitude: dropoffLocation.latitude,
        longitude: dropoffLocation.longitude,
      });
    }
    if (displayedDriverLocation) {
      markers.push({
        latitude: displayedDriverLocation.latitude,
        longitude: displayedDriverLocation.longitude,
      });
    }
    if (location && !hidePickupAndUserLocation) {
      markers.push({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
    if (markers.length === 0) return;
    
    const latitudes = markers.map(marker => marker.latitude);
    const longitudes = markers.map(marker => marker.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    // Apply zoom limits: min 4km height, max 40km height
    const latitudeDelta = Math.max(0.036, Math.min(0.36, (maxLat - minLat) * 1.2));
    const longitudeDelta = Math.max(0.036, Math.min(0.36, (maxLng - minLng) * 1.2));
    
    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta,
      longitudeDelta,
    };
    
    mapRef.current.animateToRegion(region, 1000);
  }, [pickupLocation, bookedPickupLocation, dropoffLocation, displayedDriverLocation, location, hidePickupAndUserLocation]);

  // Handle region change to enforce zoom limits
  const handleRegionChangeComplete = (region: Region) => {
    if (!isMountedRef.current) return;
    
    // Enforce zoom limits
    const minLatDelta = 0.036; // ~4km height
    const maxLatDelta = 0.36;  // ~40km height
    
    const constrainedRegion = {
      ...region,
      latitudeDelta: Math.max(minLatDelta, Math.min(maxLatDelta, region.latitudeDelta)),
      longitudeDelta: Math.max(minLatDelta, Math.min(maxLatDelta, region.longitudeDelta)),
    };
    
    setCurrentMapRegion(constrainedRegion);
    
    // If region was constrained, animate back to valid bounds
    if (region.latitudeDelta !== constrainedRegion.latitudeDelta || 
        region.longitudeDelta !== constrainedRegion.longitudeDelta) {
      setTimeout(() => {
        if (mapRef.current && isMountedRef.current) {
          mapRef.current.animateToRegion(constrainedRegion, 350);
        }
      }, 100);
    }
  };
  
  // Fetch suggestions
  const fetchSuggestions = async (query: string, type: 'pickup' | 'dropoff'): Promise<SuggestionType[]> => {
    if (!isMountedRef.current) return [];
    
    try {
      console.log(`Fetching suggestions for: ${query}`);
      const cache = type === 'pickup' ? pickupCache : dropoffCache;
      if (cache[query]) {
        console.log(`Returning cached suggestions for: ${query}`);
        return cache[query];
      }
     
      if (type === 'pickup') setPickupLoading(true);
      else setDropoffLoading(true);
     
      setSuggestionsError(null);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&countrycodes=IN`;
      console.log(`API URL: ${url}`);
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EAZYGOApp/1.0' },
      });
     
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
     
      const suggestions: SuggestionType[] = data.map((item: any) => ({
        id: item.place_id || `${item.lat}-${item.lon}`,
        name: item.display_name,
        address: extractAddress(item),
        lat: item.lat,
        lon: item.lon,
        type: item.type || 'unknown',
        importance: item.importance || 0,
      }));
      
      if (location) {
        const currentLocationSuggestion: SuggestionType = {
          id: 'current-location',
          name: 'Your Current Location',
          address: 'Use your current location',
          lat: location.latitude.toString(),
          lon: location.longitude.toString(),
          type: 'current',
          importance: 1,
        };
        suggestions.unshift(currentLocationSuggestion);
      }
     
      if (type === 'pickup') setPickupCache(prev => ({ ...prev, [query]: suggestions }));
      else setDropoffCache(prev => ({ ...prev, [query]: suggestions }));
     
      return suggestions;
    } catch (error: any) {
      console.error('Suggestions fetch error:', error);
      setSuggestionsError(error.message || 'Failed to fetch suggestions');
      return [];
    } finally {
      if (type === 'pickup') setPickupLoading(false);
      else setDropoffLoading(false);
    }
  };
  
  // Extract address
  const extractAddress = (item: any): string => {
    if (item.address) {
      const parts = [];
      if (item.address.road) parts.push(item.address.road);
      if (item.address.suburb) parts.push(item.address.suburb);
      if (item.address.city || item.address.town || item.address.village) parts.push(item.address.city || item.address.town || item.address.village);
      if (item.address.state) parts.push(item.address.state);
      if (item.address.postcode) parts.push(item.address.postcode);
      return parts.join(', ');
    }
    return item.display_name;
  };
  
  // Handle pickup change
  const handlePickupChange = (text: string) => {
    if (!isMountedRef.current) return;
    
    console.log(`handlePickupChange called with: "${text}"`);
    propHandlePickupChange(text);
    if (pickupDebounceTimer.current) {
      clearTimeout(pickupDebounceTimer.current);
      pickupDebounceTimer.current = null;
    }
    if (text.length > 2) {
      setPickupLoading(true);
      setShowPickupSuggestions(true);
      pickupDebounceTimer.current = setTimeout(async () => {
        if (isMountedRef.current) {
          const sugg = await fetchSuggestions(text, 'pickup');
          setPickupSuggestions(sugg);
          setPickupLoading(false);
        }
      }, 500);
    } else {
      setShowPickupSuggestions(false);
      setPickupSuggestions([]);
    }
  };
  
  // Handle dropoff change
  const handleDropoffChange = (text: string) => {
    if (!isMountedRef.current) return;
    
    console.log(`handleDropoffChange called with: "${text}"`);
    propHandleDropoffChange(text);
    if (dropoffDebounceTimer.current) {
      clearTimeout(dropoffDebounceTimer.current);
      dropoffDebounceTimer.current = null;
    }
    if (text.length > 2) {
      setDropoffLoading(true);
      setShowDropoffSuggestions(true);
      dropoffDebounceTimer.current = setTimeout(async () => {
        if (isMountedRef.current) {
          const sugg = await fetchSuggestions(text, 'dropoff');
          setDropoffSuggestions(sugg);
          setDropoffLoading(false);
        }
      }, 500);
    } else {
      setShowDropoffSuggestions(false);
      setDropoffSuggestions([]);
    }
  };
  
  // Select pickup suggestion
  const selectPickupSuggestion = (suggestion: SuggestionType) => {
    if (!isMountedRef.current) return;
    
    if (suggestion.type === 'current') {
      handleAutofillPickup();
      setShowPickupSuggestions(false);
      return;
    }
  
    propHandlePickupChange(suggestion.name);
    const newPickupLocation = { latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) };
    setPickupLocation(newPickupLocation);
    setShowPickupSuggestions(false);
    setIsPickupCurrent(false);
    if (dropoffLocation) fetchRoute(newPickupLocation, dropoffLocation);
    fetchNearbyDrivers(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
  };
  
  // Select dropoff suggestion
  const selectDropoffSuggestion = (suggestion: SuggestionType) => {
    if (!isMountedRef.current) return;
    
    if (suggestion.type === 'current') {
      handleAutofillDropoff();
      setShowDropoffSuggestions(false);
      return;
    }
    
    propHandleDropoffChange(suggestion.name);
    const newDropoffLocation = { latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) };
    console.log("Setting dropoffLocation to:", newDropoffLocation);
    setDropoffLocation(newDropoffLocation);
    setShowDropoffSuggestions(false);
    if (pickupLocation) fetchRoute(pickupLocation, newDropoffLocation);
  };
  
  // Handle autofill pickup
  const handleAutofillPickup = () => {
    if (!isMountedRef.current) return;
    
    if (location) {
      reverseGeocode(location.latitude, location.longitude).then(addr => {
        if (addr && isMountedRef.current) {
          propHandlePickupChange(addr);
          setPickupLocation(location);
          setIsPickupCurrent(true);
          
          if (showPickupSelector) {
            setShowPickupSelector(false);
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.036,
                longitudeDelta: 0.036,
              }, 1000);
            }
          }
          
          if (dropoffLocation) fetchRoute(location, dropoffLocation);
        }
      });
    }
  };
  
  // Handle autofill dropoff
  const handleAutofillDropoff = () => {
    if (!isMountedRef.current) return;
    
    if (location) {
      reverseGeocode(location.latitude, location.longitude).then(addr => {
        if (addr && isMountedRef.current) {
          propHandleDropoffChange(addr);
          const newDropoffLocation = { ...location };
          console.log("Setting dropoffLocation to current location:", newDropoffLocation);
          setDropoffLocation(newDropoffLocation);
          
          if (showDropoffSelector) {
            setShowDropoffSelector(false);
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.036,
                longitudeDelta: 0.036,
              }, 1000);
            }
          }
          
          if (pickupLocation) fetchRoute(pickupLocation, newDropoffLocation);
        }
      });
    }
  };
  
  // Update price
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const updatePrice = async () => {
      if (pickupLocation && dropoffLocation && distance) {
        const price = await calculatePrice();
        setEstimatedPrice(price);
      }
    };
    updatePrice();
  }, [pickupLocation, dropoffLocation, selectedRideType, wantReturn, distance]);
  
  // Panel animation
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (showPricePanel) {
      Animated.timing(panelAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(panelAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showPricePanel]);
  
  // Fetch ride price
  const fetchRidePrice = async (vehicleType: string, distance: number) => {
    const pricePerKm = dynamicPrices[vehicleType];
    if (!pricePerKm || pricePerKm === 0) {
      console.log(`⏳ Waiting for ${vehicleType} price from admin...`);
      return 0;
    }
    const calculatedPrice = distance * pricePerKm;
    console.log(`💰 Price calculation: ${distance}km ${vehicleType} × ₹${pricePerKm}/km = ₹${calculatedPrice}`);
    return calculatedPrice;
  };
  
  // Calculate price
  const calculatePrice = async (): Promise<number | null> => {
    if (!pickupLocation || !dropoffLocation || !distance) {
      console.log('❌ Missing location data for price calculation');
      return null;
    }
   
    const distanceKm = parseFloat(distance);
    console.log('\n💰 PRICE CALCULATION DEBUG:');
    console.log(`📏 Distance: ${distanceKm}km`);
    console.log(`🚗 Vehicle Type: ${selectedRideType}`);
    console.log(`🏍️ BIKE Price/km: ₹${dynamicPrices.bike}`);
    console.log(`🚕 TAXI Price/km: ₹${dynamicPrices.taxi}`);
    console.log(`🚛 PORT Price/km: ₹${dynamicPrices.port}`);
    console.log('─────────────────────────────────────');
   
    try {
      const pricePerKm = dynamicPrices[selectedRideType];
      console.log(`💰 Using price per km: ₹${pricePerKm} for ${selectedRideType}`);
     
      if (!pricePerKm || pricePerKm === 0) {
        console.log('⏳ Waiting for admin prices to be loaded...');
        console.log('🚫 Booking blocked until prices are received from admin');
        return null;
      }
     
      const calculatedPrice = distanceKm * pricePerKm;
      const multiplier = wantReturn ? 2 : 1;
      const finalPrice = Math.round(calculatedPrice * multiplier);
      console.log(`✅ Final price calculated: ${distanceKm}km × ₹${pricePerKm}/km × ${multiplier} = ₹${finalPrice}`);
      return finalPrice;
    } catch (error) {
      console.error('❌ Error calculating price:', error);
      return null;
    }
  };
  
  // Price update handler
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handlePriceUpdate = (data: { bike: number; taxi: number; port: number }) => {
      console.log('📡 Received REAL-TIME price update from admin:', data);
      setDynamicPrices({
        bike: data.bike,
        taxi: data.taxi,
        port: data.port,
      });
     
      console.log('🔄 PRICES UPDATED SUCCESSFULLY:');
      console.log(`🏍️ BIKE: ₹${data.bike}/km`);
      console.log(`🚕 TAXI: ₹${data.taxi}/km`);
      console.log(`🚛 PORT: ₹${data.port}/km`);
     
      if (pickupLocation && dropoffLocation && distance) {
        console.log('🔄 Recalculating price with new admin rates...');
        calculatePrice();
      }
    };
   
    socket.on('priceUpdate', handlePriceUpdate);
    return () => {
      socket.off('priceUpdate', handlePriceUpdate);
    };
  }, [pickupLocation, dropoffLocation, distance]);
  
  // Request prices on component mount
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    console.log('📡 Requesting current prices from admin...');
    socket.emit('getCurrentPrices');
  
    const handleCurrentPrices = (data: { bike: number; taxi: number; port: number }) => {
      console.log('📡 Received current prices:', data);
      setDynamicPrices(data);
    };
   
    socket.on('currentPrices', handleCurrentPrices);
    return () => {
      socket.off('currentPrices', handleCurrentPrices);
    };
  }, []);
  
  // Handle book ride
  const handleBookRide = async () => {
    if (!isMountedRef.current) return;
    
    if (isBooking) {
      console.log('⏭️ Ride booking already in progress, skipping duplicate');
      return;
    }
    setShowRouteDetailsModal(true);
  };

const handleConfirmBookingFromModal = async () => {
  try {
    console.log('🚨 ===== REAL RIDE BOOKING START =====');
    
    // ✅ ADD DEBUG LOGS TO CHECK LOCATIONS
    console.log('📍 Pickup Location:', pickupLocation);
    console.log('📍 Dropoff Location:', dropoffLocation);
    console.log('📱 User ID:', await AsyncStorage.getItem('userId'));
    
    // Get user data from AsyncStorage
    const userId = await AsyncStorage.getItem('userId');
    const customerId = await AsyncStorage.getItem('customerId');
    const userName = await AsyncStorage.getItem('userName');
    const userMobile = await AsyncStorage.getItem('userMobile');
    const token = await AsyncStorage.getItem('authToken');

    // ✅ Validate required data with better error messages
    if (!userId) {
      Alert.alert("Booking Error", "User ID not found. Please login again.");
      return;
    }
    
    if (!pickupLocation) {
      Alert.alert("Booking Error", "Please select a pickup location.");
      return;
    }
    
    if (!dropoffLocation) {
      Alert.alert("Booking Error", "Please select a dropoff location.");
      return;
    }

    // ✅ Use LAST 4 DIGITS of customerId as OTP
    let otp = '';
    if (customerId && customerId.length >= 4) {
      otp = customerId.slice(-4);
    } else if (userId && userId.length >= 4) {
      otp = userId.slice(-4);
    } else {
      otp = Date.now().toString().slice(-4);
    }

    // Rest of your booking code...
    const rideData = {
      userId,
      customerId: customerId || userId,
      userName: userName || 'User',
      userMobile: userMobile || 'N/A',
      pickup: {
        lat: pickupLocation.latitude,
        lng: pickupLocation.longitude,
        address: pickup,
      },
      drop: {
        lat: dropoffLocation.latitude,
        lng: dropoffLocation.longitude,
        address: dropoff,
      },
      vehicleType: selectedRideType,
      otp,
      estimatedPrice,
      distance: distance.replace(' km', ''),
      travelTime: travelTime.replace(' mins', ''),
      wantReturn,
      token,
      
      // FCM flags
      _fcmRequired: true,
      _sendFCM: true,
      _notifyAllDrivers: true,
      _source: 'user_app',
      _timestamp: Date.now(),
    };

    console.log('📦 Sending ride data with locations confirmed');
    
    // Set booking state
    setIsBooking(true);
    setRideStatus("searching");
    
    socket.emit('bookRide', rideData, (response) => {
        console.log('📨 Server response:', response);
        
        if (response && response.success) {
          console.log('✅ Ride booked successfully');
          console.log('📱 FCM Push Notification Status:', response.fcmSent ? 'SENT' : 'NOT SENT');
          console.log('👥 Drivers Notified:', response.driversNotified || 0);
          
          if (response.fcmSent) {
            console.log('🎯 FCM successfully sent to drivers');
            // Show success message with FCM status
           
          } else {
            console.log('⚠️ FCM notification failed');
            console.log('🔍 Reason:', response.fcmMessage || 'Unknown error');
            
            // Still show success but with warning
            Alert.alert(
              "Ride Booked!",
              "Your ride is booked. Searching for drivers..."
            );
          }
          
          setCurrentRideId(response.rideId);
          setBookingOTP(otp);
          setShowSearchingPopup(true);
          setShowOTPInput(true);
          
          // Save ride data to AsyncStorage
          AsyncStorage.setItem('currentRideId', response.rideId);
          AsyncStorage.setItem('bookingOTP', otp);
          AsyncStorage.setItem('rideStatus', 'searching');
          
        } else {
          console.log('❌ Ride booking failed');
          Alert.alert(
            "Booking Failed", 
            response?.message || "Failed to book ride. Please try again."
          );
          setRideStatus("idle");
          setIsBooking(false);
        }
      });
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      Alert.alert("Booking Error", "An error occurred while booking. Please try again.");
      setRideStatus("idle");
      setIsBooking(false);
    }
  };

  const triggerSimpleFCM = async () => {
    try {
      if (!currentRideId) {
        console.log('❌ No current ride ID for FCM');
        return;
      }
      
      console.log('🔄 SIMPLE FCM trigger for ride:', currentRideId);
      
      // Simple FCM payload that backend understands
      const fcmPayload = {
        rideId: currentRideId,
        action: 'retry_fcm',
        timestamp: Date.now()
      };
      
      socket.emit('manualFCMTrigger', fcmPayload, (response) => {
        console.log('📨 Simple FCM response:', response);
        if (response && response.success) {
          console.log('✅ Simple FCM triggered successfully');
        } else {
          console.log('❌ Simple FCM failed:', response?.message);
        }
      });
      
    } catch (error) {
      console.error('❌ Simple FCM trigger error:', error);
    }
  };

  // Add this useEffect to debug FCM issues
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Listen for FCM notification status
    const handleFCMStatus = (data: { 
      rideId: string; 
      fcmSent: boolean; 
      driversNotified: number;
      message: string;
      driverTokens?: string[];
      failedTokens?: string[];
    }) => {
      console.log('📱 FCM NOTIFICATION STATUS:', data);
      
      if (data.rideId === currentRideId) {
        if (data.fcmSent) {
          console.log(`✅ FCM SUCCESS: Sent to ${data.driversNotified} drivers`);
          if (data.driverTokens && data.driverTokens.length > 0) {
            console.log('📋 SUCCESSFUL Driver tokens:', data.driverTokens);
          }
        } else {
          console.log(`❌ FCM FAILED: ${data.message}`);
          if (data.failedTokens && data.failedTokens.length > 0) {
            console.log('🚫 FAILED Driver tokens:', data.failedTokens);
          }
          // Auto-retry FCM after 3 seconds
          setTimeout(() => {
            triggerManualFCM();
          }, 3000);
        }
      }
    };

    // Listen for FCM retry results
    const handleFCMRetry = (data: { 
      rideId: string; 
      success: boolean; 
      message: string;
      driversNotified: number;
    }) => {
      console.log('🔄 FCM RETRY RESULT:', data);
      
      if (data.rideId === currentRideId) {
        if (data.success) {
          console.log(`✅ FCM RETRY SUCCESS: Notified ${data.driversNotified} drivers`);
        } else {
          console.log(`❌ FCM RETRY FAILED: ${data.message}`);
        }
      }
    };

    socket.on('fcmNotificationStatus', handleFCMStatus);
    socket.on('fcmRetryResult', handleFCMRetry);
    
    return () => {
      socket.off('fcmNotificationStatus', handleFCMStatus);
      socket.off('fcmRetryResult', handleFCMRetry);
    };
  }, [currentRideId]);

  // 🔹 Debug FCM events
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handleFCMDebug = (data: any) => {
      if (
        (data.event && data.event.includes('fcm')) ||
        (data.event && data.event.includes('FCM'))
      ) {
        console.log('🔍 FCM DEBUG EVENT:', data);
      }
    };

    socket.onAny(handleFCMDebug);

    return () => {
      socket.offAny(handleFCMDebug);
    };
  }, []);

  // 🔹 Listen for FCM retry results
  useEffect(() => {
    const handleFCMStatus = (data: any) => {
      console.log('📩 FCM STATUS:', data);
    };

    const handleFCMRetry = (data: {
      rideId: string;
      success: boolean;
      message: string;
      driversNotified: number;
    }) => {
      console.log('🔄 FCM RETRY RESULT:', data);

      if (data.rideId === currentRideId && data.success) {
        console.log(
          `✅ FCM retry successful - notified ${data.driversNotified} drivers`
        );
      }
    };

    socket.on('fcmNotificationStatus', handleFCMStatus);
    socket.on('fcmRetryResult', handleFCMRetry);

    return () => {
      socket.off('fcmNotificationStatus', handleFCMStatus);
      socket.off('fcmRetryResult', handleFCMRetry);
    };
  }, [currentRideId]);

  
  const triggerManualFCM = async () => {
    try {
      if (!currentRideId) {
        console.log('❌ No current ride ID');
        return;
      }
      
      console.log('🔄 Manually triggering FCM for ride:', currentRideId);
      
      socket.emit('manualFCMTrigger', {
        rideId: currentRideId,
        pickup: pickup,
        drop: dropoff,
        fare: estimatedPrice,
        distance: distance,
        vehicleType: selectedRideType,
        timestamp: Date.now()
      }, (response) => {
        console.log('📨 Manual FCM response:', response);
      });
      
    } catch (error) {
      console.error('❌ Manual FCM trigger error:', error);
    }
  };

 
  // Fetch user data
useEffect(() => {
  if (!isMountedRef.current) return;
  
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      const backendUrl = getBackendUrl();
      const response = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📋 User Profile Response:', response.data);
      
      const userProfile = response.data;
      
      if (userProfile.success && userProfile.user) {
        const userData = userProfile.user;
        
        console.log('👤 User Data to store:', {
          userId: userData._id,
          customerId: userData.customerId,
          userName: userData.name,
          userMobile: userData.phoneNumber,
          userAddress: userData.address
        });
        
        // ✅ FIXED: Safe storage with validation
        const storageBatch = [];
        
        // Check each value before adding to batch
        if (userData._id && userData._id !== 'undefined') {
          storageBatch.push(['userId', userData._id]);
        } else {
          console.warn('⚠️ userId is undefined or invalid');
        }
        
        if (userData.customerId && userData.customerId !== 'undefined') {
          storageBatch.push(['customerId', userData.customerId]);
        } else if (userData._id && userData._id !== 'undefined') {
          storageBatch.push(['customerId', userData._id]); // fallback to _id
        }
        
        if (userData.name && userData.name !== 'undefined') {
          storageBatch.push(['userName', userData.name]);
        } else {
          storageBatch.push(['userName', '']); // store empty string
        }
        
        if (userData.phoneNumber && userData.phoneNumber !== 'undefined') {
          storageBatch.push(['userMobile', userData.phoneNumber]);
        }
        
        if (userData.address && userData.address !== 'undefined') {
          storageBatch.push(['userAddress', userData.address]);
        } else {
          storageBatch.push(['userAddress', '']); // store empty string instead of undefined
        }
        
        // Only execute if we have items to store
        if (storageBatch.length > 0) {
          await AsyncStorage.multiSet(storageBatch);
          console.log('✅ User data successfully stored in AsyncStorage');
        } else {
          console.warn('⚠️ No valid user data to store');
        }
      } else {
        console.error('❌ Invalid user profile response structure');
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching user data:', error.message);
      // Don't attempt to store anything on error
    }
  };
  
  fetchUserData();
}, []);


  
  // Handle ride created
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleRideCreated = async (data) => {
      console.log('Ride created event received:', data);
      if (data.success) {
        if (data.rideId && !currentRideId) {
          setCurrentRideId(data.rideId);
        }
        await AsyncStorage.setItem('lastRideId', data.rideId || currentRideId || '');
        await AsyncStorage.setItem('ridePickup', pickup);
        await AsyncStorage.setItem('rideDropoff', dropoff);
        await AsyncStorage.setItem('ridePickupLocation', JSON.stringify(pickupLocation));
        await AsyncStorage.setItem('bookedPickupLocation', JSON.stringify(bookedPickupLocation));
        await AsyncStorage.setItem('rideDropoffLocation', JSON.stringify(dropoffLocation));
        await AsyncStorage.setItem('rideRouteCoords', JSON.stringify(routeCoords));
        await AsyncStorage.setItem('rideDistance', distance);
        await AsyncStorage.setItem('rideTravelTime', travelTime);
        await AsyncStorage.setItem('rideSelectedType', selectedRideType);
        await AsyncStorage.setItem('rideWantReturn', wantReturn ? 'true' : 'false');
        await AsyncStorage.setItem('rideEstimatedPrice', estimatedPrice?.toString() || '');
        setBookingOTP(data.otp);
        setRideStatus("searching");
        AsyncStorage.setItem('rideStatus', 'searching');
        
        // Directly show the searching popup and OTP input without confirmation modal
        setShowSearchingPopup(true);
        setShowOTPInput(true);
      } else if (data.message) {
        Alert.alert("Booking Failed", data.message || "Failed to book ride");
        setRideStatus("idle");
        setCurrentRideId(null);
        setBookedPickupLocation(null); // Clear booked pickup location on failure
      }
    };
   
    socket.on("rideCreated", handleRideCreated);
    return () => {
      socket.off("rideCreated", handleRideCreated);
    };
  }, [currentRideId, pickup, dropoff, pickupLocation, bookedPickupLocation, dropoffLocation, routeCoords, distance, travelTime, selectedRideType, wantReturn, estimatedPrice]);
  
  // Format phone number to show only first 2 and last 4 digits
  const formatPhoneNumber = (phoneNumber: string | null): string => {
    if (!phoneNumber) return 'N/A';
    if (phoneNumber.length <= 6) return phoneNumber;
    const firstTwo = phoneNumber.substring(0, 2);
    const lastFour = phoneNumber.substring(phoneNumber.length - 4);
    const middleStars = '*'.repeat(phoneNumber.length - 6);
    return `${firstTwo}${middleStars}${lastFour}`;
  };
  
  // Handle phone call
  const handlePhoneCall = () => {
    if (acceptedDriver && acceptedDriver.driverMobile) {
      Linking.openURL(`tel:${acceptedDriver.driverMobile}`)
        .catch(err => console.error('Error opening phone dialer:', err));
    }
  };
  
  // Render suggestion item
  const renderSuggestionItem = (item: SuggestionType, onSelect: () => void, key: string) => {
    let iconName = 'location-on';
    let iconColor = '#A9A9A9';
    
    if (item.type === 'current') {
      iconName = 'my-location';
      iconColor = '#4CAF50';
    } else if (item.type.includes('railway') || item.type.includes('station')) { 
      iconName = 'train'; 
      iconColor = '#3F51B5'; 
    } else if (item.type.includes('airport')) { 
      iconName = 'flight'; 
      iconColor = '#2196F3'; 
    } else if (item.type.includes('bus')) { 
      iconName = 'directions-bus'; 
      iconColor = '#FF9800'; 
    } else if (item.type.includes('hospital')) { 
      iconName = 'local-hospital'; 
      iconColor = '#F44336'; 
    } else if (item.type.includes('school') || item.type.includes('college')) { 
      iconName = 'school'; 
      iconColor = '#4CAF50'; 
    } else if (item.type.includes('place_of_worship')) { 
      iconName = 'church'; 
      iconColor = '#9C27B0'; 
    } else if (item.type.includes('shop') || item.type.includes('mall')) { 
      iconName = 'shopping-mall'; 
      iconColor = '#E91E63'; 
    } else if (item.type.includes('park')) { 
      iconName = 'park'; 
      iconColor = '#4CAF50'; 
    }
   
    return (
      <TouchableOpacity key={key} style={styles.suggestionItem} onPress={onSelect}>
        <MaterialIcons name={iconName as any} size={20} color={iconColor} style={styles.suggestionIcon} />
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionMainText} numberOfLines={1}>{extractMainName(item.name)}</Text>
          <Text style={styles.suggestionSubText} numberOfLines={1}>{item.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Extract main name
  const extractMainName = (fullName: string): string => {
    const parts = fullName.split(',');
    return parts[0].trim();
  };
  
  // Check if book ride button is enabled
  const isBookRideButtonEnabled = pickup && dropoff && selectedRideType && estimatedPrice !== null;
  
  // Reverse geocode
  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&countrycodes=IN`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EAZYGOApp/1.0' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  };
  
  const handleMapSelectionDone = async (isPickup: boolean) => {
    if (!isMountedRef.current) return;
    
    if (currentMapRegion) {
      const addr = await reverseGeocode(currentMapRegion.latitude, currentMapRegion.longitude);
      if (addr) {
        if (isPickup) {
          propHandlePickupChange(addr);
          const newPickupLocation = { latitude: currentMapRegion.latitude, longitude: currentMapRegion.longitude };
          setPickupLocation(newPickupLocation);
          setIsPickupCurrent(false);
          if (dropoffLocation) fetchRoute(newPickupLocation, dropoffLocation);
          fetchNearbyDrivers(currentMapRegion.latitude, currentMapRegion.longitude);
        } else {
          const newDropoffLocation = { latitude: currentMapRegion.latitude, longitude: currentMapRegion.longitude };
          console.log("Setting dropoffLocation to:", newDropoffLocation);
          setDropoffLocation(newDropoffLocation);
          propHandleDropoffChange(addr);
          if (pickupLocation) fetchRoute(pickupLocation, newDropoffLocation);
        }
      }
      setShowPickupSelector(false);
      setShowDropoffSelector(false);
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (!isMountedRef.current) return;
    
    setPickupLocation(null);
    setDropoffLocation(null);
    setBookedPickupLocation(null);
    setRouteCoords([]);
    setDistance('');
    setTravelTime('');
    setEstimatedPrice(null);
    propHandlePickupChange('');
    propHandleDropoffChange('');
    setShowPickupSelector(false);
    setShowDropoffSelector(false);
    setShowRideOptions(false);
  };
  
  const handleCancelRide = async () => {
    if (!isMountedRef.current) return;

    setNearbyDrivers([]);
    setNearbyDriversCount(0);

    if (currentRideId) {
      socket.emit('cancelRide', { rideId: currentRideId });
    }

    setRideStatus("idle");
    setCurrentRideId(null);
    setRealTimeNavigationActive(false);
    setShowLocationOverlay(true);
    setAcceptedDriver(null);
    setDriverLocation(null);
    setDisplayedDriverLocation(null);

    setShowSearchingPopup(false);
    setShowOTPInput(false);

    AsyncStorage.getItem('statusPollInterval').then(id => {
      if (id) {
        clearInterval(parseInt(id));
        AsyncStorage.removeItem('statusPollInterval');
      }
    });

    AsyncStorage.getItem('acceptanceTimeout').then(id => {
      if (id) {
        clearTimeout(parseInt(id));
        AsyncStorage.removeItem('acceptanceTimeout');
      }
    });

    setTimeout(() => {
      if (isMountedRef.current) {
        setMapKey(prev => prev + 1);
      }
    }, 100);

    await clearRideStorage();
    Alert.alert("Ride Cancelled", "Your ride booking has been cancelled.");
  };
  
  // Handle ride cancelled from server
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const handleRideCancelled = async (data: { rideId: string }) => {
      if (data.rideId === currentRideId) {
        setRideStatus("idle");
        setCurrentRideId(null);
        setRealTimeNavigationActive(false);
        setShowLocationOverlay(true);
        setShowSearchingPopup(false);
        setShowOTPInput(false);
        await clearRideStorage();
        Alert.alert("Ride Cancelled", "Your ride has been cancelled.");
      }
    };
    socket.on("rideCancelled", handleRideCancelled);
    return () => socket.off("rideCancelled", handleRideCancelled);
  }, [currentRideId]);
  
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (mapNeedsRefresh && mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.036,
        longitudeDelta: 0.036,
      }, 1000);
      fetchNearbyDrivers(location.latitude, location.longitude);
      setMapNeedsRefresh(false);
    }
  }, [mapNeedsRefresh, location]);
  
  const handleBillModalClose = async () => {
    if (!isMountedRef.current) return;
    
    // Close modal immediately
    setShowBillModal(false);
    
    // Reset all state in a batch to minimize renders
    setRideStatus("idle");
    setCurrentRideId(null);
    setDriverId(null);
    setDriverLocation(null);
    setDisplayedDriverLocation(null);
    setAcceptedDriver(null);
    setPickupLocation(null);
    setBookedPickupLocation(null);
    setDropoffLocation(null);
    setRouteCoords([]);
    setDistance('');
    setTravelTime('');
    setEstimatedPrice(null);
    setBookingOTP('');
    setNearbyDrivers([]);
    setNearbyDriversCount(0);
    setShowOTPInput(false);
    setShowLocationOverlay(true);
    setDriverArrivedAlertShown(false);
    setRideCompletedAlertShown(false);
    setHasClosedSearching(false);
    setTravelledKm(0);
    setLastCoord(null);
    setRealTimeNavigationActive(false);
    setShowRouteDetailsModal(false);
    setHidePickupAndUserLocation(false);
    setIsBooking(false); // Reset booking state
    setLastPolylineUpdateLocation(null);
    setSmoothRouteCoords([]);
    setOtpVerifiedAlertShown(false);
    
    // Reset input fields
    propHandlePickupChange('');
    propHandleDropoffChange('');
    
    // Force map remount to clear all markers and routes instantly
    setMapKey(prevKey => prevKey + 1);
    
    // Clear AsyncStorage in background (non-blocking)
    AsyncStorage.multiRemove([
      'currentRideId', 'acceptedDriver', 'rideStatus', 'bookedAt', 'bookingOTP',
      'statusPollInterval', 'acceptanceTimeout', 'hidePickupAndUserLocation', 'ridePickup', 'rideDropoff',
      'ridePickupLocation', 'bookedPickupLocation', 'rideDropoffLocation', 'rideRouteCoords', 'rideDistance',
      'rideTravelTime', 'rideSelectedType', 'rideWantReturn', 'rideEstimatedPrice',
      'driverLocation', 'driverLocationTimestamp'
    ]).then(() => {
      console.log('✅ AsyncStorage cleared - Ready for new booking');
    }).catch(err => {
      console.error('Error clearing AsyncStorage:', err);
    });
    
    console.log('✅ App reset to fresh state - All ride data cleared');
  };
  
  // Debug monitoring for animation state
  useEffect(() => {
    console.log('🔍 ANIMATION STATE DEBUG:', {
      rideStatus,
      realTimeNavigationActive,
      driverLocation: driverLocation ? `SET (${driverLocation.latitude.toFixed(5)}, ${driverLocation.longitude.toFixed(5)})` : 'NULL',
      displayedDriverLocation: displayedDriverLocation ? `SET (${displayedDriverLocation.latitude.toFixed(5)}, ${displayedDriverLocation.longitude.toFixed(5)})` : 'NULL',
      dropoffLocation: dropoffLocation ? 'SET' : 'NULL',
      nearbyDriversCount: nearbyDrivers.length,
      acceptedDriver: acceptedDriver ? 'SET' : 'NULL',
      routeCoordsLength: routeCoords.length
    });
  }, [rideStatus, realTimeNavigationActive, driverLocation, displayedDriverLocation, dropoffLocation, nearbyDrivers, acceptedDriver, routeCoords]);
  
  // Handle close searching popup
  const handleCloseSearchingPopup = () => {
    if (!isMountedRef.current) return;
    
    console.log('❌ Closing searching popup - showing OTP field only');
    setShowSearchingPopup(false);
    setHasClosedSearching(true);
    setShowOTPInput(true);
  };
  
  // Function to clear all ride-related storage
  const clearRideStorage = async () => {
    if (!isMountedRef.current) return;
    
    const rideKeys = [
      'currentRideId', 'acceptedDriver', 'rideStatus', 'bookedAt', 'bookingOTP',
      'statusPollInterval', 'acceptanceTimeout', 'ridePickup', 'rideDropoff',
      'ridePickupLocation', 'bookedPickupLocation', 'rideDropoffLocation', 'rideRouteCoords', 'rideDistance',
      'rideTravelTime', 'rideSelectedType', 'rideWantReturn', 'rideEstimatedPrice',
      'hidePickupAndUserLocation', 'driverLocation', 'driverLocationTimestamp'
    ];
    await AsyncStorage.multiRemove(rideKeys);
    console.log('🧹 Cleared all ride-related storage');
  };
  
  // Memoize route coordinates to prevent unnecessary re-renders
  const memoizedRouteCoords = useMemo(() => routeCoords, [routeCoords]);
  
  // Handle map interaction
  const handleMapInteraction = () => {
    setUserInteractedWithMap(true);
  };
  
  return (
    <View style={styles.container}>
      {isLoadingLocation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Fetching your location...</Text>
        </View>
      ) : (
        <>
          {/* Full Screen Map */}
          <View style={styles.mapContainer}>
            {location && (
              <MapView
                key={mapKey} // Force remount when mapKey changes
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location?.latitude || fallbackLocation.latitude,
                  longitude: location?.longitude || fallbackLocation.longitude,
                  latitudeDelta: 0.036,
                  longitudeDelta: 0.036,
                }}
                customMapStyle={customMapStyle}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                onRegionChangeComplete={handleRegionChangeComplete}
                followsUserLocation={rideStatus === "started"}
                showsMyLocationButton={true}
                onPanDrag={handleMapInteraction}
                onRegionChange={handleMapInteraction}
                minZoomLevel={10} // ~40km
                maxZoomLevel={16} // ~4km
              >
                {/* Pickup marker - use booked pickup location if available */}
                {(bookedPickupLocation || pickupLocation) && rideStatus !== "started" && (
                  <Marker 
                    coordinate={bookedPickupLocation || pickupLocation} 
                    title="Pickup" 
                    tracksViewChanges={false}
                  >
                    <MaterialIcons name="location-pin" size={32} color="blue" />
                  </Marker>
                )}
                
                {/* Dropoff marker - ALWAYS visible */}
                {dropoffLocation && (
                  <Marker 
                    coordinate={dropoffLocation} 
                    title="Dropoff" 
                    tracksViewChanges={false}
                  >
                    <View style={styles.dropoffMarkerContainer}>
                      <MaterialIcons name="place" size={28} color="#4CAF50" />
                    </View>
                  </Marker>
                )}
                
                {/* Route polyline - Updates smoothly */}
                {memoizedRouteCoords && memoizedRouteCoords.length > 0 && (
                  <Polyline
                    coordinates={memoizedRouteCoords}
                    strokeWidth={5}
                    strokeColor="#4CAF50"
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                
                {/* Driver markers - OPTIMIZED with smooth animation */}
                {getDriversToShow().map((driver) => {
                  // Add comprehensive null checks for driver coordinates
                  if (!driver || !driver.location || !driver.location.coordinates) {
                    return null;
                  }
                  
                  const isActiveDriver = currentRideId && acceptedDriver && driver.driverId === acceptedDriver.driverId;
  
                  return (
                    <Marker
                      key={`driver-${driver.driverId}`}
                      ref={isActiveDriver ? driverMarkerRef : null}
                      coordinate={isActiveDriver && displayedDriverLocation ? 
                        displayedDriverLocation : 
                        {
                          latitude: driver.location.coordinates[1],
                          longitude: driver.location.coordinates[0],
                        }
                      }
                      tracksViewChanges={false}
                      anchor={{ x: 0.5, y: 0.5 }}
                      flat={true}
                    >
                      <Animated.View 
                        style={[
                          styles.driverMarkerContainer,
                          isActiveDriver && {
                            transform: [{ scale: pulseAnimation }]
                          }
                        ]}
                      >
                        <View
                          style={[
                            styles.vehicleIconContainer,
                            {
                              backgroundColor: isActiveDriver ? "#FF6B00" : "#4CAF50"
                            },
                          ]}
                        >
                          {renderVehicleIcon(
                            driver.vehicleType as "bike" | "taxi" | "port",
                            20,
                            "#FFFFFF"
                          )}
                        </View>
                        {isActiveDriver && (
                          <View style={styles.activeDriverPulse} />
                        )}
                      </Animated.View>
                    </Marker>
                  );
                }).filter(Boolean)}{/* Remove any null markers */}
              </MapView>
            )}
            {/* Center Pin when selecting */}
            {(showPickupSelector || showDropoffSelector) && (
              <View style={styles.centerMarker}>
                <MaterialIcons
                  name="location-pin"
                  size={48}
                  color={showPickupSelector ? '#4CAF50' : '#4CAF50'}
                />
              </View>
            )}
            {/* Location Input Overlay - Only show when rideStatus is idle */}
            {showLocationOverlay && rideStatus === "idle" && (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
                style={styles.locationOverlay}
              >
                <View style={styles.locationOverlayContent}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputRow}>
                      <View style={styles.inputWrapper}>
                        <TouchableOpacity onPress={handleAutofillPickup} style={styles.inputIconContainer}>
                          <MaterialIcons name="my-location" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter pickup location"
                          value={pickup}
                          onChangeText={handlePickupChange}
                          placeholderTextColor="#999"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.selectMapButton}
                        onPress={() => {
                          if (showPickupSelector) {
                            handleMapSelectionDone(true);
                          }
                          setShowPickupSelector((prev) => !prev);
                          setShowDropoffSelector(false);
                        }}
                      >
                        <Text style={styles.selectMapButtonText}>
                          {showPickupSelector ? 'Done' : 'Select on Map'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {showPickupSuggestions && (
                      <View style={styles.suggestionsWrapper}>
                        <ScrollView
                          style={styles.suggestionsContainer}
                          keyboardShouldPersistTaps="handled"
                        >
                          {pickupLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="small" color="#4CAF50" />
                              <Text style={styles.loadingText}>Loading suggestions...</Text>
                            </View>
                          ) : suggestionsError ? (
                            <View style={styles.errorContainer}>
                              <Text style={styles.errorText}>{suggestionsError}</Text>
                            </View>
                          ) : pickupSuggestions.length > 0 ? (
                            pickupSuggestions.map((item) => (
                              renderSuggestionItem(item, () => selectPickupSuggestion(item), item.id)
                            ))
                          ) : (
                            <View style={styles.noSuggestionsContainer}>
                              <Text style={styles.noSuggestionsText}>No suggestions found</Text>
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    )}
                    <View style={styles.inputRow}>
                      <View style={styles.inputWrapper}>
                        <TouchableOpacity onPress={handleAutofillDropoff} style={styles.inputIconContainer}>
                          <MaterialIcons name="my-location" size={20} color="#F44336" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter dropoff location"
                          value={dropoff}
                          onChangeText={handleDropoffChange}
                          placeholderTextColor="#999"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.selectMapButton}
                        onPress={() => {
                          if (showDropoffSelector) {
                            handleMapSelectionDone(false);
                          }
                          setShowDropoffSelector((prev) => !prev);
                          setShowPickupSelector(false);
                        }}
                      >
                        <Text style={styles.selectMapButtonText}>
                          {showDropoffSelector ? 'Done' : 'Select on Map'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {showDropoffSuggestions && (
                      <View style={styles.suggestionsWrapper}>
                        <ScrollView
                          style={styles.suggestionsContainer}
                          keyboardShouldPersistTaps="handled"
                        >
                          {dropoffLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="small" color="#4CAF50" />
                              <Text style={styles.loadingText}>Loading suggestions...</Text>
                            </View>
                          ) : suggestionsError ? (
                            <View style={styles.errorContainer}>
                              <Text style={styles.errorText}>{suggestionsError}</Text>
                            </View>
                          ) : dropoffSuggestions.length > 0 ? (
                            dropoffSuggestions.map((item) => (
                              renderSuggestionItem(item, () => selectDropoffSuggestion(item), item.id)
                            ))
                          ) : (
                            <View style={styles.noSuggestionsContainer}>
                              <Text style={styles.noSuggestionsText}>No suggestions found</Text>
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                    >
                      <Text style={styles.cancelButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.bookRideButton,
                        isBookRideButtonEnabled ? styles.enabledBookRideButton : styles.disabledBookRideButton,
                      ]}
                      onPress={handleBookRide}
                      disabled={!isBookRideButtonEnabled}
                    >
                      <Text style={styles.bookRideButtonText}>BOOK RIDE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}
            {/* Minimal OTP Input at Bottom - Only shows OTP and driver name with call icon */}
            {showOTPInput && rideStatus !== "started" && (
              <View style={styles.minimalOtpContainer}>
                <View style={styles.otpRow}>
                  <Text style={styles.otpLabel}>Your OTP:</Text>
                  <Text style={styles.otpValue}>{bookingOTP}</Text>
                </View>
                <View style={styles.driverRow}>
                  <Text style={styles.driverLabel}>Your Driver:</Text>
                  <Text style={styles.driverName}>{driverName || 'Driver'}</Text>
                  <TouchableOpacity style={styles.callButton} onPress={handlePhoneCall}>
                    <MaterialIcons name="phone" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          {apiError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}
          {/* Route Details Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showRouteDetailsModal}
            onRequestClose={() => setShowRouteDetailsModal(false)}
          >
            <View style={styles.routeDetailsModalOverlay}>
              <View style={styles.routeDetailsModalContainer}>
                <View style={styles.routeDetailsModalHeader}>
                  <Text style={styles.routeDetailsModalTitle}>RIDE DETAILS</Text>
                  <TouchableOpacity onPress={() => setShowRouteDetailsModal(false)}>
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.routeDetailsContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.routeDetailsRow}>
                    <Text style={styles.routeDetailsLabel}>DISTANCE:</Text>
                    <Text style={styles.routeDetailsValue}>{distance || '---'}</Text>
                  </View>
                  <View style={styles.routeDetailsRow}>
                    <Text style={styles.routeDetailsLabel}>TRAVEL TIME:</Text>
                    <Text style={styles.routeDetailsValue}>{travelTime || '---'}</Text>
                  </View>
                  <View style={styles.routeDetailsRow}>
                    <Text style={styles.routeDetailsLabel}>PRICE:</Text>
                    <Text style={styles.routeDetailsValue}>₹{estimatedPrice || 'Calculating...'}</Text>
                  </View>
                  <View style={styles.routeDetailsDivider} />
                  <Text style={styles.availableDriversText}>Available Drivers Nearby: {nearbyDriversCount}</Text>
                  <RideTypeSelector
                    selectedRideType={selectedRideType}
                    setSelectedRideType={setSelectedRideType}
                    estimatedPrice={estimatedPrice}
                    distance={distance}
                    dynamicPrices={dynamicPrices}
                  />
                </ScrollView>
                <View style={styles.routeDetailsModalButtons}>
                  <TouchableOpacity
                    style={styles.routeDetailsCancelButton}
                    onPress={() => setShowRouteDetailsModal(false)}
                  >
                    <Text style={styles.routeDetailsCancelButtonText}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.routeDetailsConfirmButton}
                    onPress={() => {
                      setShowRouteDetailsModal(false);
                      handleConfirmBookingFromModal();
                    }}
                  >
                    <Text style={styles.routeDetailsConfirmButtonText}>BOOK RIDE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Bill Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showBillModal}
            onRequestClose={handleBillModalClose}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ride Bill</Text>
                  <TouchableOpacity onPress={handleBillModalClose}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="receipt" size={60} color="#4CAF50" />
                  </View>
                  <Text style={styles.modalMessage}>
                    Thank you for choosing EAZY GO!
                  </Text>
                  <Text style={styles.modalSubMessage}>
                    Your ride has been completed.
                  </Text>
                  <View style={styles.billDetailsContainer}>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Driver Name:</Text>
                      <Text style={styles.billValue}>{billDetails.driverName}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Vehicle Type:</Text>
                      <Text style={styles.billValue}>{billDetails.vehicleType}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Distance:</Text>
                      <Text style={styles.billValue}>{billDetails.distance}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Travel Time:</Text>
                      <Text style={styles.billValue}>{billDetails.travelTime}</Text>
                    </View>
                    <View style={styles.billDivider} />
                    <View style={styles.billRow}>
                      <Text style={styles.billTotalLabel}>Total Amount:</Text>
                      <Text style={styles.billTotalValue}>₹{billDetails.charge}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleBillModalClose}
                  >
                    <Text style={styles.modalConfirmButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Searching Overlay - Can be closed with X button */}
          {showSearchingPopup && (
            <View style={styles.searchingOverlay}>
              <View style={styles.searchingHeader}>
                <Text style={styles.searchingTitle}>Searching for Driver</Text>
                <TouchableOpacity onPress={handleCloseSearchingPopup}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <SearchingAnimation /> 
              <Text style={styles.searchingMessage}>PLEASE HOLD! WE ARE SEARCHING FOR NEARBY DRIVER FOR YOU.</Text>
              <TouchableOpacity style={styles.cancelRideButton} onPress={handleCancelRide}>
                <Text style={styles.cancelRideButtonText}>Cancel Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#443333ff', fontSize: 16, marginTop: 10 },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: { 
    ...StyleSheet.absoluteFillObject,
  },
  locationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.24,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
  locationOverlayContent: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -48 }],
    zIndex: 10,
  },
  inputContainer: {
    marginBottom: 7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 2, 
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  inputIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    paddingVertical: 10,
    color: '#333' 
  },
  selectMapButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    marginRight: 10,
  },
  selectMapButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  suggestionsWrapper: {
    maxHeight: 120,
  },
  suggestionsContainer: {
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    maxHeight: 120,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  suggestionIcon: { marginRight: 12 },
  suggestionTextContainer: { flex: 1 },
  suggestionMainText: { fontSize: 16, fontWeight: '500', color: '#333333' },
  suggestionSubText: { fontSize: 12, color: '#757575', marginTop: 2 },
  noSuggestionsContainer: { paddingVertical: 10, alignItems: 'center' },
  noSuggestionsText: { fontSize: 14, color: '#666666' },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600'
  },
  bookRideButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  enabledBookRideButton: { backgroundColor: '#4caf50' },
  disabledBookRideButton: { backgroundColor: '#BDBDBD' },
  bookRideButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    elevation: 3,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center'
  },
  dropoffMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76,175,80,0.12)',
    elevation: 2,
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2
  },
  activeDriverPulse: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6B00',
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
  minimalOtpContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    elevation: 5,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  otpValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  driverName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  callButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333'
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 20
  },
  modalIconContainer: {
    marginBottom: 15
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 5
  },
  modalSubMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center'
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666'
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center'
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  billDetailsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  billLabel: {
    fontSize: 14,
    color: '#666666'
  },
  billValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333'
  },
  billDivider: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginVertical: 10
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  billTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  routeDetailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowOpacity: 0.6,
  },
  routeDetailsModalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  routeDetailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  routeDetailsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333'
  },
  routeDetailsContent: {
    marginBottom: 15,
    maxHeight: 300,
  },
  routeDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeDetailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333'
  },
  routeDetailsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  routeDetailsDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  availableDriversText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  rideTypeContainer: {
    marginBottom: 15,
  },
  rideTypeButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 5,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  selectedRideTypeButton: {
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#4caf50'
  },
  rideIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rideInfoContainer: {
    flex: 1,
  },
  rideTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  selectedRideTypeText: {
    color: '#FFFFFF'
  },
  rideDetailsText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 6,
  },
  selectedRideDetailsText: {
    color: '#FFFFFF'
  },
  ridePriceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  routeDetailsModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  routeDetailsCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  routeDetailsCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  routeDetailsConfirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  routeDetailsConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.35,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  searchingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  searchingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  progressBar: {
    marginBottom: 10,
  },
  searchingMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
  },
  cancelRideButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  cancelRideButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TaxiContent;