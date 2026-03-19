import mongoose from 'mongoose';

const FarmMediaSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },

    url: { type: String, required: true },

    is_cover: {
      type: Boolean,
      default: false
    },

    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const FarmMedia = mongoose.model('FarmMedia', FarmMediaSchema);
