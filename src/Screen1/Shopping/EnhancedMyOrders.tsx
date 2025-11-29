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
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendUrl, getImageUrl } from '../../../src/util/backendConfig';

interface Order {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
    images: string[];
  }>;
  deliveryAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  orderDate: string;
  createdAt: string;
}

const EnhancedMyOrders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const orderFilters = ['All', 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  
  useEffect(() => {
    fetchOrders();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);
  

   const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      const userProfile = await AsyncStorage.getItem('userProfile');
      
      if (!token || !userProfile) {
        throw new Error('User not authenticated');
      }
      
      const userData = JSON.parse(userProfile);
      const backendUrl = getBackendUrl();
      
      const response = await axios.get(`${backendUrl}/api/orders/customer/${userData._id || userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // ✅ FIX: Ensure we only show actual ordered products
        const ordersWithValidProducts = response.data.data.map(order => ({
          ...order,
          products: order.products || [] // Ensure products array exists
        }));
        
        setOrders(ordersWithValidProducts);
        console.log('✅ Loaded orders with products:', ordersWithValidProducts.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show alert on background refresh
      if (!refreshing) {
        Alert.alert('Error', 'Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };
  
  const filteredOrders = selectedFilter === 'All' 
    ? orders 
    : orders.filter(order => {
        const status = selectedFilter.toLowerCase().replace(/\s+/g, '_');
        return order.status === status;
      });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_confirmed': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'shipped': return '#8b5cf6';
      case 'out_for_delivery': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'order_confirmed': return 'Order Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.replace(/_/g, ' ').toUpperCase();
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.orderId}</Text>
            <Text style={styles.orderDate}>Placed on {formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          {item.products.slice(0, 2).map((product, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={{ 
                  uri: product.images && product.images.length > 0 
                    ? getImageUrl(product.images[0]) 
                    : 'https://via.placeholder.com/60' 
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.itemDetails}>
                  {formatCurrency(product.price)} × {product.quantity}
                </Text>
              </View>
            </View>
          ))}
          {item.products.length > 2 && (
            <Text style={styles.moreItemsText}>
              +{item.products.length - 2} more items
            </Text>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(item.totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>
              {item.paymentMethod === 'cash' ? 'Cash on Delivery' : 
               item.paymentMethod === 'upi' ? 'UPI Payment' : 
               item.paymentMethod === 'card' ? 'Card Payment' : 'Wallet'}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Delivery Address:</Text>
          <Text style={styles.addressText}>
            {item.deliveryAddress.name}, {item.deliveryAddress.addressLine1}, 
            {item.deliveryAddress.city} - {item.deliveryAddress.pincode}
          </Text>
        </View>
      </View>
    );
  };

  const renderFilterButton = ({ item }: { item: string }) => (
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
          keyExtractor={(item) => item.orderId}
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
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
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
  itemsContainer: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#4caf50',
    fontStyle: 'italic',
    marginLeft: 60,
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
  addressSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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






// // /Users/webasebrandings/Documents/new-main/src/Screen1/Shopping/EnhancedMyOrders.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   FlatList, 
//   Image, 
//   TouchableOpacity, 
//   Alert, 
//   ScrollView, 
//   RefreshControl,
//   ActivityIndicator 
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { getBackendUrl, getImageUrl } from '../../../src/util/backendConfig';
// import io from 'socket.io-client';

// interface Order {
//   _id: string;
//   orderId: string;
//   user: {
//     _id: string;
//     name: string;
//     phoneNumber: string;
//     customerId: string;
//     profilePicture?: string;
//   };
//   products: Array<{
//     product: {
//       _id: string;
//       name: string;
//       price: number;
//       images: string[];
//       category: string;
//       description: string;
//     };
//     quantity: number;
//     price: number;
//     name: string;
//     category: string;
//     images: string[];
//   }>;
//   totalAmount: number;
//   subtotal: number;
//   shipping: number;
//   tax: number;
//   deliveryAddress: {
//     name: string;
//     phone: string;
//     addressLine1: string;
//     addressLine2?: string;
//     city: string;
//     state: string;
//     pincode: string;
//     country: string;
//   };
//   status: string;
//   paymentStatus: string;
//   paymentMethod: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const EnhancedMyOrders = () => {
//   const navigation = useNavigation();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
//   const [socket, setSocket] = useState<any>(null);
  
//   const orderFilters = [
//     'All', 
//     'Order Confirmed', 
//     'Processing', 
//     'Shipped', 
//     'Out for Delivery', 
//     'Delivered', 
//     'Cancelled'
//   ];
  
//   useEffect(() => {
//     initializeSocket();
//     fetchOrders();
    
//     return () => {
//       if (socket) {
//         socket.disconnect();
//       }
//     };
//   }, []);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchOrders();
//     }, [])
//   );

//   const initializeSocket = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
//       if (!token) return;

//       const backendUrl = getBackendUrl();
//       const newSocket = io(backendUrl, {
//         transports: ['websocket'],
//         query: { token }
//       });

//       newSocket.on('connect', () => {
//         console.log('✅ Connected to server for real-time order updates');
//       });

//       newSocket.on('orderStatusUpdated', (data) => {
//         console.log('📢 Order status updated via socket:', data);
//         Alert.alert(
//           'Order Updated', 
//           `Order #${data.orderId} is now ${getStatusText(data.status)}`
//         );
//         fetchOrders(); // Refresh orders
//       });

//       newSocket.on('disconnect', () => {
//         console.log('❌ Disconnected from server');
//       });

//       setSocket(newSocket);
//     } catch (error) {
//       console.error('❌ Socket connection error:', error);
//     }
//   };
  
//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
      
//       if (!token) {
//         throw new Error('Authentication token not found');
//       }
      
//       const backendUrl = getBackendUrl();
//       const response = await axios.get(`${backendUrl}/api/orders/customer`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setOrders(response.data.data);
//         console.log(`✅ Loaded ${response.data.data.length} orders`);
//       } else {
//         throw new Error(response.data.error || 'Failed to load orders');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching orders:', error);
//       Alert.alert('Error', 'Failed to load orders. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchOrders();
//     setRefreshing(false);
//   };
  
//   const filteredOrders = selectedFilter === 'All' 
//     ? orders 
//     : orders.filter(order => {
//         const status = selectedFilter.toLowerCase().replace(/\s+/g, '_');
//         return order.status === status;
//       });
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'order_confirmed': return '#3b82f6';
//       case 'processing': return '#f59e0b';
//       case 'shipped': return '#8b5cf6';
//       case 'out_for_delivery': return '#06b6d4';
//       case 'delivered': return '#10b981';
//       case 'cancelled': return '#ef4444';
//       case 'returned': return '#f97316';
//       case 'refund_initiated': return '#ec4899';
//       case 'refund_completed': return '#6366f1';
//       default: return '#6b7280';
//     }
//   };
  
//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'order_confirmed': return 'Order Confirmed';
//       case 'processing': return 'Processing';
//       case 'shipped': return 'Shipped';
//       case 'out_for_delivery': return 'Out for Delivery';
//       case 'delivered': return 'Delivered';
//       case 'cancelled': return 'Cancelled';
//       case 'returned': return 'Returned';
//       case 'refund_initiated': return 'Refund Initiated';
//       case 'refund_completed': return 'Refund Completed';
//       default: return status.replace(/_/g, ' ').toUpperCase();
//     }
//   };
  
//   const getPaymentMethodText = (method: string) => {
//     switch (method) {
//       case 'upi': return 'UPI Paid';
//       case 'card': return 'Card Payment';
//       case 'cash': return 'Cash on Delivery';
//       case 'wallet': return 'Wallet Payment';
//       default: return method.toUpperCase();
//     }
//   };
  
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };
  
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2
//     }).format(amount);
//   };
  
//   const handleTrackOrder = (orderId: string) => {
//     Alert.alert('Track Order', `Tracking feature for order ${orderId} will be available soon.`);
//   };
  
//   const handleReorder = async (order: Order) => {
//     try {
//       Alert.alert('Reorder', 'Items from this order have been added to your cart.');
//       navigation.navigate('Shopping');
//     } catch (error) {
//       console.error('Error reordering:', error);
//       Alert.alert('Error', 'Failed to reorder items.');
//     }
//   };
  
//   const handleCancelOrder = async (orderId: string) => {
//     try {
//       Alert.alert(
//         'Cancel Order',
//         'Are you sure you want to cancel this order?',
//         [
//           { text: 'No', style: 'cancel' },
//           { 
//             text: 'Yes', 
//             onPress: async () => {
//               const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('authToken');
//               const backendUrl = getBackendUrl();
              
//               await axios.put(
//                 `${backendUrl}/api/orders/admin/update-status/${orderId}`, 
//                 { status: 'cancelled' },
//                 { headers: { Authorization: `Bearer ${token}` } }
//               );
              
//               Alert.alert('Success', 'Order cancelled successfully');
//               fetchOrders();
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Error cancelling order:', error);
//       Alert.alert('Error', 'Failed to cancel order.');
//     }
//   };
  
//   const renderOrderItem = ({ item }: { item: Order }) => {
//     return (
//       <View style={styles.orderCard}>
//         {/* Order Header */}
//         <View style={styles.orderHeader}>
//           <View>
//             <Text style={styles.orderId}>Order #{item.orderId}</Text>
//             <Text style={styles.orderDate}>Placed on {formatDate(item.createdAt)}</Text>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
//             <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
//               {getStatusText(item.status)}
//             </Text>
//           </View>
//         </View>

//         {/* Order Items */}
//         <View style={styles.itemsContainer}>
//           {item.products.slice(0, 2).map((orderItem, index) => (
//             <View key={index} style={styles.orderItem}>
//               <Image
//                 source={{ 
//                   uri: orderItem.images && orderItem.images.length > 0 
//                     ? getImageUrl(orderItem.images[0]) 
//                     : 'https://via.placeholder.com/60' 
//                 }}
//                 style={styles.itemImage}
//               />
//               <View style={styles.itemInfo}>
//                 <Text style={styles.itemName} numberOfLines={1}>
//                   {orderItem.name || orderItem.product?.name}
//                 </Text>
//                 <Text style={styles.itemDetails}>
//                   {formatCurrency(orderItem.price)} × {orderItem.quantity}
//                 </Text>
//               </View>
//             </View>
//           ))}
//           {item.products.length > 2 && (
//             <Text style={styles.moreItemsText}>
//               +{item.products.length - 2} more items
//             </Text>
//           )}
//         </View>

//         {/* Order Summary */}
//         <View style={styles.orderSummary}>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Items Total</Text>
//             <Text style={styles.summaryValue}>
//               {formatCurrency(item.subtotal || item.totalAmount)}
//             </Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Payment Method</Text>
//             <Text style={styles.summaryValue}>
//               {getPaymentMethodText(item.paymentMethod)}
//             </Text>
//           </View>
//           <View style={[styles.summaryRow, styles.totalRow]}>
//             <Text style={styles.totalLabel}>Total Amount</Text>
//             <Text style={styles.totalValue}>{formatCurrency(item.totalAmount)}</Text>
//           </View>
//         </View>

//         {/* Order Actions */}
//         <View style={styles.orderActions}>
//           <TouchableOpacity 
//             style={[styles.actionButton, styles.detailsButton]}
//             onPress={() => setShowOrderDetails(item._id)}
//           >
//             <Text style={styles.detailsButtonText}>View Details</Text>
//           </TouchableOpacity>
          
//           {item.status === 'delivered' && (
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.reorderButton]}
//               onPress={() => handleReorder(item)}
//             >
//               <Text style={styles.reorderButtonText}>Reorder</Text>
//             </TouchableOpacity>
//           )}
          
