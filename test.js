const fs = require('fs');
const cheerio = require('cheerio');
const data = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/419a3fb7-91d8-4f4e-8bbd-1702d6d03299/.system_generated/steps/11/content.md', 'utf8');
const $ = cheerio.load(data);
$('tr').each((i, el) => {
  const cls = $(el).attr('class') || '';
  if (cls.includes('group/row')) {
    const name = $(el).find('a .min-w-0 span.block.truncate').text().trim();
    const imageUrl = $(el).find('img').attr('src');
    const price = $(el).find('td.text-right span.font-semibold').text().trim();
    const unit = $(el).find('td.text-right span.hidden').text().trim();
    if (name) {
      console.log(name, '|', price, '|', unit, '|', imageUrl);
    }
  }
});
