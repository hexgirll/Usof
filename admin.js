const bcrypt = require('bcrypt');
const User = require('./models/User'); 

const setupAdminPanel = async (app) => {
    const { default: AdminJS } = await import('adminjs');
    const AdminJSExpress = await import('@adminjs/express');
    const { Adapter, Database, Resource } = await import('@adminjs/sql');

    AdminJS.registerAdapter({ Database, Resource });

    const db = await new Adapter('mysql', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }).init();

    const admin = new AdminJS({
        databases: [db],
        rootPath: '/admin',
        branding: {
            companyName: 'GeoChill Admin',
            softwareBrothers: false // Hides the AdminJS logo
        }
    });

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

    app.use(admin.options.rootPath, router);
    
    console.log(`AdminJS dashboard started on http://localhost:${process.env.PORT || 3000}/admin`);
};

module.exports = setupAdminPanel;