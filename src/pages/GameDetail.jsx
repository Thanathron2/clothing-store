import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, ShoppingCart, Coins, CheckCircle, Loader, RefreshCw, Star, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import confetti from 'canvas-confetti';

const GameDetail = ({ profile, onRefreshProfile }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [server, setServer] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    fetchGameDetail();
  }, [gameId]);

  const fetchGameDetail = async () => {
    setLoading(true);
    const [{ data: gameData }, { data: pkgData }] = await Promise.all([
      supabase.from('games').select('*').eq('id', gameId),
      supabase.from('game_packages').select('*').eq('game_id', gameId).order('price')
    ]);
    if (gameData && gameData.length > 0) setGame(gameData[0]);
    setPackages(pkgData || []);
    setLoading(false);
  };

  const handlePurchase = () => {
    if (!profile) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
      return;
    }
    if (!playerId.trim()) {
      alert('กรุณากรอก Player ID');
      return;
    }
    if (!selectedPkg) {
      alert('กรุณาเลือกแพ็กเกจ');
      return;
    }
    if (profile.credit < selectedPkg.price) {
    alert('เครดิตไม่เพียงพอ กรุณาเติมเครดิตก่อน');
      navigate('/topup');
      return;
    }
    setShowConfirm(true);
  };

  const confirmPurchase = async () => {
    setPurchasing(true);
    try {
      // Create purchase transaction
      const { error: purchaseError } = await supabase.from('purchase_transactions').insert({
        user_id: profile.id,
        game_id: gameId,
        package_id: selectedPkg.id,
        target_account: `${playerId}${server ? ` (${server})` : ''}`,
        price: selectedPkg.price,
        status: 'completed'
      });

      if (purchaseError) throw purchaseError;

      // Deduct credit
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credit: profile.credit - selectedPkg.price })
        .eq('id', profile.id);

      if (creditError) throw creditError;

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#00d9ff', '#f43f5e', '#10b981']
      });

      setPurchaseSuccess(true);
      if (onRefreshProfile) onRefreshProfile();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถทำรายการได้'));
    }
    setPurchasing(false);
    setShowConfirm(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <RefreshCw size={32} style={styles.spinner} />
        <p>กำลังโหลดข้อมูลเกม...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>ไม่พบข้อมูลเกม</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back button */}
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={styles.backBtn}>
        <ArrowLeft size={16} /> กลับหน้าแรก
      </button>

      {/* Game Header */}
      <GlassCard style={styles.gameHeader}>
        <div style={styles.gameHeaderContent}>
          <img
            src={game.logo_url}
            alt={game.name}
            style={styles.gameHeaderLogo}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop'; }}
          />
          <div style={styles.gameHeaderInfo}>
            <span className="badge badge-success" style={{ marginBottom: '8px', display: 'inline-block' }}>{game.category}</span>
            <h1 style={styles.gameTitle}>{game.name}</h1>
            <p style={styles.gameDesc}>{game.description}</p>
            <div style={styles.gameFeatures}>
              <span style={styles.featureTag}><Zap size={12} /> เครดิตเข้าทันที</span>
              <span style={styles.featureTag}><CheckCircle size={12} /> ระบบอัตโนมัติ 24 ชม.</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Success Message */}
      {purchaseSuccess && (
        <GlassCard style={styles.successCard}>
          <div style={styles.successContent}>
            <CheckCircle size={48} color="var(--success)" />
            <h2 style={styles.successTitle}>ทำรายการสำเร็จ!</h2>
            <p style={styles.successDesc}>
              เครดิต {selectedPkg?.reward_amount} {game.name} ได้ถูกเติมให้กับบัญชี {playerId} เรียบร้อยแล้ว
            </p>
            <div style={styles.successActions}>
              <button onClick={() => { setPurchaseSuccess(false); setSelectedPkg(null); setPlayerId(''); setServer(''); }} className="btn btn-primary">
                ซื้ออีกครั้ง
              </button>
              <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                ดูประวัติการซื้อ
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Package Selection */}
      {!purchaseSuccess && (
        <>
          <div style={styles.sectionTitleGroup}>
            <Star size={20} color="var(--secondary)" />
            <h2 style={styles.sectionTitle}>เลือกแพ็กเกจ</h2>
          </div>
          <div style={styles.packagesGrid}>
            {packages.map(pkg => (
              <GlassCard
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                style={{
                  ...styles.pkgCard,
                  ...(selectedPkg?.id === pkg.id ? styles.pkgCardSelected : {})
                }}
              >
                {pkg.original_price > pkg.price && (
                  <div style={styles.pkgDiscount}>
                    -{Math.round((1 - pkg.price / pkg.original_price) * 100)}%
                  </div>
                )}
                <div style={styles.pkgName}>{pkg.name}</div>
                <div style={styles.pkgPrice}>
                  <span style={styles.pkgPriceValue}>{pkg.price.toFixed(0)}</span>
                  <span style={styles.pkgPriceUnit}> เครดิต</span>
                </div>
                {pkg.original_price > pkg.price && (
                  <div style={styles.pkgOriginalPrice}>ปกติ {pkg.original_price.toFixed(0)} เครดิต</div>
                )}
                {selectedPkg?.id === pkg.id && (
                  <div style={styles.pkgSelectedBadge}>
                    <CheckCircle size={14} /> เลือกแล้ว
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {/* Player Info Form */}
          {selectedPkg && (
            <GlassCard style={styles.orderCard}>
              <h3 style={styles.orderTitle}>กรอกข้อมูลตัวละคร</h3>
              <div className="form-group">
                <label className="form-label">Player ID / UID ของเกม *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="เช่น 1234567890"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">เซิร์ฟเวอร์ (ถ้ามี)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="เช่น TH Server, Asia"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                />
              </div>

              {/* Order Summary */}
              <div style={styles.orderSummary}>
                <div style={styles.summaryRow}>
                  <span>แพ็กเกจ</span>
                  <span>{selectedPkg.name}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>ราคา</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{selectedPkg.price.toFixed(2)} เครดิต</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>เครดิตคงเหลือ</span>
                  <span>{profile ? profile.credit.toFixed(2) : '0.00'} ฿</span>
                </div>
                <div style={{ ...styles.summaryRow, borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                  <span style={{ fontWeight: '600' }}>เครดิตหลังซื้อ</span>
                  <span style={{ color: profile && profile.credit - selectedPkg.price < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: '700' }}>
                    {profile ? (profile.credit - selectedPkg.price).toFixed(2) : '0.00'} ฿
                  </span>
                </div>
              </div>

              <button onClick={handlePurchase} className="btn btn-primary" style={styles.purchaseBtn}>
                <ShoppingCart size={16} /> สั่งซื้อด้วยเครดิต
              </button>
            </GlassCard>
          )}
        </>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={styles.overlay}>
          <GlassCard style={styles.confirmModal}>
            <h3 style={styles.confirmTitle}>ยืนยันการสั่งซื้อ</h3>
            <div style={styles.confirmDetails}>
              <p><strong>เกม:</strong> {game.name}</p>
              <p><strong>แพ็กเกจ:</strong> {selectedPkg?.name}</p>
              <p><strong>Player ID:</strong> {playerId}</p>
              <p><strong>ราคา:</strong> <span style={{ color: 'var(--secondary)' }}>{selectedPkg?.price.toFixed(2)} เครดิต</span></p>
            </div>
            <div style={styles.confirmActions}>
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary" disabled={purchasing}>
                ยกเลิก
              </button>
              <button onClick={confirmPurchase} className="btn btn-success" disabled={purchasing}>
                {purchasing ? <Loader size={16} style={styles.spinner} /> : <><CheckCircle size={16} /> ยืนยัน</>}
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    color: 'var(--text-secondary)',
    gap: '12px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  backBtn: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  gameHeader: {
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  gameHeaderContent: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  gameHeaderLogo: {
    width: '100px',
    height: '100px',
    borderRadius: '16px',
    objectFit: 'cover',
    border: '2px solid var(--glass-border)',
  },
  gameHeaderInfo: {
    flex: '1 1 300px',
    textAlign: 'left',
  },
  gameTitle: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  gameDesc: {
    fontSize: '14px',
    marginBottom: '12px',
  },
  gameFeatures: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  featureTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.05)',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
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
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '14px',
  },
  pkgCard: {
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.25s',
  },
  pkgCardSelected: {
    border: '2px solid var(--secondary)',
    boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)',
  },
  pkgDiscount: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  pkgName: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  pkgPrice: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '2px',
  },
  pkgPriceValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--secondary)',
  },
  pkgPriceUnit: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  pkgOriginalPrice: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    marginTop: '4px',
  },
  pkgSelectedBadge: {
    marginTop: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--secondary)',
    background: 'rgba(0, 217, 255, 0.1)',
    padding: '3px 10px',
    borderRadius: '10px',
  },
  orderCard: {
    padding: '30px',
    textAlign: 'left',
  },
  orderTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  orderSummary: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    padding: '16px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  purchaseBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  successCard: {
    padding: '40px',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.3)',
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
  successActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
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
  confirmModal: {
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
  },
  confirmTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  confirmDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  confirmActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
};

export default GameDetail;
