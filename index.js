const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');

const QUERY = 'pizza margerita';
const LIMIT = 10;

async function imgScrape(queries, limit) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const allImages = new Set();
        
        for (const query of queries) {
            await page.goto(`https://duckduckgo.com/?q=${query}&atb=v314-1&iar=images&iax=images&ia=images`);
            
            await page.evaluate(async () => {
                for (let i = 0; i < 10; i++) {
                    window.scrollBy(0, window.innerHeight);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            });

            await page.waitForSelector('img');

            const images = await page.evaluate(() => {
                const imageElements = document.querySelectorAll('img');
                const urls = [];
                imageElements.forEach(img => {
                    const url = img.src;
                    if (url.startsWith('http') && !url.includes('google')) {
                        urls.push(url);
                    }
                });
                return urls;
            });

            images.forEach(url => allImages.add(url));
        }

        await browser.close();

        return Array.from(allImages).slice(0, limit);

    } catch (err) {
        console.error('An error occurred:', err);
    }
}

imgScrape([QUERY], LIMIT).then((results) => {
    if (!results || results.length === 0) {
        console.log('No images found.');
        return;
    }

    results.forEach((img, index) => {
        download(img, `./test/${QUERY}${index}.jpg`, () => {
            console.log(`Saved img ${index}`);
        });
    });
});

const download = (uri, filename, callback) => {
    request.head(uri, function (err, res, body) {
        if (err || !res) {
            console.error(`Failed to fetch ${uri}:`, err);
            return;
        }

        if (!res.headers) {
            console.error(`No headers received for ${uri}`);
            return;
        }

        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri)
            .pipe(fs.createWriteStream(filename))
            .on('close', callback);
    });
};
