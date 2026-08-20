import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, User, Sparkles, Loader } from 'lucide-react';
import GlassCard from './GlassCard';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  if (!isOpen) return null;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      if (!username || !displayName) {
        setErrorMsg('กรุณากรอกข้อมูลชื่อผู้ใช้และชื่อแสดงผลให้ครบถ้วน');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.toLowerCase().trim(),
            display_name: displayName.trim(),
            role: 'user'
          }
        }
      });

      if (error) {
        if (error.message.includes('rate limit exceeded') || error.message.includes('over_email_send_rate_limit')) {
          setErrorMsg('สมัครสมาชิกรวดเร็วเกินไป หรือติดโควตาการส่งอีเมลยืนยันของ Supabase (กรุณาปิด "Confirm email" ใน Supabase หรือรอ 5-10 นาที)');
        } else {
          setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
      } else {
        if (data?.session) {
          setSuccessMsg('สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อย!');
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 1200);
        } else {
          // Email confirmation is required by Supabase project settings
          setSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน (หรือปิด Confirm Email ใน Supabase Dashboard)');
          setTimeout(() => {
            setIsSignUp(false);
          }, 3000);
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        // Show exact error message from Supabase auth
        if (error.message === 'Invalid login credentials') {
          setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้สมัครสมาชิก');
        } else if (error.message === 'Email not confirmed') {
          setErrorMsg('อีเมลนี้ยังไม่ได้ยืนยันตัวตน (กรุณาเช็คอินบ็อกซ์ หรือปิด Confirm Email ใน Supabase Dashboard)');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setSuccessMsg('เข้าสู่ระบบสำเร็จ!');
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 1000);
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        <GlassCard className="pulse-glow" style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.titleContainer}>
              <Sparkles size={20} color="var(--secondary)" />
              <h2 style={styles.title}>{isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h2>
            </div>
            <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button 
              onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{...styles.tab, ...(isSignUp ? {} : styles.activeTab)}}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{...styles.tab, ...(isSignUp ? styles.activeTab : {})}}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
            {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

            {isSignUp && (
              <>
                <div className="form-group">
                  <label className="form-label">ชื่อผู้ใช้ (Username)</label>
                  <div style={styles.inputWrapper}>
                    <User size={16} style={styles.inputIcon} />
                    <input 
                      type="text" 
                      className="form-control" 
                      style={styles.inputWithIcon}
                      placeholder="เช่น gamer123" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ชื่อที่ต้องการให้แสดง (Display Name)</label>
                  <div style={styles.inputWrapper}>
                    <User size={16} style={styles.inputIcon} />
                    <input 
                      type="text" 
                      className="form-control" 
                      style={styles.inputWithIcon}
                      placeholder="เช่น Gamer Pro TH" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">อีเมล (Email)</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input 
                  type="email" 
                  className="form-control" 
                  style={styles.inputWithIcon}
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน (Password)</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input 
                  type="password" 
                  className="form-control" 
                  style={styles.inputWithIcon}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <Loader size={18} style={styles.spinner} />
              ) : (
                isSignUp ? 'สร้างบัญชีผู้ใช้' : 'ลงชื่อเข้าใช้งาน'
              )}
            </button>
          </form>

          {/* Info footnote */}
          <div style={styles.footnote}>
            {isSignUp ? (
              <span>มีบัญชีผู้ใช้อยู่แล้ว? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); }} style={styles.link}>เข้าสู่ระบบที่นี่</a></span>
            ) : (
              <span>ยังไม่มีบัญชีผู้ใช้? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); }} style={styles.link}>สมัครสมาชิกฟรีที่นี่</a></span>
            )}
          </div>
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
    backgroundColor: 'rgba(3, 5, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalContainer: {
    width: '100%',
    maxWidth: '420px',
  },
  card: {
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
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
    transition: 'background-color 0.2s',
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '24px',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: 'var(--glass-bg-hover)',
    color: '#fff',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
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
  submitBtn: {
    marginTop: '10px',
    padding: '12px',
    fontSize: '16px',
    width: '100%',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px',
    textAlign: 'left',
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px',
    textAlign: 'left',
  },
  footnote: {
    marginTop: '20px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  link: {
    color: 'var(--secondary)',
    fontWeight: '500',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  }
};

export default AuthModal;
