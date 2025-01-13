import { Resend } from "resend";

export async function sendVerificationRequest({ identifier, provider }) {
    const resend = new Resend(process.env.RESEND_MAIL);
    const { signinUrl } = provider;
    const host = new URL(signinUrl).host;


    try {
        if (!identifier) {
            throw new Error("Missing recipient email address (`to` field).");
        }

        console.log('Email: ', identifier);

        const data = await resend.emails.send({
            from: 'hello@foodsm.art',
            to: identifier,
            subject: `Login to ${host}`,
            text: text({ signinUrl, host })
        })
        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error('Error while sending email:', error);
        throw new Error(error.message);
    };
}

function text({ signinUrl, host }) {
    return `Sign in to ${host}\n${signinUrl}\n\n`
}