const Scraper = require('images-scraper');
const fs = require('fs');
const request = require('request');

const google = new Scraper({
    puppeteer: {
        headless: false,
    },
    safe: false
});

/*
const options = {
    userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0', // the user agent
    puppeteer: {}, // puppeteer options, for example, { headless: false }
    tbs: { // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
        isz: // options: l(arge), m(edium), i(cons), etc.
            itp: // options: clipart, face, lineart, news, photo
            ic: // options: color, gray, trans
            sur: // options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
    },
    safe: false // enable/disable safe search
};*/

(async () => {
    const results = await google.scrape('gerookte zalm', 10);
    console.log('results', results);
    results.forEach((img, index) => {
        download(img.url, `./test/zalm${index}.jpg`, () => {
            console.log(`Saved img n${index}`);
        })
    })
})();

/*
https://stackoverflow.com/questions/12740659/downloading-images-with-node-js
*/

const download = (uri, filename, callback) => {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};