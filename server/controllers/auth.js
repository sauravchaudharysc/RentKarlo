import * as config from '../config.js';

export const welcome = (req, res) => {
    res.json({
        message: 'Chalo Aab Sab Rent Karo'
    });
};

export const preRegister = async (req, res) => {
    try{
        /*
            On Pre-Registration, we will send an email to the user with a link to complete the registration.
            The link will contain a token that will be used to verify the user.
            The link will land them to a page where email and password will be extracted from the token and then user will be registered.
        */
        config.SES_CLIENT.sendEmail({
            Source: config.EMAIL_FROM,
            Destination: {
                ToAddresses: [req.body.email]
            },
            Message: {
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Complete your registration'
                },
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `
                            <html>
                                <head></head>
                                <body>
                                    <h1>Click on the link below to complete your registration</h1>
                                    <p>/register/${req.body.email}</p>
                                </body>
                            </html>
                        `
                    }
                }
            }
        }, (err, data) => {
            if(err){
                return res.json({error: "Something went wrong"});
            }else{
                console.log(data);
                return res.json({message: "Email Sent"});
            }
        });
    }catch(err){
        console.log(err);
        return res.json({error: "Something went wrong"});
    }
};