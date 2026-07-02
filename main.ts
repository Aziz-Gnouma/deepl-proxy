Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Only POST allowed', { status: 405 });
  }

  const proxySecret = req.headers.get('X-Proxy-Secret');
  if (proxySecret !== Deno.env.get('PROXY_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${Deno.env.get('DEEPL_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
     text: [body.text],
      source_lang: body.source_lang,
      target_lang: body.target_lang
    })
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
});
