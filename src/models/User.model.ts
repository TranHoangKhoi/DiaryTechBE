import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { MODULE_KEY_VALUES, ModuleKey } from '~/constants/moduleKeys';

export type FileServerSyncStatus = 'pending' | 'synced' | 'failed';

export interface IUserFileServerClient {
  client_system_id?: string;
  external_id?: string;
  user_alias?: string;
  name?: string;
  key?: string;
  client_id?: string;
  is_active?: boolean;
}

export interface IUserFileServerFolder {
  name: string;
  alias?: string;
  id?: string;
  parentId?: string;
  path?: string;
}

export interface IUserProvince {
  id?: string;
  province_code: string;
  name: string;
  short_name?: string;
  code?: string;
  place_type?: string;
  country?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IUserWard {
  id?: string;
  ward_code: string;
  name: string;
  province_code: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IUser extends Document {
  phone: string;
  password: string;
  name: string;
  cccd?: string;
  date_of_birth?: Date | null;
  cccd_issue_place?: string;
  cccd_issue_date?: Date | null;
  external_id: string;
  province?: IUserProvince | null;
  ward?: IUserWard | null;
  address?: string;
  des: string;
  avatar: string;
  gender: number;
  role: 'superadmin' | 'admin' | 'owner' | 'sub_account';
  owner_id?: mongoose.Types.ObjectId; // nếu là sub_account
  allowed_modules?: ModuleKey[];
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  file_server_client?: IUserFileServerClient;
  file_server_folders?: IUserFileServerFolder[];
  file_server_sync_status: FileServerSyncStatus;
  file_server_last_error?: string;
  file_server_synced_at?: Date;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  comparePassword(password: string): Promise<boolean>;
}

const listRole = ['superadmin', 'admin', 'owner', 'sub_account'];
const listStatus = ['active', 'inactive', 'suspended', 'deleted'];
const fileServerSyncStatuses: FileServerSyncStatus[] = ['pending', 'synced', 'failed'];
const EXTERNAL_ID_RETRY_LIMIT = 10;

const generateExternalId = () => String(randomInt(100000000, 1000000000));

// Gender === 1 ? Female : Male

const ProvinceSchema = new mongoose.Schema<IUserProvince>(
  {
    id: { type: String },
    province_code: { type: String, required: true },
    name: { type: String, required: true },
    short_name: { type: String },
    code: { type: String },
    place_type: { type: String },
    country: { type: String, default: 'VN' },
    created_at: { type: String, default: null },
    updated_at: { type: String, default: null }
  },
  { _id: false }
);

const WardSchema = new mongoose.Schema<IUserWard>(
  {
    id: { type: String },
    ward_code: { type: String, required: true },
    name: { type: String, required: true },
    province_code: { type: String, required: true },
    created_at: { type: String, default: null },
    updated_at: { type: String, default: null }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema<IUser>({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  cccd: { type: String, default: '' },
  date_of_birth: { type: Date, default: null },
  cccd_issue_place: { type: String, default: '' },
  cccd_issue_date: { type: Date, default: null },
  external_id: { type: String, required: true, unique: true },
  province: { type: ProvinceSchema, default: null },
  ward: { type: WardSchema, default: null },
  address: { type: String, default: '' },
  des: { type: String, default: '' },
  avatar: { type: String, default: '' },
  gender: { type: Number, default: 1 },
  role: { type: String, enum: listRole, required: true, default: 'owner' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // nếu sub_account
  allowed_modules: [{ type: String, enum: MODULE_KEY_VALUES }],
  status: { type: String, enum: listStatus, default: 'active' },
  file_server_client: {
    client_system_id: { type: String, default: '' },
    external_id: { type: String, default: '' },
    user_alias: { type: String, default: '' },
    name: { type: String, default: '' },
    key: { type: String, default: '', select: false },
    client_id: { type: String, default: '' },
    is_active: { type: Boolean, default: false }
  },
  file_server_folders: [
    {
      name: { type: String, required: true },
      alias: { type: String, default: '' },
      id: { type: String, default: '' },
      parentId: { type: String, default: '' },
      path: { type: String, default: '' },
      _id: false
    }
  ],
  file_server_sync_status: { type: String, enum: fileServerSyncStatuses, default: 'pending', index: true },
  file_server_last_error: { type: String, default: '' },
  file_server_synced_at: { type: Date },
  last_login: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre<IUser>('validate', async function (next) {
  if (this.role === 'sub_account' && !this.owner_id) {
    this.invalidate('owner_id', 'owner_id is required for sub_account');
  }

  if (this.role !== 'sub_account' && this.allowed_modules && this.allowed_modules.length > 0) {
    this.invalidate('allowed_modules', 'allowed_modules is only supported for sub_account');
  }

  if (!this.external_id) {
    for (let attempt = 0; attempt < EXTERNAL_ID_RETRY_LIMIT; attempt += 1) {
      const externalId = generateExternalId();
      const existedUser = await mongoose.models.User.exists({ external_id: externalId });

      if (!existedUser) {
        this.external_id = externalId;
        break;
      }
    }
  }

  if (!this.external_id) {
    this.invalidate('external_id', 'Cannot generate unique external_id');
  }

  next();
});

// Middleware hash mật khẩu
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Global Middleware to ignore deleted users
UserSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ status: { $ne: 'deleted' } });
  }
  next();
});

UserSchema.pre('countDocuments', function (next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ status: { $ne: 'deleted' } });
  }
  next();
});

UserSchema.pre('aggregate', function (next) {
  if (this.options?.includeDeleted !== true) {
    this.pipeline().unshift({ $match: { status: { $ne: 'deleted' } } });
  }
  next();
});

// UserSchema.index({ phone: 1 }, { unique: true }); // index này đã được tạo tự động bởi { unique: true } ở trên
UserSchema.index({ external_id: 1 }, { unique: true });
UserSchema.index({ owner_id: 1 }); // khi load sub-account theo chủ
UserSchema.index({ allowed_modules: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ created_at: -1 }); // sort nhanh theo ngày tạo

export default mongoose.model<IUser>('User', UserSchema);
