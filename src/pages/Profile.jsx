import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, MapPin, Phone, ExternalLink, Coins } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Profile = ({ profile }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchOrders();
    else setLoading(false);
  }, [profile]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="badge badge-success"><CheckCircle size={10} style={{ marginRight: '3px' }} /> จัดส่งสำเร็จ</span>;
      case 'shipped':
        return <span className="badge badge-success" style={{ background: 'rgba(0, 217, 255, 0.15)', color: 'var(--secondary)', borderColor: 'rgba(0, 217, 255, 0.3)' }}><Truck size={10} style={{ marginRight: '3px' }} /> จัดส่งพัสดุแล้ว</span>;
      case 'preparing':
        return <span className="badge badge-pending"><Clock size={10} style={{ marginRight: '3px' }} /> กำลังเตรียมพัสดุ</span>;
      case 'cancelled':
        return <span className="badge badge-danger"><XCircle size={10} style={{ marginRight: '3px' }} /> ยกเลิกแล้ว</span>;
      default:
        return <span className="badge badge-pending"><Clock size={10} style={{ marginRight: '3px' }} /> รอการชำระเงิน</span>;
    }
  };

  if (!profile) {
    return (
      <div style={styles.container}>
        <GlassCard style={styles.cardEmpty}>
          <User size={48} color="var(--text-muted)" />
          <h2>กรุณาเข้าสู่ระบบ</h2>
          <p>เข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อสินค้าและติดตามสถานะพัสดุ</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <GlassCard style={styles.headerCard}>
        <div style={styles.profileHeaderContent}>
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`} 
            alt="avatar" 
            style={styles.avatar} 
          />
          <div style={styles.profileInfo}>
            <h1 style={styles.name}>{profile.display_name}</h1>
            <p style={styles.username}>@{profile.username}</p>
            <div style={styles.walletBadge}>
              <Coins size={14} color="var(--secondary)" />
              <span>เครดิตสะสม: <strong>{profile.credit?.toFixed(2)} ฿</strong></span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Orders List & Tracking */}
      <div style={styles.ordersSection}>
        <div style={styles.sectionTitleGroup}>
          <Package size={20} color="var(--secondary)" />
          <h2 style={styles.sectionTitle}>ประวัติการสั่งซื้อเสื้อผ้าและติดตามพัสดุ ({orders.length})</h2>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>
            <RefreshCw size={24} style={styles.spinner} />
            <p>กำลังโหลดรายการสั่งซื้อ...</p>
          </div>
        ) : orders.length === 0 ? (
          <GlassCard style={styles.cardEmpty}>
            <Package size={48} color="var(--text-muted)" />
            <p>คุณยังไม่มีรายการสั่งซื้อเสื้อผ้าในขณะนี้</p>
          </GlassCard>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map(order => (
              <GlassCard key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderId}>คำสั่งซื้อ #{order.id.substr(0, 8)}</span>
                    <span style={styles.orderDate}>{new Date(order.created_at).toLocaleString('th-TH')}</span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items in order */}
                <div style={styles.itemsList}>
                  {(order.order_items || []).map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <img src={item.product_image} alt={item.product_name} style={styles.itemImg} />
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.product_name}</span>
                        <span style={styles.itemMeta}>ไซส์: {item.size || 'Standard'} | สี: {item.color || 'Default'} | จำนวน: {item.quantity}</span>
                        <span style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} ฿</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Tracking info */}
                <div style={styles.shippingSection}>
                  <div style={styles.shippingDetail}>
                    <MapPin size={14} color="var(--text-secondary)" />
                    <span><strong>ผู้รับ:</strong> {order.shipping_name} ({order.shipping_phone}) — {order.shipping_address}</span>
                  </div>

                  {order.tracking_number && (
                    <div style={styles.trackingBox}>
                      <Truck size={16} color="var(--secondary)" />
                      <div>
                        <span style={styles.trackingLabel}>เลขพัสดุติดตามสินค้า (Kerry Express):</span>
                        <span style={styles.trackingNo}>{order.tracking_number}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div style={styles.orderFooter}>
                  <span>ราคารวมทั้งสิ้น:</span>
                  <span style={styles.totalAmount}>{order.total_amount.toLocaleString()} ฿</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  headerCard: {
    padding: '24px',
  },
  profileHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '2px solid var(--primary)',
    boxShadow: '0 0 15px var(--primary-glow)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    fontSize: '22px',
    fontWeight: '800',
  },
  username: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  walletBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    color: 'var(--secondary)',
    width: 'fit-content',
    marginTop: '6px',
  },
  ordersSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  ordersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
  },
  orderId: {
    fontSize: '15px',
    fontWeight: '700',
    marginRight: '12px',
  },
  orderDate: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.02)',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
  },
  itemImg: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  itemMeta: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  itemPrice: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  shippingSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'rgba(0,0,0,0.2)',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  shippingDetail: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    color: 'var(--text-secondary)',
  },
  trackingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    padding: '8px 12px',
    borderRadius: '8px',
    color: 'var(--secondary)',
    marginTop: '4px',
  },
  trackingLabel: {
    fontSize: '12px',
    marginRight: '6px',
  },
  trackingNo: {
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '1px',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid var(--glass-border)',
    fontSize: '14px',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--secondary)',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
    gap: '12px',
    color: 'var(--text-secondary)',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  cardEmpty: {
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  }
};

export default Profile;
