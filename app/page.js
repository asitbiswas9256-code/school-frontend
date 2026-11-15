'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, PlusCircle, Truck, ShieldAlert, 
  Package, CheckCircle2, RefreshCw, Sparkles, 
  Trash2, User, LogOut, MapPin, ClipboardList, 
  Bike, Camera, CreditCard, Banknote, Settings, 
  ExternalLink, Search, ServerCrash, Server
} from 'lucide-react';

const API_URL = 'https://a2z-backend-tgls.onrender.com/api';

export default function SuperAppHome() {
  const [viewMode, setViewMode] = useState('STORE');
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState('');

  // NEW: Search, Sort, and Server Health States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('NEWEST');
  const [serverStatus, setServerStatus] = useState('IDLE'); // IDLE, WAKING_UP, CONNECTED, ERROR

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [cloudConfig, setCloudConfig] = useState({ cloudinaryCloudName: '', cloudinaryPreset: '', razorpayKeyId: '' });
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('LOGIN');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER', gstNumber: '' });

  const [isWholesale, setIsWholesale] = useState(false);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  const [formData, setFormData] = useState({
    name: '', category: 'GENERAL', price: '', wholesalePrice: '', minWholesaleQty: '10', stock: '100', requiresPrescription: false, imageUrl: ''
  });

  // Load saved user, cloud keys, and CACHED products for instant loading
  useEffect(() => {
    const savedUser = localStorage.getItem('a2z_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'WHOLESALE_BUYER') setIsWholesale(true);
      } catch (e) {}
    }
    const savedKeys = localStorage.getItem('a2z_cloud_keys');
    if (savedKeys) {
      try { setCloudConfig(JSON.parse(savedKeys)); } catch (e) {}
    }

    // Load cached products instantly while server wakes up
    const cachedProducts = localStorage.getItem('a2z_products');
    if (cachedProducts) {
      setProducts(JSON.parse(cachedProducts));
      setLoading(false); // Instantly stop the loading spinner!
    }

    fetchProducts();
    fetchOrders();
  }, []);

  const saveCloudKeys = (e) => {
    e.preventDefault();
    localStorage.setItem('a2z_cloud_keys', JSON.stringify(cloudConfig));
    setShowKeySettings(false);
    setStatusMsg('✅ Cloudinary & Razorpay keys saved on this device!');
  };

  const handleFileUpload = async (file, targetType) => {
    // ... [File upload code remains exactly the same]
    if (!file) return;
    setUploadingImg(true);
    setStatusMsg('📷 Processing photo...');
    try {
      let finalImageUrl = '';
      if (cloudConfig.cloudinaryCloudName && cloudConfig.cloudinaryPreset) {
        const formPayload = new FormData();
        formPayload.append('file', file);
        formPayload.append('upload_preset', cloudConfig.cloudinaryPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudConfig.cloudinaryCloudName}/image/upload`, { method: 'POST', body: formPayload });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
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
              const scaleSize = 500 / img.width;
              canvas.width = img.width > 500 ? 500 : img.width;
              canvas.height = img.width > 500 ? img.height * scaleSize : img.height;
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
        setStatusMsg('✅ Product photo attached!');
      } else if (targetType === 'PRESCRIPTION') {
        setPrescriptionUrl(finalImageUrl);
        setStatusMsg('✅ Prescription photo attached!');
      }
    } catch (err) {
      setStatusMsg(`❌ Upload Error: ${err.message}`);
    } finally {
      setUploadingImg(false);
    }
  };

  // SMART FETCH: Detects if Render is asleep
  const fetchProducts = async () => {
    if (products.length === 0) setLoading(true);
    
    // If no response in 1.5 seconds, assume Render free tier is waking up
    const timeoutId = setTimeout(() => setServerStatus('WAKING_UP'), 1500);

    try {
      const res = await fetch(`${API_URL}/products`);
      clearTimeout(timeoutId);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        localStorage.setItem('a2z_products', JSON.stringify(data)); // Update cache
        setServerStatus('CONNECTED');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setServerStatus('ERROR');
      console.error('Error fetching products:', err);
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
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => { /* Same as before */
    e.preventDefault();
    setStatusMsg(authMode === 'LOGIN' ? 'Logging in...' : 'Creating account...');
    try {
      const endpoint = authMode === 'LOGIN' ? '/users/login' : '/users/register';
      const payload = authMode === 'LOGIN' ? { email: authForm.email, password: authForm.password } : authForm;
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      const loggedInUser = data.user || { id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role, gstNumber: data.gstNumber };
      setCurrentUser(loggedInUser);
      localStorage.setItem('a2z_user', JSON.stringify(loggedInUser));
      if (loggedInUser.role === 'WHOLESALE_BUYER') setIsWholesale(true);
      setViewMode(loggedInUser.role === 'DELIVERY_PARTNER' ? 'ORDERS' : 'STORE');
      setStatusMsg(`✅ Welcome, ${loggedInUser.name}!`);
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleQuickDemoAuth = async (demoType) => { /* Same as before */
    const demoProfiles = {
      CUSTOMER: { name: 'Rahul Sharma (Retail)', email: 'retail@a2zdemo.com', password: 'password123', phone: '9876543210', role: 'CUSTOMER' },
      WHOLESALE_BUYER: { name: 'Biswas Kirana Store (B2B)', email: 'wholesale@a2zdemo.com', password: 'password123', phone: '9876500001', role: 'WHOLESALE_BUYER', gstNumber: '19ABCDE1234F1Z5' },
      DELIVERY_PARTNER: { name: 'Suman Rider (20-30km Fleet)', email: 'rider@a2zdemo.com', password: 'password123', phone: '9876599999', role: 'DELIVERY_PARTNER' }
    };
    const profile = demoProfiles[demoType];
    setStatusMsg(`Connecting as ${profile.name}...`);
    try {
      let res = await fetch(`${API_URL}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: profile.email, password: profile.password }) });
      if (!res.ok) {
        res = await fetch(`${API_URL}/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      const userObj = data.user || { id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role, gstNumber: data.gstNumber };
      setCurrentUser(userObj);
      localStorage.setItem('a2z_user', JSON.stringify(userObj));
      setIsWholesale(userObj.role === 'WHOLESALE_BUYER');
      setStatusMsg(`✅ Logged in as ${userObj.name}`);
      if (userObj.role === 'DELIVERY_PARTNER') { fetchOrders(); setViewMode('ORDERS'); } else { setViewMode('STORE'); }
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('a2z_user');
    setCurrentUser(null);
    setIsWholesale(false);
    setStatusMsg('Logged out successfully.');
  };

  const saveOrderToDatabase = async (paymentStatusText) => {
    setStatusMsg('Saving order to MongoDB...');
    try {
      const orderPayload = {
        customer: currentUser.id || currentUser._id,
        items: cart.map((item) => ({ product: item._id, quantity: item.qty, price: item.finalPrice })),
        totalAmount: cartTotal,
        deliveryAddress: `${deliveryAddress} [${paymentStatusText}]`,
        prescriptionUrl: prescriptionUrl || undefined,
        deliveryType: hasFood && hasNonFood ? 'SPLIT_FLEET' : hasFood ? 'IMMEDIATE_FOOD' : 'STANDARD_20_30KM',
        status: 'PENDING'
      };
      const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      setCart([]); setPrescriptionUrl('');
      setStatusMsg(`🎉 Order Placed (${paymentStatusText})!`);
      fetchOrders(); setViewMode('ORDERS');
    } catch (err) {
      setStatusMsg(`❌ Order Error: ${err.message}`);
    }
  };

  const handlePlaceOrder = async () => { /* Same as before */
    if (!currentUser) { setStatusMsg('⚠️ Please log in or tap a 1-Tap Demo Account first!'); setViewMode('ACCOUNT'); return; }
    if (needsRx && !prescriptionUrl.trim()) { alert('Please upload a Doctor Prescription photo or enter Rx ID for restricted medicine!'); return; }
    if (!deliveryAddress.trim()) { alert('Please enter your delivery address (within 20–30km radius)!'); return; }
    if (paymentMethod === 'COD') { await saveOrderToDatabase('COD - Pay on Delivery'); return; }
    if (cloudConfig.razorpayKeyId && typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: cloudConfig.razorpayKeyId, amount: cartTotal * 100, currency: 'INR', name: 'A2Z Wholesale & Retail', description: '20-30km Hyper-Local Order',
        handler: async function (response) { await saveOrderToDatabase(`PAID via Razorpay (${response.razorpay_payment_id})`); },
        prefill: { name: currentUser.name, email: currentUser.email, contact: currentUser.phone || '9876543210' }, theme: { color: '#4338ca' }
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
      if (currentUser && currentUser.role === 'DELIVERY_PARTNER') payload.deliveryPartner = currentUser.id || currentUser._id;
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
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
        name: formData.name, category: formData.category, price: Number(formData.price), wholesalePrice: Number(formData.wholesalePrice || formData.price),
        minWholesaleQty: Number(formData.minWholesaleQty || 10), stock: Number(formData.stock || 50), requiresPrescription: formData.requiresPrescription, imageUrl: formData.imageUrl
      };
      const res = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');
      setStatusMsg('✅ Product saved to MongoDB!');
      setFormData({ name: '', category: 'GENERAL', price: '', wholesalePrice: '', minWholesaleQty: '10', stock: '100', requiresPrescription: false, imageUrl: '' });
      fetchProducts(); setViewMode('STORE');
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleQuickDemoProduct = async () => { /* Same as before */
    setStatusMsg('Adding sample product with photo...');
    const samples = [
      { name: 'Aashirvaad Select Atta (10kg)', category: 'GENERAL', price: 460, wholesalePrice: 410, minWholesaleQty: 5, stock: 80, requiresPrescription: false, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80' },
      { name: 'Hyderabadi Chicken Biryani Pack', category: 'FOOD', price: 320, wholesalePrice: 280, minWholesaleQty: 5, stock: 30, requiresPrescription: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80' },
      { name: 'Augmentin 625 Duo Tablet Strip', category: 'MEDICINE', price: 200, wholesalePrice: 165, minWholesaleQty: 10, stock: 120, requiresPrescription: true, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80' },
      { name: 'SuperVOOC 65W Type-C Charger', category: 'ELECTRONICS', price: 799, wholesalePrice: 550, minWholesaleQty: 10, stock: 45, requiresPrescription: false, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80' }
    ];
    const randomItem = samples[Math.floor(Math.random() * samples.length)];
    try {
      const res = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(randomItem) });
      if (res.ok) { setStatusMsg(`✅ Added "${randomItem.name}"!`); fetchProducts(); }
    } catch (err) { setStatusMsg('❌ Failed to add sample item'); }
  };

  const addToCart = (product) => {
    const qtyToAdd = isWholesale ? (product.minWholesaleQty || 5) : 1;
    const unitPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
    setCart((prev) => [...prev, { ...product, qty: qtyToAdd, finalPrice: unitPrice }]);
    setStatusMsg(`🛒 Added ${product.name} (×${qtyToAdd}) to cart`);
  };

  const removeFromCart = (index) => setCart((prev) => prev.filter((_, i) => i !== index));

  // SMART SEARCH & FILTER LOGIC
  let processedProducts = activeTab === 'ALL' ? products : products.filter((p) => p.category === activeTab);
  
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    processedProducts = processedProducts.filter(p => p.name.toLowerCase().includes(lowerQuery));
  }

  processedProducts.sort((a, b) => {
    const priceA = isWholesale ? (a.wholesalePrice || a.price) : a.price;
    const priceB = isWholesale ? (b.wholesalePrice || b.price) : b.price;
    
    if (sortOption === 'PRICE_LOW_HIGH') return priceA - priceB;
    if (sortOption === 'PRICE_HIGH_LOW') return priceB - priceA;
    return 0; // Default order (usually newest from MongoDB)
  });

  const hasFood = cart.some((item) => item.category === 'FOOD');
  const hasNonFood = cart.some((item) => item.category !== 'FOOD');
  const needsRx = cart.some((item) => item.category === 'MEDICINE' && item.requiresPrescription);
  const cartTotal = cart.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  return (
    <div className="min-h-screen pb-28 bg-slate-50">
      {/* Top Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div onClick={() => setViewMode('STORE')} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">A2Z Super App</h1>
            </div>
            <p className="text-[11px] text-indigo-200 flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3" /> 20–30km Hyper-Local Wholesale & Retail
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setViewMode('STORE')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'STORE' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'}`}>Store</button>
            <button onClick={() => { fetchOrders(); setViewMode('ORDERS'); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${viewMode === 'ORDERS' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'}`}>
              <Bike className="w-3.5 h-3.5" /> Orders
            </button>
            <button onClick={() => setViewMode('ADMIN')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-indigo-100'}`}>+ Admin</button>
            <button onClick={() => setViewMode('ACCOUNT')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${viewMode === 'ACCOUNT' ? 'bg-emerald-400 text-slate-950' : 'bg-indigo-800 text-amber-300'}`}>
              <User className="w-3.5 h-3.5" /> {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
            </button>
          </div>
        </div>

        {/* Server Status & Wholesale Toggle Bar */}
        <div className="bg-indigo-800 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
            {serverStatus === 'WAKING_UP' ? (
              <span className="text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                <Server className="w-3.5 h-3.5" /> Waking up Render server (~40s)...
              </span>
            ) : serverStatus === 'ERROR' ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <ServerCrash className="w-3.5 h-3.5" /> Offline - Refreshing...
              </span>
            ) : (
              <span className="text-indigo-100 font-medium truncate">
                {isWholesale ? '📦 B2B Wholesale Rates Active' : '🛍️ Standard Retail Pricing'}
                {currentUser ? ` • ${currentUser.role}` : ''}
              </span>
            )}
            
            {viewMode === 'STORE' && (
              <button
                onClick={() => setIsWholesale(!isWholesale)}
                className={`ml-2 px-3 py-1 rounded-full font-bold transition whitespace-nowrap ${
                  isWholesale ? 'bg-emerald-400 text-slate-950' : 'bg-indigo-600 text-white border border-indigo-400'
                }`}
              >
                {isWholesale ? 'Switch to Retail' : 'Switch to Wholesale'}
              </button>
            )}
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

        {/* ==================== 1. ACCOUNT & LOGIN VIEW ==================== */}
        {viewMode === 'ACCOUNT' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{currentUser.role}</span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">{currentUser.name}</h2>
                    <p className="text-xs text-slate-500">{currentUser.email} • 📞 {currentUser.phone}</p>
                    {currentUser.gstNumber && <p className="text-xs font-semibold text-indigo-700 mt-1">GSTIN: {currentUser.gstNumber}</p>}
                  </div>
                  <button onClick={handleLogout} className="bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button onClick={() => setViewMode('STORE')} className="bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl">Go to Storefront</button>
                  <button onClick={() => { fetchOrders(); setViewMode('ORDERS'); }} className="bg-slate-800 text-white font-bold text-xs py-3 rounded-xl">View Live Orders</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1"><Sparkles className="w-4 h-4 text-indigo-600" /> 1-Tap Instant Login:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => handleQuickDemoAuth('CUSTOMER')} className="bg-white border border-slate-300 hover:border-indigo-500 text-left p-2.5 rounded-xl text-xs"><div className="font-bold text-slate-900">🛍️ Retail Customer</div></button>
                    <button onClick={() => handleQuickDemoAuth('WHOLESALE_BUYER')} className="bg-white border border-slate-300 hover:border-emerald-500 text-left p-2.5 rounded-xl text-xs"><div className="font-bold text-emerald-800">📦 Wholesale Buyer</div></button>
                    <button onClick={() => handleQuickDemoAuth('DELIVERY_PARTNER')} className="bg-white border border-slate-300 hover:border-amber-500 text-left p-2.5 rounded-xl text-xs"><div className="font-bold text-amber-800">🛵 Delivery Rider</div></button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 border-b pb-3">
                  <button onClick={() => setAuthMode('LOGIN')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${authMode === 'LOGIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Login</button>
                  <button onClick={() => setAuthMode('REGISTER')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${authMode === 'REGISTER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Register</button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === 'REGISTER' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Full Name / Shop Name *</label>
                        <input type="text" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                          <input type="text" required value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Account Role *</label>
                          <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                            <option value="CUSTOMER">Retail Customer</option>
                            <option value="WHOLESALE_BUYER">Wholesale Buyer</option>
                            <option value="DELIVERY_PARTNER">Delivery Partner</option>
                          </select>
                        </div>
                      </div>
                      {authForm.role === 'WHOLESALE_BUYER' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">GST Number (Optional)</label>
                          <input type="text" value={authForm.gstNumber} onChange={(e) => setAuthForm({ ...authForm, gstNumber: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
                    <input type="email" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
                    <input type="password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">{authMode === 'LOGIN' ? 'Login' : 'Register'}</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==================== 2. ORDERS & DELIVERY PARTNER VIEW ==================== */}
        {viewMode === 'ORDERS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border flex items-center justify-between">
              <div><h2 className="text-base font-extrabold flex items-center gap-1.5"><ClipboardList className="w-5 h-5 text-indigo-600" />Live Orders</h2></div>
              <button onClick={fetchOrders} className="bg-slate-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
            </div>
            {ordersLoading ? ( <div className="text-center py-12 text-slate-500 text-sm">Loading orders...</div>
            ) : orders.length === 0 ? ( <div className="bg-white rounded-2xl border p-8 text-center"><Bike className="w-10 h-10 text-indigo-400 mx-auto mb-2" /><h3 className="font-bold text-slate-800">No Orders Yet</h3></div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl p-4 border shadow-sm space-y-3">
                    <div className="flex items-start justify-between border-b pb-2.5">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">{order.status || 'PENDING'}</span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{order.customer?.name}</h3>
                        {order.deliveryAddress && <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />{order.deliveryAddress}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-indigo-700">₹{order.totalAmount}</div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700"><span>• {item.product?.name} × {item.quantity}</span><span className="font-semibold">₹{(item.price || item.product?.price || 0) * (item.quantity || 1)}</span></div>
                      ))}
                    </div>
                    {order.prescriptionUrl && (
                      <div className="text-xs bg-rose-50 border border-rose-200 text-rose-900 p-2.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {order.prescriptionUrl.startsWith('http') && <img src={order.prescriptionUrl} className="w-10 h-10 object-cover rounded" alt="rx"/>}
                          <div className="font-bold">🩺 Prescription Attached</div>
                        </div>
                      </div>
                    )}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">{order.deliveryPartner?.name ? `🛵 Assigned: ${order.deliveryPartner.name}` : '🛵 Awaiting Rider'}</span>
                      <div className="flex gap-1.5">
                        {['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                          <button key={st} onClick={() => handleUpdateOrderStatus(order._id, st)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${order.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-indigo-100 text-slate-700'}`}>{st.replace(/_/g, ' ')}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. ADMIN PANEL VIEW ==================== */}
        {viewMode === 'ADMIN' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-bold">Add New Product</h2>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowKeySettings(!showKeySettings)} className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Cloud Keys</button>
                  <button type="button" onClick={handleQuickDemoProduct} className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> 1-Tap Item</button>
                </div>
              </div>
              {showKeySettings && (
                <form onSubmit={saveCloudKeys} className="mb-5 p-4 rounded-xl bg-slate-50 border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div><label className="block text-[11px] font-bold">Cloudinary Name</label><input type="text" value={cloudConfig.cloudinaryCloudName} onChange={(e) => setCloudConfig({ ...cloudConfig, cloudinaryCloudName: e.target.value.trim() })} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" /></div>
                    <div><label className="block text-[11px] font-bold">Upload Preset</label><input type="text" value={cloudConfig.cloudinaryPreset} onChange={(e) => setCloudConfig({ ...cloudConfig, cloudinaryPreset: e.target.value.trim() })} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" /></div>
                    <div><label className="block text-[11px] font-bold">Razorpay Key ID</label><input type="text" value={cloudConfig.razorpayKeyId} onChange={(e) => setCloudConfig({ ...cloudConfig, razorpayKeyId: e.target.value.trim() })} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" /></div>
                  </div>
                  <button type="submit" className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg">Save Keys</button>
                </form>
              )}
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div><label className="block text-xs font-bold mb-1">Product Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
                <div className="p-3.5 rounded-xl bg-indigo-50 border space-y-2">
                  <label className="block text-xs font-bold">📷 Product Photo</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="cursor-pointer bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                      <Camera className="w-4 h-4" />{uploadingImg ? 'Uploading...' : 'Take Photo'}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRODUCT')} />
                    </label>
                    <input type="text" placeholder="Or paste image link" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Category *</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="GENERAL">GENERAL</option><option value="FOOD">FOOD</option><option value="MEDICINE">MEDICINE</option><option value="ELECTRONICS">ELECTRONICS</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-bold mb-1">Stock Qty</label><input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold mb-1">Retail Price (₹) *</label><input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
                  <div><label className="block text-xs font-bold mb-1">Wholesale Price (₹)</label><input type="number" value={formData.wholesalePrice} onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
                </div>
                {formData.category === 'MEDICINE' && (
                  <label className="flex items-center gap-2 bg-rose-50 border p-3 rounded-xl text-xs font-semibold text-rose-900"><input type="checkbox" checked={formData.requiresPrescription} onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })} className="w-4 h-4"/>Rx Mandatory</label>
                )}
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Save Product</button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== 4. STOREFRONT & SMART CART VIEW ==================== */}
        {viewMode === 'STORE' && (
          <>
            {/* SEARCH & FILTER BAR */}
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search groceries, medicines..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="NEWEST">Newest</option>
                  <option value="PRICE_LOW_HIGH">Price: Low - High</option>
                  <option value="PRICE_HIGH_LOW">Price: High - Low</option>
                </select>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['ALL', 'GENERAL', 'FOOD', 'MEDICINE', 'ELECTRONICS'].map((cat) => (
                  <button
                    key={cat} onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${activeTab === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    {cat === 'ALL' ? 'All Items' : cat}
                  </button>
                ))}
                <button onClick={fetchProducts} className="px-3 py-2 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1">
                  <RefreshCw className={`w-3.5 h-3.5 ${serverStatus === 'WAKING_UP' ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {loading && products.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center">
                <Server className="w-8 h-8 text-indigo-300 animate-pulse mb-2" />
                Connecting to Database...
              </div>
            ) : processedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4">
                <Package className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No matching products</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Try a different search or add a sample product below.</p>
                <button onClick={() => setViewMode('ADMIN')} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">Go to Admin Panel</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {processedProducts.map((product) => {
                  const displayPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
                  return (
                    <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        {product.imageUrl && (
                          <div className="h-40 w-full bg-slate-100 overflow-hidden">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4 pb-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">{product.category}</span>
                            {product.requiresPrescription && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Rx</span>}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                        </div>
                      </div>
                      <div className="p-4 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-extrabold text-indigo-700">₹{displayPrice}{isWholesale && <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">₹{product.price}</span>}</div>
                          <div className="text-[11px] text-slate-500">{isWholesale ? `Min Order: ${product.minWholesaleQty || 5}` : 'Fast Delivery'}</div>
                        </div>
                        <button onClick={() => addToCart(product)} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">+ Add</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Smart Cart */}
            {cart.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border-2 border-indigo-600 p-4 shadow-lg">
                <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center justify-between">
                  <span>Smart Cart ({cart.length} items)</span><span className="text-indigo-700 text-base">Total: ₹{cartTotal}</span>
                </h3>
                {needsRx && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                    <p className="font-bold">🩺 Doctor Prescription Required *</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer bg-rose-600 text-white font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shrink-0">
                        <Camera className="w-3.5 h-3.5" />{uploadingImg ? 'Uploading...' : 'Upload Rx'}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRESCRIPTION')} />
                      </label>
                      <input type="text" placeholder="Or enter Rx ID..." value={prescriptionUrl} onChange={(e) => setPrescriptionUrl(e.target.value)} className="w-full border rounded-lg px-2.5 py-1.5 text-xs" />
                    </div>
                  </div>
                )}
                <div className="mb-3"><label className="block text-xs font-bold mb-1">📍 Delivery Address *</label><input type="text" placeholder="Enter address..." value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-xs" /></div>
                <div className="mb-3">
                  <label className="block text-xs font-bold mb-1.5">💳 Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPaymentMethod('RAZORPAY')} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${paymentMethod === 'RAZORPAY' ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white text-slate-600'}`}><CreditCard className="w-4 h-4 text-indigo-600" /> Razorpay</button>
                    <button type="button" onClick={() => setPaymentMethod('COD')} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${paymentMethod === 'COD' ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white text-slate-600'}`}><Banknote className="w-4 h-4 text-emerald-600" /> COD</button>
                  </div>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-slate-50 p-2 rounded-lg"><span className="font-medium">{item.name} × {item.qty}</span><div className="flex gap-2"><span className="font-bold">₹{item.finalPrice * item.qty}</span><button onClick={() => removeFromCart(idx)} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button></div></div>
                  ))}
                </div>
                <button onClick={handlePlaceOrder} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Place Order</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
