import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { Pool } from "pg";
import bcryptjs from "bcryptjs";
import type { Product } from "@/data/products";

const databaseUrl = process.env.DATABASE_URL || "";
const usesPostgres = Boolean(databaseUrl);
const dataDir = usesPostgres ? "/tmp/admire-boutique" : process.env.VERCEL ? "/tmp/admire-boutique" : path.join(process.cwd(), "data");

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch {
  // Serverless platforms like Vercel may not allow writes in the app directory.
  // In that case, SQLite fallback is skipped by the `usesPostgres` guard on production deployments.
}

const sqlitePath = path.join(dataDir, "admire_boutique.db");

const sqliteDb = usesPostgres ? (null as unknown as Database.Database) : new Database(sqlitePath);
const postgresPool = usesPostgres ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}) : null;

let postgresReady = false;

// Graceful pool shutdown handler
if (postgresPool) {
  const gracefulShutdown = async () => {
    try {
      await postgresPool.end();
    } catch (err) {
      console.error("Error closing PostgreSQL pool:", err);
    }
  };
  
  process.on("exit", () => gracefulShutdown());
  process.on("SIGINT", () => gracefulShutdown());
  process.on("SIGTERM", () => gracefulShutdown());
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

function parseJsonArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: unknown): Record<string, any> {
  if (value && typeof value === "object") return value as Record<string, any>;
  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeProductRow(row: Record<string, any>): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    originalPrice: Number(row.originalPrice),
    discount: Number(row.discount),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    stock: Number(row.stock),
    badge: row.badge ?? undefined,
    fabric: row.fabric,
    description: row.description,
    images: parseJsonArray(row.images),
    colors: parseJsonArray(row.colors),
    sizes: parseJsonArray(row.sizes),
  };
}

