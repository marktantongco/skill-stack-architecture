// Verification script — checks rendered HTML for SEO/GEO elements
const fs = require('fs');

const html = fs.readFileSync('.next/server/app/index.html', 'utf8');

// 1. Per-section hreflang alternates
const hreflangRegex = /<link rel="alternate" hreflang="en" href="[^"]+"/g;
const hreflangMatches = [...html.matchAll(hreflangRegex)];
console.log('── Per-section hreflang alternates ──');
hreflangMatches.forEach(m => console.log('  ' + m[0]));

// 2. Verification meta tags
console.log('\n── Verification meta tags ──');
const gsc = html.match(/<meta name="google-site-verification" content="[^"]+"/);
const bing = html.match(/<meta name="msvalidate\.01" content="[^"]+"/);
console.log('  GSC:  ' + (gsc ? gsc[0] : 'NOT FOUND'));
console.log('  Bing: ' + (bing ? bing[0] : 'NOT FOUND'));

// 3. JSON-LD WebPage entries (per-section)
console.log('\n── JSON-LD per-section WebPage entities ──');
const webPageRegex = /"@type":"WebPage","@id":"[^"]+#[a-z]+"/g;
const webPageMatches = [...html.matchAll(webPageRegex)];
console.log('  WebPage entries found: ' + webPageMatches.length);
webPageMatches.forEach(m => console.log('    ' + m[0]));

// 4. Canonical
console.log('\n── Canonical ──');
const canonical = html.match(/<link rel="canonical" href="[^"]+"/);
console.log('  ' + (canonical ? canonical[0] : 'NOT FOUND'));

// 5. Other key SEO tags
console.log('\n── Other key SEO tags ──');
const og = html.match(/<meta property="og:url" content="[^"]+"/);
const twitter = html.match(/<meta name="twitter:card" content="[^"]+"/);
const robots = html.match(/<meta name="robots" content="[^"]+"/);
console.log('  OG URL:    ' + (og ? og[0] : 'NOT FOUND'));
console.log('  Twitter:   ' + (twitter ? twitter[0] : 'NOT FOUND'));
console.log('  Robots:    ' + (robots ? robots[0] : 'NOT FOUND'));

// 6. AI meta tags
console.log('\n── GEO AI meta tags ──');
const aiCitable = html.match(/<meta name="ai:citable" content="[^"]+"/);
const aiSummary = html.match(/<meta name="ai:summary" content="[^"]+"/);
const aiTopic = html.match(/<meta name="ai:primary_topic" content="[^"]+"/);
const aiEntities = html.match(/<meta name="ai:entities" content="[^"]+"/);
console.log('  ' + (aiCitable ? aiCitable[0] : 'NOT FOUND'));
console.log('  ' + (aiSummary ? aiSummary[0] : 'NOT FOUND'));
console.log('  ' + (aiTopic ? aiTopic[0] : 'NOT FOUND'));
console.log('  ' + (aiEntities ? aiEntities[0] : 'NOT FOUND'));
