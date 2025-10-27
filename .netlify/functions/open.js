/**
 * Netlify Function: Redirect with Webhook
 * 
 * This function fires a webhook to Make.com and immediately redirects the user.
 * The webhook is fire-and-forget (non-blocking).
 */

exports.handler = async (event, context) => {
  // Log incoming request
  console.log('Incoming request:', event.queryStringParameters);

  // Extract query parameters
  const { email = '', doc } = event.queryStringParameters || {};

  // Validate required doc parameter
  if (!doc) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing doc parameter' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  // Fire webhook to Make.com (asynchronously, non-blocking)
  fireWebhook(email, doc);

  // Immediately return redirect response
  return {
    statusCode: 302,
    headers: {
      'Location': doc,
      'Cache-Control': 'no-cache'
    },
    body: ''
  };
};

/**
 * Fire webhook to Make.com (fire-and-forget)
 * This function intentionally doesn't use await to avoid blocking the redirect
 */
function fireWebhook(email, doc) {
  const webhookUrl = 'https://hook.us2.make.com/lykie2r6pvzbig8sb994g8vliud9uhvm';
  
  const payload = {
    email: email,
    doc: doc,
    timestamp: new Date().toISOString()
  };

  // Fire webhook without awaiting (fire-and-forget)
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (response.ok) {
        console.log('Webhook fired successfully:', payload);
      } else {
        console.error('Webhook failed with status:', response.status);
      }
    })
    .catch(error => {
      // Log error but don't block the redirect
      console.error('Webhook error (non-blocking):', error.message);
    });
}

