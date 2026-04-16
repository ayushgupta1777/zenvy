// import React, { useEffect } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity, StyleSheet,
//   ActivityIndicator, Alert
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchOrder } from '../../redux/slices/orderSlice';
// import Icon from 'react-native-vector-icons/Ionicons';

// const OrderDetailsScreen = ({ route, navigation }) => {
//   const { orderId } = route.params;
//   const dispatch = useDispatch();
//   const { selectedOrder: order, isLoading } = useSelector((state) => state.orders);

//   useEffect(() => {
//     dispatch(fetchOrder(orderId));
//   }, [orderId]);

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//       </View>
//     );
//   }

//   if (!order) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Order not found</Text>
//       </View>
//     );
//   }

//   const getStatusSteps = () => {
//     const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
//     return steps;
//   };

//   const currentStatusIndex = getStatusSteps().indexOf(order.orderStatus);

//   return (
//     <ScrollView style={styles.container}>
//       {/* Order Status */}
//       <View style={styles.statusSection}>
//         <Text style={styles.sectionTitle}>Order Status</Text>
//         <View style={styles.timelineContainer}>
//           {getStatusSteps().map((step, index) => (
//             <View key={step} style={styles.timelineItem}>
//               <View style={styles.timelineRow}>
//                 <View
//                   style={[
//                     styles.timelineDot,
//                     index <= currentStatusIndex && styles.timelineDotActive
//                   ]}
//                 >
//                   <Icon
//                     name={index <= currentStatusIndex ? 'checkmark' : 'ellipse-outline'}
//                     size={16}
//                     color={index <= currentStatusIndex ? '#fff' : '#E5E7EB'}
//                   />
//                 </View>
//                 <Text
//                   style={[
//                     styles.timelineLabel,
//                     index <= currentStatusIndex && styles.timelineLabelActive
//                   ]}
//                 >
//                   {step.charAt(0).toUpperCase() + step.slice(1)}
//                 </Text>
//               </View>
//               {index < getStatusSteps().length - 1 && (
//                 <View
//                   style={[
//                     styles.timelineLine,
//                     index < currentStatusIndex && styles.timelineLineActive
//                   ]}
//                 />
//               )}
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Order Info */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Order Information</Text>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Order Number</Text>
//           <Text style={styles.infoValue}>{order.orderNo}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Order Date</Text>
//           <Text style={styles.infoValue}>
//             {new Date(order.createdAt).toLocaleDateString()}
//           </Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Payment Method</Text>
//           <Text style={styles.infoValue}>{order.paymentMethod.toUpperCase()}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Payment Status</Text>
//           <Text style={styles.infoValue}>{order.paymentStatus.toUpperCase()}</Text>
//         </View>
//       </View>

//       {/* Items */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Order Items</Text>
//         {order.items.map((item, idx) => (
//           <View key={idx} style={styles.itemBox}>
//             <Text style={styles.itemName}>{item.product?.title || 'Product'}</Text>
//             <View style={styles.itemDetails}>
//               <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
//               <Text style={styles.itemPrice}>₹{item.finalPrice} each</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Shipping Address */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Shipping Address</Text>
//         <View style={styles.addressBox}>
//           <Icon name="location-outline" size={20} color="#4F46E5" />
//           <View style={styles.addressContent}>
//             <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
//             <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
//             <Text style={styles.addressText}>
//               {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
//             </Text>
//             <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Price Details */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Price Details</Text>
//         <View style={styles.priceRow}>
//           <Text>Subtotal</Text>
//           <Text>₹{order.subtotal}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text>Shipping</Text>
//           <Text>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text>Tax (18%)</Text>
//           <Text>₹{order.tax}</Text>
//         </View>
//         <View style={styles.divider} />
//         <View style={styles.priceRow}>
//           <Text style={styles.totalLabel}>Total</Text>
//           <Text style={styles.totalValue}>₹{order.total}</Text>
//         </View>
//       </View>

