import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
    onClose();
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

          {/* Footer Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div style={styles.footer}>
              <div style={styles.subtotalRow}>
                <span style={styles.subtotalLabel}>ยอดรวมสินค้า</span>
                <span style={styles.subtotalValue}>{subtotal.toLocaleString()} ฿</span>
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
  footer: {
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '600',
  },
  subtotalLabel: {
    color: 'var(--text-secondary)',
  },
  subtotalValue: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
  },
  shippingNote: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'left',
  },
  checkoutBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};

export default CartDrawer;
