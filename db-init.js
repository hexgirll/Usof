const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function ensureDatabaseInitialized() {
    try {
        console.log('Checking database status...');
        
        // Connect to MySQL server without selecting a specific database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        const dbName = process.env.DB_NAME || 'usof_backend';

        // Ensure database exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);

        // Check if Users table exists
        const [tables] = await connection.query(`SHOW TABLES LIKE 'Users';`);

        if (tables.length === 0) {
            console.log(`Database '${dbName}' is empty. Initializing schema and seed data...`);

            const dbSql = fs.readFileSync(path.join(__dirname, 'db', 'db.sql'), 'utf8');
            const seedSql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');

            // Create tables
            await connection.query(dbSql);

            // Create triggers for automatic user rating updates
            await connection.query('DROP TRIGGER IF EXISTS after_like_insert;');
            await connection.query('DROP TRIGGER IF EXISTS after_like_delete;');
            await connection.query('DROP TRIGGER IF EXISTS after_like_update;');

            await connection.query(`
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

            await connection.query(`
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

            await connection.query(`
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

            // Insert seed data
            await connection.query(seedSql);

            console.log('Database schema created and test data inserted successfully!');
        } else {
            console.log(`Database '${dbName}' is already initialized.`);
        }

        await connection.end();
    } catch (error) {
        console.error('Database auto-initialization error:', error);
        throw error;
    }
}

module.exports = ensureDatabaseInitialized;