//       {/* Actions */}
//       {['pending', 'confirmed'].includes(order.orderStatus) && (
//         <View style={styles.section}>
//           <TouchableOpacity
//             style={styles.cancelBtn}
//             onPress={() =>
//               Alert.alert('Cancel Order', 'Are you sure?', [
//                 { text: 'No', style: 'cancel' },
//                 { text: 'Yes', onPress: () => {} }
//               ])
//             }
//           >
//             <Text style={styles.cancelBtnText}>Cancel Order</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FA' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { fontSize: 14, color: '#6B7280' },
//   statusSection: { backgroundColor: '#fff', padding: 16, marginVertical: 8 },
//   section: { backgroundColor: '#fff', padding: 16, marginVertical: 8 },
//   sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
//   timelineContainer: { paddingLeft: 16 },
//   timelineItem: { marginBottom: 12 },
//   timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   timelineDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
//   timelineDotActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
//   timelineLabel: { fontSize: 13, color: '#6B7280' },
//   timelineLabelActive: { color: '#4F46E5', fontWeight: '600' },
//   timelineLine: { width: 2, height: 20, backgroundColor: '#E5E7EB', marginLeft: 15, marginVertical: 4 },
//   timelineLineActive: { backgroundColor: '#4F46E5' },
//   infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   infoLabel: { fontSize: 13, color: '#6B7280' },
//   infoValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
//   itemBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8 },
//   itemName: { fontWeight: '600', color: '#111827', marginBottom: 6 },
//   itemDetails: { flexDirection: 'row', gap: 12 },
//   itemQty: { fontSize: 12, color: '#6B7280' },
//   itemPrice: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },
//   addressBox: { flexDirection: 'row', gap: 12, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 },
//   addressContent: { flex: 1 },
//   addressName: { fontWeight: '600', color: '#111827' },
//   addressText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   addressPhone: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
//   divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
//   totalLabel: { fontWeight: '700', color: '#111827' },
//   totalValue: { fontWeight: '700', color: '#4F46E5', fontSize: 16 },
//   cancelBtn: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
//   cancelBtnText: { color: '#fff', fontWeight: '600' }
// });

// export default OrderDetailsScreen;

// ============================================
// mobile/src/screens/orders/OrderDetailsScreen.js
// COMPLETE with Cancel, Address Change, Return, Support
// ============================================ commentimh om 29 -12 

// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity, StyleSheet,
//   ActivityIndicator, Alert, TextInput, Modal
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchOrder } from '../../redux/slices/orderSlice';
// import Icon from 'react-native-vector-icons/Ionicons';
// import api from '../../services/api';

// const OrderDetailsScreen = ({ route, navigation }) => {
//   const { orderId } = route.params;
//   const dispatch = useDispatch();
//   const { selectedOrder: order, isLoading } = useSelector((state) => state.orders);

//   const [returnInfo, setReturnInfo] = useState(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelReason, setCancelReason] = useState('');
//   const [isCancelling, setIsCancelling] = useState(false);

//   useEffect(() => {
//     loadOrderDetails();
//   }, [orderId]);

//   const loadOrderDetails = async () => {
//     try {
//       await dispatch(fetchOrder(orderId)).unwrap();

//       // Fetch return info
//       const response = await api.get(`/orders/${orderId}`);
//       if (response.data.data.returnInfo) {
//         setReturnInfo(response.data.data.returnInfo);
//       }
//     } catch (error) {
//       console.error('Failed to load order:', error);
//       Alert.alert('Error', 'Failed to load order details');
//     }
//   };

//   const getStatusSteps = () => {
//     return ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: '#F59E0B',
//       confirmed: '#3B82F6',
//       processing: '#8B5CF6',
//       packed: '#10B981',
//       shipped: '#6366F1',
//       out_for_delivery: '#0EA5E9',
//       delivered: '#059669',
//       cancelled: '#EF4444',
//       return_initiated: '#F97316',
//       return_approved: '#F59E0B',
//       refunded: '#10B981',
//       completed: '#059669'
//     };
//     return colors[status] || '#9CA3AF';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       pending: 'time-outline',
//       confirmed: 'checkmark-circle-outline',
//       processing: 'build-outline',
//       packed: 'cube-outline',
//       shipped: 'airplane-outline',
//       out_for_delivery: 'navigate-outline',
//       delivered: 'checkmark-done-outline',
//       cancelled: 'close-circle-outline',
//       return_initiated: 'return-down-back-outline',
//       refunded: 'card-outline'
//     };
//     return icons[status] || 'ellipse-outline';
//   };

