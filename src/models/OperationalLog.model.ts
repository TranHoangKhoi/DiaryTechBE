import mongoose, { Document } from 'mongoose';

export type OperationalLogStatus = 'draft' | 'submitted' | 'approved';

export interface IOperationalLog extends Document {
  book_id: mongoose.Types.ObjectId;
  template_id: mongoose.Types.ObjectId;
  domain: string;
  category: string;
  template_key: string;
  template_version: number;
  log_date: Date;
  data: Record<string, any>;
  notes?: string;
  status: OperationalLogStatus;
  legacy_source?: {
    model: 'ProductionLog' | 'manual';
    id?: mongoose.Types.ObjectId;
  };
  created_by: mongoose.Types.ObjectId;
}

const OperationalLogSchema = new mongoose.Schema<IOperationalLog>(
  {
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionBook', required: true },
    template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OperationalLogTemplate', required: true },
    domain: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    template_key: { type: String, required: true, trim: true, lowercase: true },
    template_version: { type: Number, required: true, min: 1 },
    log_date: { type: Date, required: true, default: Date.now },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['draft', 'submitted', 'approved'], default: 'submitted' },
    legacy_source: {
      model: { type: String, enum: ['ProductionLog', 'manual'] },
      id: { type: mongoose.Schema.Types.ObjectId }
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

OperationalLogSchema.index({ book_id: 1, log_date: -1 });
OperationalLogSchema.index({ template_id: 1, log_date: -1 });
OperationalLogSchema.index({ domain: 1, category: 1 });
OperationalLogSchema.index({ created_by: 1 });
OperationalLogSchema.index({ 'legacy_source.model': 1, 'legacy_source.id': 1 });

export default mongoose.model<IOperationalLog>('OperationalLog', OperationalLogSchema);
