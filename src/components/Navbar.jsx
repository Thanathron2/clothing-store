import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ShoppingBag, User, LogOut, ShieldAlert, LogIn, Menu, X, Coins, Truck, ArrowRight } from 'lucide-react';
import { supabase, isMock } from '../supabaseClient';
import GlassCard from './GlassCard';

const Navbar = ({ profile, cartCount, onCartClick, onAuthClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ width: '100%', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Official Announcement Ticker Bar */}
      <div className="ticker-bar">
        <span><span className="ticker-highlight">COMPLIMENTARY SHIPPING</span> ON ORDERS OVER 1,500 THB</span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span>NEW SEASON DROP — LIMITED EDITION</span>
      </div>

      <GlassCard style={styles.navbar}>
        <div style={styles.container}>
          {/* Logo */}
          <Link to="/" style={styles.logo} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.logoIconBg}>
              <Sparkles size={16} color="#000" />
            </div>
            <div style={styles.logoTextGroup}>
              <span style={styles.logoTextMain}>เสื้อเฮีย</span>
              <span style={styles.logoTextSub}>PARIS / TOKYO</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <Link 
              to="/" 
              style={{...styles.navLink, ...(isActive('/') ? styles.activeNavLink : {})}}
            >
              COLLECTION
            </Link>
            {profile && (
              <Link 
                to="/profile" 
                style={{...styles.navLink, ...(isActive('/profile') ? styles.activeNavLink : {})}}
              >
                <Truck size={14} style={{ marginRight: '4px' }} />
                TRACK ORDERS
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link 
                to="/admin" 
                style={{...styles.navLink, ...styles.adminLink, ...(isActive('/admin') ? styles.activeAdminLink : {})}}
              >
                <ShieldAlert size={14} style={{ marginRight: '4px' }} />
                ADMIN PANEL
              </Link>
            )}
          </div>

          {/* Action Controls */}
          <div style={styles.userSection}>
            {/* Cart Icon Button with Real-time Count Badge */}
            <button 
              onClick={onCartClick} 
              style={styles.cartBtn} 
              title="BAG"
            >
              <ShoppingBag size={18} color="#fff" />
              {cartCount > 0 && (
                <span style={styles.cartBadge}>{cartCount}</span>
              )}
            </button>

            {profile ? (
              <div style={styles.profileWrapper}>
                {/* Wallet Credit Badge */}
                <div style={styles.creditBadge} title="CREDIT BALANCE">
                  <Coins size={13} color="var(--primary)" />
                  <span style={styles.creditText}>{profile.credit.toFixed(2)} ฿</span>
                </div>
                
                {/* Profile Avatar */}
                <div style={styles.userBadge}>
                  <img 
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`} 
                    alt="avatar" 
                    style={styles.avatar} 
                  />
                  <span style={styles.displayName}>{profile.display_name}</span>
                </div>

                {/* Logout Button */}
                <button onClick={handleLogoutClick} style={styles.logoutBtn} title="SIGNOUT">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick} className="btn btn-primary" style={styles.loginBtn}>
                <LogIn size={15} />
                <span>SIGN IN</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="nav-mobile-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="nav-mobile-drawer">
            <Link 
              to="/" 
              style={{...styles.mobileNavLink, ...(isActive('/') ? styles.mobileActiveNavLink : {})}}
              onClick={() => setMobileMenuOpen(false)}
            >
              COLLECTION & CATALOG
            </Link>
            {profile && (
              <Link 
                to="/profile" 
                style={{...styles.mobileNavLink, ...(isActive('/profile') ? styles.mobileActiveNavLink : {})}}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Truck size={14} style={{ marginRight: '6px' }} />
                TRACK ORDERS
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link 
                to="/admin" 
                style={{...styles.mobileNavLink, ...styles.mobileAdminLink, ...(isActive('/admin') ? styles.mobileActiveAdminLink : {})}}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldAlert size={14} style={{ marginRight: '6px' }} />
                ADMIN PANEL
              </Link>
            )}
          </div>
        )}

        {isMock && (
          <div style={styles.mockBadge}>
            🔧 RUNNING IN AURA MOCK DATABASE MODE
          </div>
        )}
      </GlassCard>
    </header>
  );
};

const styles = {
  navbar: {
    borderRadius: '0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    width: '100%',
    padding: '0 24px',
  },
  container: {
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIconBg: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    lineHeight: '1.1',
  },
  logoTextMain: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '3px',
  },
  logoTextSub: {
    fontSize: '8px',
    fontWeight: '600',
    color: 'var(--primary)',
    letterSpacing: '3px',
  },
  navLink: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '1px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    padding: '6px 12px',
    borderRadius: '6px',
  },
  activeNavLink: {
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
  },
  adminLink: {
    color: '#f87171',
    display: 'inline-flex',
    alignItems: 'center',
  },
  activeAdminLink: {
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cartBtn: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-border)',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: 'var(--primary)',
    color: '#000',
    fontSize: '10px',
    fontWeight: '800',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  creditBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(226, 194, 117, 0.08)',
    border: '1px solid rgba(226, 194, 117, 0.2)',
    padding: '5px 10px',
    borderRadius: '20px',
  },
  creditText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.04)',
    padding: '4px 10px 4px 5px',
    borderRadius: '20px',
    border: '1px solid var(--glass-border)',
  },
  avatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  displayName: {
    fontSize: '12px',
    fontWeight: '500',
    maxWidth: '90px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loginBtn: {
    padding: '8px 16px',
    fontSize: '12px',
    letterSpacing: '1px',
  },
  mobileNavLink: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 14px',
    borderRadius: '6px',
    textDecoration: 'none',
    textAlign: 'left',
  },
  mobileActiveNavLink: {
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
  },
  mobileAdminLink: {
    color: '#f87171',
    display: 'flex',
    alignItems: 'center',
  },
  mobileActiveAdminLink: {
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  mockBadge: {
    fontSize: '10px',
    textAlign: 'center',
    padding: '2px 0 4px 0',
    color: 'var(--primary)',
    letterSpacing: '1px',
    borderTop: '1px solid rgba(226, 194, 117, 0.1)',
  }
};

export default Navbar;