//   const canCancelOrder = () => {
//     if (!order) return false;
//     const cancellableStates = ['pending', 'confirmed', 'processing'];
//     return cancellableStates.includes(order.orderStatus);
//   };

//   const canChangeAddress = () => {
//     if (!order) return false;
//     const changeableStates = ['confirmed', 'processing'];
//     return changeableStates.includes(order.orderStatus);
//   };

//   const canInitiateReturn = () => {
//     if (!order || !returnInfo) return false;
//     return order.orderStatus === 'delivered' && returnInfo.canReturn;
//   };

//   const handleCancelOrder = async () => {
//     if (!cancelReason.trim()) {
//       Alert.alert('Error', 'Please provide a reason for cancellation');
//       return;
//     }

//     setIsCancelling(true);

//     try {
//       await api.put(`/orders/${orderId}/cancel`, {
//         reason: cancelReason
//       });

//       setShowCancelModal(false);
//       Alert.alert(
//         'Order Cancelled',
//         'Your order has been cancelled successfully.',
//         [{ text: 'OK', onPress: () => loadOrderDetails() }]
//       );
//     } catch (error) {
//       console.error('Cancel error:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
//     } finally {
//       setIsCancelling(false);
//     }
//   };

//   const handleChangeAddress = () => {
//     Alert.alert(
//       'Change Address',
//       'Do you want to change the delivery address for this order?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Change',
//           onPress: () => {
//             navigation.navigate('Profile', {
//               screen: 'Addresses',
//               params: {
//                 returnTo: 'OrderDetails',
//                 orderId: order._id
//               }
//             });
//           }
//         }
//       ]
//     );
//   };

//   const handleInitiateReturn = () => {
//     navigation.navigate('InitiateReturn', {
//       order: order
//     });
//   };

//   const handleContactSupport = () => {
//     navigation.navigate('CreateSupportTicket', {
//       orderId: order._id,
//       orderNo: order.orderNo,
//       productId: order.items[0]?.product?._id
//     });
//   };

//   const handleTrackOrder = () => {
//     navigation.navigate('OrderTracking', {
//       orderId: order._id
//     });
//   };

//   if (isLoading || !order) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//       </View>
//     );
//   }

//   const currentStatusIndex = getStatusSteps().indexOf(order.orderStatus);

//   return (
//     <ScrollView style={styles.container}>
//       {/* Order Header */}
//       <View style={styles.header}>
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={styles.orderNo}>Order #{order.orderNo}</Text>
//             <Text style={styles.orderDate}>
//               {new Date(order.createdAt).toLocaleDateString('en-IN', {
//                 day: 'numeric',
//                 month: 'short',
//                 year: 'numeric'
//               })}
//             </Text>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) }]}>
//             <Icon name={getStatusIcon(order.orderStatus)} size={16} color="#fff" />
//             <Text style={styles.statusText}>
//               {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Return Window Info (if delivered) */}
//       {returnInfo && order.orderStatus === 'delivered' && (
//         <View style={[styles.section, { backgroundColor: returnInfo.canReturn ? '#F0FDF4' : '#FEF3C7' }]}>
//           <View style={styles.returnInfoRow}>
//             <Icon 
//               name={returnInfo.canReturn ? 'time-outline' : 'alert-circle-outline'} 
//               size={20} 
//               color={returnInfo.canReturn ? '#10B981' : '#F59E0B'} 
//             />
//             <View style={styles.returnInfoText}>
//               {returnInfo.canReturn ? (
//                 <>
//                   <Text style={[styles.returnInfoTitle, { color: '#10B981' }]}>
//                     Return Available
//                   </Text>
//                   <Text style={[styles.returnInfoSubtitle, { color: '#059669' }]}>
//                     {returnInfo.daysRemaining} days remaining
//                   </Text>
//                 </>
//               ) : (
//                 <>
//                   <Text style={[styles.returnInfoTitle, { color: '#F59E0B' }]}>
//                     Return Window Expired
//                   </Text>
//                   <Text style={[styles.returnInfoSubtitle, { color: '#D97706' }]}>
//                     Return period ended on {new Date(returnInfo.windowEndDate).toLocaleDateString()}
//                   </Text>
//                 </>
//               )}
//             </View>
//           </View>
//         </View>
//       )}

