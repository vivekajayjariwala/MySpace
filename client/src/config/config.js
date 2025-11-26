const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            events: '/api/events'
        }
    },
    mapboxToken: process.env.MAPBOX_TOKEN
};

export default config;
