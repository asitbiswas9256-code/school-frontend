'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Truck, ShieldAlert, Package, CheckCircle2, 
  RefreshCw, Sparkles, Trash2, User, LogOut, MapPin, 
  ClipboardList, Bike, Camera, CreditCard, Banknote, 
  Settings, ExternalLink, Search, ServerCrash, Server, Languages
} from 'lucide-react';

const API_URL = 'https://a2z-backend-tgls.onrender.com/api';

export default function SuperAppHome() {
  const [viewMode, setViewMode] = useState('STORE');
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState('');
  const [lang, setLang] = useState('EN'); // 'EN' or 'BN' (Bengali)

  // Search, Sort & Server Wake-Up States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('NEWEST');
  const [serverStatus, setServerStatus] = useState('IDLE'); // IDLE | WAKING_UP | CONNECTED | ERROR

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Cloud Keys State
  const [cloudConfig, setCloudConfig] = useState({
    cloudinaryCloudName: '',
    cloudinaryPreset: '',
    razorpayKeyId: ''
  });
  const [showKeySettings, setShowKeySettings] = useState(false);

  // User & Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('LOGIN');
  const [authForm, setAuthForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'CUSTOMER', gstNumber: ''
  });

  // Cart & Checkout States
  const [isWholesale, setIsWholesale] = useState(false);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  // Admin Form State
  const [formData, setFormData] = useState({
    name: '', category: 'GENERAL', price: '', wholesalePrice: '',
    minWholesaleQty: '10', stock: '100', requiresPrescription: false, imageUrl: ''
  });

  // Bilingual Dictionary (English & Bengali)
  const t = {
    EN: {
      subtitle: '20–30km Hyper-Local Wholesale & Retail',
      store: 'Store',
      orders: 'Orders',
      admin: '+ Admin',
      login: 'Login',
      wholesaleActive: '📦 B2B Wholesale Rates Active',
      retailActive: '🛍️ Standard Retail Pricing',
      switchRetail: 'Switch to Retail',
      switchWholesale: 'Switch to Wholesale',
      searchPlaceholder: 'Search groceries, food, medicine, charger...',
      allItems: 'All Items',
      wakingUp: 'Waking up Render server (~30s)... Showing saved items',
      offline: 'Server sleeping or offline — Tap refresh',
      fastDelivery: '20–30km Fast Delivery'
    },
    BN: {
      subtitle: '২০–৩০ কিমি হাইপার-লোকাল হোলসেল ও রিটেল ডেলিভারি',
      store: 'দোকান',
      orders: 'অর্ডার',
      admin: '+ অ্যাডমিন',
      login: 'লগইন',
      wholesaleActive: '📦 পাইকারি (B2B) রেট চালু আছে',
      retailActive: '🛍️ খুচরো (Retail) দাম চালু আছে',
      switchRetail: 'খুচরো রেট দেখুন',
      switchWholesale: 'পাইকারি রেট দেখুন',
      searchPlaceholder: 'মুদিখানা, খাবার, ওষুধ বা চার্জার খুঁজুন...',
      allItems: 'সব পণ্য',
      wakingUp: 'সার্ভার চালু হচ্ছে (~৩০ সেকেন্ড)... সংরক্ষিত পণ্য দেখানো হচ্ছে',
      offline: 'সার্ভার অফলাইন — রিফ্রেশ করুন',
      fastDelivery: '২০–৩০ কিমি দ্রুত ডেলিভারি'
    }
  }[lang];

  // Load cached data immediately so user never waits for Render spin-up
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('a2z_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'WHOLESALE_BUYER') setIsWholesale(true);
      }

      const savedKeys = localStorage.getItem('a2z_cloud_keys');
      if (savedKeys) setCloudConfig(JSON.parse(savedKeys));

      const cachedProducts = localStorage.getItem('a2z_products_cache');
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
          setLoading(false);
        }
      }

      const savedCart = localStorage.getItem('a2z_cart_cache');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error(e);
    }

    fetchProducts();
    fetchOrders();
  }, []);

  // Save Cart to phone storage automatically
  useEffect(() => {
    try {
      localStorage.setItem('a2z_cart_cache', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const saveCloudKeys = (e) => {
    e.preventDefault();
    localStorage.setItem('a2z_cloud_keys', JSON.stringify(cloudConfig));
    setShowKeySettings(false);
    setStatusMsg('✅ Cloud keys saved on this phone!');
  };

  // Smart Fetch with Render Wake-Up Detector
  const fetchProducts = async () => {
    if (products.length === 0) setLoading(true);
    const wakeTimer = setTimeout(() => setServerStatus('WAKING_UP'), 1500);

    try {
      const res = await fetch(`${API_URL}/products`);
      clearTimeout(wakeTimer);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        localStorage.setItem('a2z_products_cache', JSON.stringify(data));
        setServerStatus('CONNECTED');
      }
    } catch (err) {
      clearTimeout(wakeTimer);
      setServerStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Camera & Gallery Photo Uploader
  const handleFileUpload = async (file, targetType) => {
    if (!file) return;
    setUploadingImg(true);
    setStatusMsg('📷 Processing photo...');
    try {
      let finalImageUrl = '';
      if (cloudConfig.cloudinaryCloudName && cloudConfig.cloudinaryPreset) {
        const formPayload = new FormData();
        formPayload.append('file', file);
        formPayload.append('upload_preset', cloudConfig.cloudinaryPreset);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudConfig.cloudinaryCloudName}/image/upload`,
          { method: 'POST', body: formPayload }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
        finalImageUrl = data.secure_url;
      } else {
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 500;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
              canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.72));
            };
            img.onerror = reject;
          };
          reader.onerror = reject;
        });
      }

      if (targetType === 'PRODUCT') {
        setFormData((prev) => ({ ...prev, imageUrl: finalImageUrl }));
        setStatusMsg('✅ Product photo ready!');
      } else {
        setPrescriptionUrl(finalImageUrl);
        setStatusMsg('✅ Prescription photo attached!');
      }
    } catch (err) {
      setStatusMsg(`❌ Upload Error: ${err.message}`);
    } finally {
      setUploadingImg(false);
    }
  };

  // Login / Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(authMode === 'LOGIN' ? 'Logging in...' : 'Registering...');
    try {
      const endpoint = authMode === 'LOGIN' ? '/users/login' : '/users/register';
      const payload = authMode === 'LOGIN'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      const userObj = data.user || {
        id: data._id, name: data.name, email: data.email,
        phone: data.phone, role: data.role, gstNumber: data.gstNumber
      };
      setCurrentUser(userObj);
      localStorage.setItem('a2z_user', JSON.stringify(userObj));
      setIsWholesale(userObj.role === 'WHOLESALE_BUYER');
      setViewMode(userObj.role === 'DELIVERY_PARTNER' ? 'ORDERS' : 'STORE');
      setStatusMsg(`✅ Welcome, ${userObj.name}!`);
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  // 1-Tap Instant Demo Login
  const handleQuickDemoAuth = async (demoType) => {
    const profiles = {
      CUSTOMER: { name: 'Rahul Sharma (Retail)', email: 'retail@a2zdemo.com', password: 'password123', phone: '9876543210', role: 'CUSTOMER' },
      WHOLESALE_BUYER: { name: 'Biswas Kirana Store (B2B)', email: 'wholesale@a2zdemo.com', password: 'password123', phone: '9876500001', role: 'WHOLESALE_BUYER', gstNumber: '19ABCDE1234F1Z5' },
      DELIVERY_PARTNER: { name: 'Suman Rider (20-30km Fleet)', email: 'rider@a2zdemo.com', password: 'password123', phone: '9876599999', role: 'DELIVERY_PARTNER' }
    };
    const profile = profiles[demoType];
    setStatusMsg(`Connecting as ${profile.name}...`);

    try {
      let res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, password: profile.password })
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      const userObj = data.user || {
        id: data._id, name: data.name, email: data.email,
        phone: data.phone, role: data.role, gstNumber: data.gstNumber
      };
      setCurrentUser(userObj);
      localStorage.setItem('a2z_user', JSON.stringify(userObj));
      setIsWholesale(userObj.role === 'WHOLESALE_BUYER');
      setStatusMsg(`✅ Logged in as ${userObj.name}`);
      setViewMode(userObj.role === 'DELIVERY_PARTNER' ? 'ORDERS' : 'STORE');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('a2z_user');
    setCurrentUser(null);
    setIsWholesale(false);
    setStatusMsg('Logged out.');
  };

  // Save Order to MongoDB
  const saveOrderToDatabase = async (paymentLabel) => {
    setStatusMsg('Saving order to MongoDB...');
    try {
      const orderPayload = {
        customer: currentUser.id || currentUser._id,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.qty,
          price: item.finalPrice
        })),
        totalAmount: cartTotal,
        deliveryAddress: `${deliveryAddress} [${paymentLabel}]`,
        prescriptionUrl: prescriptionUrl || undefined,
        deliveryType: hasFood && hasNonFood ? 'SPLIT_FLEET' : hasFood ? 'IMMEDIATE_FOOD' : 'STANDARD_20_30KM',
        status: 'PENDING'
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      setCart([]);
      localStorage.removeItem('a2z_cart_cache');
      setPrescriptionUrl('');
      setStatusMsg(`🎉 Order Placed (${paymentLabel})!`);
      fetchOrders();
      setViewMode('ORDERS');
    } catch (err) {
      setStatusMsg(`❌ Order Error: ${err.message}`);
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      setStatusMsg('⚠️ Please login or tap a 1-Tap Demo Account first!');
      setViewMode('ACCOUNT');
      return;
    }
    if (needsRx && !prescriptionUrl.trim()) {
      alert('Prescription photo or Rx ID is required for restricted medicines!');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Please enter your delivery address (within 20–30km radius)!');
      return;
    }

    if (paymentMethod === 'COD') {
      await saveOrderToDatabase('COD - Pay on Delivery');
      return;
    }

    if (cloudConfig.razorpayKeyId && typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: cloudConfig.razorpayKeyId,
        amount: cartTotal * 100,
        currency: 'INR',
        name: 'A2Z Super App',
        description: '20-30km Hyper-Local Order',
        handler: async function (response) {
          await saveOrderToDatabase(`PAID via Razorpay (${response.razorpay_payment_id})`);
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone || '9876543210'
        },
        theme: { color: '#4338ca' }
      };
      new window.Razorpay(options).open();
    } else {
      const demoPayId = 'pay_A2Z' + Math.floor(100000 + Math.random() * 900000);
      await saveOrderToDatabase(`PAID Online (${demoPayId})`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setStatusMsg(`Updating order to ${newStatus}...`);
    try {
      const payload = { status: newStatus };
      if (currentUser?.role === 'DELIVERY_PARTNER') {
        payload.deliveryPartner = currentUser.id || currentUser._id;
      }
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Update failed');
      setStatusMsg(`✅ Order marked as ${newStatus}!`);
      fetchOrders();
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving product to MongoDB...');
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        wholesalePrice: Number(formData.wholesalePrice || formData.price),
        minWholesaleQty: Number(formData.minWholesaleQty || 10),
        stock: Number(formData.stock || 50),
        requiresPrescription: formData.requiresPrescription,
        imageUrl: formData.imageUrl
      };
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save product');
      setStatusMsg('✅ Product saved!');
      setFormData({
        name: '', category: 'GENERAL', price: '', wholesalePrice: '',
        minWholesaleQty: '10', stock: '100', requiresPrescription: false, imageUrl: ''
      });
      fetchProducts();
      setViewMode('STORE');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleQuickDemoProduct = async () => {
    setStatusMsg('Adding sample product...');
    const samples = [
      { name: 'Aashirvaad Select Atta (10kg)', category: 'GENERAL', price: 460, wholesalePrice: 410, minWholesaleQty: 5, stock: 80, requiresPrescription: false, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80' },
      { name: 'Hyderabadi Chicken Biryani Pack', category: 'FOOD', price: 320, wholesalePrice: 280, minWholesaleQty: 5, stock: 30, requiresPrescription: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80' },
      { name: 'Augmentin 625 Duo Tablet Strip', category: 'MEDICINE', price: 200, wholesalePrice: 165, minWholesaleQty: 10, stock: 120, requiresPrescription: true, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80' },
      { name: 'SuperVOOC 65W Type-C Fast Charger', category: 'ELECTRONICS', price: 799, wholesalePrice: 550, minWholesaleQty: 10, stock: 45, requiresPrescription: false, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80' }
    ];
    const randomItem = samples[Math.floor(Math.random() * samples.length)];
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(randomItem)
      });
      if (res.ok) {
        setStatusMsg(`✅ Added "${randomItem.name}"!`);
        fetchProducts();
      }
    } catch (err) {
      setStatusMsg('❌ Failed to add sample item');
    }
  };

  const addToCart = (product) => {
    const qtyToAdd = isWholesale ? (product.minWholesaleQty || 5) : 1;
    const unitPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
    setCart((prev) => [...prev, { ...product, qty: qtyToAdd, finalPrice: unitPrice }]);
    setStatusMsg(`🛒 Added ${product.name} (×${qtyToAdd})`);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Search & Sort Filter Pipeline
  const processedProducts = products
    .filter((p) => (activeTab === 'ALL' ? true : p.category === activeTab))
    .filter((p) =>
      searchQuery.trim() === ''
        ? true
        : (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const priceA = isWholesale ? (a.wholesalePrice || a.price) : a.price;
      const priceB = isWholesale ? (b.wholesalePrice || b.price) : b.price;
      if (sortOption === 'PRICE_LOW') return priceA - priceB;
      if (sortOption === 'PRICE_HIGH') return priceB - priceA;
      return 0;
    });

  const hasFood = cart.some((item) => item.category === 'FOOD');
  const hasNonFood = cart.some((item) => item.category !== 'FOOD');
  const needsRx = cart.some((item) => item.category === 'MEDICINE' && item.requiresPrescription);
  const cartTotal = cart.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  return (
    <div className="min-h-screen pb-28 bg-slate-50">
      {/* Top Navbar */}
      <header className="bg-indigo-700 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div onClick={() => setViewMode('STORE')} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-300 shrink-0" />
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight">A2Z Super App</h1>
            </div>
            <p className="text-[11px] text-indigo-200 flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 shrink-0" /> {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="px-2 py-1.5 rounded-lg text-xs font-extrabold bg-indigo-900 text-amber-300 border border-indigo-500 flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5" /> {lang === 'EN' ? 'বাংলা' : 'EN'}
            </button>
            <button
              onClick={() => setViewMode('STORE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                viewMode === 'STORE' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              {t.store}
            </button>
            <button
              onClick={() => { fetchOrders(); setViewMode('ORDERS'); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewMode === 'ORDERS' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              <Bike className="w-3.5 h-3.5" /> {t.orders} ({orders.length})
            </button>
            <button
              onClick={() => setViewMode('ADMIN')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                viewMode === 'ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              {t.admin}
            </button>
            <button
              onClick={() => setViewMode('ACCOUNT')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewMode === 'ACCOUNT' ? 'bg-emerald-400 text-slate-950' : 'bg-indigo-800 text-amber-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {currentUser ? currentUser.name.split(' ')[0] : t.login}
            </button>
          </div>
        </div>

        {/* Sub-Header: Server Wake Status + Wholesale Toggle */}
        <div className="bg-indigo-800 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs gap-2">
            {serverStatus === 'WAKING_UP' ? (
              <span className="text-amber-300 font-bold flex items-center gap-1.5 animate-pulse truncate">
                <Server className="w-3.5 h-3.5 shrink-0" /> {t.wakingUp}
              </span>
            ) : serverStatus === 'ERROR' ? (
              <span className="text-rose-300 font-bold flex items-center gap-1.5 truncate">
                <ServerCrash className="w-3.5 h-3.5 shrink-0" /> {t.offline}
              </span>
            ) : (
              <span className="text-indigo-100 font-medium truncate">
                {isWholesale ? t.wholesaleActive : t.retailActive}
              </span>
            )}

            <button
              onClick={() => setIsWholesale(!isWholesale)}
              className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap shrink-0 ${
                isWholesale
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-indigo-600 text-white border border-indigo-400'
              }`}
            >
              {isWholesale ? t.switchRetail : t.switchWholesale}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-xs font-bold underline ml-2">OK</button>
          </div>
        )}

        {/* ==================== STOREFRONT VIEW ==================== */}
        {viewMode === 'STORE' && (
          <>
            {/* Search & Price Sort Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-3 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="NEWEST">Sort: Newest First</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                </select>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['ALL', 'GENERAL', 'FOOD', 'MEDICINE', 'ELECTRONICS'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      activeTab === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? t.allItems : cat}
                  </button>
                ))}
                <button
                  onClick={fetchProducts}
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 ml-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serverStatus === 'WAKING_UP' ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {loading && products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center my-4">
                <Server className="w-8 h-8 text-indigo-500 animate-bounce mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Connecting to Live Render Server...</h3>
                <p className="text-xs text-slate-500 mt-1">
                  First load wakes up the cloud server (~20-30 seconds). Subsequent loads are instant!
                </p>
              </div>
            ) : processedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4">
                <Package className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No Matching Products Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Try clearing your search filter or tap below to add a sample product.
                </p>
                <button
                  onClick={handleQuickDemoProduct}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Add 1-Tap Sample Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {processedProducts.map((product) => {
                  const displayPrice = isWholesale && product.wholesalePrice
                    ? product.wholesalePrice
                    : product.price;

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {product.imageUrl && (
                          <div className="h-40 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 pb-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {product.category}
                            </span>
                            {product.requiresPrescription && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Rx Required
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                        </div>
                      </div>

                      <div className="p-4 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-extrabold text-indigo-700">
                            ₹{displayPrice}
                            {isWholesale && (
                              <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isWholesale
                              ? `Min Order: ${product.minWholesaleQty || 5} units`
                              : t.fastDelivery}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
                        >
                          + Add {isWholesale ? `(${product.minWholesaleQty || 5})` : ''}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Smart Cart Box */}
            {cart.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border-2 border-indigo-600 p-4 shadow-lg">
                <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center justify-between">
                  <span>Smart Cart ({cart.length} items)</span>
                  <span className="text-indigo-700 text-base">Total: ₹{cartTotal}</span>
                </h3>

                {hasFood && hasNonFood && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    ⚡ <strong>Split Fleet Dispatch:</strong> Hot Food will arrive in 35 mins via Immediate Rider. Wholesale/General items will arrive via 20–30km Utility Fleet.
                  </div>
                )}

                {needsRx && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                    <p className="font-bold">🩺 Doctor Prescription Required *</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer bg-rose-600 text-white font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shrink-0">
                        <Camera className="w-3.5 h-3.5" />
                        {uploadingImg ? 'Uploading...' : 'Upload Rx Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRESCRIPTION')}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or enter Doctor Rx ID..."
                        value={prescriptionUrl}
                        onChange={(e) => setPrescriptionUrl(e.target.value)}
                        className="w-full border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📍 Delivery Address (20–30km Zone) *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter village/town, landmark, and pin code..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    💳 Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'RAZORPAY'
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-600" /> Razorpay (UPI/Card)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'COD'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                      <span className="font-medium text-slate-800">{item.name} × {item.qty}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{item.finalPrice * item.qty}</span>
                        <button onClick={() => removeFromCart(idx)} className="text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {paymentMethod === 'RAZORPAY'
                    ? `Pay ₹${cartTotal} via Razorpay & Order`
                    : `Place COD Order (₹${cartTotal})`}
                </button>
              </div>
            )}
          </>
        )}

        {/* ==================== ACCOUNT VIEW ==================== */}
        {viewMode === 'ACCOUNT' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {currentUser.role}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">{currentUser.name}</h2>
                    <p className="text-xs text-slate-500">{currentUser.email} • 📞 {currentUser.phone}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setViewMode('STORE')} className="bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl">
                    Go to Storefront
                  </button>
                  <button onClick={() => { fetchOrders(); setViewMode('ORDERS'); }} className="bg-slate-800 text-white font-bold text-xs py-3 rounded-xl">
                    View Live Orders
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> 1-Tap Instant Demo Login:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => handleQuickDemoAuth('CUSTOMER')} className="bg-white border p-2.5 rounded-xl text-xs text-left font-bold">
                      🛍️ Retail Customer
                    </button>
                    <button onClick={() => handleQuickDemoAuth('WHOLESALE_BUYER')} className="bg-white border p-2.5 rounded-xl text-xs text-left font-bold text-emerald-800">
                      📦 Wholesale Buyer (B2B)
                    </button>
                    <button onClick={() => handleQuickDemoAuth('DELIVERY_PARTNER')} className="bg-white border p-2.5 rounded-xl text-xs text-left font-bold text-amber-800">
                      🛵 Delivery Rider
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 border-b pb-3">
                  <button onClick={() => setAuthMode('LOGIN')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${authMode === 'LOGIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                    Login
                  </button>
                  <button onClick={() => setAuthMode('REGISTER')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${authMode === 'REGISTER' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === 'REGISTER' && (
                    <>
                      <input type="text" required placeholder="Full Name or Shop Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" required placeholder="Phone Number" value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                        <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                          <option value="CUSTOMER">Retail Customer</option>
                          <option value="WHOLESALE_BUYER">Wholesale Buyer</option>
                          <option value="DELIVERY_PARTNER">Delivery Partner</option>
                        </select>
                      </div>
                    </>
                  )}
                  <input type="email" required placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <input type="password" required placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">
                    {authMode === 'LOGIN' ? 'Login' : 'Create Account'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==================== ORDERS VIEW ==================== */}
        {viewMode === 'ORDERS' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border flex items-center justify-between">
              <h2 className="text-base font-extrabold flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 text-indigo-600" /> Live Orders ({orders.length})
              </h2>
              <button onClick={fetchOrders} className="bg-slate-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-sm text-slate-500">No orders placed yet.</div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl p-4 border shadow-sm space-y-2.5">
                  <div className="flex justify-between border-b pb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {order.status || 'PENDING'}
                      </span>
                      <h3 className="font-bold text-sm mt-1">{order.customer?.name || 'Customer'}</h3>
                      <p className="text-xs text-slate-500">{order.deliveryAddress}</p>
                    </div>
                    <div className="text-base font-extrabold text-indigo-700">₹{order.totalAmount}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(order._id, st)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                          order.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== ADMIN VIEW ==================== */}
        {viewMode === 'ADMIN' && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add New Product</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowKeySettings(!showKeySettings)} className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" /> Keys
                </button>
                <button type="button" onClick={handleQuickDemoProduct} className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> + Sample Item
                </button>
              </div>
            </div>

            {showKeySettings && (
              <form onSubmit={saveCloudKeys} className="p-3.5 rounded-xl bg-slate-50 border space-y-2.5">
                <input type="text" placeholder="Cloudinary Cloud Name" value={cloudConfig.cloudinaryCloudName} onChange={(e) => setCloudConfig({ ...cloudConfig, cloudinaryCloudName: e.target.value.trim() })} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" />
                <input type="text" placeholder="Cloudinary Upload Preset" value={cloudConfig.cloudinaryPreset} onChange={(e) => setCloudConfig({ ...cloudConfig, cloudinaryPreset: e.target.value.trim() })} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" />
                <input type="text" placeholder="Razorpay Key ID (rzp_test_...)" value={cloudConfig.razorpayKeyId} onChange={(e) => setCloudConfig({ ...cloudConfig, razorpayKeyId: e.target.value.trim() })} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" />
                <button type="submit" className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg">Save Keys</button>
              </form>
            )}

            <form onSubmit={handleAddProduct} className="space-y-3">
              <input type="text" required placeholder="Product Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              <div className="p-3 rounded-xl bg-indigo-50 border space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="cursor-pointer bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                    <Camera className="w-4 h-4" /> {uploadingImg ? 'Uploading...' : 'Take / Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRODUCT')} />
                  </label>
                  <input type="text" placeholder="Or paste image URL..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                  <option value="GENERAL">GENERAL</option>
                  <option value="FOOD">FOOD</option>
                  <option value="MEDICINE">MEDICINE</option>
                  <option value="ELECTRONICS">ELECTRONICS</option>
                </select>
                <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" required placeholder="Retail Price (₹) *" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                <input type="number" placeholder="Wholesale Price (₹)" value={formData.wholesalePrice} onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              {formData.category === 'MEDICINE' && (
                <label className="flex items-center gap-2 bg-rose-50 border p-3 rounded-xl text-xs font-semibold text-rose-900">
                  <input type="checkbox" checked={formData.requiresPrescription} onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })} className="w-4 h-4" />
                  Requires Doctor Prescription (Rx)
                </label>
              )}
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Save Product</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