//           {(item.status === 'order_confirmed' || item.status === 'processing') && (
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.trackButton]}
//               onPress={() => handleTrackOrder(item.orderId)}
//             >
//               <Text style={styles.trackButtonText}>Track Order</Text>
//             </TouchableOpacity>
//           )}
          
//           {(item.status === 'order_confirmed' || item.status === 'processing') && (
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.cancelButton]}
//               onPress={() => handleCancelOrder(item.orderId)}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );
//   };

//   const renderFilterButton = ({ item }: { item: string }) => (
//     <TouchableOpacity
//       style={[
//         styles.filterButton,
//         selectedFilter === item && styles.filterButtonActive
//       ]}
//       onPress={() => setSelectedFilter(item)}
//     >
//       <Text
//         style={[
//           styles.filterButtonText,
//           selectedFilter === item && styles.filterButtonTextActive
//         ]}
//       >
//         {item}
//       </Text>
//     </TouchableOpacity>
//   );

//   const renderOrderDetails = () => {
//     if (!showOrderDetails) return null;
    
//     const order = orders.find(o => o._id === showOrderDetails);
//     if (!order) return null;
    
//     return (
//       <View style={styles.orderDetailsModal}>
//         <View style={styles.orderDetailsContent}>
//           <View style={styles.orderDetailsHeader}>
//             <Text style={styles.orderDetailsTitle}>Order Details</Text>
//             <TouchableOpacity 
//               style={styles.closeButton}
//               onPress={() => setShowOrderDetails(null)}
//             >
//               <MaterialIcons name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>
          
