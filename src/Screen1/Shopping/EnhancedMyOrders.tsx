// /Users/webasebrandings/Downloads/new-main/src/Screen1/Shopping/EnhancedMyOrders.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../../../src/util/backendConfig';

// Mock order data - replace with actual API data
const mockOrders = [
  {
    id: 'ORD001',
    date: '2023-06-15',
    status: 'Delivered',
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
        description: 'Premium protective phone case'
      }
    ],
    total: 3997,
    shipping: 0,
    tax: 320,
    address: {
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    id: 'ORD002',
    date: '2023-06-10',
    status: 'Processing',
    items: [
      {
        _id: '3',
        name: 'Bluetooth Speaker',
        price: 1999,
        quantity: 1,
        images: ['/images/speaker.jpg'],
        description: 'Portable Bluetooth speaker with rich sound'
      }
    ],
    total: 1999,
    shipping: 49,
    tax: 160,
    address: {
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    id: 'ORD003',
    date: '2023-06-05',
    status: 'Cancelled',
    items: [
      {
        _id: '4',
        name: 'Smart Watch',
        price: 5999,
        quantity: 1,
        images: ['/images/smartwatch.jpg'],
        description: 'Feature-rich smartwatch with health monitoring'
      }
    ],
    total: 5999,
    shipping: 0,
    tax: 480,
    address: {
      name: 'John Doe',
      phone: '+91 9876543210',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
];

const EnhancedMyOrders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState(mockOrders);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const orderFilters = ['All', 'Processing', 'Delivered', 'Cancelled'];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredOrders = selectedFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#4caf50';
      case 'Processing': return '#2196f3';
      case 'Cancelled': return '#e53935';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return 'check-circle';
      case 'Processing': return 'pending';
      case 'Cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const handleReorder = (order: any) => {
    Alert.alert('Reorder', 'Items from this order have been added to your cart.');
    navigation.navigate('EnhancedCart');
  };

  const handleTrackOrder = (orderId: string) => {
    Alert.alert('Track Order', `Tracking order ${orderId}. This feature will be available soon.`);
  };

  const handleViewDetails = (order: any) => {
    navigation.navigate('OrderDetails', { order });
  };

  const renderOrderItem = ({ item }: any) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <MaterialIcons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <FlatList
        data={item.items}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: orderItem }) => (
          <View style={styles.orderItem}>
            <Image
              source={{ 
                uri: orderItem.images && orderItem.images.length > 0 
                  ? getImageUrl(orderItem.images[0]) 
                  : 'https://via.placeholder.com/80' 
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{orderItem.name}</Text>
              <Text style={styles.itemDetails}>
                ₹{orderItem.price.toFixed(2)} × {orderItem.quantity}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(orderItem) => orderItem._id}
        contentContainerStyle={styles.itemsList}
      />

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>
            ₹{item.items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0).toFixed(2)}
          </Text>
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
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{item.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Order Actions */}
      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {item.status === 'Processing' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => handleTrackOrder(item.id)}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        )}
        
        {item.status !== 'Cancelled' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reorderButton]}
            onPress={() => handleReorder(item)}
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterButton = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === item && styles.filterButtonTextActive
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Order Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={orderFilters}
          renderItem={renderFilterButton}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt" size={80} color="#ddd" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubText}>
            {selectedFilter === 'All' 
              ? "You haven't placed any orders yet" 
              : `No ${selectedFilter.toLowerCase()} orders`
            }
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
          data={filteredOrders}
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
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#4caf50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemsList: {
    paddingBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    width: 140,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  itemDetails: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  orderSummary: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  trackButton: {
    backgroundColor: '#e3f2fd',
  },
  trackButtonText: {
    color: '#2196f3',
    fontWeight: '500',
    fontSize: 12,
  },
  reorderButton: {
    backgroundColor: '#f1f8e9',
  },
  reorderButtonText: {
    color: '#4caf50',
    fontWeight: '500',
    fontSize: 12,
  },
  actionButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
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

export default EnhancedMyOrders;