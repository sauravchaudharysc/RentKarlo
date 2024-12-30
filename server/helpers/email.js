import * as config from '../config.js';

const style = `
    background: #eee;
    padding: 20px;
    border-radius: 20px;
`;

export const emailTemplate = (email, subject, body, replyto) => {
    return {
        Source: config.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            },
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <div style="${style}">
                                <h1> Welcome to Rent Garum App</h1>
                                ${body}
                                <p>&copy; ${new Date().getFullYear()} Rent Garum. All rights reserved.</p>
                            </div>        
                        </html>
                    `,
                },
            },
        },
    };
};