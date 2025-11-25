// /Users/webasebrandings/Downloads/new-main/src/Screen1/Menuicon/MyOrders.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../../../src/util/backendConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock order data - in real app, this would come from your backend
const mockOrders = [
  {
    id: 'ORD001',
    orderDate: '2024-01-15T10:30:00Z',
    status: 'delivered',
    items: [
      {
        _id: '1',
        name: 'Wireless Bluetooth Headphones',
        price: 2999,
        quantity: 1,
        images: ['/images/headphones.jpg'],
        description: 'High-quality wireless headphones with noise cancellation'
      },
      {
        _id: '2',
        name: 'Phone Case',
        price: 499,
        quantity: 2,
        images: ['/images/phonecase.jpg'],
        description: 'Protective phone case with premium finish'
      }
    ],
    total: 3997,
    shipping: 0,
    tax: 320,
    deliveryAddress: {
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    paymentMethod: 'card'
  },
  {
    id: 'ORD002',
    orderDate: '2024-01-10T14:20:00Z',
    status: 'processing',
    items: [
      {
        _id: '3',
        name: 'Smart Watch',
        price: 5999,
        quantity: 1,
        images: ['/images/smartwatch.jpg'],
        description: 'Feature-rich smartwatch with health monitoring'
      }
    ],
    total: 5999,
    shipping: 49,
    tax: 480,
    deliveryAddress: {
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    paymentMethod: 'upi'
  },
  {
    id: 'ORD003',
    orderDate: '2024-01-05T09:15:00Z',
    status: 'cancelled',
    items: [
      {
        _id: '4',
        name: 'Laptop Bag',
        price: 1299,
        quantity: 1,
        images: ['/images/laptopbag.jpg'],
        description: 'Durable laptop bag with multiple compartments'
      }
    ],
    total: 1299,
    shipping: 49,
    tax: 104,
    deliveryAddress: {
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    paymentMethod: 'cod'
  }
];

const MyOrders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState(mockOrders);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // In a real app, you would fetch orders from your backend
      // For now, we'll use the mock data
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4caf50';
      case 'processing':
        return '#ff9800';
      case 'shipped':
        return '#2196f3';
      case 'cancelled':
        return '#e53935';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReorder = (order: any) => {
    Alert.alert(
      'Reorder',
      'Would you like to add these items to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => {
            // In a real app, you would add these items to cart
            Alert.alert('Success', 'Items added to cart!');
            navigation.navigate('Cart');
          }
        }
      ]
    );
  };

  const handleTrackOrder = (orderId: string) => {
    Alert.alert('Track Order', `Tracking order ${orderId}. This feature will be available soon.`);
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>Placed on {formatDate(item.orderDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <FlatList
        data={item.items}
        scrollEnabled={false}
        renderItem={({ item: orderItem }) => (
          <View style={styles.orderItem}>
            <Image
              source={{ 
                uri: orderItem.images && orderItem.images.length > 0 
                  ? getImageUrl(orderItem.images[0]) 
                  : 'https://via.placeholder.com/60' 
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{orderItem.name}</Text>
              <Text style={styles.itemDescription} numberOfLines={1}>
                {orderItem.description}
              </Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemPrice}>₹{orderItem.price.toFixed(2)}</Text>
                <Text style={styles.itemQuantity}>× {orderItem.quantity}</Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(orderItem) => orderItem._id}
      />

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>₹{(item.total - item.shipping - item.tax).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {item.shipping === 0 ? 'FREE' : `₹${item.shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>₹{item.tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalValue}>₹{item.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Order Actions */}
      <View style={styles.orderActions}>
        {item.status === 'delivered' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reorderButton]}
            onPress={() => handleReorder(item)}
          >
            <MaterialIcons name="replay" size={16} color="#4caf50" />
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'processing' || item.status === 'shipped' ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => handleTrackOrder(item.id)}
          >
            <MaterialIcons name="local-shipping" size={16} color="#2196f3" />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity 
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => Alert.alert('Order Details', 'Order details will be shown here')}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            You haven't placed any orders. Start shopping to see your orders here!
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Shopping')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 34,
  },
  ordersList: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4caf50',
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4caf50',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  reorderButton: {
    backgroundColor: '#f1f8e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  trackButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  detailsButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reorderButtonText: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  trackButtonText: {
    color: '#2196f3',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyOrders;