import React from 'react';
import { Sparkles, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <div style={styles.branding}>
          <div style={styles.logo}>
            <div style={styles.logoIconBg}>
              <Sparkles size={16} color="#fff" />
            </div>
            <span style={styles.logoText}>เสื้อเฮีย <span style={{ color: 'var(--primary)' }}></span></span>
          </div>
          <p style={styles.desc}>
            แบรนด์เสื้อผ้าแฟชั่นสตรีทลักชูรีอย่างเป็นทางการ ออกแบบและตัดเย็บทรงพิเศษ ผ้าเกรดพรีเมียม 100% สั่งซื้อง่าย จัดส่งด่วนทั่วประเทศ
          </p>
        </div>

        <div style={styles.features}>
          <div style={styles.featureItem}>
            <Truck size={16} color="var(--secondary)" />
            <span>จัดส่งด่วน Express 1-2 วันทำการ</span>
          </div>
          <div style={styles.featureItem}>
            <RotateCcw size={16} color="var(--primary)" />
            <span>รับประกันเปลี่ยนไซส์ฟรีภายใน 7 วัน</span>
          </div>
          <div style={styles.featureItem}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>สินค้าลิขสิทธิ์แท้ 100% จากแบรนด์ เสื้อเฮีย</span>
          </div>
        </div>
      </div>

      <div style={styles.bottom}>
        <p style={styles.copyright}>
          &copy; {new Date().getFullYear()} เสื้อเฮีย Official. All Rights Reserved. Crafted with <Heart size={12} color="red" style={{ display: 'inline', verticalAlign: 'middle' }} /> for Streetwear Enthusiasts.
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid var(--glass-border)',
    background: 'rgba(5, 7, 20, 0.85)',
    backdropFilter: 'blur(10px)',
    padding: '40px 20px 20px 20px',
    width: '100%',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '30px',
    marginBottom: '30px',
  },
  branding: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'left',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIconBg: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
  },
  desc: {
    fontSize: '13px',
    maxWidth: '420px',
    color: 'var(--text-secondary)',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    justifyContent: 'center',
    textAlign: 'left',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  bottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
    textAlign: 'center',
  },
  copyright: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  }
};

export default Footer;
