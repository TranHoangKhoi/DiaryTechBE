import mongoose from 'mongoose';

const ProductionReportSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },

    year: {
      type: Number,
      required: true
    },

    yield: {
      type: Number, // sản lượng
      required: true
    },

    unit: {
      type: String,
      default: 'ton'
    }
  },
  { timestamps: true }
);

ProductionReportSchema.index({ farm_id: 1, year: 1 });

export const ProductionReport = mongoose.model('ProductionReport', ProductionReportSchema);
