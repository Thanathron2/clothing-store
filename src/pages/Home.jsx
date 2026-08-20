import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Sparkles, ShoppingBag, ArrowRight, RefreshCw, Search, Tag, Truck, ShieldCheck, Award, Mail, Check } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Home = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prodData }, { data: catData }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    
    setProducts(prodData || []);
    setCategories(catData || []);
    setLoading(false);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category_id === selectedCategory || p.categories?.slug === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={styles.container}>
      {/* Editorial Hero Collection Showcase */}
      <GlassCard className="pulse-glow" style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <div style={styles.badgeWrap}>
            <span className="badge badge-success" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Sparkles size={10} /> 2026 EDITION — SPRING / SUMMER
            </span>
          </div>

          <h1 style={styles.heroTitle}>
            เสื้อเฮีย.Official <br />
            <span style={styles.gradientText}>PARIS & TOKYO DROP</span>
          </h1>

          <p style={styles.heroDesc}>
            ยกระดับสไตล์ของคุณด้วยเสื้อผ้าสตรีทแฟชั่นทรงพรีเมียม ตัดเย็บจากผ้า Cotton 100% สวมใส่สบาย ดีไซน์ลิขสิทธิ์แท้เฉพาะแบรนด์ เสื้อเฮีย.Official
          </p>

          <div style={styles.heroActions}>
            <button 
              onClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="btn btn-primary"
              style={styles.heroBtn}
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div style={styles.heroVisual}>
          <img 
            src="https://tse3.mm.bing.net/th/id/OIP.HBlrB3osxe6YB0yHQNHj8AHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" 
            alt="Hero Fashion" 
            style={styles.heroImage} 
          />
        </div>
      </GlassCard>

      {/* Brand Value Bar */}
      <div style={styles.brandValueGrid}>
        <div style={styles.brandValueItem}>
          <Truck size={20} color="var(--primary)" />
          <div>
            <h4 style={styles.brandValueTitle}>EXPRESS SHIPPING</h4>
            <p style={styles.brandValueDesc}>จัดส่งฟรีเมื่อซื้อสินค้า 1,500 บาทขึ้นไป</p>
          </div>
        </div>
        <div style={styles.brandValueItem}>
          <ShieldCheck size={20} color="var(--primary)" />
          <div>
            <h4 style={styles.brandValueTitle}>100% AUTHENTIC</h4>
            <p style={styles.brandValueDesc}>สินค้าลิขสิทธิ์แท้จากแบรนด์ เสื้อเฮีย</p>
          </div>
        </div>
        <div style={styles.brandValueItem}>
          <Award size={20} color="var(--primary)" />
          <div>
            <h4 style={styles.brandValueTitle}>PREMIUM FABRIC</h4>
            <p style={styles.brandValueDesc}>ตัดเย็บด้วยผ้า Cotton หนาทนทาน 260GSM</p>
          </div>
        </div>
      </div>

      {/* Catalog & Filter Section */}
      <div id="catalog-section" style={styles.catalogSection}>
        <div style={styles.filterHeader}>
          <div style={styles.sectionTitleGroup}>
            <Tag size={20} color="var(--primary)" />
            <h2 style={styles.sectionTitle}>ALL PRODUCTS — รายการเสื้อผ้าและเครื่องประดับ</h2>
          </div>

          {/* Search Bar */}
          <div style={styles.searchBox}>
            <Search size={15} style={styles.searchIcon} />
            <input
              type="text"
              className="form-control"
              style={styles.searchInput}
              placeholder="SEARCH ITEMS, HOODIES, TEES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={styles.categoryBar}>
          <button
            onClick={() => setSelectedCategory('All')}
            style={{
              ...styles.catBtn,
              ...(selectedCategory === 'All' ? styles.catBtnActive : {})
            }}
          >
            ALL ITEMS ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                ...styles.catBtn,
                ...(selectedCategory === cat.id ? styles.catBtnActive : {})
              }}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={styles.loadingWrap}>
            <RefreshCw size={28} style={styles.spinner} />
            <p style={{ fontSize: '13px', letterSpacing: '1px' }}>LOADING CATALOGUE...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.noProducts}>
            <p>ไม่พบรายการสินค้าที่คุณค้นหา</p>
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {filteredProducts.map(product => (
              <GlassCard 
                key={product.id} 
                style={styles.productCard}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div style={styles.imgWrap}>
                  <img src={product.image_url} alt={product.name} style={styles.productImg} />
                  {product.original_price && (
                    <div style={styles.discountBadge}>
                      LIMITED SALE
                    </div>
                  )}
                </div>

                <div style={styles.productBody}>
                  <div style={styles.catTag}>
                    {product.categories?.name || 'AURA APPAREL'}
                  </div>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productDesc}>{product.description}</p>
                  
                  <div style={styles.priceRow}>
                    <div>
                      <span style={styles.price}>{product.price.toLocaleString()} ฿</span>
                      {product.original_price && (
                        <span style={styles.originalPrice}>{product.original_price.toLocaleString()} ฿</span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image_url: product.image_url,
                          selectedSize: Array.isArray(product.sizes) ? product.sizes[0] : 'Free Size',
                          selectedColor: Array.isArray(product.colors) ? product.colors[0] : 'Black',
                          quantity: 1
                        });
                      }}
                      className="btn btn-primary"
                      style={styles.addBtn}
                      title="ADD TO BAG"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* High Fashion Lookbook Showcase */}
      <GlassCard style={styles.lookbookCard}>
        <div style={styles.lookbookHeader}>
          <span style={styles.lookbookSub}>EDITORIAL LOOKBOOK</span>
          <h2 style={styles.lookbookTitle}>SEASON 01 — SILHOUETTE & CRAFT</h2>
          <p style={styles.lookbookDesc}>สำรวจลุคสตรีทแฟชั่นทรงหลวมสไตล์โมเดิร์น แมตช์ลุคได้ทุกลุคอย่างสมบูรณ์แบบ</p>
        </div>

        <div style={styles.lookbookGrid}>
          <div style={styles.lookbookItem}>
            <img src="https://img.lazcdn.com/g/p/b8d60e51d32fa3496f9743e7050ab496.jpg_720x720q80.jpg" alt="lookbook 1" style={styles.lookbookImg} />
            <div style={styles.lookbookOverlay}>
              <span>LOOK 01 • OVERSIZED FIT</span>
            </div>
          </div>
          <div style={styles.lookbookItem}>
            <img src="https://tse1.mm.bing.net/th/id/OIP.lq9N_C5d99wdd2eEBL4JGgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="lookbook 2" style={styles.lookbookImg} />
            <div style={styles.lookbookOverlay}>
              <span>LOOK 02 • TACTICAL CARGO</span>
            </div>
          </div>
          <div style={styles.lookbookItem}>
            <img src="https://down-th.img.susercontent.com/file/sg-11134201-8258m-mfuw599al98r86" alt="lookbook 3" style={styles.lookbookImg} />
            <div style={styles.lookbookOverlay}>
              <span>LOOK 03 • DENIM FLIGHT</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Newsletter VIP Club Banner */}
      <GlassCard style={styles.newsletterCard}>
        <div style={styles.newsletterContent}>
          <div style={styles.newsletterIconBg}>
            <Mail size={24} color="var(--primary)" />
          </div>
          <div style={styles.newsletterTextGroup}>
            <h3 style={styles.newsletterTitle}>JOIN THE เสื้อเฮีย PRIVATE CLUB</h3>
            <p style={styles.newsletterDesc}>รับส่วนลด 10% สำหรับคำสั่งซื้อแรก พร้อมสิทธิ์สั่งซื้อสินค้าลิมิเต็ดล่วงหน้าก่อนใคร</p>
          </div>
        </div>

        <form onSubmit={handleSubscribe} style={styles.newsletterForm}>
          <input
            type="email"
            className="form-control"
            style={styles.newsletterInput}
            placeholder="ENTER YOUR EMAIL..."
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={styles.subscribeBtn}>
            SUBSCRIBE
          </button>
        </form>

        {newsletterSubscribed && (
          <div style={styles.subscribedNotice}>
            <Check size={16} /> ยินดีต้อนรับสู่ AURA CLUB! โค้ดส่วนลดถูกส่งไปยังอีเมลของคุณแล้ว
          </div>
        )}
      </GlassCard>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    width: '100%',
    textAlign: 'left',
  },
  heroBanner: {
    padding: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '340px',
    position: 'relative',
    overflow: 'hidden',
    flexWrap: 'wrap',
    gap: '30px',
  },
  heroContent: {
    flex: '1 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    zIndex: 2,
  },
  badgeWrap: {
    display: 'flex',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '900',
    lineHeight: '1.15',
    letterSpacing: '-1px',
  },
  gradientText: {
    color: 'var(--primary)',
    textShadow: '0 0 20px rgba(226, 194, 117, 0.2)',
  },
  heroDesc: {
    fontSize: '14px',
    maxWidth: '520px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
  },
  heroActions: {
    marginTop: '10px',
  },
  heroBtn: {
    padding: '14px 28px',
    fontSize: '13px',
  },
  heroVisual: {
    flex: '0 0 280px',
    height: '280px',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  brandValueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  brandValueItem: {
    background: 'rgba(17, 19, 25, 0.5)',
    border: '1px solid var(--glass-border)',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  brandValueTitle: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#fff',
    marginBottom: '2px',
  },
  brandValueDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  catalogSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  sectionTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '300px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-secondary)',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '40px',
    fontSize: '12px',
    letterSpacing: '0.8px',
  },
  categoryBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  catBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  catBtnActive: {
    background: 'rgba(226, 194, 117, 0.12)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
    boxShadow: '0 0 12px rgba(226, 194, 117, 0.15)',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  productCard: {
    padding: '0',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  imgWrap: {
    position: 'relative',
    height: '280px',
    width: '100%',
    overflow: 'hidden',
    borderBottom: '1px solid var(--glass-border)',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  discountBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'var(--primary)',
    color: '#000',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '1px',
  },
  productBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  catTag: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.3',
  },
  productDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '36px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '12px',
  },
  price: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--primary)',
  },
  originalPrice: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    marginLeft: '6px',
  },
  addBtn: {
    padding: '8px 12px',
    borderRadius: '8px',
  },
  lookbookCard: {
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  lookbookHeader: {
    textAlign: 'center',
  },
  lookbookSub: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
    color: 'var(--primary)',
  },
  lookbookTitle: {
    fontSize: '26px',
    fontWeight: '900',
    marginTop: '4px',
  },
  lookbookDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  lookbookGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  lookbookItem: {
    position: 'relative',
    height: '320px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--glass-border)',
  },
  lookbookImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  lookbookOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
    padding: '20px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  newsletterCard: {
    padding: '36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  newsletterContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '1 1 400px',
  },
  newsletterIconBg: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(226, 194, 117, 0.1)',
    border: '1px solid rgba(226, 194, 117, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsletterTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  newsletterTitle: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '1px',
  },
  newsletterDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  newsletterForm: {
    display: 'flex',
    gap: '10px',
    flex: '1 1 350px',
  },
  newsletterInput: {
    fontSize: '12px',
    letterSpacing: '1px',
  },
  subscribeBtn: {
    whiteSpace: 'nowrap',
    padding: '12px 24px',
  },
  subscribedNotice: {
    width: '100%',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
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
    animation: 'spin 1.5s linear infinite',
  },
  noProducts: {
    padding: '60px 0',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  }
};

export default Home;
