SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Likes;
TRUNCATE TABLE Comments;
TRUNCATE TABLE Post_Category;
TRUNCATE TABLE Posts;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (Password is MyTestPassvord123 for all)
INSERT INTO Users (id, login, email, password, full_name, role, is_verified) VALUES 
(1, 'GeoAdmin', 'admin@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'System Administrator', 'admin', true),
(2, 'TrailBlazer', 'trail@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Alex Trail', 'user', true),
(3, 'PicnicLover', 'picnic@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Sam Nature', 'user', true),
(4, 'BikeRider', 'bike@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Chris Rider', 'user', true),
(5, 'Explorer99', 'explore@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Jordan Explorer', 'user', true),
(6, 'EasterEggHunter', 'hunter@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Taylor Hunter', 'user', true);

-- Categories
INSERT INTO Categories (id, title, description) VALUES 
(1, 'Picnic Spots', 'Discover and share the best places to relax and eat outdoors.'),
(2, 'Bicycle Routes', 'Scenic and safe paths for your weekend rides.'),
(3, 'Hidden Easter Eggs', 'Coordinates and hints for small gifts left by our community.'),
(4, 'Camping Rules', 'Guidelines and best practices for safe camping.'),
(5, 'Gear Reviews', 'Share your thoughts on outdoor equipment.');

-- Posts
INSERT INTO Posts (id, title, content, author_id, status) VALUES 
(1, 'Community Guidelines', 'Welcome to GeoChill! Please respect nature, clean up after your picnic.', 1, 'active'),
(2, 'Perfect lake spot for a weekend', 'Found an amazing quiet place near the northern lake.', 3, 'active'),
(3, 'Left a small gift on the Red Trail!', 'I hid a handmade wooden keychain under the big oak tree.', 6, 'active'),
(4, 'Mountain biking dangers', 'Be careful on the west side trail due to recent rains.', 4, 'active'),
(5, 'Best affordable tent?', 'Can anyone recommend a good 2-person tent under $100?', 5, 'active');

-- Post_Category Links
INSERT INTO Post_Category (post_id, category_id) VALUES 
(1, 4), (2, 1), (3, 3), (4, 2), (5, 5);

-- Comments (Including nested)
INSERT INTO Comments (id, author_id, post_id, parent_id, content, status) VALUES 
(1, 2, 2, NULL, 'Is this place accessible by car?', 'active'),
(2, 3, 2, 1, 'No, you have to walk the last mile.', 'active'), -- Nested under comment 1
(3, 4, 3, NULL, 'Going there right now to find it!', 'active'),
(4, 1, 4, NULL, 'Thanks for the warning. I will pin this post.', 'active'),
(5, 2, 5, NULL, 'Check out the NatureHike Cloud Up series.', 'active');

-- Likes (Triggers will automatically update user rating!)
INSERT INTO Likes (author_id, post_id, comment_id, type) VALUES 
(2, 1, NULL, 'like'),
(3, 1, NULL, 'like'),
(4, 2, NULL, 'like'),
(5, 3, NULL, 'like'),
(1, NULL, 5, 'like');