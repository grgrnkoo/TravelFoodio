import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_MAIL);

interface SendVerificationRequestParams {
    identifier: string;
    url: string;
    provider: {
        server?: {
            host?: string;
            port?: number;
            auth?: {
                user?: string;
                pass?: string;
            };
        };
        from?: string;
    };
}

export async function sendVerificationRequest(params: SendVerificationRequestParams): Promise<void> {
    const { identifier, url, provider } = params;
    const { host } = new URL(url);
    console.log('Identifier: ', identifier);

    const emailPayload = {
        from: process.env.EMAIL_FROM as string,
        to: identifier,
        subject: `Login to ${host}`,
        text: text({ url, host }),
    };

    try {
        const data = await resend.emails.send(emailPayload);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error sending email: ', message);
        throw new Error('Error sending email: ' + message);
    }
}

function text({ url, host }: { url: string; host: string }): string {
    return `Sign in to ${host}\n${url}\n\n`;
}
