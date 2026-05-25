import mongoose, { Document } from 'mongoose';
import { SHARED_FIELD_SCOPES, SharedFieldScope } from '~/constants/sharedFieldKeys';

export interface IChemicalCatalog extends Document {
  scope_type: SharedFieldScope;
  scope_id: mongoose.Types.ObjectId;
  farm_id?: mongoose.Types.ObjectId | null;
  farm_type_id?: mongoose.Types.ObjectId | null;
  chemical_name: string;
  chemical_usage?: string;
  chemical_manufacturer?: string;
  chemical_unit?: string;
  chemical_seller?: string;
  chemical_receiver?: string;
  aliases: string[];
  normalized_name: string;
  normalized_signature: string;
  search_text: string;
  usage_count: number;
  last_used_at: Date;
  source_activity_id?: mongoose.Types.ObjectId | null;
  source_log_id?: mongoose.Types.ObjectId | null;
  created_by?: mongoose.Types.ObjectId | null;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

const normalizeLower = (value: unknown) => normalizeText(value).toLowerCase();

const buildSearchText = (doc: Partial<IChemicalCatalog>) =>
  [
    doc.chemical_name,
    doc.chemical_usage,
    doc.chemical_manufacturer,
    doc.chemical_unit,
    doc.chemical_seller,
    doc.chemical_receiver,
    ...(doc.aliases || [])
  ]
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const ChemicalCatalogSchema = new mongoose.Schema<IChemicalCatalog>(
  {
    scope_type: {
      type: String,
      enum: Object.values(SHARED_FIELD_SCOPES),
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
    chemical_name: { type: String, required: true, trim: true },
    chemical_usage: { type: String, trim: true, default: '' },
    chemical_manufacturer: { type: String, trim: true, default: '' },
    chemical_unit: { type: String, trim: true, default: '' },
    chemical_seller: { type: String, trim: true, default: '' },
    chemical_receiver: { type: String, trim: true, default: '' },
    aliases: { type: [String], default: [] },
    normalized_name: { type: String, required: true, trim: true, lowercase: true },
    normalized_signature: { type: String, required: true, trim: true, lowercase: true },
    search_text: { type: String, required: true, trim: true, lowercase: true },
    usage_count: { type: Number, default: 1, min: 1 },
    last_used_at: { type: Date, default: Date.now },
    source_activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activities',
      default: null
    },
    source_log_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionLog',
      default: null
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

ChemicalCatalogSchema.pre('validate', function (next) {
  this.chemical_name = normalizeText(this.chemical_name);
  this.chemical_usage = normalizeText(this.chemical_usage);
  this.chemical_manufacturer = normalizeText(this.chemical_manufacturer);
  this.chemical_unit = normalizeText(this.chemical_unit);
  this.chemical_seller = normalizeText(this.chemical_seller);
  this.chemical_receiver = normalizeText(this.chemical_receiver);
  this.aliases = Array.isArray(this.aliases)
    ? this.aliases.map((alias) => normalizeText(alias)).filter(Boolean)
    : [];

  this.normalized_name = normalizeLower(this.chemical_name);
  this.normalized_signature = normalizeLower(
    [
      this.chemical_name,
      this.chemical_usage,
      this.chemical_manufacturer,
      this.chemical_unit
    ]
      .map((value) => normalizeText(value))
      .filter(Boolean)
      .join('|')
  );
  this.search_text = buildSearchText(this);

  if (this.scope_type === SHARED_FIELD_SCOPES.farm) {
    if (!this.farm_id) {
      this.invalidate('farm_id', 'farm_id is required when scope_type is farm');
      next();
      return;
    }

    this.scope_id = this.farm_id;
  }

  if (this.scope_type === SHARED_FIELD_SCOPES.farmType) {
    if (!this.farm_type_id) {
      this.invalidate('farm_type_id', 'farm_type_id is required when scope_type is farm_type');
      next();
      return;
    }

    this.scope_id = this.farm_type_id;
  }

  next();
});

ChemicalCatalogSchema.index({ scope_type: 1, scope_id: 1, normalized_signature: 1 }, { unique: true });
ChemicalCatalogSchema.index({ scope_type: 1, scope_id: 1, chemical_name: 1 });
ChemicalCatalogSchema.index({ scope_type: 1, scope_id: 1, last_used_at: -1 });
ChemicalCatalogSchema.index({ scope_type: 1, scope_id: 1, usage_count: -1 });
ChemicalCatalogSchema.index({ search_text: 'text' });
ChemicalCatalogSchema.index({ deleted_at: 1 });

export default mongoose.model<IChemicalCatalog>('ChemicalCatalog', ChemicalCatalogSchema);
