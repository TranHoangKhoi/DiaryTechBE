import mongoose, { Document } from 'mongoose';

export type InventoryLogStatus = 'draft' | 'submitted' | 'approved';
export type InventoryTransactionType = 'in' | 'out' | 'adjustment' | 'transfer' | 'stocktake';

export interface IInventoryLog extends Document {
  farm_id: mongoose.Types.ObjectId;
  book_id: mongoose.Types.ObjectId;
  template_id: mongoose.Types.ObjectId;
  material_id?: mongoose.Types.ObjectId | null;
  domain: string;
  category: string;
  template_key: string;
  template_version: number;
  transaction_type: InventoryTransactionType;
  log_date: Date;
  quantity?: number;
  unit?: string;
  material_snapshot?: {
    material_name?: string;
    supplier_name?: string;
    manufacturer?: string;
    unit?: string;
  };
  data: Record<string, any>;
  notes?: string;
  status: InventoryLogStatus;
  source_reference?: {
    model: 'ProductionLog' | 'InventoryLog' | 'manual';
    id?: mongoose.Types.ObjectId;
  };
  created_by: mongoose.Types.ObjectId;
}

const InventoryLogSchema = new mongoose.Schema<IInventoryLog>(
  {
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionBook', default: null },
    template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryTemplate', required: true },
    material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryMaterial', default: null },
    domain: { type: String, required: true, trim: true, lowercase: true, default: 'inventory' },
    category: { type: String, required: true, trim: true, lowercase: true },
    template_key: { type: String, required: true, trim: true, lowercase: true },
    template_version: { type: Number, required: true, min: 1 },
    transaction_type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'transfer', 'stocktake'],
      required: true,
      default: 'in'
    },
    log_date: { type: Date, required: true, default: Date.now },
    quantity: { type: Number, default: 0 },
    unit: { type: String, trim: true, default: '' },
    material_snapshot: {
      material_name: { type: String, trim: true, default: '' },
      supplier_name: { type: String, trim: true, default: '' },
      manufacturer: { type: String, trim: true, default: '' },
      unit: { type: String, trim: true, default: '' }
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['draft', 'submitted', 'approved'], default: 'submitted' },
    source_reference: {
      model: { type: String, enum: ['ProductionLog', 'InventoryLog', 'manual'] },
      id: { type: mongoose.Schema.Types.ObjectId }
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

InventoryLogSchema.index({ farm_id: 1, log_date: -1 });
InventoryLogSchema.index({ book_id: 1, log_date: -1 });
InventoryLogSchema.index({ template_id: 1, log_date: -1 });
InventoryLogSchema.index({ material_id: 1, log_date: -1 });
InventoryLogSchema.index({ domain: 1, category: 1 });
InventoryLogSchema.index({ created_by: 1 });
InventoryLogSchema.index({ 'source_reference.model': 1, 'source_reference.id': 1 });

export default mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