//       {/* Order Status Timeline */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Order Status</Text>
//         <View style={styles.timelineContainer}>
//           {getStatusSteps().map((step, index) => {
//             const isActive = index <= currentStatusIndex;
//             const isCompleted = index < currentStatusIndex;

//             return (
//               <View key={step} style={styles.timelineItem}>
//                 <View style={styles.timelineRow}>
//                   <View
//                     style={[
//                       styles.timelineDot,
//                       isActive && styles.timelineDotActive,
//                       isCompleted && styles.timelineDotCompleted
//                     ]}
//                   >
//                     <Icon
//                       name={isCompleted ? 'checkmark' : isActive ? 'ellipse' : 'ellipse-outline'}
//                       size={16}
//                       color={isActive ? '#fff' : '#E5E7EB'}
//                     />
//                   </View>
//                   <Text
//                     style={[
//                       styles.timelineLabel,
//                       isActive && styles.timelineLabelActive
//                     ]}
//                   >
//                     {step.replace(/_/g, ' ').charAt(0).toUpperCase() + step.replace(/_/g, ' ').slice(1)}
//                   </Text>
//                 </View>
//                 {index < getStatusSteps().length - 1 && (
//                   <View
//                     style={[
//                       styles.timelineLine,
//                       isCompleted && styles.timelineLineActive
//                     ]}
//                   />
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       </View>

//       {/* Action Buttons */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Actions</Text>

//         {canCancelOrder() && (
//           <TouchableOpacity
//             style={styles.actionBtn}
//             onPress={() => setShowCancelModal(true)}
//           >
//             <Icon name="close-circle-outline" size={20} color="#EF4444" />
//             <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel Order</Text>
//           </TouchableOpacity>
//         )}

//         {canChangeAddress() && (
//           <TouchableOpacity
//             style={styles.actionBtn}
//             onPress={handleChangeAddress}
//           >
//             <Icon name="location-outline" size={20} color="#4F46E5" />
//             <Text style={styles.actionBtnText}>Change Address</Text>
//           </TouchableOpacity>
//         )}

//         {order.trackingNumber && (
//           <TouchableOpacity
//             style={styles.actionBtn}
//             onPress={handleTrackOrder}
//           >
//             <Icon name="navigate-outline" size={20} color="#4F46E5" />
//             <Text style={styles.actionBtnText}>Track Order</Text>
//           </TouchableOpacity>
//         )}

//         {canInitiateReturn() && (
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.actionBtnPrimary]}
//             onPress={handleInitiateReturn}
//           >
//             <Icon name="return-down-back-outline" size={20} color="#fff" />
//             <Text style={[styles.actionBtnText, { color: '#fff' }]}>Initiate Return</Text>
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity
//           style={styles.actionBtn}
//           onPress={handleContactSupport}
//         >
//           <Icon name="help-circle-outline" size={20} color="#4F46E5" />
//           <Text style={styles.actionBtnText}>Contact Support</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Order Items */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Order Items</Text>
//         {order.items.map((item, idx) => (
//           <View key={idx} style={styles.itemBox}>
//             <Text style={styles.itemName}>{item.product?.title || 'Product'}</Text>
//             <View style={styles.itemDetails}>
//               <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
//               <Text style={styles.itemPrice}>₹{item.finalPrice} each</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Shipping Address */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Shipping Address</Text>
//         <View style={styles.addressBox}>
//           <Icon name="location-outline" size={20} color="#4F46E5" />
//           <View style={styles.addressContent}>
//             <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
//             <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
//             {order.shippingAddress.addressLine2 && (
//               <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>
//             )}
//             <Text style={styles.addressText}>
//               {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
//             </Text>
//             <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Price Details */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Price Details</Text>
//         <View style={styles.priceRow}>
//           <Text>Subtotal</Text>
//           <Text>₹{order.subtotal}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text>Shipping</Text>
//           <Text>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text>Tax (18%)</Text>
//           <Text>₹{order.tax}</Text>
//         </View>
//         <View style={styles.divider} />
//         <View style={styles.priceRow}>
//           <Text style={styles.totalLabel}>Total</Text>
//           <Text style={styles.totalValue}>₹{order.total}</Text>
//         </View>
//       </View>

//       <View style={{ height: 20 }} />

