var ghpages = require('gh-pages');

ghpages.publish('examples', function (err) { if (err) console.error(err) });