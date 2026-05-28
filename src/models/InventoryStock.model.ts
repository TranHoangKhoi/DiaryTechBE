import mongoose, { Document } from 'mongoose';

export type InventoryStockStatus = 'active' | 'depleted' | 'archived';
export type InventoryStockTransactionType = 'in' | 'out' | 'adjustment' | 'transfer' | 'stocktake';

export interface IInventoryStock extends Document {
  farm_id: mongoose.Types.ObjectId;
  material_id: mongoose.Types.ObjectId;
  template_id?: mongoose.Types.ObjectId | null;
  category: string;
  material_name: string;
  supplier_name?: string;
  unit: string;
  batch_no?: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  last_transaction_type?: InventoryStockTransactionType;
  last_transaction_at?: Date;
  last_log_id?: mongoose.Types.ObjectId | null;
  status: InventoryStockStatus;
}

const InventoryStockSchema = new mongoose.Schema<IInventoryStock>(
  {
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryMaterial',
      required: true
    },
    template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryTemplate',
      default: null
    },
    category: { type: String, required: true, trim: true, lowercase: true },
    material_name: { type: String, required: true, trim: true },
    supplier_name: { type: String, trim: true, default: '' },
    unit: { type: String, required: true, trim: true },
    batch_no: { type: String, trim: true, default: '' },
    quantity_on_hand: { type: Number, default: 0 },
    quantity_reserved: { type: Number, default: 0 },
    last_transaction_type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'transfer', 'stocktake'],
      default: undefined
    },
    last_transaction_at: {
      type: Date,
      default: Date.now
    },
    last_log_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryLog',
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'depleted', 'archived'],
      default: 'active'
    }
  },
  { timestamps: true }
);

InventoryStockSchema.index({ farm_id: 1, material_id: 1 }, { unique: true });
InventoryStockSchema.index({ farm_id: 1, category: 1, status: 1 });
InventoryStockSchema.index({ material_id: 1, last_transaction_at: -1 });

export default mongoose.model<IInventoryStock>('InventoryStock', InventoryStockSchema);
