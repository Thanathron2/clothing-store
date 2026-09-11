import React, { useState } from 'react';
import { MessageSquare, X, Send, Phone, ArrowUpRight, HelpCircle, ShieldCheck } from 'lucide-react';
import GlassCard from './GlassCard';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={styles.container}>
      {/* Expanded Support Card */}
      {isOpen && (
        <GlassCard style={styles.card}>
          <div style={styles.header}>
            <div style={styles.headerTitleGroup}>
              <div style={styles.statusDot}></div>
              <div>
                <h4 style={styles.headerTitle}>เสื้อเฮีย.Official SUPPORT</h4>
                <p style={styles.headerSub}>ฝ่ายบริการและดูแลลูกค้า 24/7</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <X size={16} />
            </button>
          </div>

          <p style={styles.desc}>
            มีคำถามเกี่ยวกับไซส์เสื้อผ้า การจัดส่งพัสดุ หรือต้องการแจ้งปัญหา สามารถติดต่อทีมงาน AURA ผ่านช่องทางหลักได้ทันทีครับ
          </p>

          <div style={styles.channelsGrid}>
            <a
              href="https://line.me"
              target="_blank"
              rel="noreferrer"
              style={{ ...styles.channelBtn, background: 'rgba(6, 199, 85, 0.12)', border: '1px solid rgba(6, 199, 85, 0.3)', color: '#06c755' }}
            >
              <div style={styles.channelIconText}>
                <Send size={16} />
                <span>Line Official (@auraapparel)</span>
              </div>
              <ArrowUpRight size={14} />
            </a>

            <a
              href="https://m.me"
              target="_blank"
              rel="noreferrer"
              style={{ ...styles.channelBtn, background: 'rgba(0, 132, 255, 0.12)', border: '1px solid rgba(0, 132, 255, 0.3)', color: '#0084ff' }}
            >
              <div style={styles.channelIconText}>
                <MessageSquare size={16} />
                <span>Facebook Messenger</span>
              </div>
              <ArrowUpRight size={14} />
            </a>

            <a
              href="tel:021234567"
              style={{ ...styles.channelBtn, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
            >
              <div style={styles.channelIconText}>
                <Phone size={16} color="var(--primary)" />
                <span>Hotline: 02-123-4567 (09:00 - 22:00)</span>
              </div>
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div style={styles.faqSection}>
            <div style={styles.faqTitleGroup}>
              <HelpCircle size={13} color="var(--text-muted)" />
              <span style={styles.faqTitle}>คำถามที่พบบ่อย (FAQ)</span>
            </div>
            <div style={styles.faqList}>
              <div style={styles.faqItem}>• จัดส่งพัสดุในกี่วัน? ➔ จัดส่งฟรีด่วน 1-2 วันทำการ</div>
              <div style={styles.faqItem}>• ลองแล้วหลวมไปเปลี่ยนไซส์ได้ไหม? ➔ เปลี่ยนได้ฟรีภายใน 7 วัน</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.triggerBtn}
        className="pulse-glow"
        title="Contact Support"
      >
        {isOpen ? <X size={22} color="#090a0d" /> : <MessageSquare size={22} color="#090a0d" />}
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9990,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
  },
  triggerBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'var(--primary)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 6px 20px var(--primary-glow)',
    transition: 'all 0.3s ease',
  },
  card: {
    width: '340px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    textAlign: 'left',
    boxShadow: '0 15px 50px rgba(0,0,0,0.7)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '10px',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '0.8px',
  },
  headerSub: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px',
  },
  desc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  channelsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  channelBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  channelIconText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  faqSection: {
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  faqTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  faqTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  faqItem: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  }
};

export default SupportWidget;
