# Authentication Setup Guide

This document provides detailed instructions for setting up authentication in your School Management System.

## JWT Secret Setup

A secure JWT secret is essential for NextAuth.js to properly sign and verify authentication tokens. This secret should be:

- Random
- Complex
- Not shared publicly
- Different between development and production environments

### Setting Up Your JWT Secret

1. Create a `.env` file in the root of your project (if it doesn't exist already)

2. Add a strong `NEXTAUTH_SECRET` value to your `.env` file:

```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-string-here"
```

### Generating a Secure Secret

For production environments, it's important to use a cryptographically secure random string. Here are ways to generate one:

#### Using OpenSSL (Recommended)

```bash
openssl rand -base64 32
```

#### Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment-Specific Configuration

It's recommended to use different environments for development and production:

1. Create `.env.development` and `.env.production` files
2. Set different secrets for each environment:

```
# .env.development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-do-not-use-in-production"

# .env.production
NEXTAUTH_URL="https://your-production-url.com"
NEXTAUTH_SECRET="your-secure-production-secret"
```

## Complete Environment Variables

Here's a complete example of what your `.env` file should contain:

```
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-string-here"

# Email Provider (for password resets - optional)
# EMAIL_SERVER_USER=
# EMAIL_SERVER_PASSWORD=
# EMAIL_SERVER_HOST=
# EMAIL_SERVER_PORT=
# EMAIL_FROM=
```

## Testing Authentication

After setting up your JWT secret, you can test the authentication system:

1. Start your development server
2. Navigate to the login page
3. Try to log in with the demo credentials:
   - Admin: admin@edusync.com / password
   - Teacher: teacher@edusync.com / password
   - Student: student@edusync.com / password

## Troubleshooting

If you encounter issues with authentication:

1. **JWT Verification Errors**: Make sure your `NEXTAUTH_SECRET` is properly set in your environment variables
2. **Redirection Issues**: Verify that `NEXTAUTH_URL` is correctly set to your application's base URL
3. **Token Expiration**: The default token expiration is 30 days. You can modify this in your NextAuth configuration

## Security Best Practices

1. **Never commit your .env file** to version control
2. **Rotate secrets** periodically in production environments
3. **Use different secrets** for development and production
4. **Implement rate limiting** to prevent brute force attacks
5. **Set appropriate cookie security options** for production (secure: true, httpOnly: true)

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/configuration/options)
- [JSON Web Tokens Introduction](https://jwt.io/introduction)
- [OWASP Authentication Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
