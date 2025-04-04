# Troubleshooting Guide

This document provides solutions for common issues you might encounter while using or developing the vehicle and driver management platform.

## Table of Contents
- [Authentication Issues](#authentication-issues)
- [Database Problems](#database-problems)
- [File Upload Issues](#file-upload-issues)
- [PDF Generation](#pdf-generation)
- [Localization Issues](#localization-issues)
- [Vehicle Registration](#vehicle-registration)
- [Common Error Messages](#common-error-messages)

## Authentication Issues

### Problem: Unable to Login
- Check if the username and password are correct
- Ensure the user account is not suspended
- Verify if the account is approved (for drivers)

### Problem: Session Expires Too Quickly
- Check if the `SESSION_SECRET` environment variable is properly set
- Verify PostgreSQL session store is working correctly
- Check if the server time is correctly synchronized

## Database Problems

### Problem: Database Connection Failed
1. Verify environment variables:
   ```
   DATABASE_URL
   PGUSER
   PGPASSWORD
   PGDATABASE
   PGHOST
   PGPORT
   ```
2. Check if Neon database is accessible
3. Verify network connectivity

### Problem: Migration Issues
- Run `npm run db:push` to update the schema
- Check if there are any pending migrations
- Verify schema changes in `shared/schema.ts`

## File Upload Issues

### Problem: Unable to Upload Images
1. Check if the uploads directory exists and has proper permissions
2. Verify file size limits (max 5MB per file)
3. Ensure supported file formats (JPG, PNG, WEBP)
4. Check Multer configuration in server routes

### Problem: Files Not Displaying
1. Verify file paths in the database
2. Check if files are properly saved in uploads directory
3. Ensure proper URL construction for file access

## PDF Generation

### Problem: PDF Not Generating
1. Check if weasyprint is properly installed
2. Verify Arabic font installation (Madani Arabic)
3. Check Python environment variables
4. Verify template access and permissions

### Problem: PDF Missing Data
1. Check if all required fields are passed to the template
2. Verify data formatting in the template
3. Check QR code generation

## Localization Issues

### Problem: Translations Not Working
1. Check if language files are properly loaded
2. Verify translation keys exist in all language files
3. Check if i18next is properly initialized
4. Verify language selection is working

### Problem: Arabic Text Rendering
1. Check if Arabic font is properly loaded
2. Verify text direction settings (RTL)
3. Check if Arabic translations are properly formatted

## Vehicle Registration

### Problem: Unable to Register Vehicle
1. Check if user is authenticated
2. Verify required fields are properly filled
3. Check file upload size and format
4. Verify company mapping exists for vehicle type

### Problem: Vehicle Not Appearing in List
1. Check if vehicle was properly saved in database
2. Verify query permissions
3. Check if vehicle is associated with correct driver

## Common Error Messages

### "Cannot find variable: insertUserSchema"
- Verify import statement in component file
- Check if schema file is properly exported
- Update shared schema definitions

### "Runtime Error: Rendered fewer hooks than expected"
- Check for conditional hook calls
- Verify hooks are called in the proper order
- Ensure hooks are not inside loops or conditions

### "Font-face 'Madani Arabic' cannot be loaded"
- Verify font installation
- Check font path in configuration
- Ensure font is accessible to weasyprint

## Development Tips

### Local Development
1. Use proper environment variables
2. Run database migrations when schema changes
3. Check console for error messages
4. Use browser developer tools for debugging

### Deployment
1. Verify all environment variables are set
2. Check database connection string
3. Verify file permissions
4. Test all major features after deployment

## Support

If you encounter issues not covered in this guide:
1. Check the application logs
2. Review server-side error messages
3. Check browser console for client-side errors
4. Contact the development team with specific error details

Remember to always provide:
- Exact error messages
- Steps to reproduce the issue
- Environment details (browser, OS)
- Screenshots if applicable

## Updating This Guide

This troubleshooting guide is a living document. If you encounter new issues:
1. Document the problem
2. Add steps to reproduce
3. Include the solution
4. Update the table of contents
