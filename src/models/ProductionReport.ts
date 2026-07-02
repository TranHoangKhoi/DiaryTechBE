import mongoose from 'mongoose';

const MoneyItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    amount: { type: Number, default: 0 },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const HarvestItemSchema = new mongoose.Schema(
  {
    date: { type: Date },
    species: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    revenue: { type: Number, default: 0 },
    buyer: { type: String, default: '' },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const LogSummaryItemSchema = new mongoose.Schema(
  {
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activities' },
    activity_name: { type: String, default: '' },
    count: { type: Number, default: 0 }
  },
  { _id: false }
);

const ProductionReportSchema = new mongoose.Schema(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },
    farm_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmtype',
      default: null,
      index: true
    },
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionBook',
      default: null,
      // index: true // Đã có ProductionReportSchema.index({ book_id: 1 }, { sparse: true }); ở dưới
    },
    year: {
      type: Number,
      required: true
    },
    season_name: { type: String, default: '' },
    species: { type: String, default: '' },
    start_date: { type: Date },
    end_date: { type: Date },
    yield: {
      type: Number,
      required: true,
      default: 0
    },
    unit: {
      type: String,
      default: 'kg'
    },
    total_harvest: { type: Number, default: 0 },
    harvest_unit: { type: String, default: 'kg' },
    total_revenue: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    harvest_items: { type: [HarvestItemSchema], default: [] },
    cost_items: { type: [MoneyItemSchema], default: [] },
    log_summary: {
      total_logs: { type: Number, default: 0 },
      first_log_date: { type: Date, default: null },
      last_log_date: { type: Date, default: null },
      by_activity: { type: [LogSummaryItemSchema], default: [] }
    },
    status: {
      type: String,
      enum: ['draft', 'finalized'],
      default: 'draft'
    },
    notes: { type: String, default: '' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

ProductionReportSchema.index({ farm_id: 1, year: 1 });
ProductionReportSchema.index({ book_id: 1 }, { sparse: true });

export const ProductionReport = mongoose.model('ProductionReport', ProductionReportSchema);
