# Netlify Redirect Webhook Function

A Netlify serverless function that fires a webhook to Make.com and immediately redirects users to a specified URL. Perfect for tracking link clicks while maintaining a seamless user experience.

## Features

- **Fire-and-forget webhook**: Sends data to Make.com without blocking the redirect
- **Instant redirect**: Users are redirected immediately (302 redirect)
- **Error handling**: Gracefully handles missing parameters and webhook failures
- **Production-ready**: Proper logging and edge case handling

## How It Works

1. User clicks a link like: `https://your-site.netlify.app/.netlify/functions/open?email=john@example.com&doc=https://gamma.app/docs/xyz123`
2. Function fires webhook to Make.com with email, doc URL, and timestamp
3. User is immediately redirected to the doc URL (Gamma, Google Docs, etc.)

## Setup Instructions

### 1. Configure Webhook URL

Before deploying, update the webhook URL in `.netlify/functions/open.js`:

```javascript
const webhookUrl = 'https://hook.make.com/YOUR_ACTUAL_WEBHOOK_ID';
```

Replace `YOUR_ACTUAL_WEBHOOK_ID` with your actual Make.com webhook ID.

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended)

1. Push this code to a GitHub repository
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account and select this repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (first time only)
netlify init

# Deploy to production
netlify deploy --prod
```

### 3. Get Your Function URL

After deployment, your function URL will be:

```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/open
```

You can find `YOUR-SITE-NAME` in:
- Netlify dashboard under "Site settings" → "General" → "Site details"
- Or use a custom domain if you've configured one

## Local Testing

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
# Start Netlify Dev server
npm run dev
```

Your function will be available at:
```
http://localhost:8888/.netlify/functions/open
```

### Test the Function

```bash
# Test with both parameters
curl -i "http://localhost:8888/.netlify/functions/open?email=test@example.com&doc=https://google.com"

# Test with missing email (should still work)
curl -i "http://localhost:8888/.netlify/functions/open?doc=https://google.com"

# Test with missing doc (should return 400 error)
curl -i "http://localhost:8888/.netlify/functions/open?email=test@example.com"
```

## Usage Examples

### Example 1: Full Parameters
```
https://my-redirect-tracker.netlify.app/.netlify/functions/open?email=john@example.com&doc=https://gamma.app/docs/abc123
```

**Result**: Webhook fires with email and doc, user redirects to Gamma doc

### Example 2: Missing Email
```
https://my-redirect-tracker.netlify.app/.netlify/functions/open?doc=https://docs.google.com/document/d/xyz
```

**Result**: Webhook fires with empty email, user redirects to Google Doc

### Example 3: Missing Doc
```
https://my-redirect-tracker.netlify.app/.netlify/functions/open?email=john@example.com
```

**Result**: Returns 400 error with message "Missing doc parameter"

## Webhook Payload

The webhook sends the following JSON payload to Make.com:

```json
{
  "email": "john@example.com",
  "doc": "https://gamma.app/docs/abc123",
  "timestamp": "2025-10-27T12:34:56.789Z"
}
```

## Error Handling

- **Missing `doc` parameter**: Returns 400 error (redirect cannot proceed)
- **Missing `email` parameter**: Sends empty string in webhook, redirect proceeds
- **Webhook failure**: Logged to console, redirect still proceeds (non-blocking)

## Monitoring

Check function logs in Netlify:
1. Go to your site in Netlify dashboard
2. Click "Functions" in the top menu
3. Click on "open" function
4. View real-time logs

## Environment Variables (Optional)

To avoid hardcoding the webhook URL, you can use environment variables:

1. In Netlify dashboard: Site settings → Environment variables
2. Add variable: `MAKE_WEBHOOK_URL` = `https://hook.make.com/YOUR_WEBHOOK_ID`
3. Update function code to use: `process.env.MAKE_WEBHOOK_URL`

## Troubleshooting

### Function returns 404
- Ensure you're using the correct path: `/.netlify/functions/open` (note the leading dot)
- Check that the function deployed successfully in Netlify dashboard

### Webhook not firing
- Check function logs in Netlify dashboard
- Verify webhook URL is correct in the code
- Test webhook URL directly with curl or Postman

### Redirect not working
- Ensure `doc` parameter contains a valid URL
- Check that URL is properly encoded if it contains special characters

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

