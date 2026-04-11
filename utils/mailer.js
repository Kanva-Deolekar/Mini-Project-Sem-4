import nodemailer from 'nodemailer';

const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : smtpPort === 465;

let transporterPromise;

const createTransporter = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are missing. Set EMAIL_USER and EMAIL_PASS.');
    }

    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        host: process.env.SMTP_HOST || undefined,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000
    });

    await transporter.verify();
    return transporter;
};

const getTransporter = async () => {
    if (!transporterPromise) {
        transporterPromise = createTransporter().catch((error) => {
            transporterPromise = null;
            throw error;
        });
    }

    return transporterPromise;
};

export const sendMail = async (mailOptions) => {
    const transporter = await getTransporter();
    return transporter.sendMail(mailOptions);
};

export const buildAppUrl = (path = '/') => {
    const baseUrl = (process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000').replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
};
