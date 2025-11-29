import mongoose, { Document } from 'mongoose';

interface IActivities extends Document {
  farm_type_id: string;
  activity_name: string;
  image: string;
  description: string;
  fields: [
    {
      field_name: string;
      field_type: string;
      is_required: boolean;
      options: string[];
    }
  ];
}

const ActivitySchema = new mongoose.Schema(
  {
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', required: true },
    activity_name: { type: String, required: true },
    image: {
      type: String,
      required: true,
      default: 'https://res.cloudinary.com/delix6nht/image/upload/v1760068625/3_xs0l5w.png'
    },
    description: { type: String },
    fields: [
      {
        field_name: { type: String, required: true },
        field_type: { type: String, required: true },
        is_required: { type: Boolean, default: false },
        options: { type: [String] }
      }
    ]
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
