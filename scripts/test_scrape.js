const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
  const { data } = await axios.get('https://tepbac.com/gia-thuy-san/gia/tom', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(data);
  const items = [];
  $('.price-item, .price-list tr, .item, tr').each((i, el) => {
      // just extract any text to see if it has prices
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.includes('Tôm') || text.includes('VNĐ') || text.includes('kg')) {
          items.push(text);
      }
  });
  
  // if no table rows, maybe they use div grid
  if (items.length === 0) {
     $('div').each((i, el) => {
         const className = $(el).attr('class') || '';
         if (className.includes('price')) {
             items.push($(el).text().replace(/\s+/g, ' ').trim());
         }
     });
  }

  // Look for specific price classes
  const cleanItems = [];
  $('.card, .bg-white.rounded').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
     if (text.includes('Tôm') && text.includes('đ/kg')) {
          cleanItems.push(text);
     }
  });

  fs.writeFileSync('scratch.json', JSON.stringify({items, cleanItems}, null, 2));
}

scrape().catch(console.error);
