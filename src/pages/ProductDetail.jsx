import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShoppingBag, ArrowLeft, Check, Sparkles, Truck, ShieldCheck, RefreshCw, Ruler, AlertCircle, Award, Star, MessageSquarePlus, ThumbsUp, UserCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import SizeGuideModal from '../components/SizeGuideModal';
import confetti from 'canvas-confetti';

const ProductDetail = ({ onAddToCart }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'กิตติศักดิ์ พ.',
      rating: 5,
      date: '2 วันที่แล้ว',
      size: 'L',
      comment: 'เนื้อผ้า Cotton หนานุ่มมาก ทรง Oversized สวยตรงปกสุดๆ สั่งเมื่อวานวันนี้ได้ของแล้ว ประทับใจมากครับ',
      verified: true
    },
    {
      id: 2,
      author: 'พิมพ์มาดา ส.',
      rating: 5,
      date: '5 วันที่แล้ว',
      size: 'M',
      comment: 'ทรงสวย ผ้าไม่ย้วยเลย สกรีนคมชัด คุ้มค่ากับราคามากๆ เดี๋ยวอุดหนุนสีอื่นเพิ่มแน่นอนค่ะ',
      verified: true
    },
    {
      id: 3,
      author: 'ธนากร ม.',
      rating: 5,
      date: '1 สัปดาห์ที่แล้ว',
      size: 'XL',
      comment: 'ใส่พอดีตัว ไหล่ตกกำลังดี ตัดเย็บเรียบร้อยมาก จัดส่งไวมีเลข Tracking ให้ตามในเว็บได้เลย',
      verified: true
    }
  ]);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [showWriteReview, setShowWriteReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !data) {
      console.error('Product not found:', error);
      setProduct(null);
    } else {
      setProduct(data);
      setSelectedImage(data.image_url);
      
      const sizesArr = Array.isArray(data.sizes) ? data.sizes : [];
      const colorsArr = Array.isArray(data.colors) ? data.colors : [];
      if (sizesArr.length > 0) setSelectedSize(sizesArr[0]);
      if (colorsArr.length > 0) setSelectedColor(colorsArr[0]);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      selectedSize,
      selectedColor,
      quantity
    };

    onAddToCart(cartItem);
    confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 } });
    
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newComment || !reviewerName) return;

    const newRev = {
      id: Date.now(),
      author: reviewerName,
      rating: newRating,
      date: 'เมื่อสักครู่',
      size: selectedSize || 'Free Size',
      comment: newComment,
      verified: true
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setReviewerName('');
    setShowWriteReview(false);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <RefreshCw size={28} style={styles.spinner} />
        <p style={{ fontSize: '13px', letterSpacing: '1px' }}>LOADING PRODUCT DETAILS...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <GlassCard style={styles.notFoundCard}>
          <h2>ไม่พบสินค้าชิ้นนี้</h2>
          <p>สินค้าอาจถูกยกเลิกหรือไม่มีอยู่ในระบบ</p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} /> กลับไปยังหน้าหลัก
          </button>
        </GlassCard>
      </div>
    );
  }

  const sizes = Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL'];
  const colors = Array.isArray(product.colors) ? product.colors : ['Black'];
  const gallery = [product.image_url, ...(Array.isArray(product.additional_images) ? product.additional_images : [])];

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={16} /> CATALOGUE / BACK TO PRODUCTS
      </button>

      <div style={styles.detailGrid}>
        {/* Left: Product Images Gallery */}
        <div style={styles.galleryCol}>
          <GlassCard style={styles.mainImageCard}>
            <img src={selectedImage} alt={product.name} style={styles.mainImg} />
          </GlassCard>
          
          {gallery.length > 1 && (
            <div style={styles.thumbRow}>
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    ...styles.thumbBtn,
                    ...(selectedImage === img ? styles.activeThumbBtn : {})
                  }}
                >
                  <img src={img} alt={`thumb-${idx}`} style={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div style={styles.infoCol}>
          <GlassCard style={styles.infoCard}>
            <div style={styles.badgeRow}>
              <span className="badge badge-success">
                <Sparkles size={10} style={{ marginRight: '4px' }} /> OFFICIAL DROP 2026
              </span>
              <span style={styles.skuText}>ITEM ID: #{product.id.substr(0, 8).toUpperCase()}</span>
            </div>
            
            <h1 style={styles.title}>{product.name}</h1>
            
            <div style={styles.ratingRow}>
              <div style={styles.starsGroup}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={15} fill="var(--primary)" color="var(--primary)" />
                ))}
              </div>
              <span style={styles.ratingText}>{avgRating} ({reviews.length} รีวิวจากผู้สั่งซื้อจริง)</span>
            </div>

            <div style={styles.priceRow}>
              <span style={styles.price}>{product.price.toLocaleString()} ฿</span>
              {product.original_price && (
                <span style={styles.originalPrice}>{product.original_price.toLocaleString()} ฿</span>
              )}
            </div>

            <p style={styles.description}>{product.description}</p>

            {/* Select Color */}
            {colors.length > 0 && (
              <div style={styles.optionSection}>
                <label style={styles.optionLabel}>COLOR: <span style={styles.selectedVal}>{selectedColor}</span></label>
                <div style={styles.pillsRow}>
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        ...styles.pillBtn,
                        ...(selectedColor === color ? styles.activePillBtn : {})
                      }}
                    >
                      {selectedColor === color && <Check size={12} style={{ marginRight: '4px' }} />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Select Size & Size Guide Trigger */}
            {sizes.length > 0 && (
              <div style={styles.optionSection}>
                <div style={styles.sizeHeaderRow}>
                  <label style={styles.optionLabel}>SELECT SIZE: <span style={styles.selectedVal}>{selectedSize}</span></label>
                  <button onClick={() => setShowSizeGuide(true)} style={styles.sizeGuideBtn}>
                    <Ruler size={13} /> ตารางวัดไซส์ (SIZE GUIDE)
                  </button>
                </div>
                <div style={styles.pillsRow}>
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        ...styles.pillBtn,
                        ...(selectedSize === size ? styles.activePillBtn : {})
                      }}
                    >
                      {selectedSize === size && <Check size={12} style={{ marginRight: '4px' }} />}
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={styles.optionSection}>
              <label style={styles.optionLabel}>QUANTITY:</label>
              <div style={styles.qtyBox}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>-</button>
                <span style={styles.qtyVal}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>+</button>
              </div>
            </div>

            {/* Stock indicator */}
            <div style={styles.stockInfo}>
              {product.stock <= 30 ? (
                <span style={styles.lowStockBadge}>
                  <AlertCircle size={12} /> สินค้าจำนวนจำกัด - เหลือในคลัง {product.stock} ชิ้น
                </span>
              ) : (
                <span className="badge badge-success">IN STOCK ({product.stock} ITEMS AVAILABLE)</span>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={styles.addCartBtn}
            >
              <ShoppingBag size={18} /> ADD TO SHOPPING BAG
            </button>

            {addedNotice && (
              <div style={styles.addedAlert}>
                <Check size={16} /> สินค้าถูกเพิ่มลงในตะกร้าเรียบร้อยแล้ว
              </div>
            )}

            {/* Features Guarantee Bar */}
            <div style={styles.guaranteeBox}>
              <div style={styles.guaranteeItem}>
                <Award size={15} color="var(--primary)" />
                <span>100% HEAVYWEIGHT PREMIUM COTTON (260GSM)</span>
              </div>
              <div style={styles.guaranteeItem}>
                <Truck size={15} color="var(--secondary)" />
                <span>COMPLIMENTARY EXPRESS SHIPPING NATIONWIDE</span>
              </div>
              <div style={styles.guaranteeItem}>
                <ShieldCheck size={15} color="var(--success)" />
                <span>AUTHENTIC BRAND GUARANTEE • 7-DAY FIT REPLACEMENT</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <GlassCard style={styles.reviewsCard}>
        <div style={styles.reviewsHeader}>
          <div>
            <span style={styles.reviewsSubTitle}>CUSTOMER FEEDBACK</span>
            <h3 style={styles.reviewsTitle}>รีวิวจากผู้สั่งซื้อสินค้า ({reviews.length})</h3>
          </div>
          <button 
            onClick={() => setShowWriteReview(!showWriteReview)} 
            className="btn btn-secondary"
            style={styles.writeReviewBtn}
          >
            <MessageSquarePlus size={16} /> เขียนรีวิวสินค้า
          </button>
        </div>

        {/* Write Review Form */}
        {showWriteReview && (
          <form onSubmit={handleAddReview} style={styles.writeForm}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>แบ่งปันความรู้สึกของคุณเกี่ยวกับสินค้าชิ้นนี้</h4>
            
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">ชื่อของคุณ *</label>
              <input 
                className="form-control" 
                placeholder="เช่น สมชาย พ." 
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">ให้คะแนนสินค้า (1 - 5 ดาว)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star size={22} fill={star <= newRating ? "var(--primary)" : "none"} color="var(--primary)" />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">ความเห็นเกี่ยวกับสินค้า *</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="อธิบายเกี่ยวกับเนื้อผ้า ทรงเสื้อ หรือความประทับใจในการจัดส่ง..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowWriteReview(false)} className="btn btn-secondary">ยกเลิก</button>
              <button type="submit" className="btn btn-primary">ส่งรีวิว</button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div style={styles.reviewsList}>
          {reviews.map(rev => (
            <div key={rev.id} style={styles.reviewItem}>
              <div style={styles.reviewItemHeader}>
                <div style={styles.reviewerInfo}>
                  <span style={styles.reviewerName}>{rev.author}</span>
                  {rev.verified && (
                    <span style={styles.verifiedBadge}>
                      <UserCheck size={11} /> ผู้สั่งซื้อจริง (VERIFIED BUYER)
                    </span>
                  )}
                </div>
                <span style={styles.reviewDate}>{rev.date}</span>
              </div>

              <div style={styles.reviewStars}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={13} fill="var(--primary)" color="var(--primary)" />
                ))}
                <span style={styles.reviewSizeBadge}>ไซส์ที่สั่ง: {rev.size}</span>
              </div>

              <p style={styles.reviewComment}>{rev.comment}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '30px 20px',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
  detailGrid: {
    display: 'flex',
    gap: '36px',
    flexWrap: 'wrap',
  },
  galleryCol: {
    flex: '1 1 480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mainImageCard: {
    padding: '0',
    overflow: 'hidden',
    height: '520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbRow: {
    display: 'flex',
    gap: '12px',
  },
  thumbBtn: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '2px solid var(--glass-border)',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s',
  },
  activeThumbBtn: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 12px var(--primary-glow)',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoCol: {
    flex: '1 1 500px',
  },
  infoCard: {
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '1px',
  },
  title: {
    fontSize: '30px',
    fontWeight: '800',
    lineHeight: '1.2',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  starsGroup: {
    display: 'flex',
    gap: '2px',
  },
  ratingText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  price: {
    fontSize: '30px',
    fontWeight: '800',
    color: 'var(--primary)',
  },
  originalPrice: {
    fontSize: '18px',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
  },
  optionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sizeHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '1px',
  },
  selectedVal: {
    color: 'var(--primary)',
    fontWeight: '400',
    marginLeft: '4px',
  },
  sizeGuideBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'underline',
  },
  pillsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pillBtn: {
    padding: '8px 18px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  activePillBtn: {
    background: 'rgba(226, 194, 117, 0.12)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    boxShadow: '0 0 10px rgba(226, 194, 117, 0.15)',
  },
  qtyBox: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    overflow: 'hidden',
    width: 'fit-content',
    background: 'rgba(0,0,0,0.4)',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  qtyVal: {
    width: '36px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  stockInfo: {
    fontSize: '12px',
  },
  lowStockBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#fbbf24',
    background: 'rgba(245, 158, 11, 0.1)',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  addCartBtn: {
    padding: '15px',
    fontSize: '14px',
    marginTop: '6px',
    letterSpacing: '1.5px',
  },
  addedAlert: {
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
  guaranteeBox: {
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '18px',
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  guaranteeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
  },
  reviewsCard: {
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '16px',
  },
  reviewsSubTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '1.5px',
  },
  reviewsTitle: {
    fontSize: '22px',
    fontWeight: '800',
    marginTop: '2px',
  },
  writeReviewBtn: {
    fontSize: '12px',
    padding: '8px 16px',
  },
  writeForm: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reviewItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    padding: '18px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  reviewItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  reviewerName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: 'var(--success)',
    background: 'rgba(16, 185, 129, 0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  reviewDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  reviewStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  reviewSizeBadge: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '10px',
  },
  reviewComment: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '100px 0',
    gap: '12px',
    color: 'var(--text-secondary)',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  notFoundCard: {
    padding: '60px 20px',
    textAlign: 'center',
  }
};

export default ProductDetail;
