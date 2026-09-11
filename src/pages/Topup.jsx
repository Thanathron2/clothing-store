import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Coins, QrCode, Upload, CheckCircle, Clock, XCircle, Loader, RefreshCw, CreditCard, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import confetti from 'canvas-confetti';

const Topup = ({ profile, onRefreshProfile }) => {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [slipPreview, setSlipPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [topupHistory, setTopupHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const presetAmounts = [50, 100, 200, 500, 1000, 2000];

  useEffect(() => {
    if (profile) fetchHistory();
    else setLoading(false);
  }, [profile]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('topup_transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setTopupHistory(data || []);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize and compress image using HTML Canvas
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

          // Compress to JPEG with 0.7 quality (~60-100KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setSlipPreview(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getFinalAmount = () => {
    return amount === 'custom' ? parseFloat(customAmount) || 0 : parseFloat(amount) || 0;
  };

  const handleSubmit = async () => {
    if (!profile) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    const finalAmount = getFinalAmount();
    if (finalAmount < 10) {
      alert('กรุณาระบุจำนวนเงินขั้นต่ำ 10 บาท');
      return;
    }
    if (paymentMethod === 'promptpay' && !slipPreview) {
      alert('กรุณาอัปโหลดสลิปโอนเงิน');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('topup_transactions').insert({
        user_id: profile.id,
        amount: finalAmount,
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'promptpay'
          ? { slip_url: slipPreview }
          : { pin: 'SIMULATED-' + Math.random().toString(36).substr(2, 8).toUpperCase() },
        status: 'pending'
      });

      if (error) throw error;

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      setSubmitted(true);
      fetchHistory();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถส่งคำขอได้'));
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setAmount('');
    setCustomAmount('');
    setSlipPreview(null);
    setSubmitted(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge badge-success"><CheckCircle size={10} style={{ marginRight: '3px' }} /> อนุมัติแล้ว</span>;
      case 'rejected': return <span className="badge badge-danger"><XCircle size={10} style={{ marginRight: '3px' }} /> ถูกปฏิเสธ</span>;
      default: return <span className="badge badge-pending"><Clock size={10} style={{ marginRight: '3px' }} /> รอดำเนินการ</span>;
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <GlassCard style={styles.successCard}>
          <div style={styles.successContent}>
            <CheckCircle size={56} color="var(--success)" />
            <h2 style={styles.successTitle}>ส่งคำขอเติมเครดิตแล้ว!</h2>
            <p style={styles.successDesc}>
              คำขอเติมเครดิต {getFinalAmount().toFixed(2)} บาท ถูกส่งไปยังระบบแล้ว
              กรุณารอผู้ดูแลระบบตรวจสอบ (ประมาณ 1-5 นาที)
            </p>
            <button onClick={resetForm} className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Coins size={16} /> เติมเครดิตเพิ่มเติม
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Coins size={28} color="var(--secondary)" />
        <h1 style={styles.title}>เติมเครดิต</h1>
      </div>

      <div style={styles.grid}>
        {/* Left: Topup Form */}
        <div style={styles.leftCol}>
          <GlassCard style={styles.formCard}>
            <h3 style={styles.formTitle}>เลือกจำนวนเงิน</h3>
            <div style={styles.amountGrid}>
              {presetAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => { setAmount(a.toString()); setCustomAmount(''); }}
                  style={{
                    ...styles.amountBtn,
                    ...(amount === a.toString() ? styles.amountBtnActive : {})
                  }}
                >
                  {a >= 1000 ? `${a / 1000}K` : a}
                  <span style={styles.amountUnit}>฿</span>
                </button>
              ))}
              <button
                onClick={() => setAmount('custom')}
                style={{
                  ...styles.amountBtn,
                  ...(amount === 'custom' ? styles.amountBtnActive : {})
                }}
              >
                กำหนดเอง
              </button>
            </div>

            {amount === 'custom' && (
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">ระบุจำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="ขั้นต่ำ 10 บาท"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="10"
                />
              </div>
            )}

            {/* Payment Method */}
            <h3 style={{ ...styles.formTitle, marginTop: '24px' }}>ช่องทางการชำระ</h3>
            <div style={styles.methodGrid}>
              <button
                onClick={() => setPaymentMethod('promptpay')}
                style={{
                  ...styles.methodBtn,
                  ...(paymentMethod === 'promptpay' ? styles.methodBtnActive : {})
                }}
              >
                <QrCode size={20} />
                <span>PromptPay QR</span>
              </button>
              <button
                onClick={() => setPaymentMethod('truemoney')}
                style={{
                  ...styles.methodBtn,
                  ...(paymentMethod === 'truemoney' ? styles.methodBtnActive : {})
                }}
              >
                <CreditCard size={20} />
                <span>ทรูมันนี่</span>
              </button>
            </div>

            {/* QR / Slip Upload */}
            {paymentMethod === 'promptpay' && (
              <div style={styles.qrSection}>
                <div style={styles.qrPlaceholder}>
                  {getFinalAmount() > 0 ? (
                    <img
                      src={`https://promptpay.io/0644320510/${getFinalAmount()}.png`}
                      alt="PromptPay QR"
                      style={styles.qrImage}
                    />
                  ) : (
                    <>
                      <QrCode size={64} color="var(--text-muted)" />
                      <p style={styles.qrText}>สแกน QR Code เพื่อโอนเงิน</p>
                    </>
                  )}
                  <p style={styles.qrAmount}>
                    {getFinalAmount() > 0 ? `${getFinalAmount().toFixed(2)} บาท` : 'เลือกจำนวนเงินก่อน'}
                  </p>
                </div>

                <div style={styles.slipSection}>
                  <p style={styles.slipLabel}>อัปโหลดสลิปโอนเงิน:</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {slipPreview ? (
                    <div style={styles.slipPreview}>
                      <img src={slipPreview} alt="slip" style={styles.slipImage} />
                      <button onClick={() => setSlipPreview(null)} className="btn btn-danger" style={styles.removeSlipBtn}>
                        <XCircle size={14} /> ลบ
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={styles.uploadBtn}>
                      <Upload size={16} /> เลือกไฟล์สลิป
                    </button>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'truemoney' && (
              <div style={styles.truemoneySection}>
                <p style={styles.truemoneyLabel}>รหัสบัตรทรูมันนี่ 14 หลัก:</p>
                <p style={styles.truemoneyNote}>ระบบจะสร้างรหัสจำลองให้อัตโนมัติเมื่อกดส่งคำขอ</p>
              </div>
            )}

            {/* Summary & Submit */}
            {getFinalAmount() > 0 && (
              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>จำนวนเงินที่เติม</span>
                  <span style={styles.summaryValue}>{getFinalAmount().toFixed(2)} บาท</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>เครดิตที่ได้รับ</span>
                  <span style={{ ...styles.summaryValue, color: 'var(--secondary)' }}>{getFinalAmount().toFixed(2)} เครดิต</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>เครดิตคงเหลือปัจจุบัน</span>
                  <span>{profile ? profile.credit.toFixed(2) : '0.00'} ฿</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={styles.submitBtn}
              disabled={submitting || getFinalAmount() < 10}
            >
              {submitting ? (
                <Loader size={16} style={styles.spinner} />
              ) : (
                <><Zap size={16} /> ส่งคำขอเติมเครดิต</>
              )}
            </button>
          </GlassCard>
        </div>

        {/* Right: History */}
        <div style={styles.rightCol}>
          <GlassCard style={styles.historyCard}>
            <h3 style={styles.historyTitle}>ประวัติการเติมเครดิต</h3>
            {loading ? (
              <div style={styles.loadingWrap}>
                <RefreshCw size={20} style={styles.spinner} />
                <p>กำลังโหลด...</p>
              </div>
            ) : topupHistory.length === 0 ? (
              <p style={styles.emptyText}>ยังไม่มีประวัติการเติมเครดิต</p>
            ) : (
              <div style={styles.historyList}>
                {topupHistory.map(tx => (
                  <div key={tx.id} style={styles.historyItem}>
                    <div style={styles.historyTop}>
                      <span style={styles.historyAmount}>+{tx.amount.toFixed(2)} ฿</span>
                      {getStatusBadge(tx.status)}
                    </div>
                    <div style={styles.historyBottom}>
                      <span style={styles.historyMethod}>{tx.payment_method === 'promptpay' ? 'PromptPay' : 'TrueMoney'}</span>
                      <span style={styles.historyDate}>{new Date(tx.created_at).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
  },
  grid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 500px',
  },
  rightCol: {
    flex: '1 1 350px',
  },
  formCard: {
    padding: '30px',
    textAlign: 'left',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  amountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
  },
  amountBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 8px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '16px',
    fontWeight: '600',
  },
  amountBtnActive: {
    background: 'rgba(0, 217, 255, 0.1)',
    border: '2px solid var(--secondary)',
    color: 'var(--secondary)',
    boxShadow: '0 0 15px rgba(0, 217, 255, 0.15)',
  },
  amountUnit: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
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
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
  },
  methodBtnActive: {
    background: 'rgba(139, 92, 246, 0.1)',
    border: '2px solid var(--primary)',
    color: '#fff',
  },
  qrSection: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  qrPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    border: '2px dashed var(--glass-border)',
    borderRadius: '12px',
    width: '100%',
    gap: '8px',
  },
  qrImage: {
    width: '200px',
    height: '200px',
    borderRadius: '12px',
    border: '2px solid var(--glass-border)',
  },
  qrText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  qrAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  slipSection: {
    width: '100%',
    textAlign: 'center',
  },
  slipLabel: {
    fontSize: '14px',
    marginBottom: '8px',
    color: 'var(--text-secondary)',
  },
  uploadBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  slipPreview: {
    position: 'relative',
    display: 'inline-block',
  },
  slipImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
  },
  removeSlipBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 10px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  truemoneySection: {
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(255, 165, 0, 0.05)',
    border: '1px solid rgba(255, 165, 0, 0.2)',
    borderRadius: '10px',
  },
  truemoneyLabel: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  truemoneyNote: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  summaryBox: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  summaryValue: {
    fontWeight: '700',
    color: 'var(--success)',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  historyCard: {
    padding: '24px',
    textAlign: 'left',
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--glass-border)',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px 0',
    gap: '8px',
    color: 'var(--text-secondary)',
  },
  emptyText: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '30px 0',
    fontSize: '14px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyItem: {
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
  },
  historyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  historyAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--success)',
  },
  historyBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  historyMethod: {},
  historyDate: {},
  successCard: {
    padding: '50px 30px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '40px auto',
  },
  successContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--success)',
  },
  successDesc: {
    fontSize: '14px',
    maxWidth: '400px',
  },
};

export default Topup;
