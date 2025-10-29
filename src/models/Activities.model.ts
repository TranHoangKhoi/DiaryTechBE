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
  created_at: Date;
  updated_at: Date;
}

const ActivitySchema = new mongoose.Schema({
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
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IActivities>('Activities', ActivitySchema);