const seedProducts = [
  {
    id: "prod-1",
    slug: "saffron-silk-kurti",
    name: "Saffron Silk Kurti",
    category: "Festive Kurtis",
    price: 1899,
    originalPrice: 2599,
    discount: 27,
    rating: 4.8,
    reviews: 214,
    stock: 18,
    badge: "Bestseller",
    fabric: "Pure silk blend",
    description:
      "A softly draped festive kurti with a refined sheen and elegant neckline, made for celebrations and evening transitions.",
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    colors: [
      { name: "Saffron", hex: "#c96b2d" },
      { name: "Ivory", hex: "#f3eadb" },
      { name: "Deep Maroon", hex: "#5e1a1b" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "prod-2",
    slug: "ivory-cotton-straight-kurti",
    name: "Ivory Cotton Straight Kurti",
    category: "Cotton Kurtis",
    price: 1299,
    originalPrice: 1699,
    discount: 24,
    rating: 4.7,
    reviews: 182,
    stock: 26,
    badge: "New",
    fabric: "Premium cotton",
    description:
      "Minimal, breathable and tailored for all-day comfort. A classic straight silhouette that keeps your wardrobe refined and versatile.",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    colors: [
      { name: "Ivory", hex: "#f7efe5" },
      { name: "Peach", hex: "#d78d6d" },
      { name: "Brown", hex: "#5d4037" },
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "prod-3",
    slug: "terracotta-printed-a-line-kurti",
    name: "Terracotta Printed A-line Kurti",
    category: "Printed Kurtis",
    price: 1499,
    originalPrice: 2099,
    discount: 29,
    rating: 4.9,
    reviews: 286,
    stock: 15,
    badge: "Bestseller",
    fabric: "Cotton rayon",
    description:
      "Flattering A-line cut with a modern print story and airy fit, ideal for both day errands and relaxed festive evenings.",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    colors: [
      { name: "Terracotta", hex: "#b75b42" },
      { name: "Rust", hex: "#8d4a3a" },
      { name: "Blush", hex: "#d8a88d" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "prod-4",
    slug: "deep-maroon-floral-anarkali",
    name: "Deep Maroon Floral Anarkali",
    category: "Anarkali Kurtis",
    price: 2199,
    originalPrice: 2999,
    discount: 27,
    rating: 4.8,
    reviews: 141,
    stock: 12,
    badge: "Featured",
    fabric: "Georgette with satin lining",
    description:
      "An elegant flared silhouette with a contemporary floral palette, designed to feel festive without being ostentatious.",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    ],
    colors: [
      { name: "Maroon", hex: "#4d1d21" },
      { name: "Rose", hex: "#c47473" },
      { name: "Gold", hex: "#b68a3f" },
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "prod-5",
    slug: "charcoal-office-cotton-kurti",
    name: "Charcoal Office Cotton Kurti",
    category: "Office Wear",
    price: 1599,
    originalPrice: 2299,
    discount: 30,
    rating: 4.6,
    reviews: 95,
    stock: 20,
    badge: "Office edit",
    fabric: "Cotton twill",
    description:
      "Built for polished mornings and effortless transitions, this sharp kurti balances comfort and professionalism.",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    colors: [
      { name: "Charcoal", hex: "#2a2c2f" },
      { name: "Taupe", hex: "#b29a86" },
      { name: "Mushroom", hex: "#d6c8be" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

const seedFaqs = [
  {
    id: "faq-1",
    question: "How long does delivery take?",
    answer: "Most orders within India are delivered in 4–7 business days. Metro cities may receive faster delivery depending on courier performance and order value.",
    category: "Shipping",
  },
  {
    id: "faq-2",
    question: "Do you offer returns or exchanges?",
    answer: "Yes. We offer easy returns and exchanges on eligible items within 7 days of delivery, provided the product is unused and in original packaging.",
    category: "Returns",
  },
  {
    id: "faq-3",
    question: "What is your sizing guide?",
    answer: "Our kurtis are designed to fit true to size. For best results, please check the size chart on each product page and compare against your usual measurements.",
    category: "Sizing",
  },
  {
    id: "faq-4",
    question: "Do you accept COD?",
    answer: "Cash on Delivery is available on eligible orders in select locations. The COD option appears automatically during checkout when your address qualifies.",
    category: "Payment",
  },
  {
    id: "faq-5",
    question: "How do I track my order?",
    answer: "Once your order is shipped, we share the tracking ID and courier partner details in your account under Order History and via email/SMS.",
    category: "Tracking",
  },
];

const seedCustomer = {
  id: "cust-1",
  name: "Ansh Agarwal",
  email: "customer@admireboutique.in",
  phone: "+91 98765 43210",
  password: "Admire@123",
};

const seedAddresses = [
  {
    id: "addr-1",
    customer_id: "cust-1",
    label: "Home",
    full_name: "Ansh Agarwal",
    phone: "+91 98765 43210",
    line1: "12, Saffron Residency",
    line2: "Near MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    country: "India",
    is_default: 1,
  },
  {
    id: "addr-2",
    customer_id: "cust-1",
    label: "Office",
    full_name: "Ansh Agarwal",
    phone: "+91 98765 43210",
    line1: "8th Floor, Worklab Avenue",
    line2: "Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560095",
    country: "India",
    is_default: 0,
  },
];

const seedOrders = [
  {
    id: "ord-1001",
    customer_id: "cust-1",
    order_number: "AB-1001",
    status: "Delivered",
    sub_total: 1899,
    shipping: 0,
    discount: 500,
    total: 1399,
    payment_status: "Paid",
    payment_method: "Razorpay",
    delivery_partner: "BlueDart",
    tracking_id: "BD123456789",
    estimated_delivery: "Delivered on 12 Aug 2026",
    items_json: JSON.stringify([{ name: "Saffron Silk Kurti", size: "M", qty: 1, price: 1899 }]),
  },
  {
    id: "ord-1002",
    customer_id: "cust-1",
    order_number: "AB-1002",
    status: "In Transit",
    sub_total: 2199,
    shipping: 0,
    discount: 300,
    total: 1899,
    payment_status: "Paid",
    payment_method: "UPI",
    delivery_partner: "Delhivery",
    tracking_id: "DL789012345",
    estimated_delivery: "Arrives by 20 Aug 2026",
    items_json: JSON.stringify([{ name: "Deep Maroon Floral Anarkali", size: "L", qty: 1, price: 2199 }]),
  },
];

if (!usesPostgres) {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL NOT NULL,
      discount INTEGER NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      badge TEXT,
      fabric TEXT NOT NULL,
      description TEXT NOT NULL,
      images TEXT NOT NULL,
      colors TEXT NOT NULL,
      sizes TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      label TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      sub_total REAL NOT NULL,
      shipping REAL NOT NULL,
      discount REAL NOT NULL,
      total REAL NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      delivery_partner TEXT,
      tracking_id TEXT,
      estimated_delivery TEXT,
      items_json TEXT NOT NULL,
      address_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS faq_items (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      subscribed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TEXT,
      status TEXT DEFAULT 'active'
    );
  `);

  const productsCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productsCount.count === 0) {
    const insertProduct = sqliteDb.prepare(`
      INSERT INTO products (
        id, slug, name, category, price, originalPrice, discount, rating, reviews, stock, badge, fabric, description, images, colors, sizes
      ) VALUES (
        @id, @slug, @name, @category, @price, @originalPrice, @discount, @rating, @reviews, @stock, @badge, @fabric, @description, @images, @colors, @sizes
      )
    `);

    const transaction = sqliteDb.transaction(() => {
      for (const product of seedProducts) {
        insertProduct.run({
          ...product,
          images: JSON.stringify(product.images),
          colors: JSON.stringify(product.colors),
          sizes: JSON.stringify(product.sizes),
        });
      }
    });

    transaction();
  }

  const adminCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM admin_users").get() as { count: number };
  if (adminCount.count === 0) {
    sqliteDb.prepare(`
      INSERT INTO admin_users (id, name, email, password_hash) VALUES (?, ?, ?, ?)
    `).run("admin-owner-1", "Boutique Owner", "owner@admireboutique.in", bcryptjs.hashSync("admire123", 12));
  }

  const customerCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM customers").get() as { count: number };
  if (customerCount.count === 0) {
    sqliteDb.prepare(`
      INSERT INTO customers (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)
    `).run(seedCustomer.id, seedCustomer.name, seedCustomer.email, seedCustomer.phone, bcryptjs.hashSync(seedCustomer.password, 12));
  }

  const addressCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM addresses").get() as { count: number };
  if (addressCount.count === 0) {
    const insertAddress = sqliteDb.prepare(`
      INSERT INTO addresses (id, customer_id, label, full_name, phone, line1, line2, city, state, pincode, country, is_default)
      VALUES (@id, @customer_id, @label, @full_name, @phone, @line1, @line2, @city, @state, @pincode, @country, @is_default)
    `);

    for (const address of seedAddresses) {
      insertAddress.run(address);
    }
  }

  const orderCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
  if (orderCount.count === 0) {
    const insertOrder = sqliteDb.prepare(`
      INSERT INTO orders (
        id, customer_id, order_number, status, sub_total, shipping, discount, total, payment_status, payment_method, delivery_partner,
        tracking_id, estimated_delivery, items_json
      ) VALUES (
        @id, @customer_id, @order_number, @status, @sub_total, @shipping, @discount, @total, @payment_status, @payment_method,
        @delivery_partner, @tracking_id, @estimated_delivery, @items_json
      )
    `);

    for (const order of seedOrders) {
      insertOrder.run(order);
    }
  }

  const faqCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM faq_items").get() as { count: number };
  if (faqCount.count === 0) {
    const insertFaq = sqliteDb.prepare(`
      INSERT INTO faq_items (id, question, answer, category) VALUES (@id, @question, @answer, @category)
    `);

    for (const faq of seedFaqs) {
      insertFaq.run(faq);
    }
  }
}

async function ensurePostgresReady() {
  if (!postgresPool || postgresReady) return;

  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      "originalPrice" DOUBLE PRECISION NOT NULL,
      discount INTEGER NOT NULL,
      rating DOUBLE PRECISION NOT NULL,
      reviews INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      badge TEXT,
      fabric TEXT NOT NULL,
      description TEXT NOT NULL,
      images TEXT NOT NULL,
      colors TEXT NOT NULL,
      sizes TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      label TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      sub_total DOUBLE PRECISION NOT NULL,
      shipping DOUBLE PRECISION NOT NULL,
      discount DOUBLE PRECISION NOT NULL,
      total DOUBLE PRECISION NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      delivery_partner TEXT,
      tracking_id TEXT,
      estimated_delivery TEXT,
      items_json TEXT NOT NULL,
      address_json TEXT DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS faq_items (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ,
      status TEXT DEFAULT 'active'
    );
  `);

  const productCount = await postgresPool.query("SELECT COUNT(*) as count FROM products");
  if (Number(productCount.rows[0]?.count ?? 0) === 0) {
    for (const product of seedProducts) {
      await postgresPool.query(
        `INSERT INTO products (id, slug, name, category, price, "originalPrice", discount, rating, reviews, stock, badge, fabric, description, images, colors, sizes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          product.id,
          product.slug,
          product.name,
          product.category,
          product.price,
          product.originalPrice,
          product.discount,
          product.rating,
          product.reviews,
          product.stock,
          product.badge ?? null,
          product.fabric,
          product.description,
          JSON.stringify(product.images),
          JSON.stringify(product.colors),
          JSON.stringify(product.sizes),
        ]
      );
    }
  }

  const adminCount = await postgresPool.query("SELECT COUNT(*) as count FROM admin_users");
  if (Number(adminCount.rows[0]?.count ?? 0) === 0) {
    await postgresPool.query(
      "INSERT INTO admin_users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)",
      ["admin-owner-1", "Boutique Owner", "owner@admireboutique.in", await hashPassword("admire123")]
    );
  }

  const customerCount = await postgresPool.query("SELECT COUNT(*) as count FROM customers");
  if (Number(customerCount.rows[0]?.count ?? 0) === 0) {
    await postgresPool.query(
      "INSERT INTO customers (id, name, email, phone, password_hash) VALUES ($1, $2, $3, $4, $5)",
      [seedCustomer.id, seedCustomer.name, seedCustomer.email, seedCustomer.phone, await hashPassword(seedCustomer.password)]
    );
  }

  const addressCount = await postgresPool.query("SELECT COUNT(*) as count FROM addresses");
  if (Number(addressCount.rows[0]?.count ?? 0) === 0) {
    for (const address of seedAddresses) {
      await postgresPool.query(
        `INSERT INTO addresses (id, customer_id, label, full_name, phone, line1, line2, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          address.id,
          address.customer_id,
          address.label,
          address.full_name,
          address.phone,
          address.line1,
          address.line2,
          address.city,
          address.state,
          address.pincode,
          address.country,
          address.is_default,
        ]
      );
    }
  }

  const orderCount = await postgresPool.query("SELECT COUNT(*) as count FROM orders");
  if (Number(orderCount.rows[0]?.count ?? 0) === 0) {
    for (const order of seedOrders) {
      await postgresPool.query(
        `INSERT INTO orders (id, customer_id, order_number, status, sub_total, shipping, discount, total, payment_status, payment_method, delivery_partner, tracking_id, estimated_delivery, items_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          order.id,
          order.customer_id,
          order.order_number,
          order.status,
          order.sub_total,
          order.shipping,
          order.discount,
          order.total,
          order.payment_status,
          order.payment_method,
          order.delivery_partner,
          order.tracking_id,
          order.estimated_delivery,
          order.items_json,
        ]
      );
    }
  }

  const faqCount = await postgresPool.query("SELECT COUNT(*) as count FROM faq_items");
  if (Number(faqCount.rows[0]?.count ?? 0) === 0) {
    for (const faq of seedFaqs) {
      await postgresPool.query(
        "INSERT INTO faq_items (id, question, answer, category) VALUES ($1, $2, $3, $4)",
        [faq.id, faq.question, faq.answer, faq.category]
      );
    }
  }

  postgresReady = true;
}

export function getDb() {
  if (sqliteDb) return sqliteDb;
  return {
    prepare: () => ({
      all: () => [],
      get: () => undefined,
      run: () => ({ changes: 0 }),
    }),
  };
}

export async function listProducts(): Promise<Product[]> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM products ORDER BY created_at DESC");
    return result.rows.map(normalizeProductRow);
  }

  const rows = sqliteDb.prepare(`SELECT * FROM products ORDER BY created_at DESC`).all() as Record<string, any>[];
  return rows.map(normalizeProductRow);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM products WHERE slug = $1", [slug]);
    return result.rows[0] ? normalizeProductRow(result.rows[0]) : undefined;
  }

  const row = sqliteDb.prepare(`SELECT * FROM products WHERE slug = ?`).get(slug) as Record<string, any> | undefined;
  return row ? normalizeProductRow(row) : undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0] ? normalizeProductRow(result.rows[0]) : undefined;
  }

  const row = sqliteDb.prepare(`SELECT * FROM products WHERE id = ?`).get(id) as Record<string, any> | undefined;
  return row ? normalizeProductRow(row) : undefined;
}

export async function getProductByName(name: string): Promise<Product | undefined> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM products WHERE name = $1", [name]);
    return result.rows[0] ? normalizeProductRow(result.rows[0]) : undefined;
  }

  const row = sqliteDb.prepare(`SELECT * FROM products WHERE name = ?`).get(name) as Record<string, any> | undefined;
  return row ? normalizeProductRow(row) : undefined;
}

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
  fabric: string;
  description?: string;
  badge?: string;
  images?: string[];
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
}) {
  const slug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `product-${Date.now()}`;

  const originalPrice = Math.max(input.price * 1.35, input.price + 300);
  const discount = Math.min(40, Math.max(10, Math.round(((originalPrice - input.price) / originalPrice) * 100)));
  const id = `prod-${Date.now()}`;

  const product = {
    id,
    slug,
    name: input.name,
    category: input.category,
    price: input.price,
    originalPrice,
    discount,
    rating: 4.8,
    reviews: 0,
    stock: input.stock,
    badge: input.badge || "New",
    fabric: input.fabric,
    description: input.description || "Curated for the Admire Boutique collection.",
    images: input.images || [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    colors: input.colors || [{ name: "Terracotta", hex: "#c06a4f" }],
    sizes: input.sizes || ["XS", "S", "M", "L", "XL"],
  };

  if (usesPostgres) {
    await ensurePostgresReady();
    await postgresPool!.query(
      `INSERT INTO products (id, slug, name, category, price, "originalPrice", discount, rating, reviews, stock, badge, fabric, description, images, colors, sizes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        product.id,
        product.slug,
        product.name,
        product.category,
        product.price,
        product.originalPrice,
        product.discount,
        product.rating,
        product.reviews,
        product.stock,
        product.badge,
        product.fabric,
        product.description,
        JSON.stringify(product.images),
        JSON.stringify(product.colors),
        JSON.stringify(product.sizes),
      ]
    );
    return normalizeProductRow({ ...product, images: JSON.stringify(product.images), colors: JSON.stringify(product.colors), sizes: JSON.stringify(product.sizes) });
  }

  sqliteDb.prepare(
    `INSERT INTO products (
      id, slug, name, category, price, originalPrice, discount, rating, reviews, stock, badge, fabric, description, images, colors, sizes
    ) VALUES (
      @id, @slug, @name, @category, @price, @originalPrice, @discount, @rating, @reviews, @stock, @badge, @fabric, @description, @images, @colors, @sizes
    )`
  ).run({
    ...product,
    images: JSON.stringify(product.images),
    colors: JSON.stringify(product.colors),
    sizes: JSON.stringify(product.sizes),
  });

  return normalizeProductRow({ ...product, images: JSON.stringify(product.images), colors: JSON.stringify(product.colors), sizes: JSON.stringify(product.sizes) });
}

export async function replaceAllProducts(products: Product[]) {
  if (usesPostgres) {
    await ensurePostgresReady();
    await postgresPool!.query("DELETE FROM products");

    for (const product of products) {
      await postgresPool!.query(
        `INSERT INTO products (id, slug, name, category, price, "originalPrice", discount, rating, reviews, stock, badge, fabric, description, images, colors, sizes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          product.id,
          product.slug,
          product.name,
          product.category,
          product.price,
          product.originalPrice,
          product.discount,
          product.rating,
          product.reviews,
          product.stock,
          product.badge ?? null,
          product.fabric,
          product.description,
          JSON.stringify(product.images || []),
          JSON.stringify(product.colors || []),
          JSON.stringify(product.sizes || []),
        ]
      );
    }

    return listProducts();
  }

  const transaction = sqliteDb.transaction(() => {
    sqliteDb.prepare("DELETE FROM products").run();
    const insert = sqliteDb.prepare(`
      INSERT INTO products (
        id, slug, name, category, price, originalPrice, discount, rating, reviews, stock, badge, fabric, description, images, colors, sizes
      ) VALUES (
        @id, @slug, @name, @category, @price, @originalPrice, @discount, @rating, @reviews, @stock, @badge, @fabric, @description, @images, @colors, @sizes
      )
    `);

    for (const product of products) {
      insert.run({
        ...product,
        images: JSON.stringify(product.images || []),
        colors: JSON.stringify(product.colors || []),
        sizes: JSON.stringify(product.sizes || []),
      });
    }
  });

  transaction();
  return listProducts();
}

export async function deleteProductById(id: string) {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("DELETE FROM products WHERE id = $1 OR slug = $2", [id, id]);
    return Number(result.rowCount ?? 0) > 0;
  }

  const result = sqliteDb.prepare("DELETE FROM products WHERE id = ? OR slug = ?").run(id, id);
  return result.changes > 0;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<AdminUserRecord | null> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM admin_users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return null;
    if (!(await verifyPassword(password, user.password_hash))) return null;
    return { id: user.id, name: user.name, email: user.email };
  }

  const user = sqliteDb.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as Record<string, any> | undefined;
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  } satisfies AdminUserRecord;
}

export async function getAdminByEmail(email: string): Promise<AdminUserRecord | null> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM admin_users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email };
  }

  const user = sqliteDb.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as Record<string, any> | undefined;
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  } satisfies AdminUserRecord;
}

export const adminSessions = new Map<string, string>();

export function storeSessionToken(token: string, email: string) {
  adminSessions.set(token, email);
}

export async function validateSessionToken(token: string): Promise<AdminUserRecord | null> {
  const email = adminSessions.get(token);
  if (!email) return null;
  return getAdminByEmail(email);
}

export async function verifyCustomerCredentials(email: string, password: string): Promise<CustomerRecord | null> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM customers WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return null;
    if (!(await verifyPassword(password, user.password_hash))) return null;
    return { id: user.id, name: user.name, email: user.email, phone: user.phone };
  }

  const user = sqliteDb.prepare("SELECT * FROM customers WHERE email = ?").get(email) as Record<string, any> | undefined;
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  } satisfies CustomerRecord;
}

export async function getCustomerByEmail(email: string): Promise<CustomerRecord | null> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM customers WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, phone: user.phone };
  }

  const user = sqliteDb.prepare("SELECT * FROM customers WHERE email = ?").get(email) as Record<string, any> | undefined;
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  } satisfies CustomerRecord;
}

export async function getCustomerById(id: string): Promise<CustomerRecord | null> {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM customers WHERE id = $1", [id]);
    const user = result.rows[0];
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, phone: user.phone };
  }

  const user = sqliteDb.prepare("SELECT * FROM customers WHERE id = ?").get(id) as Record<string, any> | undefined;
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  } satisfies CustomerRecord;
}

export async function createCustomer(input: { name: string; email: string; phone: string; password: string }): Promise<CustomerRecord | null> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const password = input.password;

  if (!name || !email || !phone || !password) {
    return null;
  }

  const passwordHash = await hashPassword(password);

  if (usesPostgres) {
    await ensurePostgresReady();
    const existing = await postgresPool!.query("SELECT id FROM customers WHERE email = $1", [email]);
    if (existing.rows[0]) return null;

    const id = `cust-${Date.now()}`;
    await postgresPool!.query(
      "INSERT INTO customers (id, name, email, phone, password_hash) VALUES ($1, $2, $3, $4, $5)",
      [id, name, email, phone, passwordHash]
    );

    return { id, name, email, phone };
  }

  const existing = sqliteDb.prepare("SELECT id FROM customers WHERE email = ?").get(email) as { id?: string } | undefined;
  if (existing) return null;

  const id = `cust-${Date.now()}`;
  sqliteDb.prepare(`
    INSERT INTO customers (id, name, email, phone, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, email, phone, passwordHash);

  return { id, name, email, phone } satisfies CustomerRecord;
}

export async function listCustomerAddresses(customerId: string) {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query(
      "SELECT * FROM addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC",
      [customerId]
    );
    return result.rows;
  }

  return sqliteDb.prepare(`
    SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC
  `).all(customerId) as Record<string, any>[];
}

export async function createAddress(customerId: string, input: {
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  is_default?: boolean;
}) {
  const id = `addr-${Date.now()}`;
  const address = {
    id,
    customer_id: customerId,
    label: input.label,
    full_name: input.full_name,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 ?? "",
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    country: input.country ?? "India",
    is_default: input.is_default ? 1 : 0,
  };

  if (usesPostgres) {
    await ensurePostgresReady();
    await postgresPool!.query(
      `INSERT INTO addresses (id, customer_id, label, full_name, phone, line1, line2, city, state, pincode, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        address.id,
        address.customer_id,
        address.label,
        address.full_name,
        address.phone,
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.pincode,
        address.country,
        address.is_default,
      ]
    );
    return address;
  }

  sqliteDb.prepare(`
    INSERT INTO addresses (id, customer_id, label, full_name, phone, line1, line2, city, state, pincode, country, is_default)
    VALUES (@id, @customer_id, @label, @full_name, @phone, @line1, @line2, @city, @state, @pincode, @country, @is_default)
  `).run(address);

  return address;
}

export async function listCustomerOrders(customerId: string) {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query(
      "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
      [customerId]
    );
    return result.rows.map((row) => ({
      ...row,
      items: parseJsonArray(row.items_json),
    }));
  }

  const rows = sqliteDb.prepare(`
    SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC
  `).all(customerId) as Record<string, any>[];

  return rows.map((row) => ({
    ...row,
    items: parseJsonArray(row.items_json),
  }));
}

export async function getOrderByNumber(orderNumber: string) {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query(
      "SELECT * FROM orders WHERE order_number = $1",
      [orderNumber]
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...row,
      items: parseJsonArray(row.items_json),
    };
  }

  const row = sqliteDb.prepare(`
    SELECT * FROM orders WHERE order_number = ?
  `).get(orderNumber) as Record<string, any> | undefined;

  if (!row) return null;
  return {
    ...row,
    items: parseJsonArray(row.items_json),
  };
}

export async function createOrder(customerId: string, input: {
  order_number: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: string;
  payment_method: string;
  delivery_partner: string;
  tracking_id: string;
  estimated_delivery: string;
  items: Array<{ name: string; size: string; qty: number; price: number; productId?: string }>;
  address?: { id?: string; label?: string; full_name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string; country?: string };
}) {
  const id = `ord-${Date.now()}`;
  const order = {
    id,
    customer_id: customerId,
    order_number: input.order_number,
    status: input.status,
    sub_total: input.subtotal,
    shipping: input.shipping,
    discount: input.discount,
    total: input.total,
    payment_status: input.payment_status,
    payment_method: input.payment_method,
    delivery_partner: input.delivery_partner,
    tracking_id: input.tracking_id,
    estimated_delivery: input.estimated_delivery,
    items_json: JSON.stringify(input.items),
    address_json: input.address ? JSON.stringify(input.address) : JSON.stringify({}),
  };

  if (usesPostgres) {
    await ensurePostgresReady();
    const client = await postgresPool!.connect();
    try {
      // Start transaction for atomicity (prevents race conditions)
      await client.query('BEGIN');
      
      // Insert order
      await client.query(
        `INSERT INTO orders (id, customer_id, order_number, status, sub_total, shipping, discount, total, payment_status, payment_method, delivery_partner, tracking_id, estimated_delivery, items_json, address_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          order.id,
          order.customer_id,
          order.order_number,
          order.status,
          order.sub_total,
          order.shipping,
          order.discount,
          order.total,
          order.payment_status,
          order.payment_method,
          order.delivery_partner,
          order.tracking_id,
          order.estimated_delivery,
          order.items_json,
          order.address_json,
        ]
      );
      
      // Reduce stock for each item
      for (const item of input.items) {
        if (item.productId) {
          const checkResult = await client.query(
            `SELECT stock FROM products WHERE id = $1 FOR UPDATE`,
            [item.productId]
          );
          
          if (!checkResult.rows.length) {
            throw new Error(`Product ${item.productId} not found`);
          }
          
          const currentStock = checkResult.rows[0].stock;
          if (currentStock < item.qty) {
            throw new Error(`Insufficient stock for product ${item.productId}. Available: ${currentStock}, Requested: ${item.qty}`);
          }
          
          await client.query(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [item.qty, item.productId]
          );
        }
      }
      
      await client.query('COMMIT');
      return { ...order, items: input.items };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // SQLite transaction for stock reduction with locking
  const transaction = sqliteDb.transaction(() => {
    // Insert order
    sqliteDb.prepare(`
      INSERT INTO orders (
        id, customer_id, order_number, status, sub_total, shipping, discount, total, payment_status, payment_method,
        delivery_partner, tracking_id, estimated_delivery, items_json, address_json
      ) VALUES (
        @id, @customer_id, @order_number, @status, @sub_total, @shipping, @discount, @total, @payment_status,
        @payment_method, @delivery_partner, @tracking_id, @estimated_delivery, @items_json, @address_json
      )
    `).run(order);
    
    // Reduce stock for each item
    for (const item of input.items) {
      if (item.productId) {
        const product = sqliteDb.prepare(`SELECT stock FROM products WHERE id = ?`).get(item.productId) as any;
        
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        if (product.stock < item.qty) {
          throw new Error(`Insufficient stock for product ${item.productId}. Available: ${product.stock}, Requested: ${item.qty}`);
        }
        
        sqliteDb.prepare(`UPDATE products SET stock = stock - ? WHERE id = ?`).run(item.qty, item.productId);
      }
    }
  });
  
  transaction();
  return { ...order, items: input.items };
}

export async function listFaqs() {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query("SELECT * FROM faq_items ORDER BY created_at DESC");
    return result.rows;
  }

  return sqliteDb.prepare(`SELECT * FROM faq_items ORDER BY created_at DESC`).all() as Record<string, any>[];
}

export function getCustomerSessionToken(token: string) {
  return adminSessions.get(token) || null;
}

export const userSessions = new Map<string, string>();

export function storeUserSessionToken(token: string, email: string) {
  userSessions.set(token, email);
}

export async function validateUserSessionToken(token: string): Promise<CustomerRecord | null> {
  const email = userSessions.get(token);
  if (!email) return null;
  return getCustomerByEmail(email);
}

export async function listRecentAdminOrders() {
  if (usesPostgres) {
    await ensurePostgresReady();
    const result = await postgresPool!.query(
      `SELECT o.id, o.order_number, o.status, o.total, o.payment_status, o.payment_method, o.created_at, c.name AS customer_name
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );
    return result.rows.map((row) => ({ ...row, total: Number(row.total) }));
  }

  const rows = sqliteDb.prepare(`
    SELECT o.id, o.order_number, o.status, o.total, o.payment_status, o.payment_method, o.created_at, c.name AS customer_name
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ORDER BY o.created_at DESC
    LIMIT 5
  `).all() as Array<{ id: string; order_number: string; status: string; total: number; payment_status: string; payment_method: string; created_at: string; customer_name: string }>;

  return rows.map((row) => ({ ...row, total: Number(row.total) }));
}
