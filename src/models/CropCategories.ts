import mongoose from 'mongoose';

const CropSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, required: true, unique: true },

    farm_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmtype',
      required: true,
      index: true
    },

    category: {
      type: String, // fruit | livestock | aquaculture
      default: 'fruit'
    },

    icon: { type: String, required: true },

    image: { type: String },

    color: { type: String, required: true },

    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

CropSchema.index({ farm_type_id: 1 });

export const Crop = mongoose.model('Crop', CropSchema);
