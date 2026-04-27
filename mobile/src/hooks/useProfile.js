import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const useProfile = (navigation) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showResellerModal, setShowResellerModal] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    orders: 0,
    wishlist: 0,
    returns: 0,
    points: 0
  });

  const [resellerForm, setResellerForm] = useState({
    businessName: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Mocking stats for now, replace with actual API if available
      setUserStats({
        orders: 8,
        wishlist: 12,
        returns: 2,
        points: 650
      });
      setStatsLoading(false);
    } catch (error) {
      console.log('Stats error:', error);
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) }
      ]
    );
  };

  const handleResellerApply = async () => {
    if (!resellerForm.businessName || !resellerForm.accountHolderName || !resellerForm.accountNumber || !resellerForm.bankName || !resellerForm.ifscCode) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    // API logic here
    Alert.alert('Success', 'Application submitted successfully!');
    setShowResellerModal(false);
    setResellerForm({ businessName: '', accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '' });
  };

  return {
    user,
    userStats,
    statsLoading,
    showResellerModal,
    setShowResellerModal,
    resellerForm,
    setResellerForm,
    handleLogout,
    handleResellerApply
  };
};

export default useProfile;
