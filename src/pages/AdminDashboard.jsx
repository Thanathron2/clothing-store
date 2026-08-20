import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  ShieldCheck, RefreshCw, CheckCircle, XCircle, Clock, Coins,
  ShoppingBag, Users, Tag, Package, TrendingUp, DollarSign,
  AlertCircle, Loader, Edit, Trash2, Plus, Save, X, Eye, Truck, MapPin
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AdminDashboard = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [viewingSlip, setViewingSlip] = useState(null);
  const [editingTrackingOrder, setEditingTrackingOrder] = useState(null);
  const [trackingNoInput, setTrackingNoInput] = useState('');

  // New Product Modal Form
  const [showAddProd, setShowAddProd] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: '',
    category_id: '',
    price: '',
    original_price: '',
    description: '',
    image_url: '',
    sizes: 'S, M, L, XL',
    colors: 'Black, White',
    stock: 50
  });

  useEffect(() => {
    if (profile?.role === 'admin') fetchAllData();
  }, [profile, activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    const [
      { data: orderData },
      { data: prodData },
      { data: catData },
      { data: userData }
    ] = await Promise.all([
      supabase.from('orders').select('*, profiles(*), order_items(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('profiles').select('*')
    ]);

    setOrders(orderData || []);
    setProducts(prodData || []);
    setCategories(catData || []);
    setUsers(userData || []);
    setLoading(false);
  };

  const getSlipUrl = (tx) => {
    if (!tx || !tx.payment_details) return null;
    let details = tx.payment_details;

    if (typeof details === 'string') {
      const trimmed = details.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { details = JSON.parse(trimmed); } catch (e) {}
      }
    }

    if (typeof details === 'object' && details !== null) {
      if (details.slip_url) return details.slip_url;
      if (details.url) return details.url;
      if (details.slip) return details.slip;
      if (details.image) return details.image;
    }

    if (typeof details === 'string' && details.trim().length > 0) {
      return details.trim();
    }

    return null;
  };

  const updateOrderStatus = async (orderId, newStatus, trackingNo = null) => {
    setActionLoading(true);
    try {
      const updateData = { status: newStatus };
      if (trackingNo !== null) updateData.tracking_number = trackingNo;

      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
      if (error) throw error;

      setEditingTrackingOrder(null);
      setTrackingNoInput('');
      fetchAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถอัปเดตสถานะได้'));
    }
    setActionLoading(false);
  };

  const handleAddProduct = async () => {
    if (!prodForm.name || !prodForm.price || !prodForm.image_url) {
      alert('กรุณากรอกชื่อสินค้า ราคา และ URL รูปภาพให้ครบถ้วน');
      return;
    }

    setActionLoading(true);
    try {
      const sizesArray = prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean);
      const colorsArray = prodForm.colors.split(',').map(c => c.trim()).filter(Boolean);

      const { error } = await supabase.from('products').insert({
        name: prodForm.name.trim(),
        category_id: prodForm.category_id || categories[0]?.id,
        price: parseFloat(prodForm.price),
        original_price: prodForm.original_price ? parseFloat(prodForm.original_price) : null,
        description: prodForm.description.trim(),
        image_url: prodForm.image_url.trim(),
        sizes: sizesArray,
        colors: colorsArray,
        stock: parseInt(prodForm.stock) || 50,
        is_featured: true
      });

      if (error) throw error;

      setShowAddProd(false);
      setProdForm({
        name: '', category_id: '', price: '', original_price: '',
        description: '', image_url: '', sizes: 'S, M, L, XL', colors: 'Black, White', stock: 50
      });
      fetchAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
    setActionLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('ยืนยันการลบสินค้าชิ้นนี้ออกจากระบบ?')) return;
    setActionLoading(true);
    try {
      await supabase.from('products').delete().eq('id', id);
      fetchAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบสินค้า: ' + err.message);
    }
    setActionLoading(false);
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div style={styles.container}>
        <GlassCard style={styles.accessDenied}>
          <AlertCircle size={48} color="var(--danger)" />
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>หน้านี้สำหรับผู้ดูแลระบบร้านค้าเท่านั้น</p>
        </GlassCard>
      </div>
    );
  }

  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending_payment' || o.status === 'preparing').length;

  const tabs = [
    { key: 'overview', label: 'ภาพรวมยอดขาย', icon: TrendingUp },
    { key: 'orders', label: 'คำสั่งซื้อเสื้อผ้า', icon: ShoppingBag, badge: pendingOrdersCount },
    { key: 'products', label: 'จัดการสินค้า & สต็อก', icon: Tag },
    { key: 'users', label: 'ผู้ใช้งาน', icon: Users },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <ShieldCheck size={28} color="var(--danger)" />
        <h1 style={styles.title}>ระบบหลังบ้านร้านเสื้อผ้า (AURA Admin)</h1>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.badge > 0 && <span style={styles.tabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingWrap}>
          <RefreshCw size={28} style={styles.spinner} />
          <p>กำลังโหลดข้อมูลระบบหลังบ้าน...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={styles.overviewGrid}>
              <GlassCard style={styles.statCard}>
                <DollarSign size={28} color="var(--success)" />
                <div style={styles.statInfo}>
                  <span style={styles.statValue}>{totalSales.toLocaleString()} ฿</span>
                  <span style={styles.statLabel}>ยอดขายรวมทั้งหมด</span>
                </div>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <ShoppingBag size={28} color="var(--secondary)" />
                <div style={styles.statInfo}>
                  <span style={styles.statValue}>{orders.length}</span>
                  <span style={styles.statLabel}>ออเดอร์คำสั่งซื้อ</span>
                </div>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <Tag size={28} color="var(--primary)" />
                <div style={styles.statInfo}>
                  <span style={styles.statValue}>{products.length}</span>
                  <span style={styles.statLabel}>สินค้าในระบบ</span>
                </div>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <Users size={28} color="var(--warning)" />
                <div style={styles.statInfo}>
                  <span style={styles.statValue}>{users.length}</span>
                  <span style={styles.statLabel}>ลูกค้าทั้งหมด</span>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <GlassCard style={styles.tableCard}>
              <h3 style={styles.sectionTitle}>รายการคำสั่งซื้อสินค้าทั้งหมด</h3>
              {orders.length === 0 ? (
                <p style={styles.emptyText}>ไม่มีรายการคำสั่งซื้อ</p>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>รหัสออเดอร์</th>
                        <th style={styles.th}>ลูกค้า</th>
                        <th style={styles.th}>สินค้า</th>
                        <th style={styles.th}>ยอดชำระ</th>
                        <th style={styles.th}>ที่อยู่จัดส่ง</th>
                        <th style={styles.th}>สถานะ</th>
                        <th style={styles.th}>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(ord => {
                        const slipUrl = getSlipUrl(ord);
                        return (
                          <tr key={ord.id} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: '700' }}>#{ord.id.substr(0, 8)}</td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{ord.shipping_name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.shipping_phone}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                                {(ord.order_items || []).map((item, idx) => (
                                  <span key={idx}>• {item.product_name} ({item.size}/{item.color}) x{item.quantity}</span>
                                ))}
                              </div>
                            </td>
                            <td style={{ ...styles.td, color: 'var(--secondary)', fontWeight: '700' }}>{ord.total_amount.toLocaleString()} ฿</td>
                            <td style={{ ...styles.td, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ord.shipping_address}>
                              {ord.shipping_address}
                            </td>
                            <td style={styles.td}>
                              {ord.status === 'delivered' && <span className="badge badge-success">จัดส่งสำเร็จ</span>}
                              {ord.status === 'shipped' && <span className="badge badge-success" style={{ background: 'rgba(0, 217, 255, 0.15)', color: 'var(--secondary)' }}>จัดส่งแล้ว</span>}
                              {ord.status === 'preparing' && <span className="badge badge-pending">กำลังเตรียมพัสดุ</span>}
                              {ord.status === 'pending_payment' && <span className="badge badge-pending">รอตรวจสอบสลิป</span>}
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionBtns}>
                                {slipUrl && (
                                  <button onClick={() => setViewingSlip({ ...ord, slipUrl })} className="btn btn-secondary" style={styles.actionBtn}>
                                    <Eye size={12} /> สลิป
                                  </button>
                                )}

                                {ord.status === 'pending_payment' && (
                                  <button onClick={() => updateOrderStatus(ord.id, 'preparing')} className="btn btn-success" style={styles.actionBtn} disabled={actionLoading}>
                                    <CheckCircle size={12} /> อนุมัติสลิป
                                  </button>
                                )}

                                {ord.status === 'preparing' && (
                                  <button
                                    onClick={() => {
                                      setEditingTrackingOrder(ord);
                                      setTrackingNoInput('TH88' + Math.floor(1000000 + Math.random() * 9000000) + 'EX');
                                    }}
                                    className="btn btn-primary"
                                    style={styles.actionBtn}
                                  >
                                    <Truck size={12} /> ส่งพัสดุ
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div style={styles.productsAdmin}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>จัดการเสื้อผ้าและคลังสินค้า</h3>
                <button onClick={() => setShowAddProd(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> เพิ่มเสื้อผ้าใหม่
                </button>
              </div>

              {/* Add Product Modal Form */}
              {showAddProd && (
                <GlassCard style={styles.addForm}>
                  <h4 style={styles.formTitle}>เพิ่มสินค้าแฟชั่นใหม่</h4>
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">ชื่อสินค้า *</label>
                      <input className="form-control" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} placeholder="เช่น AURA Oversized Hoodie" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">หมวดหมู่</label>
                      <select className="form-control" value={prodForm.category_id} onChange={e => setProdForm({ ...prodForm, category_id: e.target.value })}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">ราคาขาย (บาท) *</label>
                      <input type="number" className="form-control" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} placeholder="890" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ราคาเดิม (บาท)</label>
                      <input type="number" className="form-control" value={prodForm.original_price} onChange={e => setProdForm({ ...prodForm, original_price: e.target.value })} placeholder="1290" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">URL รูปภาพหลัก *</label>
                      <input className="form-control" value={prodForm.image_url} onChange={e => setProdForm({ ...prodForm, image_url: e.target.value })} placeholder="https://images.unsplash.com/..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ไซส์ที่มี (คั่นด้วยจุลภาค)</label>
                      <input className="form-control" value={prodForm.sizes} onChange={e => setProdForm({ ...prodForm, sizes: e.target.value })} placeholder="S, M, L, XL" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">สีที่มี (คั่นด้วยจุลภาค)</label>
                      <input className="form-control" value={prodForm.colors} onChange={e => setProdForm({ ...prodForm, colors: e.target.value })} placeholder="Black, White, Cream" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">รายละเอียดสินค้า</label>
                      <textarea className="form-control" rows="2" value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} placeholder="รายละเอียดเนื้อผ้า และดีไซน์" />
                    </div>
                  </div>
                  <div style={styles.formActions}>
                    <button onClick={() => setShowAddProd(false)} className="btn btn-secondary">ยกเลิก</button>
                    <button onClick={handleAddProduct} className="btn btn-success" disabled={actionLoading}>
                      {actionLoading ? <Loader size={14} style={styles.spinner} /> : <><Save size={14} /> บันทึกสินค้า</>}
                    </button>
                  </div>
                </GlassCard>
              )}

              <div style={styles.productsList}>
                {products.map(prod => (
                  <GlassCard key={prod.id} style={styles.productAdminCard}>
                    <img src={prod.image_url} alt={prod.name} style={styles.productAdminImg} />
                    <div style={styles.productAdminInfo}>
                      <h4>{prod.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>หมวดหมู่: {prod.categories?.name || 'ทั่วไป'}</p>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>{prod.price.toLocaleString()} ฿</span>
                    </div>
                    <div style={styles.productAdminActions}>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-danger" style={styles.actionBtn} disabled={actionLoading}>
                        <Trash2 size={14} /> ลบสินค้า
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <GlassCard style={styles.tableCard}>
              <h3 style={styles.sectionTitle}>รายชื่อลูกค้าทั้งหมด</h3>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ชื่อลูกค้า</th>
                      <th style={styles.th}>เบอร์โทรศัพท์</th>
                      <th style={styles.th}>เครดิตกระเป๋าเงิน</th>
                      <th style={styles.th}>บทบาท</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>{u.display_name || u.username}</td>
                        <td style={{ ...styles.td, fontSize: '13px' }}>{u.phone || '-'}</td>
                        <td style={{ ...styles.td, color: 'var(--secondary)', fontWeight: '600' }}>{u.credit?.toFixed(2) || '0.00'} ฿</td>
                        <td style={styles.td}>
                          {u.role === 'admin'
                            ? <span className="badge badge-danger">Admin</span>
                            : <span className="badge badge-success">Customer</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* Slip Modal */}
      {viewingSlip && (
        <div style={styles.overlay} onClick={() => setViewingSlip(null)}>
          <GlassCard style={styles.slipModalCard} onClick={e => e.stopPropagation()}>
            <div style={styles.slipModalHeader}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '700' }}>
                  สลิปโอนเงิน (ออเดอร์ #{viewingSlip.id?.substr(0, 8)})
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  ยอดชำระ: {viewingSlip.total_amount?.toLocaleString()} ฿ — {viewingSlip.shipping_name}
                </p>
              </div>
              <button onClick={() => setViewingSlip(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.slipImgWrap}>
              <img src={viewingSlip.slipUrl} alt="Slip" style={styles.slipImg} />
            </div>

            <div style={styles.slipModalFooter}>
              {viewingSlip.status === 'pending_payment' && (
                <button
                  onClick={() => { updateOrderStatus(viewingSlip.id, 'preparing'); setViewingSlip(null); }}
                  className="btn btn-success"
                  style={{ width: '100%' }}
                  disabled={actionLoading}
                >
                  <CheckCircle size={16} /> อนุมัติสลิปโอนเงิน
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tracking Number Input Modal */}
      {editingTrackingOrder && (
        <div style={styles.overlay} onClick={() => setEditingTrackingOrder(null)}>
          <GlassCard style={styles.trackingModalCard} onClick={e => e.stopPropagation()}>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              ใส่เลขพัสดุสำหรับจัดส่ง (Kerry / Express)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              ออเดอร์ #{editingTrackingOrder.id.substr(0, 8)} — {editingTrackingOrder.shipping_name}
            </p>

            <div className="form-group">
              <label className="form-label">Tracking Number *</label>
              <input
                type="text"
                className="form-control"
                value={trackingNoInput}
                onChange={e => setTrackingNoInput(e.target.value)}
                placeholder="เช่น TH882947102EX"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingTrackingOrder(null)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button
                onClick={() => updateOrderStatus(editingTrackingOrder.id, 'shipped', trackingNoInput)}
                className="btn btn-primary"
                disabled={actionLoading || !trackingNoInput}
              >
                <Truck size={16} /> ยืนยันการจัดส่งพัสดุ
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '30px 20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
  },
  accessDenied: {
    padding: '60px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  tabBar: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid var(--primary)',
    color: '#fff',
  },
  tabBadge: {
    background: 'var(--danger)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '10px',
    marginLeft: '4px',
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
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  statCard: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  tableCard: {
    padding: '24px',
    overflow: 'auto',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  emptyText: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px 0',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
  },
  actionBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  productsAdmin: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  addForm: {
    padding: '24px',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productAdminCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  productAdminImg: {
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  productAdminInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  productAdminActions: {},
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(3, 5, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  slipModalCard: {
    padding: '24px',
    maxWidth: '460px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  slipModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
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
  slipImgWrap: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
    maxHeight: '450px',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '12px',
    padding: '10px',
    border: '1px solid var(--glass-border)',
  },
  slipImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  slipModalFooter: {
    marginTop: '16px',
  },
  trackingModalCard: {
    padding: '30px',
    maxWidth: '420px',
    width: '100%',
  }
};

export default AdminDashboard;
