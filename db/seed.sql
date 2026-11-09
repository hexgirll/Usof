SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Likes;
TRUNCATE TABLE Comments;
TRUNCATE TABLE Post_Category;
TRUNCATE TABLE Posts;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Users;
TRUNCATE TABLE News;
TRUNCATE TABLE Post_Images;
TRUNCATE TABLE Comment_Images;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (Password is MyTestPassvord123 for all)
INSERT INTO Users (id, login, email, password, full_name, role, is_verified, profile_picture) VALUES 
(1, 'GeoAdmin', 'admin@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'System Administrator', 'admin', true, 'admin_avatar.png'),
(2, 'TrailBlazer', 'trail@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Alex Trail', 'user', true, 'alex_avatar.jpg'),
(3, 'PicnicLover', 'picnic@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Sam Nature', 'user', true, 'sam_avatar.jpg'),
(4, 'BikeRider', 'bike@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Chris Rider', 'user', true, 'chris_avatar.jpg'),
(5, 'Explorer99', 'explore@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Jordan Explorer', 'user', true, 'jordan_avatar.jpg'),
(6, 'EasterEggHunter', 'hunter@geochill.local', '$2b$12$dYQtXwZl.iK9PAmyPPTRn.GBBYMJd94v1oohVcrN/IUZEQeR1PM86', 'Taylor Hunter', 'user', true, 'taylor_avatar.jpg');

-- Categories
INSERT INTO Categories (id, title, description, icon) VALUES
(1, 'On Foot / Hiking', 'Scenic walking trails, hidden pathways, and places reachable only by foot.', 'hiking-icon.svg'),
(2, 'Bicycles', 'Beautiful cycling routes, off-road biking spots, and pedal-powered adventures.', 'bike-icon.svg'),
(3, 'Electric Mopeds', 'Quiet escapes into nature using eco-friendly electric mopeds.', 'moped-icon.svg'),
(4, 'Public Transport', 'Great outdoor spots you can reach easily by train or bus.', 'train-icon.svg'),
(5, 'Car Camping', 'Spacious spots perfect for road trips and parking your car right next to the tent.', 'car-icon.svg');

-- Posts
INSERT INTO Posts (id, title, content, author_id, status, latitude, longitude, publish_date) VALUES 
(1, 'Platform Rules & Good Vibes', 'Hey everyone! Just a quick reminder to keep things chill here. Don''t leave trash behind after your weekend hangs, respect local property, and let''s keep these spots clean for everyone else. Enjoy the outdoors!', 1, 'active', 50.0000, 36.2000, '2026-09-01 08:00:00'),
(2, 'Found a super cozy lake spot for the weekend', 'Stumbled upon this quiet little corner by the north lake yesterday. Water is surprisingly clear and nobody was around. Perfect if you just want to sit on a log, drink some warm tea, and listen to the frogs. Highly recommend!', 3, 'active', 50.1234, 36.4567, '2026-10-01 10:00:00'),
(3, 'That view at the end of the pine trail', 'Not gonna lie, my legs were burning by the time I reached the top of the hill, but that sunset through the pine trees? Totally worth the sweat. Bring a windbreaker though, gets breezy fast once the sun drops.', 4, 'active', 50.4501, 30.5234, '2026-10-05 14:30:00'),
(4, 'Old campfire spot', 'Oops, turns out this clearing is actually someone''s backyard extension. Taking down coordinates so nobody gets chased by angry dogs lol.', 2, 'inactive', NULL, NULL, '2026-10-10 09:15:00'),
(5, 'Hidden waterfall off the beaten path', 'Took the local bus and then walked about 2 hours through the woods. My sneakers are completely ruined, but finding this tiny hidden waterfall tucked between the rocks made it 100% worth it. Bring extra socks!', 5, 'active', 48.4647, 35.0461, '2026-10-12 16:20:00'),
(6, 'Rode my moped up to the old observatory ruins', 'Charged up my 72V battery and took the dirt path up to the abandoned observatory. The structure looks super dystopian and creepy, but the photos you can get from the roof are unreal. Watch out for loose gravel on the way up!', 6, 'active', 48.1234, 24.5678, '2026-10-15 11:00:00'),
(7, 'Easy car camping spot by the river', 'Super chill spot where you can literally park the trunk right next to your tent. Road getting here is a bit bumpy, so low-riders beware, but my hatchback made it fine. Great place to set up a hammock.', 2, 'active', 49.8396, 24.0297, '2026-10-20 08:45:00'),
(8, 'Left a tiny surprise on the Red Trail!', 'Hey trail folks! I hid a small handmade wooden keychain inside a hollow branch right under the giant oak tree on the Red Trail ridge. First one to find it gets to keep it. Good luck!', 6, 'active', 50.4121, 30.5132, '2026-10-25 15:30:00');

-- Post_Category Links
INSERT INTO Post_Category (post_id, category_id) VALUES 
(1, 1), (2, 2), (2, 1), (3, 2), (4, 5), (5, 1), (5, 4), (6, 3), (7, 5), (8, 1);

-- News
INSERT INTO News (id, title, content, is_pinned, publish_date, status) VALUES 
(1, 'Welcome to GeoChill!', 'I am super excited to finally launch the platform! Feel free to share your secret camping spots, hiking trails, and hidden nature escapes with the community.', TRUE, '2026-11-01 10:00:00', 'active'),
(2, 'Interactive Map Feature Coming Soon', 'I am currently testing out a new interactive map layer so you can drop pins and check routes much easier. Stay tuned for updates!', FALSE, '2026-11-03 12:00:00', 'active');

-- Comments
INSERT INTO Comments (id, author_id, post_id, news_id, parent_id, content, status) VALUES 
(1, 4, 2, NULL, NULL, 'Can you actually drive all the way down to the water, or do you have to park on the main road?', 'active'),
(2, 3, 2, NULL, 1, 'Nah, you gotta leave the car near the old fence and walk like 10-15 mins through the trees. Saves your suspension anyway!', 'active'),
(3, 5, 2, NULL, 2, 'Good to know, thanks! Planning to head there this Saturday.', 'active'),
(4, 5, 3, NULL, NULL, 'I usually do this trail on my mountain bike around 7 AM. The morning fog is just magic there.', 'active'),
(5, 2, 3, NULL, 4, 'Man, 7 AM? You are way more disciplined than I am haha.', 'active'),
(6, 4, 5, NULL, NULL, 'Which bus number did you take from the city? Google Maps is showing like three different routes.', 'active'),
(7, 5, 5, NULL, 6, 'Take the #42 express to the last stop, then follow the yellow markers past the old water tower.', 'active'),
(8, 4, 8, NULL, NULL, 'No way, I am literally heading out right now to look for it! Hope nobody beat me to it.', 'active'),
(9, 6, 8, NULL, 8, 'Let me know if you find it! Took me an hour to carve that little fox.', 'active'),
(10, 2, NULL, 1, NULL, 'Awesome interface update! Super clean and fast.', 'active');

-- Likes & Dislikes
INSERT INTO Likes (author_id, post_id, comment_id, news_id, type) VALUES 
(3, 1, NULL, NULL, 'like'),
(4, 1, NULL, NULL, 'like'),
(5, 1, NULL, NULL, 'like'),
(6, 1, NULL, NULL, 'like'),
(3, 2, NULL, NULL, 'like'),
(4, 2, NULL, NULL, 'like'),
(5, 2, NULL, NULL, 'like'),
(1, 3, NULL, NULL, 'like'),
(2, 3, NULL, NULL, 'like'),
(6, 5, NULL, NULL, 'like'),
(2, 7, NULL, NULL, 'like'),
(3, 7, NULL, NULL, 'like'),
(4, 8, NULL, NULL, 'like'),
(5, 8, NULL, NULL, 'like'),
(1, 2, NULL, NULL, 'dislike'),
(2, NULL, 1, NULL, 'like'),
(3, NULL, 2, NULL, 'like'),
(4, NULL, 3, NULL, 'like'),
(1, NULL, 4, NULL, 'like'),
(6, NULL, 8, NULL, 'like'),
(3, NULL, 9, NULL, 'like'),
(1, NULL, 1, NULL, 'dislike'),
(2, NULL, NULL, 1, 'like'),
(3, NULL, NULL, 1, 'like'),
(4, NULL, NULL, 1, 'like'),
(5, NULL, NULL, 2, 'like'),
(6, NULL, NULL, 2, 'dislike');

-- Images
INSERT INTO Post_Images (post_id, filename, sort_order) VALUES 
(2, 'lake_mountain.jpg', 0),
(2, 'lake_house.jpg', 1),
(5, 'valley_waterfall.jpg', 0),
(6, 'observatory_moped.jpg', 0),
(8, 'oak_tree_view.jpg', 0);