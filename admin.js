const bcrypt = require('bcrypt');
const User = require('./models/User'); 

const setupAdminPanel = async (app) => {
    // 1. Use dynamic import to load AdminJS and its dependencies
    const { default: AdminJS } = await import('adminjs');
    const AdminJSExpress = await import('@adminjs/express');
    const { Adapter, Database, Resource } = await import('@adminjs/sql');

    // 2. Register the AdminJS adapter for SQL databases
    AdminJS.registerAdapter({ Database, Resource });

    // 3. Initialize the database connection using the Adapter
    const db = await new Adapter('mysql', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }).init();

    // 4. Initialize the AdminJS instance
    const admin = new AdminJS({
        databases: [db],
        rootPath: '/admin',
        branding: {
            companyName: 'GeoChill Admin',
            softwareBrothers: false // Hides the AdminJS logo
        }
    });

    // 5. Create an authenticated router
    const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
        authenticate: async (email, password) => {
            const user = await User.findByEmail(email);
            
            if (user && user.role === 'admin') {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) return user;
            }
            return false;
        },
        cookiePassword: process.env.JWT_SECRET || 'some-super-secret-cookie-password',
    });

    // 6. Mount the router on our Express application
    app.use(admin.options.rootPath, router);
    
    console.log(`AdminJS dashboard started on http://localhost:${process.env.PORT || 3000}/admin`);
};

module.exports = setupAdminPanel;