Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Only POST allowed', {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.apiKey || !body.text || !body.target_lang) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: apiKey, text, target_lang' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Prepare DeepL request body
    const deeplBody: any = {
      text: Array.isArray(body.text) ? body.text : [body.text],
      target_lang: body.target_lang,
    };

    // Add source_lang if provided
    if (body.source_lang) {
      deeplBody.source_lang = body.source_lang;
    }

    // Call DeepL API
    const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deeplBody),
    });

    const data = await deeplResponse.json();

    return new Response(JSON.stringify(data), {
      status: deeplResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
