import mongoose, { Document } from 'mongoose';

interface IActivities extends Document {
  farm_type_id: string;
  activity_code?: string;
  activity_name: string;
  image: string;
  description: string;
  fields: [
    {
      key: string;
      field_name: string;
      field_type: string;
      is_required: boolean;
      autoFill?: string;
      options: string[];
      is_shared: boolean;
      shared_scope?: string;
      shared_mode?: string;
    }
  ];
  supported_material_categories: string[];
  workflow_type: string;
}

const ActivitySchema = new mongoose.Schema(
  {
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', required: true },
    activity_code: { type: String, default: null },
    activity_name: { type: String, required: true },
    image: {
      type: String,
      default:
        'https://res.cloudinary.com/delix6nht/image/upload/v1779251418/55fnc3b4ng-nghie1bb87p-thc3b4ng-minh1-1604989305810604890581-crop-1604989310824614604916-1624349165163487002833_hgk56s.jpg'
    },
    description: { type: String },
    workflow_type: { type: String, enum: ['general', 'issue', 'receive'], default: 'general' },
    fields: [
      {
        key: { type: String, required: true },
        field_name: { type: String, required: true },
        field_type: { type: String, required: true },
        is_required: { type: Boolean, default: false },
        autoFill: { type: String, default: undefined },
        options: { type: [String] },
        is_shared: { type: Boolean, default: false },
        shared_scope: { type: String, enum: ['farm', 'farm_type'], default: undefined },
        shared_mode: { type: String, enum: ['suggest', 'latest'], default: undefined }
      }
    ],
    supported_material_categories: { type: [String], default: [] }
  },
  {
    timestamps: true // ✅ tự tạo createdAt và updatedAt
  }
);

ActivitySchema.index({ farm_type_id: 1 }); // Lọc theo loại nông trại
ActivitySchema.index({ activity_name: 1 }); // Tìm kiếm theo tên hoạt động
ActivitySchema.index({ created_at: -1 }); // Sort theo thời gian tạo
ActivitySchema.index({ farm_type_id: 1, created_at: -1 });

export default mongoose.model<IActivities>('Activities', ActivitySchema);
