import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { Product, ProductCategory, ProductUnit } from '../../types';
import {
  subscribeToProducts,
  updateProduct,
  createProduct,
} from '../../services/firebaseRtdb';
import {
  getProductImageUrl,
  UNSPLASH_PRESETS,
  CATEGORY_FALLBACK_IMAGES,
} from '../../utils/unsplashImages';

interface InventoryManagerProps {
  onBackToCustomerView: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  onBackToCustomerView,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterCategory, setFilterCategory] = useState<'all' | ProductCategory>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [unsplashPickerVisible, setUnsplashPickerVisible] = useState(false);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('veggies');
  const [newPrice, setNewPrice] = useState('40');
  const [newUnit, setNewUnit] = useState<ProductUnit>('kg');
  const [newStock, setNewStock] = useState('50');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Inline editing state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState('');
  const [editStockVal, setEditStockVal] = useState('');

  useEffect(() => {
    const unsub = subscribeToProducts(list => {
      setProducts(list);
    });
    return () => unsub();
  }, []);

  const handleStockDelta = async (product: Product, delta: number) => {
    const newStockVal = Math.max(0, product.stockQuantity + delta);
    // Automated Zero-Stock Guard: if newStockVal === 0, isDisabled = true
    const isDisabled = newStockVal === 0 ? true : product.isDisabled;
    await updateProduct(product.id, {
      stockQuantity: newStockVal,
      isDisabled,
    });
  };

  const handleToggleDisabled = async (product: Product) => {
    if (product.stockQuantity === 0 && product.isDisabled) {
      Alert.alert(
        'Zero Stock Warning',
        'Please add stock quantity before enabling this product for customer ordering.'
      );
      return;
    }
    await updateProduct(product.id, {
      isDisabled: !product.isDisabled,
    });
  };

  const startInlineEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditPriceVal(String(product.price));
    setEditStockVal(String(product.stockQuantity));
  };

  const saveInlineEdit = async (product: Product) => {
    const priceNum = parseFloat(editPriceVal) || product.price;
    const stockNum = parseInt(editStockVal, 10) || 0;
    // Zero-Stock Guard
    const isDisabled = stockNum <= 0 ? true : product.isDisabled;

    await updateProduct(product.id, {
      price: priceNum,
      stockQuantity: stockNum,
      isDisabled,
    });
    setEditingProductId(null);
  };

  const handleCreateProduct = async () => {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert('Required Fields', 'Please enter product name and price.');
      return;
    }

    const priceNum = parseFloat(newPrice) || 0;
    const stockNum = parseInt(newStock, 10) || 0;
    const assignedImageUrl =
      newImageUrl.trim() || CATEGORY_FALLBACK_IMAGES[newCategory];

    await createProduct({
      name: newName.trim(),
      category: newCategory,
      price: priceNum,
      unit: newUnit,
      stockQuantity: stockNum,
      isDisabled: stockNum <= 0,
      imageUrl: assignedImageUrl,
      description: newDescription.trim() || `Fresh organic ${newName.trim()}`,
    });

    setModalVisible(false);
    setNewName('');
    setNewPrice('40');
    setNewStock('50');
    setNewImageUrl('');
    setNewDescription('');
    Alert.alert('Product Added', 'Item added to farm inventory successfully!');
  };

  const filteredProducts = products.filter(
    p => filterCategory === 'all' || p.category === filterCategory
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🌾 Farm Inventory Manager</Text>
          <Text style={styles.headerSub}>Live Realtime Catalog & Zero-Stock Guard</Text>
        </View>
        <Pressable style={styles.previewBtn} onPress={onBackToCustomerView}>
          <Text style={styles.previewBtnText}>🛒 Customer View</Text>
        </Pressable>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(
            [
              { id: 'all', label: 'All Stock' },
              { id: 'leafy_greens', label: 'Leafy Greens' },
              { id: 'veggies', label: 'Fresh Veggies' },
              { id: 'rice_bags', label: 'Rice Bags' },
              { id: 'organic_specials', label: 'Organic Specials' },
            ] as const
          ).map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.filterPill,
                filterCategory === cat.id && styles.filterPillActive,
              ]}
              onPress={() => setFilterCategory(cat.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filterCategory === cat.id && styles.filterPillTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={styles.addProductBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addProductBtnText}>+ New Item</Text>
        </Pressable>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isZeroStock = item.stockQuantity <= 0;
          const isEditing = editingProductId === item.id;

          return (
            <View style={[styles.productRow, isZeroStock && styles.productRowZero]}>
              {/* Product Thumbnail */}
              <View style={styles.thumbWrapper}>
                <Image
                  source={{
                    uri: getProductImageUrl(item.imageUrl, item.category),
                  }}
                  style={styles.thumb}
                />
                {isZeroStock && (
                  <View style={styles.zeroBadge}>
                    <Text style={styles.zeroBadgeText}>0 STOCK</Text>
                  </View>
                )}
              </View>

              {/* Main Info */}
              <View style={styles.rowMain}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.categoryTag}>{item.category}</Text>
                </View>

                {isEditing ? (
                  <View style={styles.editInputsRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.editLabel}>Price ₹</Text>
                      <TextInput
                        style={styles.inlineInput}
                        value={editPriceVal}
                        onChangeText={setEditPriceVal}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.editLabel}>Stock</Text>
                      <TextInput
                        style={styles.inlineInput}
                        value={editStockVal}
                        onChangeText={setEditStockVal}
                        keyboardType="number-pad"
                      />
                    </View>
                    <Pressable
                      style={styles.saveEditBtn}
                      onPress={() => saveInlineEdit(item)}
                    >
                      <Text style={styles.saveEditBtnText}>Save</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.metricsRow}>
                    <Pressable onPress={() => startInlineEdit(item)}>
                      <Text style={styles.priceDisplay}>
                        ₹{item.price} / {item.unit}{' '}
                        <Text style={styles.editHint}>✎</Text>
                      </Text>
                    </Pressable>

                    {/* Stock Stepper */}
                    <View style={styles.stockStepper}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => handleStockDelta(item, -5)}
                      >
                        <Text style={styles.stepperBtnText}>-5</Text>
                      </Pressable>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => handleStockDelta(item, -1)}
                      >
                        <Text style={styles.stepperBtnText}>-1</Text>
                      </Pressable>

                      <Pressable onPress={() => startInlineEdit(item)}>
                        <Text
                          style={[
                            styles.stockValue,
                            isZeroStock && styles.stockValueZero,
                          ]}
                        >
                          {item.stockQuantity}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => handleStockDelta(item, 1)}
                      >
                        <Text style={styles.stepperBtnText}>+1</Text>
                      </Pressable>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => handleStockDelta(item, 10)}
                      >
                        <Text style={styles.stepperBtnText}>+10</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              {/* Visibility Switch */}
              <View style={styles.switchCol}>
                <Switch
                  value={!item.isDisabled && item.stockQuantity > 0}
                  onValueChange={() => handleToggleDisabled(item)}
                  trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                  thumbColor={!item.isDisabled ? '#0C831F' : '#9CA3AF'}
                />
                <Text style={styles.switchLabel}>
                  {item.isDisabled ? 'Disabled' : 'Active'}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Add New Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product to Inventory</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView>
              <Text style={styles.fieldLabel}>Product Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Fresh Baby Spinach"
                placeholderTextColor="#9CA3AF"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.catGrid}>
                {(
                  [
                    'leafy_greens',
                    'veggies',
                    'rice_bags',
                    'organic_specials',
                  ] as const
                ).map(c => (
                  <Pressable
                    key={c}
                    style={[
                      styles.catChoice,
                      newCategory === c && styles.catChoiceActive,
                    ]}
                    onPress={() => setNewCategory(c)}
                  >
                    <Text
                      style={[
                        styles.catChoiceText,
                        newCategory === c && styles.catChoiceTextActive,
                      ]}
                    >
                      {c.replace('_', ' ').toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Price (₹) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="decimal-pad"
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Unit</Text>
                  <View style={styles.unitRow}>
                    {(['kg', '500g', 'bunch', 'bag', 'bottle'] as const).map(u => (
                      <Pressable
                        key={u}
                        style={[
                          styles.unitPill,
                          newUnit === u && styles.unitPillActive,
                        ]}
                        onPress={() => setNewUnit(u)}
                      >
                        <Text
                          style={[
                            styles.unitPillText,
                            newUnit === u && styles.unitPillTextActive,
                          ]}
                        >
                          {u}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Opening Stock Quantity</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="number-pad"
                value={newStock}
                onChangeText={setNewStock}
              />

              {/* Royalty-Free Unsplash Image Picker Trigger */}
              <Text style={styles.fieldLabel}>Royalty-Free Image URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://images.unsplash.com/photo-..."
                placeholderTextColor="#9CA3AF"
                value={newImageUrl}
                onChangeText={setNewImageUrl}
              />

              <Pressable
                style={styles.pickPresetBtn}
                onPress={() => setUnsplashPickerVisible(true)}
              >
                <Text style={styles.pickPresetBtnText}>
                  🖼️ Pick from Curated Unsplash Presets
                </Text>
              </Pressable>

              <Pressable
                style={styles.submitProductBtn}
                onPress={handleCreateProduct}
              >
                <Text style={styles.submitProductBtnText}>
                  Add to Live Farm Catalog
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Unsplash Presets Modal */}
      <Modal
        visible={unsplashPickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setUnsplashPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '75%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick Royalty-Free Image</Text>
              <Pressable onPress={() => setUnsplashPickerVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <FlatList
              data={UNSPLASH_PRESETS}
              keyExtractor={item => item.url}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.presetItem}
                  onPress={() => {
                    setNewImageUrl(item.url);
                    setUnsplashPickerVisible(false);
                  }}
                >
                  <Image source={{ uri: item.url }} style={styles.presetThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.presetLabel}>{item.label}</Text>
                    <Text style={styles.presetKeyword}>{item.keyword}</Text>
                  </View>
                  <Text style={styles.presetSelectText}>Select</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  previewBtn: {
    backgroundColor: '#E8F7EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0C831F',
  },
  previewBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
  },
  actionBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: '#0C831F',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  addProductBtn: {
    backgroundColor: '#0C831F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  listContent: {
    padding: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productRowZero: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  zeroBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: '#DC2626',
    borderRadius: 3,
    alignItems: 'center',
  },
  zeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  rowMain: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceDisplay: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C831F',
  },
  editHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  stockStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 2,
  },
  stepperBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  stockValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
    paddingHorizontal: 6,
  },
  stockValueZero: {
    color: '#DC2626',
  },
  editInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    marginRight: 6,
  },
  editLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
  },
  inlineInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#0C831F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 12,
    color: '#111827',
    minWidth: 45,
  },
  saveEditBtn: {
    backgroundColor: '#0C831F',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 10,
  },
  saveEditBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  switchCol: {
    alignItems: 'center',
    marginLeft: 8,
  },
  switchLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  modalClose: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#111827',
    marginBottom: 12,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  catChoice: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
    marginBottom: 6,
  },
  catChoiceActive: {
    backgroundColor: '#0C831F',
  },
  catChoiceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  catChoiceTextActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    marginRight: 4,
    marginBottom: 4,
  },
  unitPillActive: {
    backgroundColor: '#0C831F',
  },
  unitPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },
  pickPresetBtn: {
    backgroundColor: '#E8F7EC',
    borderWidth: 1,
    borderColor: '#0C831F',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  pickPresetBtnText: {
    color: '#0C831F',
    fontWeight: '800',
    fontSize: 13,
  },
  submitProductBtn: {
    backgroundColor: '#0C831F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitProductBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  presetThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  presetKeyword: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  presetSelectText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
    paddingHorizontal: 8,
  },
});
