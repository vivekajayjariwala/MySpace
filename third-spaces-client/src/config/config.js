const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            events: '/api/events'
        }
    }
};

export default config;
