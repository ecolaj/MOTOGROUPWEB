import { StitchToolClient } from '@google/stitch-sdk';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const API_KEY = 'REMOVED_FOR_SECURITY';
const PROJECT_ID = '2594330217565024146';

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        downloadFile(res.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(outputPath, buffer);
        console.log(`  Downloaded: ${outputPath} (${buffer.length} bytes)`);
        resolve(buffer);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchWithNode(url) {
  const response = await fetch(url);
  return response.text();
}

async function main() {
  const outputDir = path.join(process.cwd(), 'stitch-export');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Screen data from previous export
  const screens = [
    {
      title: 'MotoGroup - Official Landing Page (Full)',
      screenId: '322fac2a40244888bce3f57508088700',
      htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NzRhMTAyMDBhODkwOTI1YzczY2JkMGIzMjhiEgsSBxCNjdGQ2wMYAZIBIwoKcHJvamVjdF9pZBIVQhMyNTk0MzMwMjE3NTY1MDI0MTQ2&filename=&opi=89354086',
      screenshotUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLuQMXwX-1hKsJqZh2IP9q9SvaiVqphCusBpIyP5deNicLEu2k_ozJtMndvttnN8JtOMpu2Hy3TIb6Ksn9-fErcJ7O4RBxEKUTRXXgrBpKxRIcz9hAE8aMleIx0-KrhmF-VxssuCjKCBUbSN0x7ELbqzwEt6-7fMrPpfVGtAejUCNCQAXqwgiqvtM-vQ6xtSDCN-7D7vmHrKQot455Ecno5VrXTjN3v3gGeC-LOeOZP7OIapcRUKFdiunsM',
      deviceType: 'DESKTOP',
      width: 2560,
      height: 9256
    },
    {
      title: 'MotoGroup Logo',
      screenId: 'df56e63a91ae4c7ab3656c4ad9b6574a',
      screenshotUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLsxr1PzAiUBv4GfN8x34d54vuFfAgcQKzT05PXrVM_1EU829j2y-GnjdLc82rhGVRlqXD0JofbX_RZrcFj8fQAIy435aQw5JANa3ULQ2fHNST-vhAfsgd9MEGAaI_wNJUknaAg5S_qLkJCrWxPi-i1X4sxwA1qHgolhOOR81dgaSCGkoQt7XvjRC5xBDackAY5XK3AHwXD_F14oi5cmOiWhLuTVF-t4ztVnQ1SV29xv4KOyF2o0YrH9I1w',
      width: 1024,
      height: 1024
    },
    {
      title: 'MotoGroup - Official Landing Page (1280)',
      screenId: '0b6c1c35a6ed474cb93d0607fdea1f39',
      htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NzRhNmMxNmVlNTcwMmE5YjFiYzhmMDJkMDUzEgsSBxCNjdGQ2wMYAZIBIwoKcHJvamVjdF9pZBIVQhMyNTk0MzMwMjE3NTY1MDI0MTQ2&filename=&opi=89354086',
      deviceType: 'DESKTOP',
      width: 1280,
      height: 1024
    }
  ];

  console.log('=== Downloading Stitch Assets ===\n');

  for (const screen of screens) {
    console.log(`\nScreen: ${screen.title}`);
    
    // Download HTML
    if (screen.htmlUrl) {
      try {
        console.log('  Downloading HTML...');
        const html = await fetchWithNode(screen.htmlUrl);
        const htmlFile = path.join(outputDir, `${screen.screenId}.html`);
        fs.writeFileSync(htmlFile, html);
        console.log(`  Saved HTML: ${htmlFile} (${html.length} chars)`);
      } catch (e) {
        console.log(`  Error downloading HTML: ${e.message}`);
      }
    }
    
    // Download screenshot
    if (screen.screenshotUrl) {
      try {
        console.log('  Downloading screenshot...');
        const ext = '.png';
        const screenshotFile = path.join(outputDir, `${screen.screenId}${ext}`);
        await downloadFile(screen.screenshotUrl, screenshotFile);
      } catch (e) {
        console.log(`  Error downloading screenshot: ${e.message}`);
      }
    }
  }

  console.log('\n=== All downloads complete! ===');
}

main().catch(console.error);
