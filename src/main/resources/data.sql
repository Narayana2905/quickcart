-- ============================================================
-- 1. APP USERS  (password for all: Password@123)
-- FIX: added 3rd user 'anil_v' — orders section referenced user_id=3
-- ============================================================
INSERT INTO app_users (username, email, password, phone, role, active, created_at, updated_at, created_by, updated_by) VALUES
('rahul_k', 'rahul.k@example.com', '$2b$10$rJNhgBqwGUs9Nj5XMzebBes8ros8PTRfP0Xugi5gMjq//20Qtg.Ku', '9876543210', 'USER', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('priya_s', 'priya.s@example.com', '$2b$10$DLwmmgzAkJ7.IKK517oM3ui8TfSvCWJRbn6a.lwGiiJNwLFDPNDES', '9123456780', 'USER', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('anil_v', 'anil.v@example.com', '$2b$10$rJNhgBqwGUs9Nj5XMzebBes8ros8PTRfP0Xugi5gMjq//20Qtg.Ku', '9988776655', 'USER', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 2. BRANDS
-- ============================================================
INSERT INTO brands (name, logo_url, active, created_at, updated_at, created_by, updated_by) VALUES
('Amul', 'https://cdn.quickcarts.com/brands/amul.png', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Nestle', 'https://cdn.quickcarts.com/brands/nestle.png', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Lays', 'https://cdn.quickcarts.com/brands/lays.png', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Coca-Cola', 'https://cdn.quickcarts.com/brands/cocacola.png', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Patanjali', 'https://cdn.quickcarts.com/brands/patanjali.png', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 3. CATEGORIES (root categories first: ids 1,2; children reference them)
-- ============================================================
INSERT INTO categories (name, image_url, parent_id, active, created_at, updated_at, created_by, updated_by) VALUES
('Dairy, Bread & Eggs', 'https://cdn.quickcarts.com/cat/dairy.png', NULL, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Snacks & Beverages', 'https://cdn.quickcarts.com/cat/snacks.png', NULL, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');

INSERT INTO categories (name, image_url, parent_id, active, created_at, updated_at, created_by, updated_by) VALUES
('Mik', 'https://cdn.quickcarts.com/cat/milk.png', 1, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Chips & Namkeen', 'https://cdn.quickcarts.com/cat/chips.png', 2, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Soft Drinks', 'https://cdn.quickcarts.com/cat/drinks.png', 2, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 4. DARK STORES
-- ============================================================
INSERT INTO dark_stores (name, address, pincode, latitude, longitude, opening_time, closing_time, active, created_at, updated_at, created_by, updated_by) VALUES
('QuickCart Hitech City', 'Plot 12, Hitech City, Hyderabad', '500081', 17.4483, 78.3915, '06:00:00', '23:59:00', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('QuickCart Gachibowli', 'Road No 5, Gachibowli, Hyderabad', '500032', 17.4401, 78.3489, '06:00:00', '23:59:00', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('QuickCart Kondapur', 'Main Road, Kondapur, Hyderabad', '500084', 17.4615, 78.3647, '06:00:00', '23:59:00', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 5. COUPONS
-- ============================================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount_amount, expiry_date, usage_limit, used_count, active, created_at, updated_at, created_by, updated_by) VALUES
('WELCOME50', 'FLAT', 50.00, 199.00, NULL, DATEADD('DAY', 30, NOW()), 1000, 12, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('SAVE10', 'PERCENTAGE', 10.00, 300.00, 100.00, DATEADD('DAY', 15, NOW()), 500, 45, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('FLAT20', 'FLAT', 20.00, 100.00, NULL, DATEADD('DAY', 60, NOW()), 2000, 300, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('MEGA25', 'PERCENTAGE', 25.00, 500.00, 150.00, DATEADD('DAY', 7, NOW()), 200, 198, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 6. ADDRESSES (app_users 1,2 used; 3 has none seeded)
-- ============================================================
INSERT INTO addresses (user_id, label, type, address_line, pincode, latitude, longitude, is_default, created_at, updated_at, created_by, updated_by) VALUES
(1, 'Home', 'HOME', 'Flat 302, Silver Oaks, Hitech City', '500081', 17.4483, 78.3915, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 'Work', 'WORK', 'Tower B, Cyber Towers, Hitech City', '500081', 17.4450, 78.3900, FALSE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 'Home', 'HOME', 'House 5, Road 10, Gachibowli', '500032', 17.4401, 78.3489, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 7. PRODUCTS
-- ============================================================
INSERT INTO products (name, description, mrp, selling_price, unit, unit_value, category_id, brand_id, active, created_at, updated_at, created_by, updated_by) VALUES
('Amul Toned Milk', 'Fresh toned milk pouch', 30.00, 28.00, 'ml', 500, 3, 1, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Lays Classic Salted', 'Crispy potato chips', 20.00, 18.00, 'g', 52, 4, 3, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Coca-Cola Can', 'Chilled soft drink can', 45.00, 40.00, 'ml', 300, 5, 4, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Nestle Maggi Noodles', 'Instant masala noodles', 14.00, 12.00, 'g', 70, 4, 2, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Patanjali Atta', 'Whole wheat flour', 250.00, 230.00, 'kg', 5, 1, 5, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 8. PRODUCT VARIANTS
-- ============================================================
INSERT INTO product_variants (variant_name, price, product_id, active, created_at, updated_at, created_by, updated_by) VALUES
('500ml Pouch', 28.00, 1, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('1L Pouch', 55.00, 1, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('52g Pack', 18.00, 2, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('300ml Can', 40.00, 3, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('750ml Bottle', 90.00, 3, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('70g Pack', 12.00, 4, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('5kg Bag', 230.00, 5, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 9. PRODUCT IMAGES
-- ============================================================
INSERT INTO product_images (image_url, primary_img, product_id, created_at, updated_at, created_by, updated_by) VALUES
('https://cdn.quickcarts.com/products/amul-milk.png', TRUE, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('https://cdn.quickcarts.com/products/lays.png', TRUE, 2, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('https://cdn.quickcarts.com/products/cocacola.png', TRUE, 3, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('https://cdn.quickcarts.com/products/maggi.png', TRUE, 4, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('https://cdn.quickcarts.com/products/atta.png', TRUE, 5, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 10. RIDERS
-- ============================================================
INSERT INTO riders (name, phone, vehicle_number, dark_store_id, status, current_latitude, current_longitude, active, created_at, updated_at, created_by, updated_by) VALUES
('Suresh Kumar', '9000011111', 'TS09EA1234', 1, 'AVAILABLE', 17.4483, 78.3915, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Manoj Reddy', '9000022222', 'TS09EB5678', 1, 'AVAILABLE', 17.4490, 78.3920, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Kiran Babu', '9000033333', 'TS10EC9012', 2, 'ON_DELIVERY', 17.4401, 78.3489, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
('Ravi Teja', '9000044444', 'TS11ED3456', 3, 'OFFLINE', 17.4615, 78.3647, TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 11. INVENTORY
-- ============================================================
INSERT INTO inventory (dark_store_id, product_variant_id, available_quantity, reserved_quantity, low_stock_threshold, created_at, updated_at, created_by, updated_by) VALUES
(1, 1, 100, 0, 10, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 3, 150, 0, 15, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 4, 80, 0, 10, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 6, 200, 0, 20, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 7, 40, 0, 5, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 1, 60, 0, 10, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 2, 30, 0, 5, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 5, 25, 0, 5, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, 3, 90, 0, 10, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, 6, 120, 0, 15, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 12. STORE SERVICE ZONES
-- ============================================================
INSERT INTO store_service_zones (dark_store_id, pincode, active, created_at, updated_at, created_by, updated_by) VALUES
(1, '500081', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, '500082', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, '500032', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, '500033', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, '500084', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, '500085', TRUE, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 13. CARTS (user IDs 1 and 2)
-- ============================================================
INSERT INTO carts (user_id, dark_store_id, created_at, updated_at, created_by, updated_by) VALUES
(1, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 14. CART ITEMS
-- ============================================================
INSERT INTO cart_items (cart_id, product_variant_id, quantity, created_at, updated_at, created_by, updated_by) VALUES
(1, 1, 2, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 3, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 6, 3, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 15. ORDERS (user_id=3 now valid — anil_v added in step 1)
-- ============================================================
INSERT INTO orders (user_id, dark_store_id, delivery_address, delivery_pincode, total_amount, delivery_fee, status, cancellation_reason, created_at, updated_at, created_by, updated_by) VALUES
(1, 1, 'Flat 302, Silver Oaks, Hitech City', '500081', 92.00, 0.00, 'DELIVERED', NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 2, 'House 5, Road 10, Gachibowli', '500032', 130.00, 20.00, 'OUT_FOR_DELIVERY', NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, 3, '204, Green Residency, Kondapur', '500084', 54.00, 0.00, 'CANCELLED', 'Ordered by mistake', NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 16. ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_variant_id, product_name, price_at_purchase, quantity, created_at, updated_at, created_by, updated_by) VALUES
(1, 1, 'Amul Toned Milk - 500ml Pouch', 28.00, 2, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 3, 'Lays Classic Salted - 52g Pack', 18.00, 2, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 2, 'Amul Toned Milk - 1L Pouch', 55.00, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 5, 'Coca-Cola Can - 750ml Bottle', 90.00, 1, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, 3, 'Lays Classic Salted - 52g Pack', 18.00, 3, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 17. PAYMENTS
-- ============================================================
INSERT INTO payments (order_id, amount, method, status, gateway_transaction_id, failure_reason, created_at, updated_at, created_by, updated_by) VALUES
(1, 92.00, 'UPI', 'SUCCESS', 'TXN1001', NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 130.00, 'CARD', 'SUCCESS', 'TXN1002', NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, 54.00, 'COD', 'REFUNDED', NULL, NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 18. REFUNDS
-- ============================================================
INSERT INTO refunds (payment_id, amount, reason, status, created_at, updated_at, created_by, updated_by) VALUES
(3, 54.00, 'Order cancelled by mistake', 'REFUNDED', NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 19. DELIVERY ASSIGNMENTS
-- ============================================================
INSERT INTO delivery_assignments (order_id, rider_id, status, picked_up_at, delivered_at, failure_reason, created_at, updated_at, created_by, updated_by) VALUES
(2, 3, 'PICKED_UP', NOW(), NULL, NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 1, 'DELIVERED', NOW(), NOW(), NULL, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 20. PRODUCT REVIEWS
-- ============================================================
INSERT INTO product_reviews (product_id, user_id, rating, comment, created_at, updated_at, created_by, updated_by) VALUES
(1, 1, 5, 'Always fresh, delivered fast!', NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 2, 4, 'Good quality milk, packaging could be better', NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 1, 5, 'Best chips brand, crispy every time', NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(3, 2, 3, 'Was not chilled on delivery', NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(4, 1, 4, 'Quick 10 min delivery, noodles were fresh', NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 21. WISHLISTS
-- ============================================================
INSERT INTO wishlists (user_id, product_id, created_at, updated_at, created_by, updated_by) VALUES
(1, 3, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(1, 5, NOW(), NOW(), 'SYSTEM', 'SYSTEM'),
(2, 2, NOW(), NOW(), 'SYSTEM', 'SYSTEM');


-- ============================================================
-- 22. ORDER COUPON DATA
-- ============================================================
UPDATE orders SET coupon_code = 'WELCOME50', discount_amount = 50.00 WHERE id = 1;
UPDATE orders SET coupon_code = NULL, discount_amount = 0.00 WHERE id = 2;
UPDATE orders SET coupon_code = 'FLAT20', discount_amount = 20.00 WHERE id = 3;