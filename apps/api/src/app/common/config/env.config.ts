module.exports = {
    port: 3333,
    appEndpoint: "http://localhost:3333",
    apiEndpoint: "http://localhost:3333",
    jwt_secret: "myS33!!creeeT",
    jwt_expiration_in_seconds: 36000,
    environment: "dev",
    permissionLevels: {
        NORMAL_USER: 1,
        PAID_USER: 4,
        ADMIN: 2048,
    },
};
