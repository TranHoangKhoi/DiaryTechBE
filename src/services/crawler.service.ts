import axios from 'axios';
import * as cheerio from 'cheerio';
import { MarketPrice } from '../models/marketPrice.model';

export const scrapeTepbacPrices = async () => {
  try {
    console.log('[Crawler] Bắt đầu lấy dữ liệu từ Tép Bạc...');
    const url = 'https://tepbac.com/gia-thuy-san/gia/tom';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Duyệt qua từng dòng dữ liệu của bảng
    $('tr').each((i, el) => {
      const cls = $(el).attr('class') || '';
      if (cls.includes('group/row')) {
        const name = $(el).find('a .min-w-0 span.block.truncate').text().trim();
        let imageUrl = $(el).find('img').attr('src');
        const price = $(el).find('td.text-right span.font-semibold').first().text().trim();
        const unitText = $(el).find('td.text-right span.hidden').text().trim();

        if (name && price) {
          // Xử lý fallback ảnh nếu Tép Bạc không có ảnh
          if (!imageUrl) {
            const lowercaseName = name.toLowerCase();
            if (lowercaseName.includes('thẻ')) {
              imageUrl = 'https://tepbac.com/storage/species/tom-the-chan-trang.jpg';
            } else if (lowercaseName.includes('sú')) {
              imageUrl = 'https://tepbac.com/storage/species/tom-su.jpg';
            } else if (lowercaseName.includes('càng xanh')) {
              imageUrl = 'https://tepbac.com/storage/species/tom-cang-xanh.jpg';
            } else {
              imageUrl = 'https://tepbac.com/storage/species/tom-the-chan-trang.jpg'; // default
            }
          }

          // Chuẩn hóa unit
          const unit = unitText.toLowerCase().includes('con') ? 'con' : 'kg';

          results.push({
            name: name,
            price: price,
            unit: unit,
            region: 'Toàn quốc',
            date: today,
            imageUrl: imageUrl,
            source: 'Tepbac',
            type: 'tom'
          });
        }
      }
    });

    // Lọc trùng lặp
    const uniqueResults = Array.from(new Map(results.map((item) => [item.name, item])).values());

    if (uniqueResults.length > 0) {
      console.log(`[Crawler] Đã cào được ${uniqueResults.length} bản ghi giá tôm.`);

      // Lưu vào DB
      for (const item of uniqueResults) {
        // Cập nhật nếu đã có trong ngày hôm nay, hoặc tạo mới
        await MarketPrice.findOneAndUpdate(
          { name: item.name, date: item.date },
          { $set: item },
          { upsert: true, new: true }
        );
      }
      console.log('[Crawler] Lưu vào DB thành công.');
    } else {
      console.log('[Crawler] Không tìm thấy dữ liệu giá nào phù hợp.');
    }
  } catch (error) {
    console.error('[Crawler] Lỗi trong quá trình cào dữ liệu:', error);
    // Trong thực tế sẽ gọi Webhook cảnh báo vào Telegram/Slack ở đây
  }
};
