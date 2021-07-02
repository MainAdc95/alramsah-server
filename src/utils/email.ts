import nodemailer, { SentMessageInfo } from "nodemailer";
import Config from "../config";

type EmailType = "contact" | "noreply";

const contactUsEmail = nodemailer.createTransport({
    host: Config.email.host,
    port: Config.email.port,
    secure: Config.email.secure,
    auth: {
        user: Config.email.contact.email,
        pass: Config.email.contact.password,
    },
});

const noreplyEmail = nodemailer.createTransport({
    host: Config.email.host,
    port: Config.email.port,
    secure: Config.email.secure,
    auth: {
        user: Config.email.noreply.email,
        pass: Config.email.noreply.password,
    },
});

const getEmailTransport = (type: EmailType) => {
    switch (type) {
        case "contact":
            return contactUsEmail;
        case "noreply":
            return noreplyEmail;
        default:
            return null;
    }
};

export async function sendAsyncEmail(
    type: EmailType,
    html: string,
    subject: string,
    to?: string | undefined
): Promise<SentMessageInfo> {
    return new Promise(async (resolve, reject) => {
        try {
            let info: SentMessageInfo | undefined;

            info = await getEmailTransport(type)?.sendMail({
                to: to || Config.email.info.email,
                from: Config.email[type].email || Config.email.backupEmail,
                subject,
                html,
            });

            return resolve(info);
        } catch (err) {
            return reject(err);
        }
    });
}

export function sendSyncEmail(
    type: EmailType,
    subject: string,
    html: string,
    to?: string | undefined
) {
    getEmailTransport(type)?.sendMail(
        {
            from: Config.email[type].email || Config.email.backupEmail,
            to: to || Config.email[type].email,
            subject,
            html,
        },
        (err, success) => {}
    );
}
