import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../src/config/db';
import User from '../src/models/User.model';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

const resetPasswords = async () => {
  try {
    console.log('🔄 Đang kết nối tới database...');
    await connectDB();
    console.log('✅ Đã kết nối Database.');

    console.log('🔐 Đang tạo mã băm (hash) cho mật khẩu mới...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    console.log('⚡ Đang cập nhật mật khẩu cho toàn bộ người dùng...');
    // Cập nhật tất cả user
    const result = await User.updateMany(
      {},
      { $set: { password: hashedPassword, updated_at: new Date() } },
      { strict: false }
    );

    console.log(`🎉 Thành công! Đã thay đổi mật khẩu của ${result.modifiedCount} tài khoản thành '12345678'.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình reset mật khẩu:', error);
    process.exit(1);
  }
};

resetPasswords();
