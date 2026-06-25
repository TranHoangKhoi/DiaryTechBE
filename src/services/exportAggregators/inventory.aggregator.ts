import mongoose from 'mongoose';
import { IReportTemplate } from '../../models/ReportTemplate.model';
import InventoryMaterial from '../../models/InventoryMaterial.model';
import Farm from '../../models/Farm.model';

/**
 * Hàm gom nhóm dữ liệu Danh mục Vật tư/Thuốc/Thức ăn (Không yêu cầu book_id)
 */
export const aggregateInventoryMaterial = async (
  template: IReportTemplate,
  farmId: string,
  bookId: string | null | undefined,
  startDate: Date,
  endDate: Date
) => {
  // Lấy thông tin Farm để lấy Chủ Farm (Owner) và Người dùng trực tiếp (User)
  const farm = await Farm.findById(farmId).populate('owner_id', 'name').populate('user_id', 'name');

  const farm_owner_name = farm?.owner_id ? (farm.owner_id as any).name : '';
  const farm_user_name = farm?.user_id ? (farm.user_id as any).name : '';

  // Query tất cả vật tư của Farm này
  const materials = await InventoryMaterial.find({
    scope_id: new mongoose.Types.ObjectId(farmId),
    status: { $ne: 'archived' }
  }).sort({ createdAt: -1 });

  const rows = materials.map((material) => {
    return {
      farm_owner_name: farm_owner_name,
      farm_user_name: farm_user_name,
      code: material.code || '',
      name: material.name || '',
      aliases: Array.isArray(material.aliases) ? material.aliases.join(', ') : '',
      category: material.category || '',
      manufacturer: material.manufacturer || '',
      supplier_name: material.supplier_name || '',
      description: material.description || '',
      unit: material.unit || '',
      status: material.status || '',
      substance_type: material.substance_type || '',
    };
  });

  return { rows, add_names: [] };
};
