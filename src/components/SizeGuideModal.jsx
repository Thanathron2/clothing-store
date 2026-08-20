import React from 'react';
import { X, Ruler } from 'lucide-react';
import GlassCard from './GlassCard';

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalWrap} onClick={e => e.stopPropagation()}>
        <GlassCard style={styles.card}>
          <div style={styles.header}>
            <div style={styles.titleGroup}>
              <Ruler size={20} color="var(--primary)" />
              <h3 style={styles.title}>SIZE & FIT GUIDE — ตารางวัดขนาดสินค้า</h3>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>

          <p style={styles.desc}>
            ตารางวัดไซส์มาตรฐานสำหรับเสื้อผ้า AURA APPAREL (ทรง Oversized / Boxy Fit) สามารถวัดเปรียบเทียบกับขนาดรอบอกและความยาวเสื้อของคุณได้ด้านล่างนี้
          </p>

          {/* Size Chart Table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SIZE</th>
                  <th style={styles.th}>รอบอก (CHEST)</th>
                  <th style={styles.th}>ความยาว (LENGTH)</th>
                  <th style={styles.th}>ไหล่กว้าง (SHOULDER)</th>
                  <th style={styles.th}>ความยาวแขน (SLEEVE)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>S</td>
                  <td style={styles.td}>44 นิ้ว (112 cm)</td>
                  <td style={styles.td}>28 นิ้ว (71 cm)</td>
                  <td style={styles.td}>21 นิ้ว (53 cm)</td>
                  <td style={styles.td}>8.5 นิ้ว (21 cm)</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>M</td>
                  <td style={styles.td}>46 นิ้ว (117 cm)</td>
                  <td style={styles.td}>29 นิ้ว (73 cm)</td>
                  <td style={styles.td}>22 นิ้ว (56 cm)</td>
                  <td style={styles.td}>9.0 นิ้ว (23 cm)</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>L</td>
                  <td style={styles.td}>48 นิ้ว (122 cm)</td>
                  <td style={styles.td}>30 นิ้ว (76 cm)</td>
                  <td style={styles.td}>23 นิ้ว (58 cm)</td>
                  <td style={styles.td}>9.5 นิ้ว (24 cm)</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>XL</td>
                  <td style={styles.td}>50 นิ้ว (127 cm)</td>
                  <td style={styles.td}>31 นิ้ว (78 cm)</td>
                  <td style={styles.td}>24 นิ้ว (61 cm)</td>
                  <td style={styles.td}>10 นิ้ว (25 cm)</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>XXL</td>
                  <td style={styles.td}>52 นิ้ว (132 cm)</td>
                  <td style={styles.td}>32 นิ้ว (81 cm)</td>
                  <td style={styles.td}>25 นิ้ว (63 cm)</td>
                  <td style={styles.td}>10.5 นิ้ว (26 cm)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.tipBox}>
            <strong>💡 คำแนะนำในการเลือกไซส์:</strong> หากชอบสไตล์หลวมกำลังดีทรง Streetwear Oversized แนะนำเลือกตรงไซส์ หากชอบทรงกระชับสามารถลดลง 1 ไซส์ได้ครับ
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
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
    background: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalWrap: {
    maxWidth: '560px',
    width: '100%',
  },
  card: {
    padding: '28px',
    textAlign: 'left',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.8px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
  },
  desc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  tableWrap: {
    overflowX: 'auto',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.8px',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  td: {
    padding: '10px 12px',
    fontSize: '13px',
  },
  tipBox: {
    padding: '12px',
    background: 'rgba(226, 194, 117, 0.08)',
    border: '1px solid rgba(226, 194, 117, 0.2)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  }
};

export default SizeGuideModal;