//           <ScrollView style={styles.orderDetailsBody}>
//             <View style={styles.detailsSection}>
//               <Text style={styles.detailsSectionTitle}>Order Information</Text>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Order ID:</Text>
//                 <Text style={styles.detailsValue}>#{order.orderId}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Order Date:</Text>
//                 <Text style={styles.detailsValue}>{formatDate(order.createdAt)}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Status:</Text>
//                 <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
//                   <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
//                     {getStatusText(order.status)}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Payment Method:</Text>
//                 <Text style={styles.detailsValue}>{getPaymentMethodText(order.paymentMethod)}</Text>
//               </View>
//             </View>
            
//             <View style={styles.detailsSection}>
//               <Text style={styles.detailsSectionTitle}>Delivery Address</Text>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Name:</Text>
//                 <Text style={styles.detailsValue}>{order.deliveryAddress.name}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Phone:</Text>
//                 <Text style={styles.detailsValue}>{order.deliveryAddress.phone}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Address:</Text>
//                 <Text style={styles.detailsValue}>{order.deliveryAddress.addressLine1}</Text>
//               </View>
//               {order.deliveryAddress.addressLine2 && (
//                 <View style={styles.detailsRow}>
//                   <Text style={styles.detailsLabel}>Address Line 2:</Text>
//                   <Text style={styles.detailsValue}>{order.deliveryAddress.addressLine2}</Text>
//                 </View>
//               )}
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>City:</Text>
//                 <Text style={styles.detailsValue}>{order.deliveryAddress.city}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>State:</Text>
//                 <Text style={styles.detailsValue}>{order.deliveryAddress.state}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Pincode:</Text>
//                 <Text style={styles.detailsValue}>{order.deliveryAddress.pincode}</Text>
//               </View>
//             </View>
            
