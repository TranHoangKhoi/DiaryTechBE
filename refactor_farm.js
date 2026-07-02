const fs = require('fs');
const path = 'e:/HKB/DiaryTech/FullstackDiary/DiaryTechBE/src/controllers/farm.controller.ts';
let content = fs.readFileSync(path, 'utf8');

const getFarmsLogic = `
export const getFarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { includeDeleted, user_id } = req.query;
    const isIncludeDeleted = includeDeleted === 'true';

    let query: any = {};

    if (user.role === 'owner') {
      query.owner_id = user.id;
    } else if (user.role === 'sub_account' || user.role === 'farmer') {
      query.user_id = user.id;
    } else if (user.role === 'superadmin' || user.role === 'admin') {
      if (user_id) {
        query.user_id = user_id;
      }
    } else {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const farmsQuery = FarmModel.find(query);
    
    if (isIncludeDeleted) {
      farmsQuery.setOptions({ includeDeleted: true });
      farmsQuery.populate({ path: 'user_id', options: { includeDeleted: true } });
    } else {
      farmsQuery.populate('user_id');
    }

    const farms = await farmsQuery
      .populate('owner_id', 'name avatar')
      .populate('farm_type_id')
      .lean();

    const farmIds = farms.map((farm) => farm._id);

    const farmCrops = await FarmCrop.find({
      farm_id: { $in: farmIds },
      is_primary: true
    })
      .select('farm_id crop_id')
      .lean();
    const cropMap = new Map(farmCrops.map((farmCrop) => [String(farmCrop.farm_id), String(farmCrop.crop_id)]));

    const farmZones = await FarmZoneModel.find({ farm_id: { $in: farmIds } })
      .select('farm_id')
      .lean();

    const farmZoneMap = new Map<string, number>();
    for (const zone of farmZones) {
      const key = String(zone.farm_id);
      farmZoneMap.set(key, (farmZoneMap.get(key) || 0) + 1);
    }

    res.status(200).json({
      success: true,
      data: farms.map((farm) => ({
        ...farm,
        crop_id: cropMap.get(String(farm._id)) || '',
        total_farm_zones: farmZoneMap.get(String(farm._id)) || 0
      }))
    });
  } catch (error: any) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
`;

content = content.replace(/export const getFarmsByOwner = [\s\S]*?export const getFarmsByUserId = [\s\S]*?export const getFarmsByUserIdFormAdmin = [\s\S]*?\};/m, getFarmsLogic);

fs.writeFileSync(path, content);
console.log('Replaced farm controllers successfully.');
