const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');
        
        const dbSql = fs.readFileSync(path.join(__dirname, 'db', 'db.sql'), 'utf8');
        const seedSql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');

        // Create tables and schema
        console.log('Applying db.sql (Creating tables)...');
        await db.query(dbSql);

        // Create triggers for rating calculation
        console.log('Creating triggers for rating calculation...');
        
        await db.query(`
            CREATE TRIGGER after_like_insert
            AFTER INSERT ON Likes
            FOR EACH ROW
            BEGIN
                DECLARE target_user INT;
                IF NEW.post_id IS NOT NULL THEN
                    SELECT author_id INTO target_user FROM Posts WHERE id = NEW.post_id;
                ELSEIF NEW.comment_id IS NOT NULL THEN
                    SELECT author_id INTO target_user FROM Comments WHERE id = NEW.comment_id;
                END IF;
                
                IF NEW.type = 'like' THEN
                    UPDATE Users SET rating = rating + 1 WHERE id = target_user;
                ELSE
                    UPDATE Users SET rating = rating - 1 WHERE id = target_user;
                END IF;
            END;
        `);

        await db.query(`
            CREATE TRIGGER after_like_delete
            AFTER DELETE ON Likes
            FOR EACH ROW
            BEGIN
                DECLARE target_user INT;
                IF OLD.post_id IS NOT NULL THEN
                    SELECT author_id INTO target_user FROM Posts WHERE id = OLD.post_id;
                ELSEIF OLD.comment_id IS NOT NULL THEN
                    SELECT author_id INTO target_user FROM Comments WHERE id = OLD.comment_id;
                END IF;
                
                IF OLD.type = 'like' THEN
                    UPDATE Users SET rating = rating - 1 WHERE id = target_user;
                ELSE
                    UPDATE Users SET rating = rating + 1 WHERE id = target_user;
                END IF;
            END;
        `);

        await db.query(`
            CREATE TRIGGER after_like_update
            AFTER UPDATE ON Likes
            FOR EACH ROW
            BEGIN
                DECLARE target_user INT;
                IF NEW.post_id IS NOT NULL THEN
                    SELECT author_id INTO target_user FROM Posts WHERE id = NEW.post_id;
                ELSEIF NEW.comment_id IS NOT NULL THEN
                    SELECT author_id INTO target_user FROM Comments WHERE id = NEW.comment_id;
                END IF;
                
                IF OLD.type != NEW.type THEN
                    IF NEW.type = 'like' THEN
                        UPDATE Users SET rating = rating + 2 WHERE id = target_user;
                    ELSE
                        UPDATE Users SET rating = rating - 2 WHERE id = target_user;
                    END IF;
                END IF;
            END;
        `);

        // Seed the database with initial data
        console.log('Applying seed.sql (Inserting test data)...');
        await db.query(seedSql);

        console.log('Database initialized and seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();