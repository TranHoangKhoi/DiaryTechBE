import mongoose from 'mongoose';

const FarmCropSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },

    crop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true
    },

    area: {
      type: Number, // m2
      default: 0
    },

    is_primary: {
      type: Boolean,
      default: true // dùng để hiển thị trên map
    }
  },
  { timestamps: true }
);

FarmCropSchema.index({ farm_id: 1, crop_id: 1 });

export const FarmCrop = mongoose.model('FarmCrop', FarmCropSchema);
