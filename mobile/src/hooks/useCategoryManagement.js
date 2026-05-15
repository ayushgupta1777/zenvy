import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

const useCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories/tree');
      setCategories(response.data.data.categories);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const deleteCategory = async (categoryId) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      Alert.alert('Success', 'Category deleted successfully');
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete category';
      Alert.alert('Error', errorMsg);
    }
  };

  const saveCategory = async (payload, editingId = null) => {
    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        Alert.alert('Success', 'Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        Alert.alert('Success', 'Category created successfully!');
      }
      fetchCategories();
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save category';
      Alert.alert('Error', errorMsg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    categories,
    isLoading,
    isSaving,
    fetchCategories,
    deleteCategory,
    saveCategory
  };
};

export default useCategoryManagement;
