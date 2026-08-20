import { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isMock } from './supabaseClient';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Cart State (Persisted in LocalStorage)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aurastore_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aurastore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      fetchProfile(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const handleAuthSuccess = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user?.id);
    });
  };

  const handleLogout = () => {
    setProfile(null);
  };

  const handleRefreshProfile = () => {
    if (profile) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        fetchProfile(session?.user?.id);
      });
    }
  };

  // Cart Management Functions
  const handleAddToCart = (newItem) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => 
        item.id === newItem.id && 
        item.selectedSize === newItem.selectedSize && 
        item.selectedColor === newItem.selectedColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity || 1;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
    setCartDrawerOpen(true);
  };

  const handleUpdateCartQuantity = (targetItem, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(targetItem);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === targetItem.id && 
          item.selectedSize === targetItem.selectedSize && 
          item.selectedColor === targetItem.selectedColor) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (targetItem) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === targetItem.id && 
        item.selectedSize === targetItem.selectedSize && 
        item.selectedColor === targetItem.selectedColor)
    ));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>กำลังโหลด AURA APPAREL...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div style={styles.app}>
        <Navbar
          profile={profile}
          cartCount={totalCartCount}
          onCartClick={() => setCartDrawerOpen(true)}
          onAuthClick={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
            <Route path="/product/:productId" element={<ProductDetail onAddToCart={handleAddToCart} />} />
            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  profile={profile} 
                  cartItems={cartItems} 
                  onClearCart={handleClearCart} 
                  onRefreshProfile={handleRefreshProfile} 
                />
              } 
            />
            <Route path="/profile" element={<Profile profile={profile} />} />
            <Route path="/admin" element={<AdminDashboard profile={profile} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Slide-over Cart Drawer */}
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </HashRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--glass-border)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
};

export default App;
