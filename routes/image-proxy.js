import express from 'express';
import { Readable } from 'stream';

const router = express.Router();

const PASSTHROUGH_HEADERS = [
  'content-type',
  'content-encoding',
  'cache-control',
  'etag',
  'last-modified',
  'accept-ranges',
  'content-length',
  'vary',
  'date',
  'age',
];

const FORWARD_HEADERS = [
  'range',
  'if-match',
  'if-none-match',
  'if-modified-since',
  'if-unmodified-since',
  'accept',
  'accept-encoding',
  'accept-language',
];

// please replace with the correct referer
const MANGA_REFERER = 'https://harimanga.me/';

router.get('/', async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const allowedHosts = ['h1.manimg24.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).send('Forbidden host');
    }

    const fetchHeaders = {
      Referer: MANGA_REFERER,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    };

    FORWARD_HEADERS.forEach(header => {
      const value = req.headers[header.toLowerCase()];
      if (typeof value === 'string') {
        fetchHeaders[header] = value;
      }
    });

    const response = await fetch(imageUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok && response.status !== 304) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    PASSTHROUGH_HEADERS.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Range, If-Modified-Since, If-None-Match'
    );
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Range, Accept-Ranges'
    );

    if (!res.getHeader('Cache-Control')) {
      res.setHeader(
        'Cache-Control',
        'public, max-age=86400, stale-while-revalidate=604800'
      );
    }

    if (response.status === 304) {
      return res.status(304).end();
    }

    const stream = Readable.fromWeb(response.body);
    stream.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
