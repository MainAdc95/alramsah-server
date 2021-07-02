require("dotenv").config();

const port = process.env.PORT || 5000;

const Config = {
    port,
    isProduction: process.env.NODE_ENV === "production",
    clientDomain:
        process.env.NODE_ENV === "production"
            ? "https://alramsah.com"
            : `http://localhost:3000`,
    domain:
        process.env.NODE_ENV === "production"
            ? "https://alramsah.com/api"
            : `http://localhost:${port}/api`,
    jwtSecret: process.env.JWT_SECRET || "alskdjf10293nlkajndhflsdfgkj12",
    aws: {
        bucketName: process.env.BUCKET_NAME || "alramsah",
        iamKey: process.env.IAM_KEY,
        iamSecret: process.env.IAM_SECRET,
    },
    db: {
        main: {
            host: process.env.DB_MAIN_HOST,
            port: process.env.DB_MAIN_PORT || 5432,
            user: process.env.DB_MAIN_USER,
            password: process.env.DB_MAIN_PASSWORD,
            database: process.env.DB_MAIN_DATABASE,
        },
        user: {
            host: process.env.DB_USER_HOST,
            port: process.env.DB_USER_PORT || 5432,
            user: process.env.DB_USER_USER,
            password: process.env.DB_USER_PASSWORD,
            database: process.env.DB_USER_DATABASE,
        },
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: 465,
        secure: true,
        backupEmail: "info@alramsah.com",
        noreply: {
            email: process.env.NOREPLY_EMAIL,
            password: process.env.NOREPLY_PASS,
        },
        contact: {
            email: process.env.CONTACT_EMAIL,
            password: process.env.CONTACT_PASS,
        },
        info: {
            email: process.env.INFO_EMAIL,
            password: process.env.INFO_PASS,
        },
    },
    // stripe: {
    //     sk: process.env.STRIPE_SECRET_KEY,
    //     pk: process.env.STRIPE_PUBLIC_KEY,
    // },
};

export default Config;
