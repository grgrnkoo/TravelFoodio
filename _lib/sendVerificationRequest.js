import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_MAIL);

export async function sendVerificationRequest(params) {
    const { identifier, url, provider } = params;
    const { host } = new URL(url);

    try {
        console.log('Identifier: ', identifier, 'URL: ', url, 'Provider: ', provider);
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: identifier,
            subject: `Login to ${host}`,
            text: text({ url, host })
        })
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Error sending email: ', error).message;
    }
}

function text({url, host}) {
    return `Sign in to ${host}\n${url}\n\n`
}