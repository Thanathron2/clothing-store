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
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google OAuth');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      if (!username) {
        setErrorMsg('กรุณากรอกชื่อผู้ใช้ (Username)');
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
            display_name: username.trim(),
            role: 'user'
          }
        }
      });

      if (error) {
        if (error.message.includes('rate limit exceeded') || error.message.includes('over_email_send_rate_limit')) {
          setErrorMsg('สมัครสมาชิกรวดเร็วเกินไป หรือติดโควตาการส่งอีเมลยืนยันของ Supabase');
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
          setSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน');
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
        if (error.message === 'Invalid login credentials') {
          setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้สมัครสมาชิก');
        } else if (error.message === 'Email not confirmed') {
          setErrorMsg('อีเมลนี้ยังไม่ได้ยืนยันตัวตน (กรุณาเช็คอินบ็อกซ์หรือปิด Confirm Email ใน Supabase)');
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
              <Sparkles size={20} color="var(--primary)" />
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

          {/* Google Social Login Button */}
          <button
            type="button"
            onClick={handleGoogleOAuth}
            style={styles.googleBtn}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isSignUp ? 'สมัครด้วย Google Account' : 'เข้าสู่ระบบด้วย Google Account'}</span>
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>หรือใช้อีเมล</span>
            <span style={styles.dividerLine}></span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
            {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

            {isSignUp && (
              <div className="form-group">
                <label className="form-label">ชื่อผู้ใช้ (USERNAME)</label>
                <div style={styles.inputWrapper}>
                  <User size={16} style={styles.inputIcon} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={styles.inputWithIcon}
                    placeholder="เช่น somchai_style" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">อีเมล (EMAIL)</label>
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
              <label className="form-label">รหัสผ่าน (PASSWORD)</label>
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
    marginBottom: '20px',
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
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '11px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--glass-border)',
  },
  dividerText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
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
    fontSize: '15px',
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
    color: 'var(--primary)',
    fontWeight: '500',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  }
};

export default AuthModal;
