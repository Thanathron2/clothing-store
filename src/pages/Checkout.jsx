import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShoppingBag, QrCode, Upload, CheckCircle, Clock, XCircle, Loader, ArrowLeft, Coins, CreditCard, ShieldCheck, MapPin, Phone, User, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import confetti from 'canvas-confetti';

const Checkout = ({ profile, cartItems, onClearCart, onRefreshProfile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [shippingName, setShippingName] = useState(profile?.display_name || '');
  const [shippingPhone, setShippingPhone] = useState(profile?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(profile?.address || '');
  
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [slipPreview, setSlipPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setSlipPreview(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async () => {
    if (!profile) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า');
      return;
    }
    if (!shippingName || !shippingPhone || !shippingAddress) {
      alert('กรุณากรอกชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }
    if (cartItems.length === 0) {
      alert('ไม่มีสินค้าในตะกร้า');
      return;
    }
    if (paymentMethod === 'promptpay' && !slipPreview) {
      alert('กรุณาอัปโหลดสลิปโอนเงิน PromptPay');
      return;
    }
    if (paymentMethod === 'credit' && profile.credit < subtotal) {
      alert(`ยอดเงินในกระเป๋าไม่พอ (ต้องการ ${subtotal.toLocaleString()} ฿ แต่มี ${profile.credit.toLocaleString()} ฿) กรุณาเปลี่ยนช่องทางชำระเงิน`);
      return;
    }

    setSubmitting(true);
    try {
      // Create Order
      const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
        user_id: profile.id,
        total_amount: subtotal,
        shipping_name: shippingName.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: shippingAddress.trim(),
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'promptpay' ? { slip_url: slipPreview } : { paid_via: 'credit_wallet' },
        status: paymentMethod === 'credit' ? 'preparing' : 'pending_payment'
      });

      if (orderErr) throw orderErr;

      const orderId = Array.isArray(orderData) ? orderData[0]?.id : orderData?.id || ('ord-' + Math.random().toString(36).substr(2, 6));

      // Create Order Items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image_url,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize || 'Standard',
        color: item.selectedColor || 'Default'
      }));

      await supabase.from('order_items').insert(orderItemsToInsert);

      // If credit payment, deduct credit from profile
      if (paymentMethod === 'credit') {
        await supabase.from('profiles').update({ credit: profile.credit - subtotal }).eq('id', profile.id);
        onRefreshProfile();
      }

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setOrderComplete(orderId);
      onClearCart();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'));
    }
    setSubmitting(false);
  };

  if (orderComplete) {
    return (
      <div style={styles.container}>
        <GlassCard style={styles.successCard}>
          <CheckCircle size={64} color="var(--success)" />
          <h2 style={styles.successTitle}>สั่งซื้อสินค้าสำเร็จแล้ว!</h2>
          <p style={styles.successDesc}>
            คำสั่งซื้อรหัส <strong>#{orderComplete.substr(0, 8)}</strong> ถูกส่งเข้าสู่ระบบแล้ว
            ทางแบรนด์ AURA จะทำการจัดเตรียมพัสดุและจัดส่งให้คุณโดยเร็วที่สุด
          </p>
          <div style={styles.successActions}>
            <button onClick={() => navigate('/profile')} className="btn btn-primary">
              ติดตามสถานะพัสดุ
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              กลับไปหน้าแรก
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={16} /> กลับไปเลือกสินค้าเพิ่มเติม
      </button>

      <h1 style={styles.pageTitle}>ชำระเงินและระบุที่อยู่จัดส่ง</h1>

      {cartItems.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <ShoppingBag size={48} color="var(--text-muted)" />
          <h2>ไม่มีสินค้าในตะกร้า</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '16px' }}>
            เริ่มเลือกซื้อสินค้า
          </button>
        </GlassCard>
      ) : (
        <div style={styles.grid}>
          {/* Left Column: Shipping & Payment Form */}
          <div style={styles.leftCol}>
            {/* Shipping Info Card */}
            <GlassCard style={styles.card}>
              <h3 style={styles.cardTitle}>
                <MapPin size={18} color="var(--secondary)" /> ข้อมูลการจัดส่งพัสดุ
              </h3>
              <div style={styles.formGroup}>
                <label className="form-label">ชื่อ-นามสกุล ผู้รับสินค้า *</label>
                <div style={styles.inputWrap}>
                  <User size={16} style={styles.inputIcon} />
                  <input
                    type="text"
                    className="form-control"
                    style={styles.inputWithIcon}
                    placeholder="เช่น สมชาย ใจดี"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label className="form-label">เบอร์โทรศัพท์ผู้รับ *</label>
                <div style={styles.inputWrap}>
                  <Phone size={16} style={styles.inputIcon} />
                  <input
                    type="tel"
                    className="form-control"
                    style={styles.inputWithIcon}
                    placeholder="เช่น 0812345678"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label className="form-label">ที่อยู่จัดส่งโดยละเอียด *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
            </GlassCard>

            {/* Payment Method Card */}
            <GlassCard style={styles.card}>
              <h3 style={styles.cardTitle}>
                <CreditCard size={18} color="var(--primary)" /> ช่องทางการชำระเงิน
              </h3>

              <div style={styles.methodGrid}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  style={{
                    ...styles.methodBtn,
                    ...(paymentMethod === 'promptpay' ? styles.activeMethodBtn : {})
                  }}
                >
                  <QrCode size={20} />
                  <span>PromptPay QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  style={{
                    ...styles.methodBtn,
                    ...(paymentMethod === 'credit' ? styles.activeMethodBtn : {})
                  }}
                >
                  <Coins size={20} />
                  <span>เครดิตกระเป๋าเงิน ({profile ? profile.credit.toFixed(2) : '0'} ฿)</span>
                </button>
              </div>

              {/* PromptPay QR Section */}
              {paymentMethod === 'promptpay' && (
                <div style={styles.qrSection}>
                  <div style={styles.qrBox}>
                    <img
                      src={`https://promptpay.io/0644320510/${subtotal}.png`}
                      alt="PromptPay QR"
                      style={styles.qrImg}
                    />
                    <p style={styles.qrAmount}>สแกนจ่ายเงินยอดรวม {subtotal.toLocaleString()} บาท</p>
                  </div>

                  <div style={styles.slipUploadBox}>
                    <label style={styles.slipLabel}>อัปโหลดสลิปโอนเงิน:</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {slipPreview ? (
                      <div style={styles.slipPreviewWrap}>
                        <img src={slipPreview} alt="slip" style={styles.slipImg} />
                        <button onClick={() => setSlipPreview(null)} className="btn btn-danger" style={styles.removeSlipBtn}>
                          <XCircle size={14} /> ลบรูปสลิป
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={styles.uploadBtn}>
                        <Upload size={16} /> เลือกไฟล์สลิปชำระเงิน
                      </button>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'credit' && (
                <div style={styles.creditNoteBox}>
                  <p>หักจากยอดเงินในกระเป๋าของคุณทันที เมื่ออนุมัติออเดอร์แล้วทางร้านจะจัดส่งพัสดุโดยเร็วที่สุด</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Order Summary */}
          <div style={styles.rightCol}>
            <GlassCard style={styles.card}>
              <h3 style={styles.cardTitle}>สรุปรายการสั่งซื้อ</h3>
              <div style={styles.summaryItems}>
                {cartItems.map((item, idx) => (
                  <div key={idx} style={styles.summaryItemRow}>
                    <img src={item.image_url} alt={item.name} style={styles.summaryItemImg} />
                    <div style={styles.summaryItemInfo}>
                      <span style={styles.summaryItemName}>{item.name}</span>
                      <span style={styles.summaryItemMeta}>ไซส์: {item.selectedSize} | สี: {item.selectedColor} | x{item.quantity}</span>
                      <span style={styles.summaryItemPrice}>{(item.price * item.quantity).toLocaleString()} ฿</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.totalDivider}></div>

              <div style={styles.totalRow}>
                <span>ยอดรวมสินค้าทั้งสิ้น</span>
                <span style={styles.totalValue}>{subtotal.toLocaleString()} ฿</span>
              </div>
              
              <p style={styles.freeShippingText}>
                <Sparkles size={12} color="var(--success)" style={{ display: 'inline', marginRight: '4px' }} />
                ฟรีค่าจัดส่งด่วน Kerry Express
              </p>

              <button
                onClick={handlePlaceOrder}
                className="btn btn-primary"
                style={styles.submitOrderBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader size={18} style={styles.spinner} />
                ) : (
                  <>ยืนยันการสั่งซื้อสินค้า ({subtotal.toLocaleString()} ฿)</>
                )}
              </button>
            </GlassCard>
          </div>
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
    textAlign: 'left',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '24px',
  },
  grid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightCol: {
    flex: '1 1 350px',
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--glass-border)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-secondary)',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '40px',
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  methodBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 10px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  activeMethodBtn: {
    background: 'rgba(139, 92, 246, 0.15)',
    border: '1px solid var(--primary)',
    color: '#fff',
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)',
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginTop: '10px',
  },
  qrBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    border: '2px dashed var(--glass-border)',
    borderRadius: '12px',
    width: '100%',
  },
  qrImg: {
    width: '180px',
    height: '180px',
    borderRadius: '10px',
  },
  qrAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--secondary)',
    marginTop: '10px',
  },
  slipUploadBox: {
    width: '100%',
  },
  slipLabel: {
    fontSize: '14px',
    marginBottom: '8px',
    display: 'block',
    color: 'var(--text-secondary)',
  },
  uploadBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
  },
  slipPreviewWrap: {
    position: 'relative',
    textAlign: 'center',
  },
  slipImg: {
    maxWidth: '100%',
    maxHeight: '220px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
  },
  removeSlipBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '12px',
    padding: '4px 8px',
  },
  creditNoteBox: {
    padding: '14px',
    background: 'rgba(0, 217, 255, 0.05)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  summaryItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryItemRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  summaryItemImg: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  summaryItemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
  },
  summaryItemName: {
    fontWeight: '600',
    color: '#fff',
  },
  summaryItemMeta: {
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
  summaryItemPrice: {
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  totalDivider: {
    height: '1px',
    background: 'var(--glass-border)',
    margin: '8px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--secondary)',
  },
  freeShippingText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  submitOrderBtn: {
    padding: '14px',
    fontSize: '16px',
    marginTop: '10px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  successCard: {
    padding: '60px 30px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  successTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--success)',
  },
  successDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  successActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  emptyCard: {
    padding: '60px 20px',
    textAlign: 'center',
  }
};

export default Checkout;
