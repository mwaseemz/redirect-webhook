/**
 * Netlify Function: Redirect with Webhook
 * 
 * This function fires a webhook to Make.com and then redirects the user.
 * The webhook is fired with a timeout to ensure it doesn't delay too long.
 */

exports.handler = async (event, context) => {
  // Log incoming request
  console.log('Incoming request:', event.queryStringParameters);

  // Extract all query parameters
  const params = event.queryStringParameters || {};
  const { email = '', doc, utm_source, utm_medium, utm_campaign, utm_term, utm_content, source, ...otherParams } = params;

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

  // Prepare tracking data
  const trackingData = {
    email,
    doc,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    source,
    ...otherParams // Include any other custom parameters
  };

  // Fire webhook to Make.com with a timeout (max 2 seconds)
  await fireWebhookWithTimeout(trackingData, 2000);

  // Return redirect response
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
 * Fire webhook to Make.com with a timeout
 * This ensures the webhook fires but doesn't block the redirect too long
 */
async function fireWebhookWithTimeout(trackingData, timeoutMs) {
  const webhookUrl = 'https://hook.us2.make.com/fyc2fc2428n1xvxt5o7ywdts6a7xuly5';
  
  // Build payload with all tracking data and timestamp
  const payload = {
    ...trackingData,
    timestamp: new Date().toISOString()
  };

  console.log('Firing webhook with payload:', payload);

  // Create webhook promise
  const webhookPromise = fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (response.ok) {
        console.log('Webhook fired successfully:', response.status);
        return true;
      } else {
        console.error('Webhook failed with status:', response.status);
        return false;
      }
    })
    .catch(error => {
      console.error('Webhook error:', error.message);
      return false;
    });

  // Create timeout promise
  const timeoutPromise = new Promise(resolve => 
    setTimeout(() => {
      console.log('Webhook timeout reached, proceeding with redirect');
      resolve(false);
    }, timeoutMs)
  );

  // Race between webhook and timeout
  await Promise.race([webhookPromise, timeoutPromise]);
}

