-- Sample seed data so the app is usable immediately after first run.
-- Admin password is 'Admin@12345' (BCrypt hash below). CHANGE THIS after first login in production.

INSERT INTO admin_users (name, email, password_hash, role, active) VALUES
('Hotel Admin', 'admin@hotel.com', '$2b$10$kXzX.BS.LvDED8.5/itaLOZCiM7i5q.cm4gOzIS4gIR4LuBkcP.Bu', 'ADMIN', TRUE);

INSERT INTO categories (name, description, active, display_order) VALUES
('Starters', 'Appetizers and small bites', TRUE, 1),
('Main Course', 'Hearty main dishes', TRUE, 2),
('Biryani & Rice', 'Rice specialties', TRUE, 3),
('Beverages', 'Cold and hot drinks', TRUE, 4),
('Desserts', 'Sweet treats', TRUE, 5);

INSERT INTO food_items (category_id, name, description, price, image_url, available, veg, preparation_time_minutes) VALUES
(1, 'Paneer Tikka', 'Grilled cottage cheese with spices', 220.00, NULL, TRUE, TRUE, 15),
(1, 'Chicken 65', 'Spicy deep fried chicken', 260.00, NULL, TRUE, FALSE, 15),
(2, 'Butter Chicken', 'Creamy tomato based chicken curry', 320.00, NULL, TRUE, FALSE, 25),
(2, 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 280.00, NULL, TRUE, TRUE, 20),
(3, 'Chicken Biryani', 'Aromatic basmati rice with chicken', 280.00, NULL, TRUE, FALSE, 30),
(3, 'Veg Biryani', 'Aromatic basmati rice with vegetables', 220.00, NULL, TRUE, TRUE, 25),
(4, 'Masala Chai', 'Indian spiced tea', 40.00, NULL, TRUE, TRUE, 5),
(4, 'Fresh Lime Soda', 'Refreshing lime soda', 60.00, NULL, TRUE, TRUE, 5),
(5, 'Gulab Jamun', 'Sweet milk dumplings in syrup', 90.00, NULL, TRUE, TRUE, 5);

INSERT INTO delivery_partners (name, mobile, active) VALUES
('Ravi Kumar', '+919876543210', TRUE);
