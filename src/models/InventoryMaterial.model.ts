import mongoose, { Document } from 'mongoose';

export type InventoryMaterialScope = 'farm' | 'farm_type';
export type InventoryMaterialStatus = 'draft' | 'active' | 'archived';

export interface IInventoryMaterial extends Document {
  scope_type: InventoryMaterialScope;
  scope_id: mongoose.Types.ObjectId;
  farm_id?: mongoose.Types.ObjectId | null;
  farm_type_id?: mongoose.Types.ObjectId | null;
  domain: string;
  category: string;
  key: string;
  code: string;
  name: string;
  supplier_name?: string;
  manufacturer?: string;
  unit: string;
  description?: string;
  aliases: string[];
  normalized_name: string;
  search_text: string;
  status: InventoryMaterialStatus;
  source_template_id?: mongoose.Types.ObjectId | null;
  created_by?: mongoose.Types.ObjectId | null;
  last_used_at: Date;
}

const normalizeText = (value: unknown) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const normalizeLower = (value: unknown) => normalizeText(value).toLowerCase();

const buildSearchText = (doc: Partial<IInventoryMaterial>) =>
  [
    doc.name,
    doc.supplier_name,
    doc.manufacturer,
    doc.unit,
    doc.description,
    ...(doc.aliases || [])
  ]
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const InventoryMaterialSchema = new mongoose.Schema<IInventoryMaterial>(
  {
    scope_type: {
      type: String,
      enum: ['farm', 'farm_type'],
      required: true
    },
    scope_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null
    },
    farm_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmtype',
      default: null
    },
    domain: { type: String, required: true, trim: true, lowercase: true, default: 'inventory' },
    category: { type: String, required: true, trim: true, lowercase: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    code: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    supplier_name: { type: String, trim: true, default: '' },
    manufacturer: { type: String, trim: true, default: '' },
    unit: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    aliases: { type: [String], default: [] },
    normalized_name: { type: String, required: true, trim: true, lowercase: true },
    search_text: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active'
    },
    source_template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryTemplate',
      default: null
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    last_used_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

InventoryMaterialSchema.pre('validate', function (next) {
  this.name = normalizeText(this.name);
  this.supplier_name = normalizeText(this.supplier_name);
  this.manufacturer = normalizeText(this.manufacturer);
  this.unit = normalizeText(this.unit);
  this.description = normalizeText(this.description);
  this.aliases = Array.isArray(this.aliases)
    ? this.aliases.map((alias) => normalizeText(alias)).filter(Boolean)
    : [];

  this.normalized_name = normalizeLower(this.name);
  this.search_text = buildSearchText(this);

  if (this.farm_id && this.farm_type_id) {
    this.invalidate('farm_id', 'Only one of farm_id or farm_type_id is allowed');
    next();
    return;
  }

  if (!this.scope_type) {
    if (this.farm_id) this.scope_type = 'farm';
    if (this.farm_type_id) this.scope_type = 'farm_type';
  }

  if (this.scope_type === 'farm') {
    if (!this.farm_id) {
      this.invalidate('farm_id', 'farm_id is required when scope_type is farm');
      next();
      return;
    }

    this.scope_id = this.farm_id;
    this.farm_type_id = null;
  }

  if (this.scope_type === 'farm_type') {
    if (!this.farm_type_id) {
      this.invalidate('farm_type_id', 'farm_type_id is required when scope_type is farm_type');
      next();
      return;
    }

    this.scope_id = this.farm_type_id;
    this.farm_id = null;
  }

  next();
});

InventoryMaterialSchema.index({ scope_type: 1, scope_id: 1, key: 1, code: 1 }, { unique: true });
InventoryMaterialSchema.index({ scope_type: 1, scope_id: 1, category: 1, normalized_name: 1 }, { unique: true });
InventoryMaterialSchema.index({ scope_type: 1, scope_id: 1, category: 1, status: 1 });
InventoryMaterialSchema.index({ search_text: 'text' });

export default mongoose.model<IInventoryMaterial>('InventoryMaterial', InventoryMaterialSchema);
