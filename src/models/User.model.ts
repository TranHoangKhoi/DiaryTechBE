import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  phone: string;
  password: string;
  name: string;
  address?: string;
  des: string;
  avatar: string;
  gender: number;
  role: 'superadmin' | 'admin' | 'owner' | 'sub_account';
  owner_id?: mongoose.Types.ObjectId; // nếu là sub_account
  status: 'active' | 'inactive' | 'suspended';
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  comparePassword(password: string): Promise<boolean>;
}

const listRole = ['superadmin', 'admin', 'owner', 'sub_account'];
const listStatus = ['active', 'inactive', 'suspended'];

// Gender === 1 ? Female : Male

const UserSchema = new mongoose.Schema<IUser>({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String },
  des: { type: String, default: '' },
  avatar: { type: String, default: '' },
  gender: { type: Number, default: 1 },
  role: { type: String, enum: listRole, required: true, default: 'owner' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // nếu sub_account
  status: { type: String, enum: listStatus, default: 'active' },
  last_login: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware hash mật khẩu
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
