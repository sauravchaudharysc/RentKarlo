# Backend API Endpoints

## Authentication and User Management
- **GET `/`**: Welcome message (requires authentication).  
- **POST `/pre-register`**: Initiate pre-registration(email).  
- **POST `/register`**: Complete user registration.  
- **POST `/login`**: User login and token generation.  
- **POST `/forgot-password`**: Send password reset link or OTP.  
- **POST `/reset-password`**: Reset user password.  
- **GET `/refresh-token`**: Generate a new authentication token.  
- **GET `/current-user`**: Get details of the authenticated user (requires authentication).  

## Profile Management
- **GET `/profile/:username`**: Fetch public profile by username.  
- **PUT `/update-password`**: Update password (requires authentication).  
- **PUT `/update-profile`**: Update profile details (requires authentication).  