//             <View style={styles.detailsSection}>
//               <Text style={styles.detailsSectionTitle}>Order Items</Text>
//               {order.products.map((orderItem, index) => (
//                 <View key={index} style={styles.orderDetailsItem}>
//                   <Image
//                     source={{ 
//                       uri: orderItem.images && orderItem.images.length > 0 
//                         ? getImageUrl(orderItem.images[0]) 
//                         : 'https://via.placeholder.com/60' 
//                     }}
//                     style={styles.orderDetailsItemImage}
//                   />
//                   <View style={styles.orderDetailsItemInfo}>
//                     <Text style={styles.orderDetailsItemName}>
//                       {orderItem.name || orderItem.product?.name}
//                     </Text>
//                     <Text style={styles.orderDetailsItemCategory}>
//                       {orderItem.category || orderItem.product?.category}
//                     </Text>
//                     <Text style={styles.orderDetailsItemDetails}>
//                       {formatCurrency(orderItem.price)} × {orderItem.quantity}
//                     </Text>
//                   </View>
//                   <View style={styles.orderDetailsItemPrice}>
//                     <Text style={styles.orderDetailsItemPriceText}>
//                       {formatCurrency(orderItem.price * orderItem.quantity)}
//                     </Text>
//                   </View>
//                 </View>
//               ))}
//             </View>
            
//             <View style={styles.detailsSection}>
//               <Text style={styles.detailsSectionTitle}>Order Summary</Text>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Items Total:</Text>
//                 <Text style={styles.detailsValue}>{formatCurrency(order.subtotal || order.totalAmount)}</Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Shipping:</Text>
//                 <Text style={styles.detailsValue}>
//                   {order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}
//                 </Text>
//               </View>
//               <View style={styles.detailsRow}>
//                 <Text style={styles.detailsLabel}>Tax:</Text>
//                 <Text style={styles.detailsValue}>{formatCurrency(order.tax)}</Text>
//               </View>
//               <View style={[styles.detailsRow, styles.totalRow]}>
//                 <Text style={styles.totalLabel}>Total Amount:</Text>
//                 <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4caf50" />
//         <Text style={styles.loadingText}>Loading your orders...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <MaterialIcons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Orders</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {/* Order Filters */}
//       <View style={styles.filtersContainer}>
//         <FlatList
//           data={orderFilters}
//           renderItem={renderFilterButton}
//           keyExtractor={(item) => item}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.filtersList}
//         />
//       </View>

