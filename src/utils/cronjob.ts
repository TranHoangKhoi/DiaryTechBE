import cron from 'node-cron';
import { scrapeTepbacPrices } from '../services/crawler.service';

export const initCronJobs = () => {
  console.log('[Cronjob] Đang khởi tạo các lịch trình ngầm...');

  // Chạy vào 06:00 sáng mỗi ngày
  cron.schedule(
    '0 6 * * *',
    async () => {
      console.log('[Cronjob] Đã đến giờ cào dữ liệu giá thủy sản (06:00 AM)');
      await scrapeTepbacPrices();
    },
    {
      timezone: 'Asia/Ho_Chi_Minh'
    }
  );

  console.log('[Cronjob] Khởi tạo thành công.');
};
