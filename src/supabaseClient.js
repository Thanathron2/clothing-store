import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid and not placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.startsWith('https://');

let supabase;
let isMock = false;

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize real Supabase client, falling back to mock mode.", error);
    isMock = true;
  }
} else {
  isMock = true;
}

if (isMock) {
  console.warn("⚠️ Supabase is not configured. Running in Mock Database Mode for AURA APPAREL.");

  // Seeding initial storage
  const getDB = () => {
    const data = localStorage.getItem('aurastore_mock_db');
    if (data) {
      return JSON.parse(data);
    }
    const initialData = {
      users: [
        { id: 'admin-id', email: 'admin@termgame.com', password: 'admin1234', role: 'admin' },
        { id: 'user-id', email: 'user@termgame.com', password: 'user1234', role: 'user' }
      ],
      profiles: [
        { id: 'admin-id', username: 'admin', display_name: 'AURA Store Manager', credit: 99999.00, role: 'admin', phone: '0812345678', address: '123 AURA Fashion Building, Sukhumvit Rd, Bangkok 10110', avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=admin' },
        { id: 'user-id', username: 'fashionista', display_name: 'Alex Rivera', credit: 2500.00, role: 'user', phone: '0898765432', address: '456 Cyber Tower, Pathum Wan, Bangkok 10330', avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=fashionista' }
      ],
      categories: [
        { id: 'cat-1', name: 'Tops & Tees', slug: 'tops', description: 'เสื้อยืดแฟชั่น Oversized ทรงสวย ผ้าเนื้อหนาพิเศษ 240GSM' },
        { id: 'cat-2', name: 'Hoodies & Outerwear', slug: 'outerwear', description: 'เสื้อฮู้ดและแจ็คเก็ตทรงปัง ดีไซน์สตรีทพรีเมียม' },
        { id: 'cat-3', name: 'Pants & Cargos', slug: 'pants', description: 'กางเกงคาร์โก้และกางเกงสตรีท ทรงสวยใส่สบาย' },
        { id: 'cat-4', name: 'Accessories', slug: 'accessories', description: 'หมวก กระเป๋า และเครื่องประดับแฟชั่นคอมพลีทลุค' }
      ],
      products: [
        {
          id: 'prod-1',
          category_id: 'cat-1',
          name: 'AURA Heavyweight Oversized Tee',
          price: 790.00,
          original_price: 1190.00,
          description: 'เสื้อยืดแขนสั้น Oversized ผลิตจากผ้า Cotton 100% เกรดพรีเมียม 260GSM นุ่มสบาย ระบายอากาศได้ดีเยี่ยม ทรงสวยอยู่ทรงตลอดวัน เหมาะกับทุกโอกาสสไตล์ Minimal Street',
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
          additional_images: [
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop'
          ],
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Cyber Black', 'Off White', 'Slate Gray'],
          stock: 45,
          is_featured: true
        },
        {
          id: 'prod-2',
          category_id: 'cat-2',
          name: 'Cyberpunk Neon Zip-Up Hoodie',
          price: 1890.00,
          original_price: 2490.00,
          description: 'เสื้อฮู้ดซิปหน้าทรงครอปพรีเมียม ผ้า Fleece เนื้อนุ่มกันหนาวได้ดี ตกแต่งสกรีนสะท้อนแสง 3M ปลายแขนกระชับ ใส่ได้ทั้งชายและหญิง',
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
          additional_images: [
            'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop'
          ],
          sizes: ['M', 'L', 'XL'],
          colors: ['Neon Violet', 'Obsidian Black'],
          stock: 30,
          is_featured: true
        },
        {
          id: 'prod-3',
          category_id: 'cat-3',
          name: 'Tactical Multi-Pocket Cargo Pants',
          price: 1490.00,
          original_price: 1990.00,
          description: 'กางเกงคาร์โก้ทรงดีไซเนอร์ กระเป๋าอเนกประสงค์ 6 ช่อง สายปรับกระชับข้อเท้า เนื้อผ้าทรงทนทาน ใส่ลุยได้ทุกสถานการณ์',
          image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
          additional_images: [
            'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop'
          ],
          sizes: ['S (28-30)', 'M (31-33)', 'L (34-36)'],
          colors: ['Army Khaki', 'Stealth Black'],
          stock: 25,
          is_featured: true
        },
        {
          id: 'prod-4',
          category_id: 'cat-2',
          name: 'Vintage Denim Flight Jacket',
          price: 2290.00,
          original_price: 2990.00,
          description: 'แจ็คเก็ตยีนส์ฟอกทรงวินเทจ ตัดเย็บอย่างปราณีต ซับในลื่นใส่สบาย ดีไซน์ Unisex เข้ากับทุกชุดเพิ่มลุคเท่โดดเด่น',
          image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
          additional_images: [],
          sizes: ['M', 'L', 'XL'],
          colors: ['Washed Blue', 'Raw Indigo'],
          stock: 20,
          is_featured: false
        },
        {
          id: 'prod-5',
          category_id: 'cat-4',
          name: 'AURA Glassmorphism Street Cap',
          price: 590.00,
          original_price: 890.00,
          description: 'หมวกเบสบอลปักโลโก้ AURA 3D ปรับขนาดด้านหลังได้ ป้องกันรังสียูวี ทรงสวยกระชับศรีษะ',
          image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
          additional_images: [],
          sizes: ['Free Size'],
          colors: ['Black', 'Beige'],
          stock: 50,
          is_featured: true
        },
        {
          id: 'prod-6',
          category_id: 'cat-1',
          name: 'Minimalist Boxy Graphic Tee',
          price: 890.00,
          original_price: 1290.00,
          description: 'เสื้อยืดลายกราฟิกแนวสตรีท สกรีนลายความละเอียดสูง ซักไม่ลอก ทรง Boxy Fit ทันสมัย',
          image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
          additional_images: [],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Washed Black', 'Sand Cream'],
          stock: 35,
          is_featured: false
        }
      ],
      orders: [
        {
          id: 'ord-1001',
          user_id: 'user-id',
          total_amount: 2280.00,
          shipping_name: 'Alex Rivera',
          shipping_phone: '0898765432',
          shipping_address: '456 Cyber Tower, Pathum Wan, Bangkok 10330',
          payment_method: 'promptpay',
          payment_details: { slip_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300&auto=format&fit=crop' },
          status: 'shipped',
          tracking_number: 'TH882947102EX',
          admin_notes: 'จัดส่งพัสดุผ่าน Kerry Express เรียบร้อยแล้ว',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ],
      order_items: [
        {
          id: 'item-1',
          order_id: 'ord-1001',
          product_id: 'prod-1',
          product_name: 'AURA Heavyweight Oversized Tee',
          product_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
          price: 790.00,
          quantity: 1,
          size: 'L',
          color: 'Cyber Black'
        },
        {
          id: 'item-2',
          order_id: 'ord-1001',
          product_id: 'prod-3',
          product_name: 'Tactical Multi-Pocket Cargo Pants',
          product_image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
          price: 1490.00,
          quantity: 1,
          size: 'M (31-33)',
          color: 'Stealth Black'
        }
      ]
    };
    localStorage.setItem('aurastore_mock_db', JSON.stringify(initialData));
    return initialData;
  };

  const saveDB = (db) => {
    localStorage.setItem('aurastore_mock_db', JSON.stringify(db));
  };

  // Auth helper
  const getSession = () => {
    const session = localStorage.getItem('aurastore_mock_session');
    return session ? JSON.parse(session) : null;
  };

  const saveSession = (session) => {
    if (session) {
      localStorage.setItem('aurastore_mock_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('aurastore_mock_session');
    }
  };

  const authListeners = new Set();

  const triggerAuthChange = (event, session) => {
    authListeners.forEach(listener => listener(event, session));
  };

  // Create Mock Supabase Client
  supabase = {
    auth: {
      signUp: async ({ email, password, options }) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const db = getDB();
        if (db.users.find(u => u.email === email)) {
          return { data: { user: null }, error: { message: 'อีเมลนี้ถูกใช้งานแล้ว' } };
        }
        const userId = 'user-' + Math.random().toString(36).substr(2, 9);
        const newUser = { id: userId, email, password, role: 'user' };
        db.users.push(newUser);

        const username = options?.data?.username || email.split('@')[0];
        const display_name = options?.data?.display_name || username;
        const avatar_url = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`;
        
        const newProfile = {
          id: userId,
          username,
          display_name,
          credit: 0.00,
          role: 'user',
          avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.profiles.push(newProfile);
        saveDB(db);

        const session = {
          access_token: 'mock-token-' + userId,
          user: { id: userId, email, user_metadata: { username, display_name, role: 'user', avatar_url } }
        };
        saveSession(session);
        triggerAuthChange('SIGNED_IN', session);

        return { data: { user: session.user, session }, error: null };
      },

      signInWithPassword: async ({ email, password }) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const db = getDB();
        const user = db.users.find(u => u.email === email && u.password === password);
        if (!user) {
          return { data: { user: null }, error: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } };
        }
        const profile = db.profiles.find(p => p.id === user.id);
        const session = {
          access_token: 'mock-token-' + user.id,
          user: { 
            id: user.id, 
            email, 
            user_metadata: { 
              username: profile?.username || user.email.split('@')[0], 
              display_name: profile?.display_name || profile?.username, 
              role: profile?.role || 'user',
              avatar_url: profile?.avatar_url
            } 
          }
        };
        saveSession(session);
        triggerAuthChange('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      },

      signOut: async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        saveSession(null);
        triggerAuthChange('SIGNED_OUT', null);
        return { error: null };
      },

      getSession: async () => {
        return { data: { session: getSession() }, error: null };
      },

      getUser: async () => {
        const session = getSession();
        return { data: { user: session ? session.user : null }, error: null };
      },

      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        const session = getSession();
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              }
            }
          }
        };
      }
    },

    // Database Queries Mock
    from: (table) => {
      const db = getDB();
      let queryResult = [...(db[table] || [])];
      let filters = [];
      let orderBy = null;
      let orderAsc = true;
      let isSingle = false;

      const builder = {
        select: (fields) => {
          return builder;
        },
        eq: (column, value) => {
          filters.push({ column, value });
          return builder;
        },
        order: (column, { ascending = true } = {}) => {
          orderBy = column;
          orderAsc = ascending;
          return builder;
        },
        single: () => {
          isSingle = true;
          return builder;
        },
        insert: async (data) => {
          await new Promise(resolve => setTimeout(resolve, 300));
          const rows = Array.isArray(data) ? data : [data];
          const newRows = rows.map(r => {
            return {
              id: r.id || 'gen-' + Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...r
            };
          });

          db[table] = [...(db[table] || []), ...newRows];
          saveDB(db);

          return { data: isSingle ? newRows[0] : newRows, error: null };
        },
        update: async (data) => {
          await new Promise(resolve => setTimeout(resolve, 300));
          db[table] = db[table].map(row => {
            const match = filters.every(f => row[f.column] === f.value);
            if (match) {
              return { ...row, ...data, updated_at: new Date().toISOString() };
            }
            return row;
          });
          saveDB(db);

          const updatedDB = getDB();
          const updatedRows = updatedDB[table].filter(row => filters.every(f => row[f.column] === f.value));

          return { data: isSingle ? updatedRows[0] : updatedRows, error: null };
        },
        delete: async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          const beforeCount = db[table].length;
          db[table] = db[table].filter(row => !filters.every(f => row[f.column] === f.value));
          saveDB(db);
          return { data: { count: beforeCount - db[table].length }, error: null };
        },
        then: async (onfulfilled) => {
          let data = [...queryResult];
          
          filters.forEach(f => {
            data = data.filter(row => row[f.column] === f.value);
          });

          // Join simulation for relational tables
          if (table === 'orders') {
            const profiles = db.profiles;
            const items = db.order_items;
            data = data.map(ord => {
              const profile = profiles.find(p => p.id === ord.user_id);
              const orderItems = items.filter(i => i.order_id === ord.id);
              return {
                ...ord,
                profiles: profile || null,
                order_items: orderItems
              };
            });
          } else if (table === 'products') {
            const categories = db.categories;
            data = data.map(p => {
              const cat = categories.find(c => c.id === p.category_id);
              return {
                ...p,
                categories: cat || null
              };
            });
          }

          if (orderBy) {
            data.sort((a, b) => {
              const valA = a[orderBy];
              const valB = b[orderBy];
              if (valA < valB) return orderAsc ? -1 : 1;
              if (valA > valB) return orderAsc ? 1 : -1;
              return 0;
            });
          }

          const result = {
            data: isSingle ? (data[0] || null) : data,
            error: null
          };

          return onfulfilled(result);
        }
      };

      return builder;
    }
  };
}

export { supabase, isMock };
