import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Farmtype from '../src/models/Farmtype.model';
import InventoryLogModel from '../src/models/InventoryLog.model';
import InventoryMaterialModel from '../src/models/InventoryMaterial.model';
import InventoryTemplateModel from '../src/models/InventoryTemplate.model';
import UserModel from '../src/models/User.model';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

type TemplateDefinition = {
  match: string[];
  category: string;
  key: string;
  name: string;
};

const WRITE = process.argv.includes('--write');
const UPSERT_TEMPLATES = process.argv.includes('--templates');
const CODE_PAD = 3;

const normalizeSlug = (value: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  { match: ['tom', 'shrimp'], category: 'feed', key: 'shrimp_feed', name: 'Nuoi tom - thuc an' },
  { match: ['tom', 'shrimp'], category: 'chemical', key: 'shrimp_chemical', name: 'Nuoi tom - hoa chat' },
  { match: ['trong_trot', 'crop', 'cay'], category: 'seed', key: 'crop_seed', name: 'Trong trot - giong' },
  { match: ['trong_trot', 'crop', 'cay'], category: 'chemical', key: 'crop_chemical', name: 'Trong trot - vat tu xu ly' },
  { match: ['ocop'], category: 'equipment', key: 'ocop_equipment', name: 'OCOP - vat tu dong goi' },
  { match: ['vietgap'], category: 'chemical', key: 'vietgap_chemical', name: 'VietGAP - vat tu dau vao' }
];

const buildTemplateSchema = (category: string) => [
  {
    key: 'general',
    name: 'Thong tin chung',
    type: 'section',
    fields: [
      {
        key: 'material_id',
        label: 'Vat tu',
        type: 'select',
        required: true,
        options: [],
        lookup: {
          model: 'InventoryMaterial',
          scope: 'farm',
          category,
          auto_fill: {
            supplier_name: 'supplier_name',
            unit: 'unit',
            manufacturer: 'manufacturer'
          }
        }
      },
      { key: 'quantity', label: 'So luong', type: 'number', required: true, options: [] },
      { key: 'unit', label: 'Don vi', type: 'text', required: true, options: [] },
      { key: 'supplier_name', label: 'Nha cung cap', type: 'text', required: false, options: [] },
      { key: 'manufacturer', label: 'Nha san xuat', type: 'text', required: false, options: [] },
      { key: 'note', label: 'Ghi chu', type: 'textarea', required: false, options: [] }
    ],
    columns: []
  }
];

const getAdminUserId = async () => {
  const envUserId = process.env.INVENTORY_MIGRATION_ADMIN_ID;
  if (envUserId && mongoose.Types.ObjectId.isValid(envUserId)) return new mongoose.Types.ObjectId(envUserId);

  const user = await UserModel.findOne({ role: { $in: ['superadmin', 'admin'] } }).select('_id').lean();
  if (!user?._id) throw new Error('Missing admin user. Set INVENTORY_MIGRATION_ADMIN_ID in .env.local');
  return user._id;
};

const normalizeMaterialCodes = async () => {
  const materials = await InventoryMaterialModel.find({}).sort({ createdAt: 1, _id: 1 });
  const counters = new Map<string, number>();
  let changed = 0;

  for (const material of materials) {
    if (!material.farm_id && !material.farm_type_id) continue;

    const scopeType = material.farm_id ? 'farm' : 'farm_type';
    const scopeId = String(material.farm_id || material.farm_type_id);
    const key = normalizeSlug(material.key || material.category || 'material');
    const counterKey = `${scopeType}:${scopeId}:${key}`;
    const nextNumber = (counters.get(counterKey) || 0) + 1;
    counters.set(counterKey, nextNumber);

    const nextCode = `${key}-${String(nextNumber).padStart(CODE_PAD, '0')}`;
    const nextCategory = normalizeSlug(material.category || 'other');
    const nextDomain = normalizeSlug(material.domain || 'inventory');

    const needUpdate =
      material.scope_type !== scopeType ||
      String(material.scope_id || '') !== scopeId ||
      material.key !== key ||
      material.code !== nextCode ||
      material.category !== nextCategory ||
      material.domain !== nextDomain;

    if (!needUpdate) continue;
    changed += 1;

    if (WRITE) {
      material.scope_type = scopeType;
      material.scope_id = new mongoose.Types.ObjectId(scopeId);
      material.farm_id = scopeType === 'farm' ? new mongoose.Types.ObjectId(scopeId) : null;
      material.farm_type_id = scopeType === 'farm_type' ? new mongoose.Types.ObjectId(scopeId) : null;
      material.key = key;
      material.code = nextCode;
      material.category = nextCategory;
      material.domain = nextDomain;
      await material.save();
    }
  }

  console.log(`[materials] ${WRITE ? 'updated' : 'would update'} ${changed}/${materials.length}`);
};

const backfillLogSnapshots = async () => {
  const logs = await InventoryLogModel.find({ material_id: { $ne: null } }).populate(
    'material_id',
    'name supplier_name manufacturer unit'
  );
  let changed = 0;

  for (const log of logs) {
    const material: any = log.material_id;
    if (!material || typeof material !== 'object') continue;

    const snapshot = log.material_snapshot || {};
    const nextSnapshot = {
      material_name: snapshot.material_name || material.name || '',
      supplier_name: snapshot.supplier_name || material.supplier_name || '',
      manufacturer: snapshot.manufacturer || material.manufacturer || '',
      unit: snapshot.unit || material.unit || ''
    };

    const needUpdate =
      !snapshot.material_name ||
      !snapshot.supplier_name ||
      !snapshot.manufacturer ||
      !snapshot.unit ||
      !log.unit;

    if (!needUpdate) continue;
    changed += 1;

    if (WRITE) {
      log.material_snapshot = nextSnapshot;
      log.unit = log.unit || nextSnapshot.unit;
      await log.save();
    }
  }

  console.log(`[logs] ${WRITE ? 'backfilled' : 'would backfill'} ${changed}/${logs.length}`);
};

const upsertStandardTemplates = async () => {
  if (!UPSERT_TEMPLATES) return;

  const adminUserId = WRITE ? await getAdminUserId() : null;
  const farmTypes = await Farmtype.find({}).select('_id type_name').lean();
  let changed = 0;

  for (const farmType of farmTypes) {
    const normalizedName = normalizeSlug(farmType.type_name);
    const definitions = TEMPLATE_DEFINITIONS.filter((definition) =>
      definition.match.some((keyword) => normalizedName.includes(keyword))
    );

    for (const definition of definitions) {
      changed += 1;
      if (!WRITE) continue;

      await InventoryTemplateModel.findOneAndUpdate(
        {
          farm_type_id: farmType._id,
          farm_id: null,
          domain: 'inventory',
          category: definition.category,
          key: definition.key,
          version: 1
        },
        {
          $set: {
            farm_type_id: farmType._id,
            farm_id: null,
            domain: 'inventory',
            category: definition.category,
            key: definition.key,
            name: definition.name,
            description: `Standard inventory template for ${farmType.type_name}`,
            schema: buildTemplateSchema(definition.category),
            version: 1,
            status: 'active',
            created_by: adminUserId!
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    }
  }

  console.log(`[templates] ${WRITE ? 'upserted' : 'would upsert'} ${changed}`);
};

const main = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI');

  await mongoose.connect(uri);
  console.log(`Connected DB. Mode: ${WRITE ? 'write' : 'dry-run'}`);

  await normalizeMaterialCodes();
  await backfillLogSnapshots();
  await upsertStandardTemplates();
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
