import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import InventoryStockModel from '../models/InventoryStock.model';
import InventoryLogModel from '../models/InventoryLog.model';
import InventoryMaterialModel from '../models/InventoryMaterial.model';
import ProductionLogModel from '../models/ProductionLogs.model';
import ProductionBookModel from '../models/ProductionBook.model';
import ActivitiesModel from '../models/Activities.model';
import InventoryTemplateModel from '../models/InventoryTemplate.model';
import SystemConfigModel from '../models/SystemConfig.model';
import { syncSharedFieldValuesFromLog, syncSharedFieldValuesFromInventoryLog } from '../services/sharedFieldValue.service';

const issueAndLogSchema = z.object({
  farm_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid farm_id'),
  book_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid book_id'),
  sync_book_ids: z.array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val))).optional().default([]),
  activity_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid activity_id'),
  material_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid material_id'),
  template_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid template_id'),
  quantity: z.number().min(0, 'Quantity must be at least 0'),
  date: z.string().optional(),
  notes: z.string().optional(),
  production_data: z.record(z.any()).optional().default({}),
  inventory_data: z.record(z.any()).optional().default({}),
  override_timestamps: z.boolean().optional().default(false),
});

export const issueAndLog = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payload = issueAndLogSchema.parse(req.body);
    const userId = (req as any).user?.id || (req as any).user?._id;
    const actionDate = payload.date ? new Date(payload.date) : new Date();

    // 1. Lấy danh sách các book_id (bao gồm book chính và các book đồng bộ, loại bỏ trùng lặp)
    const targetBookIds = Array.from(new Set([payload.book_id, ...payload.sync_book_ids]));

    // 2. Validate Entities
    const books = await ProductionBookModel.find({ _id: { $in: targetBookIds } }).session(session);
    const activity = await ActivitiesModel.findById(payload.activity_id).session(session);
    const material = await InventoryMaterialModel.findById(payload.material_id).session(session);
    const template = await InventoryTemplateModel.findById(payload.template_id).session(session);
    const stock = await InventoryStockModel.findOne({
      farm_id: payload.farm_id,
      material_id: payload.material_id
    }).session(session);

    if (books.length === 0) throw new Error('Production Book not found');
    if (!activity) throw new Error('Activity not found');
    if (!material) throw new Error('Material not found');
    if (!template) throw new Error('Inventory Template not found');

    const totalQuantityToDeduct = payload.quantity * books.length;

    // 3. Check Stock Quantity
    const systemConfig = await SystemConfigModel.findOne().session(session);
    const allowNegative = systemConfig?.allow_negative_stock || false;
    
    const currentStock = stock?.quantity_on_hand || 0;
    if (!allowNegative && currentStock < totalQuantityToDeduct) {
      throw new Error(`Vật tư không đủ. Yêu cầu: ${totalQuantityToDeduct}, Khả dụng: ${currentStock}`);
    }

    const productionLogsToSave: any[] = [];
    const inventoryLogsToSave: any[] = [];

    // 4. Create ProductionLog and InventoryLog for each book
    for (const book of books) {
      const productionLogId = new mongoose.Types.ObjectId();
      const inventoryLogId = new mongoose.Types.ObjectId();

      const productionLog = new ProductionLogModel({
        _id: productionLogId,
        farm_id: payload.farm_id,
        activity_id: payload.activity_id,
        book_id: book._id,
        date: actionDate,
        data: payload.production_data,
        notes: payload.notes,
        created_by: userId,
        inventory_log_id: inventoryLogId.toString(),
        ...(payload.override_timestamps ? { created_at: actionDate, updated_at: actionDate } : {})
      });

      const inventoryLog = new InventoryLogModel({
        _id: inventoryLogId,
        farm_id: payload.farm_id,
        book_id: book._id,
        template_id: payload.template_id,
        material_id: payload.material_id,
        domain: material.domain,
        category: material.category,
        template_key: 'issue_for_production',
        template_version: 1,
        transaction_type: 'out',
        log_date: actionDate,
        quantity: payload.quantity,
        unit: material.unit,
        material_snapshot: {
          material_name: material.name,
          supplier_name: material.supplier_name,
          manufacturer: material.manufacturer,
          unit: material.unit
        },
        data: payload.inventory_data,
        notes: payload.notes,
        status: 'approved',
        source_reference: {
          model: 'ProductionLog',
          id: productionLogId
        },
        created_by: userId,
        ...(payload.override_timestamps ? { createdAt: actionDate, updatedAt: actionDate } : {})
      });

      productionLogsToSave.push(productionLog);
      inventoryLogsToSave.push(inventoryLog);
    }

    // 5. Update InventoryStock
    let currentStockObj = stock;
    if (!currentStockObj) {
      currentStockObj = new InventoryStockModel({
        farm_id: payload.farm_id,
        material_id: payload.material_id,
        material_name: material.normalized_name,
        quantity_on_hand: 0,
        supplier_name: material.supplier_name,
        unit: material.unit,
        category: template.category,
        status: 'active'
      });
    }

    currentStockObj.quantity_on_hand -= totalQuantityToDeduct;
    currentStockObj.last_transaction_type = 'out';
    currentStockObj.last_transaction_at = actionDate;
    if (inventoryLogsToSave.length > 0) {
      currentStockObj.last_log_id = inventoryLogsToSave[0]._id as mongoose.Types.ObjectId; // Lấy cái đầu tiên làm đại diện
    }
    if (currentStockObj.quantity_on_hand <= 0) {
      currentStockObj.status = 'depleted';
    }

    // Save all
    await ProductionLogModel.insertMany(productionLogsToSave, { session });
    await InventoryLogModel.insertMany(inventoryLogsToSave, { session });
    await currentStockObj.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 6. Sync Shared Field Values (History) outside the transaction
    try {
      const syncPromises = [];
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const productionLog = productionLogsToSave[i];
        const inventoryLog = inventoryLogsToSave[i];

        const farmObj = {
          _id: payload.farm_id,
          farm_type_id: book.farm_type_id
        };

        syncPromises.push(
          syncSharedFieldValuesFromLog({
            farm: farmObj,
            activity,
            book,
            log: productionLog
          })
        );
        syncPromises.push(
          syncSharedFieldValuesFromInventoryLog({
            farm: farmObj,
            template,
            log: inventoryLog
          })
        );
      }
      await Promise.all(syncPromises);
    } catch (syncError) {
      console.error('Error syncing shared field values in workflow:', syncError);
      // We don't fail the request if syncing history fails
    }

    res.status(200).json({
      message: 'Workflow executed successfully',
      data: {
        synced_books_count: books.length,
        total_quantity_deducted: totalQuantityToDeduct,
        production_logs: productionLogsToSave,
        inventory_logs: inventoryLogsToSave
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    
    // Catch custom errors thrown in try block
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
       res.status(400).json({ message: error.message });
       return;
    }

    console.error('Error issueAndLog:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const receiveAndLogSchema = z.object({
  farm_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid farm_id'),
  book_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid book_id'),
  activity_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid activity_id'),
  material_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid material_id'),
  template_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid template_id'),
  quantity: z.number().min(0, 'Quantity must be at least 0'),
  date: z.string().optional(),
  notes: z.string().optional(),
  production_data: z.record(z.any()).optional().default({}),
  inventory_data: z.record(z.any()).optional().default({}),
  override_timestamps: z.boolean().optional().default(false),
});

export const receiveAndLog = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payload = receiveAndLogSchema.parse(req.body);
    const userId = (req as any).user?.id || (req as any).user?._id;
    const actionDate = payload.date ? new Date(payload.date) : new Date();

    // 1. Validate Entities
    const book = await ProductionBookModel.findById(payload.book_id).session(session);
    const activity = await ActivitiesModel.findById(payload.activity_id).session(session);
    const material = await InventoryMaterialModel.findById(payload.material_id).session(session);
    const template = await InventoryTemplateModel.findById(payload.template_id).session(session);
    const stock = await InventoryStockModel.findOne({
      farm_id: payload.farm_id,
      material_id: payload.material_id
    }).session(session);

    if (!book) throw new Error('Production Book not found');
    if (!activity) throw new Error('Activity not found');
    if (!material) throw new Error('Material not found');
    if (!template) throw new Error('Inventory Template not found');

    const productionLogId = new mongoose.Types.ObjectId();
    const inventoryLogId = new mongoose.Types.ObjectId();

    // 2. Create ProductionLog and InventoryLog
    const productionLog = new ProductionLogModel({
      _id: productionLogId,
      farm_id: payload.farm_id,
      activity_id: payload.activity_id,
      book_id: book._id,
      date: actionDate,
      data: payload.production_data,
      notes: payload.notes,
      created_by: userId,
      inventory_log_id: inventoryLogId.toString(),
      ...(payload.override_timestamps ? { created_at: actionDate, updated_at: actionDate } : {})
    });

    const inventoryLog = new InventoryLogModel({
      _id: inventoryLogId,
      farm_id: payload.farm_id,
      book_id: book._id,
      template_id: payload.template_id,
      material_id: payload.material_id,
      domain: material.domain,
      category: material.category,
      template_key: 'receive_for_production',
      template_version: 1,
      transaction_type: 'in',
      log_date: actionDate,
      quantity: payload.quantity,
      unit: material.unit,
      material_snapshot: {
        material_name: material.name,
        supplier_name: material.supplier_name,
        manufacturer: material.manufacturer,
        unit: material.unit
      },
      data: payload.inventory_data,
      notes: payload.notes,
      status: 'approved',
      source_reference: {
        model: 'ProductionLog',
        id: productionLogId
      },
      created_by: userId,
      ...(payload.override_timestamps ? { createdAt: actionDate, updatedAt: actionDate } : {})
    });

    // 3. Update InventoryStock
    let currentStockObj = stock;
    if (!currentStockObj) {
      currentStockObj = new InventoryStockModel({
        farm_id: payload.farm_id,
        material_id: payload.material_id,
        material_name: material.normalized_name,
        quantity_on_hand: 0,
        supplier_name: material.supplier_name,
        unit: material.unit,
        category: template.category,
        status: 'active'
      });
    }

    currentStockObj.quantity_on_hand += payload.quantity;
    currentStockObj.last_transaction_type = 'in';
    currentStockObj.last_transaction_at = actionDate;
    currentStockObj.last_log_id = inventoryLogId;
    if (currentStockObj.quantity_on_hand > 0) {
      currentStockObj.status = 'active'; // In case it was 'depleted'
    }

    // Save all
    await productionLog.save({ session });
    await inventoryLog.save({ session });
    await currentStockObj.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 4. Sync Shared Field Values (History) outside the transaction
    try {
      const farmObj = {
        _id: payload.farm_id,
        farm_type_id: book.farm_type_id
      };
      await Promise.all([
        syncSharedFieldValuesFromLog({
          farm: farmObj,
          activity,
          book,
          log: productionLog
        }),
        syncSharedFieldValuesFromInventoryLog({
          farm: farmObj,
          template,
          log: inventoryLog
        })
      ]);
    } catch (syncError) {
      console.error('Error syncing shared field values in workflow:', syncError);
    }

    res.status(200).json({
      message: 'Receive workflow executed successfully',
      data: {
        production_log: productionLog,
        inventory_log: inventoryLog
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    
    if (error.message.includes('not found')) {
       res.status(400).json({ message: error.message });
       return;
    }

    console.error('Error receiveAndLog:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