//       {filteredOrders.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="receipt" size={80} color="#ddd" />
//           <Text style={styles.emptyText}>No orders found</Text>
//           <Text style={styles.emptySubText}>
//             {selectedFilter === 'All' 
//               ? "You haven't placed any orders yet" 
//               : `No ${selectedFilter.toLowerCase()} orders`
//             }
//           </Text>
//           <TouchableOpacity 
//             style={styles.shopButton} 
//             onPress={() => navigation.navigate('Shopping')}
//           >
//             <Text style={styles.shopButtonText}>Start Shopping</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredOrders}
//           renderItem={renderOrderItem}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={styles.ordersList}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         />
//       )}
      
//       {/* Order Details Modal */}
//       {renderOrderDetails()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//   },
//   backButton: {
//     padding: 5,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   placeholder: {
//     width: 34,
//   },
//   filtersContainer: {
//     backgroundColor: '#fff',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   filtersList: {
//     paddingHorizontal: 20,
//   },
//   filterButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#f5f5f5',
//     marginRight: 10,
//   },
//   filterButtonActive: {
//     backgroundColor: '#4caf50',
//   },
//   filterButtonText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   filterButtonTextActive: {
//     color: '#fff',
//   },
//   ordersList: {
//     padding: 15,
//   },
//   orderCard: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 15,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 15,
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   orderDate: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   itemsContainer: {
//     marginBottom: 15,
//   },
//   orderItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 15,
//     marginBottom: 10,
//   },
//   itemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   itemInfo: {
//     flex: 1,
//   },
//   itemName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//     marginBottom: 2,
//   },
//   itemDetails: {
//     fontSize: 12,
//     color: '#666',
//   },
//   moreItemsText: {
//     fontSize: 12,
//     color: '#4caf50',
//     fontStyle: 'italic',
//     marginLeft: 60,
//   },
//   orderSummary: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 10,
//     padding: 15,
//     marginTop: 5,
//     marginBottom: 15,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//   },
//   totalRow: {
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 8,
//     marginTop: 4,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#4caf50',
//   },
//   orderActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 5,
//   },
//   actionButton: {
//     flex: 1,
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     marginHorizontal: 5,
//     alignItems: 'center',
//   },
//   detailsButton: {
//     backgroundColor: '#f1f8e9',
//   },
//   detailsButtonText: {
//     color: '#4caf50',
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   trackButton: {
//     backgroundColor: '#e3f2fd',
//   },
//   trackButtonText: {
//     color: '#2196f3',
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   reorderButton: {
//     backgroundColor: '#f1f8e9',
//   },
//   reorderButtonText: {
//     color: '#4caf50',
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   cancelButton: {
//     backgroundColor: '#ffebee',
//   },
//   cancelButtonText: {
//     color: '#e53935',
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#999',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   shopButton: {
//     backgroundColor: '#4caf50',
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     marginTop: 20,
//   },
//   shopButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderDetailsModal: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   orderDetailsContent: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     width: '90%',
//     maxHeight: '80%',
//     overflow: 'hidden',
//   },
//   orderDetailsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   orderDetailsTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   closeButton: {
//     padding: 5,
//   },
//   orderDetailsBody: {
//     padding: 20,
//   },
//   detailsSection: {
//     marginBottom: 20,
//   },
//   detailsSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   detailsLabel: {
//     fontSize: 14,
//     color: '#666',
//     flex: 1,
//   },
//   detailsValue: {
//     fontSize: 14,
//     color: '#333',
//     flex: 2,
//     textAlign: 'right',
//   },
//   orderDetailsItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   orderDetailsItemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 15,
//   },
//   orderDetailsItemInfo: {
//     flex: 1,
//   },
//   orderDetailsItemName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//     marginBottom: 2,
//   },
//   orderDetailsItemCategory: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 2,
//   },
//   orderDetailsItemDetails: {
//     fontSize: 12,
//     color: '#666',
//   },
//   orderDetailsItemPrice: {
//     alignItems: 'flex-end',
//   },
//   orderDetailsItemPriceText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#4caf50',
//   },
// });

// export default EnhancedMyOrders;