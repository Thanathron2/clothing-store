import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Sparkles, Tag, Check } from 'lucide-react';
import GlassCard from './GlassCard';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = (rawSubtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'flat') {
      discountAmount = Math.min(rawSubtotal, appliedCoupon.value);
    }
  }

  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'AURA10') {
      setAppliedCoupon({ code: 'AURA10', label: 'ส่วนลด 10% พิเศษ', type: 'percent', value: 10 });
      setCouponCode('');
    } else if (code === 'WELCOME200') {
      setAppliedCoupon({ code: 'WELCOME200', label: 'ส่วนลด 200 ฿ สมาชิกใหม่', type: 'flat', value: 200 });
      setCouponCode('');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', label: 'ส่วนลดค่าจัดส่ง 100 ฿', type: 'flat', value: 100 });
      setCouponCode('');
    } else {
      setCouponError('โค้ดส่วนลดไม่ถูกต้อง หรือหมดอายุแล้ว');
    }
  };

  const handleCheckoutClick = () => {
    onClose();
    // Pass coupon state via session/localStorage
    if (appliedCoupon) {
      localStorage.setItem('aura_applied_coupon', JSON.stringify({ ...appliedCoupon, discountAmount }));
    } else {
      localStorage.removeItem('aura_applied_coupon');
    }
    navigate('/checkout');
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <GlassCard style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.titleGroup}>
              <ShoppingBag size={20} color="var(--secondary)" />
              <h3 style={styles.title}>ตะกร้าสินค้าของคุณ ({totalItemsCount})</h3>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div style={styles.itemList}>
            {cartItems.length === 0 ? (
              <div style={styles.emptyCart}>
                <ShoppingBag size={48} color="var(--text-muted)" />
                <p style={styles.emptyText}>ยังไม่มีสินค้าในตะกร้า</p>
                <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: '12px' }}>
                  เริ่มเลือกซื้อสินค้า
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} style={styles.itemRow}>
                  <img src={item.image_url} alt={item.name} style={styles.itemImg} />
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <div style={styles.itemMeta}>
                      <span style={styles.metaBadge}>ไซส์: {item.selectedSize || 'Standard'}</span>
                      {item.selectedColor && <span style={styles.metaBadge}>สี: {item.selectedColor}</span>}
                    </div>
                    <div style={styles.priceRow}>
                      <span style={styles.itemPrice}>{item.price.toLocaleString()} ฿</span>
                      <div style={styles.qtyControl}>
                        <button 
                          onClick={() => onUpdateQuantity(item, item.quantity - 1)} 
                          style={styles.qtyBtn}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={styles.qtyText}>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item, item.quantity + 1)} 
                          style={styles.qtyBtn}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item)} 
                    style={styles.removeBtn}
                    title="ลบออกจากตะกร้า"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Coupon Code Section */}
          {cartItems.length > 0 && (
            <div style={styles.couponSection}>
              {appliedCoupon ? (
                <div style={styles.appliedCouponTag}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="var(--success)" />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                      {appliedCoupon.code} ({appliedCoupon.label})
                    </span>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} style={styles.removeCouponBtn}>ลบ</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={styles.couponForm}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={13} style={styles.couponIcon} />
                    <input
                      type="text"
                      className="form-control"
                      style={styles.couponInput}
                      placeholder="กรอกคูปอง (เช่น AURA10)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '12px' }}>
                    ใช้คูปอง
                  </button>
                </form>
              )}
              {couponError && <p style={styles.couponErrorText}>{couponError}</p>}
            </div>
          )}

          {/* Footer Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div style={styles.footer}>
              <div style={styles.subtotalRow}>
                <span style={styles.subtotalLabel}>ยอดรวมสินค้า</span>
                <span style={styles.subtotalValue}>{rawSubtotal.toLocaleString()} ฿</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ ...styles.subtotalRow, color: 'var(--primary)' }}>
                  <span style={styles.subtotalLabel}>ส่วนลดคูปอง ({appliedCoupon?.code})</span>
                  <span style={{ fontWeight: '700' }}>-{discountAmount.toLocaleString()} ฿</span>
                </div>
              )}

              <div style={{ ...styles.subtotalRow, borderTop: '1px dashed var(--glass-border)', paddingTop: '8px' }}>
                <span style={{ fontWeight: '700', color: '#fff' }}>ยอดสุทธิที่ต้องชำระ</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>{finalTotal.toLocaleString()} ฿</span>
              </div>

              <p style={styles.shippingNote}>
                <Sparkles size={12} color="var(--success)" style={{ display: 'inline', marginRight: '4px' }} />
                ฟรีค่าจัดส่งด่วนทั่วประเทศเมื่อสั่งซื้อสินค้าวันนี้
              </p>

              <button 
                onClick={handleCheckoutClick} 
                className="btn btn-primary" 
                style={styles.checkoutBtn}
              >
                <span>ดำเนินการชำระเงิน</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(3, 5, 15, 0.75)',
    backdropFilter: 'blur(6px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '100%',
    maxWidth: '440px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    height: '100%',
    borderRadius: '16px 0 0 16px',
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--glass-border)',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px 0',
  },
  emptyCart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px',
    color: 'var(--text-secondary)',
  },
  emptyText: {
    fontSize: '15px',
  },
  itemRow: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    alignItems: 'center',
  },
  itemImg: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.3',
  },
  itemMeta: {
    display: 'flex',
    gap: '6px',
  },
  metaBadge: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  itemPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '6px',
    padding: '2px 6px',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
  },
  qtyText: {
    fontSize: '13px',
    fontWeight: '600',
    minWidth: '16px',
    textAlign: 'center',
  },
  removeBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponSection: {
    padding: '12px 0',
    borderTop: '1px solid var(--glass-border)',
  },
  couponForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  couponIcon: {
    position: 'absolute',
    left: '12px',
    top: '12px',
    color: 'var(--text-secondary)',
  },
  couponInput: {
    paddingLeft: '34px',
    fontSize: '12px',
  },
  appliedCouponTag: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(226, 194, 117, 0.1)',
    border: '1px dashed var(--primary)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  removeCouponBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  couponErrorText: {
    fontSize: '11px',
    color: 'var(--danger)',
    marginTop: '4px',
    textAlign: 'left',
  },
  footer: {
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '600',
  },
  subtotalLabel: {
    color: 'var(--text-secondary)',
  },
  subtotalValue: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
  },
  shippingNote: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'left',
  },
  checkoutBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};

export default CartDrawer;
