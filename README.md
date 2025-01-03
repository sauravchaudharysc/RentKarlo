# RentKarlo
A Full-Stack MERN (MongoDB, Express.js, React, Node.js) application designed to streamline rental business management.

The platform supports two primary user roles:

1. Hosts: Users can list properties (houses, flats, or other accommodations) for rent, providing details like availability, pricing, and rental terms.

2. Renters: Users can explore listed properties and book them for flexible durations—daily, monthly, or yearly.
This application ensures a seamless experience for property owners and renters, simplifying property management and bookings.

# Server Setup Guide

## Prerequisites
1. Ensure Node.js is installed on your system. You can download the latest version from [Node.js Official Website](https://nodejs.org/).
2. Install a code editor like Visual Studio Code for easy project management.

## Initializing a Node.js Project
Follow these steps to initialize a new Node.js project:

1. **Download Node.js**
   - Visit the [Node.js Official Website](https://nodejs.org/) and download the latest version.

2. **Initialize the Project**
   - Open a terminal and navigate to the desired project directory.
   - Run the following command to initialize a new Node.js project:
     ```bash
     npm init -y
     ```
   - This will create a `package.json` file with default configurations.

3. **Install Required Dependencies**
   - Run the following command to install essential packages:
     ```bash
     npm install express nodemon morgan mongoose jsonwebtoken bcrypt nanoid cors email-validator slugify node-geocoder
     ```

4. **Update package.json**
   - Add a script to run the server with `nodemon`:
     ```json
     "scripts": {
         "start": "nodemon server.js"
     }
     ```

## Creating a Node.js Server

Follow these steps to create a simple Node.js server:
1. **Create a Server File**
   - Create a file named `server.js` in the root directory of your project.
   - Use the following basic template to set up your server:
     ```javascript
     import express from 'express';
     import authRoutes from './routes/auth.js';

     const app = express();

     // Middleware
     app.use(express.json());

     // Define Routes
     app.use('/api', authRoutes);

     // Start Server
     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => {
         console.log(`Server running on port ${PORT}`);
     });
     ```

2. **Setup Middleware and Routes**
   - Middleware allows handling of HTTP requests before reaching the routes.
   - Example structure:
     - `server.js` -> Routes (e.g., `authRoutes`) -> Controller (handles business logic).
   - To add a route:
     - Create a directory named `routes`.
     - Add a file `auth.js` in the `routes` directory.
     - Example `auth.js`:
       ```javascript
       import *  as auth from '../controllers/auth.js';
       const router = express.Router();
       router.get('/',auth.welcome);
       router.post('/pre-register',auth.preRegister);
       export default router;
       ```

3. **Setup Models**
   - Create a directory named `models`.
   - Add a file `auth.js` in the `models` directory.
   - Example `auth.js`:
     ```javascript
        import e from 'express';
        import { model,Schema, ObjectId } from 'mongoose';
        import mongoose from 'mongoose';

        const authSchema = new Schema({
            username: { type: String, required: true },
            password: { type: String, required: true },
        });
        
        export default model('User',authSchema);;
     ```
     
## Notes
- Use `nodemon` during development for automatic server restarts:
  ```bash
  npm start
  ```
- Structure your project for scalability by organizing controllers, models, and routes.

## Example Directory Structure
```
project-name
├── server.js
├── package.json
├── routes
│   ├── auth.js
├── models
│   ├── auth.js
├── controllers
│   ├── authController.js
```


# AWS SES Setup Guide

## Steps to Configure AWS SES

1. **Sign Up/Login to AWS Console**
   - Go to the [AWS Console](https://aws.amazon.com/console/).
   - Sign up for a new account or log in to an existing account.
   - If creating a new account, log out after setup. (Skip this step for existing users.)

2. **Login as Root User**
   - Log in to the AWS Console using the root user credentials.

3. **Create an IAM User**
   - Navigate to **Services > IAM > Users**, then click **Add Users**.
   - Create a user and assign them to a group with the necessary permissions.

4. **Setup IAM Group**
   - Create a group and attach the appropriate policy for SES access (e.g., `AmazonSESFullAccess`).

5. **Save Credentials**
   - Copy the **Access Key ID** and **Secret Access Key** of the IAM user for future use.

6. **Configure Amazon SES**
   - Open [Amazon SES](https://eu-north-1.console.aws.amazon.com/ses).
   - Add the email identity required for sending and receiving emails.
   - Required In **Sandbox Mode**, can send mail to only verified email addresses for testing.
   - For **Production Mode**, you can send emails to any address.

You are now ready to use Amazon SES for sending and receiving emails.

# How to send email using amazon ses ?

## Prerequisites

- An AWS account
- AWS SES configured and verified email addresses/domains
- Node.js installed on your system

## Installation

Install the required AWS SDK package:

```bash
npm install aws-sdk
```

## Configuration

1. Add this in `config.js ` file :

```javascript
const AWS = require('aws-sdk');

const SES_CONFIG = {
  apiVersion: '2010-12-01',
  accessKeyId: '<YOUR_AWS_ACCESS_KEY_ID>',
  secretAccessKey: '<YOUR_AWS_SECRET_ACCESS_KEY>',
  region: '<YOUR_AWS_REGION>'
};

const SES_CLIENT = new AWS.SES(SES_CONFIG);

module.exports = SES_CLIENT;
```

2. Replace the placeholder values with your actual AWS credentials:
   - `<YOUR_AWS_ACCESS_KEY_ID>`: Your AWS access key
   - `<YOUR_AWS_SECRET_ACCESS_KEY>`: Your AWS secret access key
   - `<YOUR_AWS_REGION>`: Your AWS region (e.g., 'eu-north-1')

## Usage

### Basic Email Sending

```javascript
import * as config from '../config.js';

config.SES_CLIENT.sendEmail({
   Source: config.EMAIL_FROM,
   Destination: {
         ToAddresses: [req.body.email]
   },
   Message: {
         Subject: {
         },
         Body: {
            Html: {
               Data: `
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
```

### Advanced Features

#### Sending to Multiple Recipients

```javascript
const params = {
  Source: 'sender@yourdomain.com',
  Destination: {
    ToAddresses: ['recipient1@example.com', 'recipient2@example.com'],
    CcAddresses: ['cc@example.com'],
    BccAddresses: ['bcc@example.com']
  },
  // ... rest of the email configuration
};
```

# How to protect routes from not logged-in users ?
Routes are protected using a middleware that validates user authentication. Tokens are passed in request headers and are verified to confirm if the user is logged in.

Tokens are created using user_id. Middleware extracts and verifies the token from request headers. Extract User Information. Once verified, the middleware extracts relevant user information associated with the user_id.

