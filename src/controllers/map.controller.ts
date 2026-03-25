import { Request, Response } from 'express';
import FarmModel from '~/models/Farm.model';
import { VietnamAddressConverter } from '../addressConvert/VietnamAddressConverter';

import path from 'path';
import mongoose from 'mongoose';

// export const getAllFarmsMap = async (req: Request, res: Response) => {
//   try {
//     const farms = await FarmModel.find()
//       .populate('farm_type_id', 'type_name image description') // chọn trường cần thiết
//       .populate('owner_id', 'name phone avatar role') // chỉ lấy thông tin cơ bản
//       .populate('user_id', 'name phone avatar role')
//       .sort({ created_at: -1 }); // sắp xếp farm mới nhất lên đầu

//     res.status(200).json({
//       success: true,
//       total: farms.length,
//       data: farms
//     });
//   } catch (error: any) {
//     console.error('Error getAllFarms:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy danh sách nông trại',
//       error: error.message
//     });
//   }
// };

export const getAllFarmsMap = async (req: Request, res: Response) => {
  try {
    const { crop_id, province_code, owner_id } = req.query;

    const match: any = {
      farm_status: 'active'
    };

    if (province_code) {
      match['province.province_code'] = province_code;
    }

    // Lọc theo owner_id nếu có trong query hoặc từ token (nếu là owner)
    const effectiveOwnerId = owner_id || (req.user?.role === 'owner' ? req.user.id : null);
    if (effectiveOwnerId && mongoose.Types.ObjectId.isValid(effectiveOwnerId as string)) {
      match.owner_id = new mongoose.Types.ObjectId(effectiveOwnerId as string);
    }

    const farms = await FarmModel.aggregate([
      {
        $match: match
      },

      // join FarmCrop (primary)
      {
        $lookup: {
          from: 'farmcrops',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$farm_id', '$$farmId'] }, { $eq: ['$is_primary', true] }]
                }
              }
            }
          ],
          as: 'farmCrop'
        }
      },
      { $unwind: { path: '$farmCrop', preserveNullAndEmptyArrays: true } },

      // filter theo crop nếu có
      ...(crop_id
        ? [
            {
              $match: {
                'farmCrop.crop_id': new mongoose.Types.ObjectId(crop_id as string)
              }
            }
          ]
        : []),

      // join Crop
      {
        $lookup: {
          from: 'crops',
          localField: 'farmCrop.crop_id',
          foreignField: '_id',
          as: 'crop'
        }
      },
      { $unwind: { path: '$crop', preserveNullAndEmptyArrays: true } },

      // join media cover
      {
        $lookup: {
          from: 'farmmedias',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$farm_id', '$$farmId'] }, { $eq: ['$is_cover', true] }]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'media'
        }
      },
      { $unwind: { path: '$media', preserveNullAndEmptyArrays: true } },

      // chỉ lấy field cần thiết
      {
        $project: {
          farm_name: 1,
          geo_location: 1,
          polygon: 1,
          area: 1,
          unit: 1,
          avatar: 1,

          'crop._id': 1,
          'crop.name': 1,
          'crop.image': 1,
          'crop.color': 1,
          'crop.icon': 1,

          cover: '$media.url'
        }
      }
    ]);

    // 🎯 convert → GeoJSON
    const features: any[] = [];

    farms.forEach((farm) => {
      // POINT (marker)
      if (farm.geo_location) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: farm.geo_location
          },
          properties: {
            farm_id: farm._id,
            farm_name: farm.farm_name,
            avatar: farm.cover || farm.avatar,

            crop_id: farm.crop?._id,
            crop_name: farm.crop?.name,
            crop_image: farm.crop?.image,
            crop_color: farm.crop?.color,
            crop_icon: farm.crop?.icon,

            area: farm.area,
            unit: farm.unit
          }
        });
      }

      // POLYGON (vùng đất)
      if (farm.polygon) {
        features.push({
          type: 'Feature',
          geometry: farm.polygon,
          properties: {
            farm_id: farm._id,
            crop_color: farm.crop?.color,
            crop_id: farm.crop?._id
          }
        });
      }
    });

    res.status(200).json({
      type: 'FeatureCollection',
      features
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

export const getFarmDetail = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farmId' });
      return;
    }

    const farmObjectId = new mongoose.Types.ObjectId(farmId);

    const [farm] = await FarmModel.aggregate([
      // ===== MATCH =====
      {
        $match: { _id: farmObjectId }
      },

      // ===== PROJECT SỚM =====
      {
        $project: {
          farm_name: 1,
          owner_id: 1,
          avatar: 1,
          farm_type_id: 1,
          area: 1,
          unit: 1,
          ward: 1,
          province: 1,
          farm_status: 1,
          description: 1,
          updated_at: 1
        }
      },

      // ===== OWNER =====
      {
        $lookup: {
          from: 'users',
          let: { ownerId: '$owner_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$ownerId'] }
              }
            },
            {
              $project: {
                name: 1,
                phone: 1
              }
            }
          ],
          as: 'owner'
        }
      },

      // ===== FARM TYPE =====
      {
        $lookup: {
          from: 'farmtypes',
          let: { typeId: '$farm_type_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$typeId'] }
              }
            },
            {
              $project: {
                type_name: 1
              }
            }
          ],
          as: 'farmType'
        }
      },

      // ===== CROP =====
      {
        $lookup: {
          from: 'farmcrops',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$farm_id', '$$farmId'] }, { $eq: ['$is_primary', true] }]
                }
              }
            },
            { $limit: 1 },
            {
              $lookup: {
                from: 'crops',
                localField: 'crop_id',
                foreignField: '_id',
                as: 'crop'
              }
            },
            { $unwind: '$crop' },
            {
              $project: {
                cropId: '$crop._id',
                cropName: '$crop.name',
                cropType: '$crop.category'
              }
            }
          ],
          as: 'cropData'
        }
      },

      // ===== MEDIA =====
      {
        $lookup: {
          from: 'farmmedias',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$farm_id', '$$farmId'] }
              }
            },
            {
              $project: {
                url: 1
              }
            }
          ],
          as: 'medias'
        }
      },

      // ===== REPORT =====
      {
        $lookup: {
          from: 'productionreports',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$farm_id', '$$farmId'] }
              }
            },
            {
              $project: {
                year: 1,
                yield: 1
              }
            },
            {
              $sort: { year: 1 }
            }
          ],
          as: 'reports'
        }
      },

      // ===== 🔥 LOGS (5 GẦN NHẤT) =====
      {
        $lookup: {
          from: 'productionlogs',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$farm_id', '$$farmId'] }
              }
            },
            {
              $sort: { date: -1 } // mới nhất trước
            },
            {
              $limit: 5 // ⚡ chỉ lấy 5 log
            },

            // 👉 JOIN activity (nếu bạn muốn hiển thị tên hoạt động)
            {
              $lookup: {
                from: 'activities',
                localField: 'activity_id',
                foreignField: '_id',
                as: 'activity'
              }
            },
            {
              $unwind: {
                path: '$activity',
                preserveNullAndEmptyArrays: true
              }
            },

            {
              $project: {
                season: {
                  $ifNull: ['$activity.name', 'Hoạt động']
                },
                year: { $year: '$date' },
                result: {
                  $ifNull: ['$notes', 'Không có ghi chú']
                }
              }
            }
          ],
          as: 'seasons'
        }
      },

      // ===== FINAL =====
      {
        $addFields: {
          owner: { $arrayElemAt: ['$owner', 0] },
          farmType: { $arrayElemAt: ['$farmType', 0] },
          cropData: { $arrayElemAt: ['$cropData', 0] }
        }
      },

      {
        $project: {
          id: '$_id',
          name: '$farm_name',

          owner: '$owner.name',
          phone: '$owner.phone',
          avatar: '$avatar',

          cropId: '$cropData.cropId',
          cropName: '$cropData.cropName',
          cropType: '$cropData.cropType',

          farmingModel: {
            $ifNull: ['$farmType.type_name', 'Chưa cập nhật']
          },

          area: 1,
          unit: 1,

          address: {
            $concat: ['$ward.name', ', ', '$province.name']
          },

          status: '$farm_status',

          certification: [],

          images: {
            $map: {
              input: '$medias',
              as: 'm',
              in: '$$m.url'
            }
          },

          description: 1,

          reports: 1,

          seasons: 1, // 🔥 thêm vào FE dùng luôn

          updatedAt: '$updated_at'
        }
      }
    ]);

    if (!farm) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }

    res.status(200).json(farm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Khởi tạo 1 instance toàn cục
const converter = new VietnamAddressConverter();

// ✅ Khởi tạo khi server khởi động
(async () => {
  try {
    const dataPath = path.join(__dirname, '../addressConvert/geojson/vietnameConver.json');
    await converter.initialize(dataPath);
    console.log('✅ VietnamAddressConverter initialized!');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo converter:', error);
  }
})();

// 📍 API chính
export const handleConvertAddress = async (req: Request, res: Response) => {
  try {
    const { address } = req.query; // GET nên lấy từ query

    if (!address || typeof address !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Thiếu tham số ?address=...'
      });
      return;
    }

    const result = converter.convertAddress(address);
    res.json(result);
  } catch (err: any) {
    console.error('❌ Lỗi convert address:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getProvinces = async (req: Request, res: Response) => {
  try {
    const provinces = converter.getProvinces();

    res.json({
      success: true,
      total: provinces.length,
      data: provinces
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getWardsByProvince = async (req: Request, res: Response) => {
  try {
    const { province_code } = req.query;

    if (!province_code || typeof province_code !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Thiếu province_code'
      });
      return;
    }

    const wards = converter.getWardsByProvince(province_code);

    res.json({
      success: true,
      total: wards.length,
      data: wards
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchProvinces = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      res.json({
        success: true,
        data: converter.getProvinces()
      });
      return;
    }

    const normalized = keyword.toString().toLowerCase();

    const provinces = converter.getProvinces().filter((p) => p.name.toLowerCase().includes(normalized));

    res.json({
      success: true,
      total: provinces.length,
      data: provinces
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
