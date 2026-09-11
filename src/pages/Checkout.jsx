import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShoppingBag, QrCode, Upload, CheckCircle, Clock, XCircle, Loader, ArrowLeft, CreditCard, MapPin, Phone, User, Sparkles, Tag, Check } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import confetti from 'canvas-confetti';

const Checkout = ({ profile, cartItems, onClearCart, onRefreshProfile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [shippingName, setShippingName] = useState(profile?.display_name || '');
  const [shippingPhone, setShippingPhone] = useState(profile?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(profile?.address || '');
  
  const [slipPreview, setSlipPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const savedCoupon = localStorage.getItem('aura_applied_coupon');
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {}
    }
  }, []);

  const rawSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? (appliedCoupon.discountAmount || 0) : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

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
    if (!slipPreview) {
      alert('กรุณาอัปโหลดสลิปโอนเงิน PromptPay');
      return;
    }

    setSubmitting(true);
    let initialStatus = 'pending_payment';
    let verifiedPaymentDetails = { slip_url: slipPreview };

    try {
      // 1. SlipOK Automatic Slip Verification API Call
      try {
        const cleanBase64 = slipPreview.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        // Try proxy endpoint first (avoids browser CORS), fallback to direct URL
        let slipRes;
        try {
          slipRes = await fetch('/api/slipok/api/line/apikey/75243', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-authorization': 'SLIPOK0J3S9H5'
            },
            body: JSON.stringify({
              data: cleanBase64,
              log: true
            })
          });
        } catch (proxyErr) {
          const formData = new FormData();
          const response = await fetch(slipPreview);
          const blob = await response.blob();
          formData.append('files', blob, 'slip.jpg');

          slipRes = await fetch('https://api.slipok.com/api/line/apikey/75243', {
            method: 'POST',
            headers: {
              'x-authorization': 'SLIPOK0J3S9H5'
            },
            body: formData
          });
        }

        const slipResult = await slipRes.json();
        
        if (slipResult && (slipResult.success || slipResult.status === 200)) {
          const slipData = slipResult.data || {};
          const verifiedAmt = slipData.amount || 0;
          if (verifiedAmt >= finalTotal) {
            initialStatus = 'preparing';
            verifiedPaymentDetails = {
              slip_url: slipPreview,
              is_auto_verified: true,
              verified_amount: verifiedAmt,
              trans_ref: slipData.transRef || null,
              sending_bank: slipData.sendingBank || null,
              trans_date: slipData.transDate || null,
              trans_time: slipData.transTime || null,
              verified_at: new Date().toISOString()
            };
          } else {
            alert(`⚠️ ยอดเงินในสลิป (${verifiedAmt.toLocaleString()} บาท) ไม่ตรงกับยอดสั่งซื้อ (${finalTotal.toLocaleString()} บาท) กรุณาตรวจสอบและอัปโหลดสลิปที่ถูกต้อง`);
            setSubmitting(false);
            return;
          }
        } else {
          // Slip verification returned error (e.g. invalid QR code, duplicate slip)
          const errorDetail = slipResult?.message || slipResult?.data?.message || 'ไม่พบ QR Code บนสลิปธนาคาร หรือสลิปนี้ถูกใช้งานไปแล้ว';
          alert(`⚠️ ระบบไม่สามารถยืนยันสลิปอัตโนมัติได้: ${errorDetail}\nคำสั่งซื้อจะถูกส่งเข้าสู่ระบบแบบรอ Admin ตรวจสอบ`);
        }
      } catch (slipErr) {
        console.warn('SlipOK Verification fallback:', slipErr);
      }

      // 2. Create Order in Supabase
      const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
        user_id: profile.id,
        total_amount: finalTotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        shipping_name: shippingName.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: shippingAddress.trim(),
        payment_method: 'promptpay',
        payment_details: verifiedPaymentDetails,
        status: initialStatus
      });

      if (orderErr) throw orderErr;

      const orderId = Array.isArray(orderData) ? orderData[0]?.id : orderData?.id || ('ord-' + Math.random().toString(36).substr(2, 6));

      // 3. Create Order Items
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

      localStorage.removeItem('aura_applied_coupon');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setOrderComplete({ id: orderId, isAutoVerified: initialStatus === 'preparing' });
      onClearCart();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'));
    }
    setSubmitting(false);
  };

  if (orderComplete) {
    const orderIdStr = typeof orderComplete === 'string' ? orderComplete : orderComplete?.id || '';
    const isAutoVerified = typeof orderComplete === 'object' && orderComplete?.isAutoVerified;

    return (
      <div style={styles.container}>
        <GlassCard style={styles.successCard}>
          <CheckCircle size={64} color="var(--success)" />
          <h2 style={styles.successTitle}>สั่งซื้อสินค้าสำเร็จแล้ว!</h2>

          {isAutoVerified && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '10px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px'
            }}>
              <Check size={16} /> ตรวจสอบสลิปผ่าน SlipOK อัตโนมัติเรียบร้อยแล้ว (สถานะ: กำลังเตรียมพัสดุ)
            </div>
          )}

          <p style={styles.successDesc}>
            คำสั่งซื้อรหัส <strong>#{orderIdStr.substr(0, 8)}</strong> ถูกส่งเข้าสู่ระบบแล้ว
            ทางแบรนด์ เสื้อเฮีย จะทำการจัดเตรียมพัสดุและจัดส่งให้คุณโดยเร็วที่สุด
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
                <CreditCard size={18} color="var(--primary)" /> ชำระเงินผ่าน PromptPay QR
              </h3>

              {/* PromptPay QR Section */}
              <div style={styles.qrSection}>
                <div style={styles.qrBox}>
                  <img
                    src={`https://promptpay.io/0644320510/${finalTotal}.png`}
                    alt="PromptPay QR"
                    style={styles.qrImg}
                  />
                  <p style={styles.qrAmount}>สแกนจ่ายเงินยอดรวม {finalTotal.toLocaleString()} บาท</p>
                </div>

                <div style={styles.slipUploadBox}>
                  <label style={styles.slipLabel}>อัปโหลดสลิปโอนเงิน: *</label>
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
                <span>ยอดรวมสินค้า</span>
                <span>{rawSubtotal.toLocaleString()} ฿</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ ...styles.totalRow, color: 'var(--primary)' }}>
                  <span>ส่วนลดคูปอง ({appliedCoupon?.code})</span>
                  <span>-{discountAmount.toLocaleString()} ฿</span>
                </div>
              )}

              <div style={{ ...styles.totalRow, fontSize: '18px', paddingTop: '6px', borderTop: '1px dashed var(--glass-border)' }}>
                <span>ยอดสุทธิทั้งสิ้น</span>
                <span style={styles.totalValue}>{finalTotal.toLocaleString()} ฿</span>
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
                  <>ยืนยันการสั่งซื้อสินค้า ({finalTotal.toLocaleString()} ฿)</>
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
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginTop: '6px',
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
    color: 'var(--primary)',
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
    fontSize: '14px',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--primary)',
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
