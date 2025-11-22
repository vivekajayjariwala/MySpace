const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            events: '/api/events'
        }
    },
    mapboxToken: "pk.eyJ1Ijoidml2ZWtqYXJpd2FsYXdlc3Rlcm4iLCJhIjoiY21pOXg2cXQ4MHIyMTJsb2c5N2hlOWdwaSJ9.yrWeJXJKMZQaSnfOq0XAqw"
};

export default config;
