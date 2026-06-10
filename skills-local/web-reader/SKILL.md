# Web Reader Skill

## Context

Use this skill when the user needs to scrape web pages, extract article content, retrieve page metadata, or build applications that process web content.

**Trigger phrases:** "read web page," "extract content from URL," "scrape website," "fetch article," "get page metadata"

---

## Instructions

### Step 1: Use the z-ai-web-dev-sdk

The SDK is already installed. Use the `page_reader` function:

```javascript
import ZAI from 'z-ai-web-dev-sdk';

async function readWebPage(url) {
  const zai = await ZAI.create();
  const result = await zai.functions.invoke('page_reader', {
    url: url
  });
  
  return {
    title: result.data.title,
    html: result.data.html,
    text: result.data.text,
    publishTime: result.data.publishTime,
    url: result.data.url
  };
}
```

### Step 2: Handle Response

The response includes:
- `title`: Page title
- `html`: Main content HTML
- `text`: Plain text content
- `publish_time`: Publication timestamp (if available)
- `url`: Original URL

### Step 3: Save Results

Save outputs to `/home/hive/workspace/` directory:

```javascript
import fs from 'fs';

const pageData = await readWebPage('https://example.com/article');
fs.writeFileSync('/home/hive/workspace/page-content.json', JSON.stringify(pageData, null, 2));
```

### Step 4: CLI Usage

For simple tasks, use the CLI:

```bash
z-ai function -n page_reader -a '{"url": "https://example.com"}' -o output.json
```

---

## Constraints

- NEVER use z-ai-web-dev-sdk in client-side code — backend only
- NEVER expose SDK credentials in client-side code
- ALWAYS validate URLs before processing
- ALWAYS implement rate limiting for multiple requests
- ALWAYS respect website terms of service and robots.txt

---

## Examples

### Example 1: Extract Article Content
```javascript
const article = await readWebPage('https://techblog.com/ai-trends');
console.log('Title:', article.title);
console.log('Word count:', article.text.split(/\s+/).length);
```

### Example 2: Batch Processing
```javascript
const urls = ['https://site.com/1', 'https://site.com/2', 'https://site.com/3'];
const results = [];

for (const url of urls) {
  const data = await readWebPage(url);
  results.push({ url, title: data.title, date: data.publishTime });
}

fs.writeFileSync('/home/hive/workspace/batch-results.json', JSON.stringify(results, null, 2));
```

### Example 3: Site Crawler Pattern
```javascript
class SiteCrawler {
  async crawl(seedUrl, maxPages = 50) {
    const zai = await ZAI.create();
    const queue = [seedUrl];
    const visited = new Set();
    const results = [];
    
    while (queue.length > 0 && results.length < maxPages) {
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);
      
      const result = await zai.functions.invoke('page_reader', { url });
      results.push({ url, ...result.data });
      
      // Extract links from HTML and add to queue
      // (basic regex pattern: /href="(https?:\/\/[^"]+)"/g)
    }
    
    return results;
  }
}
```