//       {/* Cancel Modal */}
//       <Modal
//         visible={showCancelModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowCancelModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Cancel Order</Text>
//               <TouchableOpacity onPress={() => setShowCancelModal(false)}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalContent}>
//               <Text style={styles.modalLabel}>Reason for cancellation:</Text>
//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="E.g., Changed my mind, found better price..."
//                 value={cancelReason}
//                 onChangeText={setCancelReason}
//                 multiline
//                 numberOfLines={4}
//                 textAlignVertical="top"
//               />

//               <Text style={styles.modalNote}>
//                 Note: Stock will be restored and if payment was made, refund will be processed.
//               </Text>
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.modalBtnSecondary}
//                 onPress={() => setShowCancelModal(false)}
//                 disabled={isCancelling}
//               >
//                 <Text style={styles.modalBtnSecondaryText}>Go Back</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.modalBtnDanger, isCancelling && styles.modalBtnDisabled]}
//                 onPress={handleCancelOrder}
//                 disabled={isCancelling}
//               >
//                 {isCancelling ? (
//                   <ActivityIndicator color="#fff" size="small" />
//                 ) : (
//                   <Text style={styles.modalBtnDangerText}>Cancel Order</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FA' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   orderNo: { fontSize: 18, fontWeight: '700', color: '#111827' },
//   orderDate: { fontSize: 14, color: '#6B7280', marginTop: 4 },
//   statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
//   statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
//   section: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
//   sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
//   returnInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   returnInfoText: { flex: 1 },
//   returnInfoTitle: { fontSize: 15, fontWeight: '600' },
//   returnInfoSubtitle: { fontSize: 13, marginTop: 2 },
//   timelineContainer: { paddingLeft: 16 },
//   timelineItem: { marginBottom: 8 },
//   timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   timelineDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   timelineDotActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
//   timelineDotCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
//   timelineLabel: { fontSize: 13, color: '#6B7280' },
//   timelineLabelActive: { color: '#4F46E5', fontWeight: '600' },
//   timelineLine: { width: 2, height: 16, backgroundColor: '#E5E7EB', marginLeft: 15, marginVertical: 2 },
//   timelineLineActive: { backgroundColor: '#4F46E5' },
//   actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
//   actionBtnPrimary: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
//   actionBtnText: { fontSize: 15, fontWeight: '600', color: '#4F46E5' },
//   itemBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8 },
//   itemName: { fontWeight: '600', color: '#111827', marginBottom: 6 },
//   itemDetails: { flexDirection: 'row', gap: 12 },
//   itemQty: { fontSize: 12, color: '#6B7280' },
//   itemPrice: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },
//   addressBox: { flexDirection: 'row', gap: 12, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 },
//   addressContent: { flex: 1 },
//   addressName: { fontWeight: '600', color: '#111827' },
//   addressText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   addressPhone: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
//   divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
//   totalLabel: { fontWeight: '700', color: '#111827' },
//   totalValue: { fontWeight: '700', color: '#4F46E5', fontSize: 16 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
//   modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
//   modalContent: { padding: 20 },
//   modalLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
//   modalInput: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 100 },
//   modalNote: { fontSize: 12, color: '#6B7280', marginTop: 12, fontStyle: 'italic' },
//   modalActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   modalBtnSecondary: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
//   modalBtnSecondaryText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
//   modalBtnDanger: { flex: 1, backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
//   modalBtnDangerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
//   modalBtnDisabled: { opacity: 0.6 }
// });

// export default OrderDetailsScreen;\


// ============================================
// mobile/src/screens/orders/OrderDetailsScreen.js
// COMPLETE with Payment Details, Retry Payment, Auto-Cancel
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../../redux/slices/orderSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';
import CustomHeader from '../../components/CustomHeader';

const EnhancedOrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const { selectedOrder: order, isLoading } = useSelector((state) => state.orders);

  const [returnInfo, setReturnInfo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  useEffect(() => {
    loadOrderDetails();

    // Auto-refresh every 30 seconds if payment is pending
    const interval = order?.paymentStatus === 'pending' && order?.orderStatus === 'pending'
      ? setInterval(loadOrderDetails, 30000)
      : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      await dispatch(fetchOrder(orderId)).unwrap();

      const response = await api.get(`/orders/${orderId}`);
      if (response.data.data.returnInfo) {
        setReturnInfo(response.data.data.returnInfo);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    }
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',      // Yellow (only for online payment pending)
      confirmed: '#10B981',    // Green (COD + paid online orders)
      processing: '#8B5CF6',   // Purple
      packed: '#3B82F6',       // Blue
      shipped: '#0EA5E9',      // Light blue
      out_for_delivery: '#06B6D4', // Cyan
      delivered: '#059669',    // Dark green
      cancelled: '#EF4444',    // Red
      returned: '#F59E0B'      // Orange
    };
    return colors[status] || '#9CA3AF';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',      // Yellow (only for online payment pending)
      confirmed: '#10B981',    // Green (COD + paid online orders)
      processing: '#8B5CF6',   // Purple
      packed: '#3B82F6',       // Blue
      shipped: '#0EA5E9',      // Light blue
      out_for_delivery: '#06B6D4', // Cyan
      delivered: '#059669',    // Dark green
      cancelled: '#EF4444',    // Red
      returned: '#F59E0B'      // Orange
    };
    return colors[status] || '#9CA3AF';
  };

  const getPaymentStatusIcon = (status) => {
    const icons = {
      pending: 'time-outline',
      completed: 'checkmark-circle',
      failed: 'close-circle',
      refunded: 'arrow-back-circle'
    };
    return icons[status] || 'help-circle-outline';
  };

  const canRetryPayment = () => {
    if (!order) return false;
    // Can retry if payment pending or failed, and order not cancelled
    return (
      (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') &&
      order.paymentMethod !== 'cod' &&
      order.orderStatus !== 'cancelled'
    );
  };

  const handleRetryPayment = async () => {
    Alert.alert(
      'Retry Payment',
      `Amount: ₹${order.total}\n\nDo you want to complete the payment now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            setIsRetryingPayment(true);
            try {
              // Navigate to payment gateway with existing order
              navigation.navigate('PaymentGateway', {
                order: order,
                isRetry: true
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to open payment gateway');
            } finally {
              setIsRetryingPayment(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelFailedOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'This order has failed payment. Do you want to cancel it?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/orders/${orderId}/cancel`, {
                reason: 'Payment failed'
              });
              Alert.alert('Success', 'Order cancelled successfully');
              loadOrderDetails();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const canCancelOrder = () => {
    if (!order) return false;
    const cancellableStates = ['pending', 'confirmed', 'processing'];
    return cancellableStates.includes(order.orderStatus);
  };

  const handleCancelOrder = async () => {
    if (isCancelling) return; // Prevent double taps

    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }

    setIsCancelling(true);

    try {
      await api.put(`/orders/${orderId}/cancel`, {
        reason: cancelReason
      });

      setShowCancelModal(false);
      Alert.alert(
        'Order Cancelled',
        'Your order has been cancelled successfully.',
        [{ text: 'OK', onPress: () => loadOrderDetails() }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <CustomHeader title="Order Details" showBack={true} />
      <ScrollView style={styles.container} bounces={true}>
        {/* Background fill for pull-down bounce - matching the first section (white) */}
        <View style={{ backgroundColor: '#fff', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />
        {/* Order Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderNo}>Order #{order.orderNo}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(order.orderStatus) }]}>
              <Text style={styles.statusText}>
                {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* PAYMENT STATUS - DETAILED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.paymentInfoCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodBadge}>
                <Icon
                  name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
                  size={16}
                  color="#4F46E5"
                />
                <Text style={styles.paymentMethodText}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <View style={[styles.paymentStatusBadge, { backgroundColor: getPaymentStatusColor(order.paymentStatus) }]}>
                <Icon name={getPaymentStatusIcon(order.paymentStatus)} size={16} color="#fff" />
                <Text style={styles.paymentStatusText}>
                  {order.paymentStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            {order.paymentId && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment ID</Text>
                <Text style={styles.paymentValue}>{order.paymentId}</Text>
              </View>
            )}

            {order.paymentMethod !== 'cod' && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Amount Paid</Text>
                <Text style={[styles.paymentValue, styles.amountText]}>₹{order.total}</Text>
              </View>
            )}

            {order.razorpayPaymentId && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Razorpay Payment ID</Text>
                <Text style={styles.paymentValue} numberOfLines={1}>{order.razorpayPaymentId}</Text>
              </View>
            )}

            {order.paymentError && (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={20} color="#EF4444" />
                <View style={styles.errorContent}>
                  <Text style={styles.errorTitle}>Payment Failed</Text>
                  <Text style={styles.errorText}>{order.paymentError}</Text>
                </View>
              </View>
            )}
          </View>

          {/* PAYMENT ACTION BUTTONS */}
          {canRetryPayment() && (
            <TouchableOpacity
              style={styles.retryPaymentBtn}
              onPress={handleRetryPayment}
              disabled={isRetryingPayment}
            >
              {isRetryingPayment ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="card" size={20} color="#fff" />
                  <Text style={styles.retryPaymentText}>
                    {order.paymentStatus === 'failed' ? 'Retry Payment' : 'Complete Payment'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {order.paymentStatus === 'failed' && order.orderStatus === 'pending' && (
            <TouchableOpacity
              style={styles.cancelFailedBtn}
              onPress={handleCancelFailedOrder}
            >
              <Icon name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.cancelFailedText}>Cancel Failed Order</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* INTELLIGENT ALERT - Payment Pending */}
        {order.paymentStatus === 'pending' && order.paymentMethod !== 'cod' && order.orderStatus === 'pending' && (
          <View style={styles.alertCard}>
            <Icon name="information-circle" size={24} color="#F59E0B" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Payment Pending</Text>
              <Text style={styles.alertText}>
                Your order is pending because payment is not completed. Please complete payment to confirm your order.
              </Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={handleRetryPayment}
              >
                <Text style={styles.alertButtonText}>Complete Payment Now</Text>
                <Icon name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Return Window Info */}
        {returnInfo && order.orderStatus === 'delivered' && (
          <View style={[styles.section, { backgroundColor: returnInfo.canReturn ? '#F0FDF4' : '#FEF3C7' }]}>
            <View style={styles.returnInfoRow}>
              <Icon
                name={returnInfo.canReturn ? 'time-outline' : 'alert-circle-outline'}
                size={20}
                color={returnInfo.canReturn ? '#10B981' : '#F59E0B'}
              />
              <View style={styles.returnInfoText}>
                {returnInfo.canReturn ? (
                  <>
                    <Text style={[styles.returnInfoTitle, { color: '#10B981' }]}>
                      Return Available
                    </Text>
                    <Text style={[styles.returnInfoSubtitle, { color: '#059669' }]}>
                      {returnInfo.daysRemaining} days remaining
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.returnInfoTitle, { color: '#F59E0B' }]}>
                      Return Window Expired
                    </Text>
                    <Text style={[styles.returnInfoSubtitle, { color: '#D97706' }]}>
                      Return period ended on {new Date(returnInfo.windowEndDate).toLocaleDateString()}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Order Status Timeline */}
        <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('OrderTracking', { orderId: orderId })}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          {order.statusHistory && order.statusHistory.length > 0 ? (
            <View style={styles.statusHistory}>
              {order.statusHistory.slice().reverse().map((history, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDot}>
                    <Icon name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>
                      {history.to.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    {history.reason && (
                      <Text style={styles.historyReason}>{history.reason}</Text>
                    )}
                    <Text style={styles.historyTime}>
                      {new Date(history.changedAt).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noHistory}>No status updates yet</Text>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {canCancelOrder() && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setShowCancelModal(true)}
            >
              <Icon name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {order.trackingNumber && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('OrderTracking', { orderId: order._id })}
            >
              <Icon name="navigate-outline" size={20} color="#4F46E5" />
              <Text style={styles.actionBtnText}>Track Order</Text>
            </TouchableOpacity>
          )}

          {returnInfo?.canReturn && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => navigation.navigate('InitiateReturn', { order })}
            >
              <Icon name="return-down-back-outline" size={20} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Initiate Return</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' }]}
            onPress={() => navigation.navigate('UserChat', {
              orderId: order._id,
              orderNo: order.orderNo
            })}
          >
            <Icon name="chatbubble-ellipses-outline" size={20} color="#4F46E5" />
            <Text style={[styles.actionBtnText, { color: '#4F46E5' }]}>Raise Issue / Get Help</Text>
          </TouchableOpacity>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemBox}>
              <Text style={styles.itemName}>{item.product?.title || 'Product'}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.finalPrice} each</Text>
                {item.resellPrice > 0 && (
                  <Text style={styles.resellerMarkup}>+₹{item.resellPrice} margin</Text>
                )}
              </View>
              <Text style={styles.itemTotal}>Subtotal: ₹{item.finalPrice * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
            <Icon name="location-outline" size={20} color="#4F46E5" />
            <View style={styles.addressContent}>
              <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
              {order.shippingAddress.addressLine2 && (
                <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>
              )}
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </Text>
              <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
            </View>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text>₹{order.subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (3%)</Text>
            <Text>₹{order.tax}</Text>
          </View>
          {order.coupon && order.coupon.code && (
            <View style={styles.priceRow}>
              <Text style={{ color: '#10B981', fontWeight: '600' }}>
                Discount ({order.coupon.code})
              </Text>
              <Text style={{ color: '#10B981', fontWeight: '600' }}>
                -₹{order.coupon.discountAmount}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />

        {/* Cancel Modal */}
        <Modal
          visible={showCancelModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cancel Order</Text>
                <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Reason for cancellation:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="E.g., Changed my mind, found better price..."
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={styles.modalNote}>
                  Note: Stock will be restored and if payment was made, refund will be processed.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtnSecondary}
                  onPress={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                >
                  <Text style={styles.modalBtnSecondaryText}>Go Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtnDanger, isCancelling && styles.modalBtnDisabled]}
                  onPress={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalBtnDangerText}>Cancel Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNo: { fontSize: 18, fontWeight: '700', color: '#111827' },
  orderDate: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  // Payment Info Styles
  paymentInfoCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', paddingRight: 4 },
  paymentValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  amountText: { fontSize: 16, color: '#4F46E5' },
  paymentMethodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  paymentMethodText: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  paymentStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  paymentStatusText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginTop: 8 },
  errorContent: { flex: 1 },
  errorTitle: { fontSize: 14, fontWeight: '600', color: '#DC2626', marginBottom: 4 },
  errorText: { fontSize: 13, color: '#991B1B', lineHeight: 18 },
  retryPaymentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 8, marginTop: 12 },
  retryPaymentText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelFailedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: '#EF4444', paddingVertical: 14, borderRadius: 8, marginTop: 8 },
  cancelFailedText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },

  // Alert Card
  alertCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FEF3C7', padding: 16, margin: 16, marginTop: 0, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  alertText: { fontSize: 13, color: '#78350F', lineHeight: 18, marginBottom: 12 },
  alertButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start' },
  alertButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Status History
  statusHistory: { gap: 16 },
  historyItem: { flexDirection: 'row', gap: 12 },
  historyDot: { paddingTop: 2 },
  historyContent: { flex: 1 },
  historyStatus: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  historyReason: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  historyTime: { fontSize: 12, color: '#9CA3AF' },
  noHistory: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },

  returnInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  returnInfoText: { flex: 1 },
  returnInfoTitle: { fontSize: 15, fontWeight: '600' },
  returnInfoSubtitle: { fontSize: 13, marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  actionBtnPrimary: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#4F46E5' },
  itemBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8 },
  itemName: { fontWeight: '600', color: '#111827', marginBottom: 6 },
  itemDetails: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  itemQty: { fontSize: 12, color: '#6B7280' },
  itemPrice: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },
  resellerMarkup: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  itemTotal: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 4 },
  addressBox: { flexDirection: 'row', gap: 12, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 },
  addressContent: { flex: 1 },
  addressName: { fontWeight: '600', color: '#111827' },
  addressText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addressPhone: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#6B7280', paddingRight: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  totalLabel: { fontWeight: '700', color: '#111827' },
  totalValue: { fontWeight: '700', color: '#4F46E5', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalContent: { padding: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  modalInput: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 100 },
  modalNote: { fontSize: 12, color: '#6B7280', marginTop: 12, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  modalBtnSecondary: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  modalBtnSecondaryText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  modalBtnDanger: { flex: 1, backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  modalBtnDangerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalBtnDisabled: { opacity: 0.6 }
});

export default EnhancedOrderDetailsScreen;