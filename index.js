function parseRange(encoded) {
  if (encoded === null) {
    return
  }

  const parts = encoded.split("bytes=")[1]?.split("-") ?? []
  if (parts.length !== 2) {
    throw new Error('Not supported to skip specifying the beginning/ending byte at this time')
  }

  return {
    offset: Number(parts[0]),
    length: Number(parts[1]) + 1 - Number(parts[0]),
  }
} 

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    switch (request.method) {
    
      case "GET":
        const range = parseRange(request.headers.get('range'))
       // const range = request.headers.get('range')
        const object = await env.BUCKET.get(key, {
          range,
          onlyIf : request.headers,
        })
        if (object === null) {
        return new Response("Object Not Found", { status: 404 });
      }
        const headers = new Headers()
       object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        const status = object.body ? (range ? 206 : 200) : 304
        return new Response(object.body, {
          headers,
          status
        })
     
      //  return new Response(object.body);

      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  }
};
