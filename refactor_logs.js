const fs = require('fs');
const path = 'e:/HKB/DiaryTech/FullstackDiary/DiaryTechBE/src/controllers/productionLogs.controller.ts';
let content = fs.readFileSync(path, 'utf8');

const getProductionLogsLogic = `
export const getProductionLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { farm_id, book_id, activity_id, scope, limit, sort, start_date, end_date } = req.query;

    const query: any = {};

    // Base query according to role and scope
    if (user.role === 'owner' || scope === 'owner') {
      const farms = await FarmModel.find({ owner_id: user.id }).select('_id');
      const farmIds = farms.map(f => f._id);
      
      if (farm_id) {
        if (!farmIds.some(id => String(id) === String(farm_id))) {
          res.status(403).json({ message: 'Farm access denied' });
          return;
        }
        query.farm_id = farm_id;
      } else {
        query.farm_id = { $in: farmIds };
      }
    } else {
      if (!farm_id) {
        res.status(400).json({ message: 'farm_id is required' });
        return;
      }
      query.farm_id = farm_id;
    }

    if (book_id) query.book_id = book_id;
    if (activity_id) query.activity_id = activity_id;

    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date as string);
      if (end_date) query.date.$lte = new Date(end_date as string);
    }

    let queryBuilder = ProductionLogsModel.find(query)
      .populate('activity_id', 'activity_name icon fields type expected_days description color code type_activity')
      .populate('user_id', 'name email phone avatar')
      .populate('farm_id', 'farm_name location avatar');

    if (sort) {
      const sortOrder = String(sort).startsWith('-') ? -1 : 1;
      const sortField = String(sort).replace(/^-/, '');
      queryBuilder = queryBuilder.sort({ [sortField]: sortOrder });
    } else {
      queryBuilder = queryBuilder.sort({ date: -1 }); // Default
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(Number(limit));
    }

    const logs = await queryBuilder.lean();

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    console.error('Error fetching production logs:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
`;

// Simple regex replace to remove each old function entirely. We assume they end with a '}' character.
// Because it's hard to accurately parse AST with regex, we can just replace them with empty string and append the new one.
// Let's use a trick: match from export const funcName to the end of its block.
const removeFunction = (name) => {
  const funcStart = new RegExp(`export const ${name} = async \\(req: Request, res: Response\\) (=> )?\\{`);
  const match = content.match(funcStart);
  if (match) {
    let startIndex = match.index;
    let braceCount = 0;
    let endIndex = -1;
    let started = false;
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        started = true;
      } else if (content[i] === '}') {
        braceCount--;
      }
      if (started && braceCount === 0) {
        endIndex = i;
        break;
      }
    }
    if (endIndex !== -1) {
      content = content.substring(0, startIndex) + content.substring(endIndex + 1);
    }
  }
}

['getProductionLogsByActivityAndFarm', 'getProductionLogsByFarm', 'getRecentProductionLogs', 'getOwnerProductionLogs', 'getRecentActivities'].forEach(removeFunction);

content = content + '\n' + getProductionLogsLogic;
fs.writeFileSync(path, content);
console.log('Replaced productionLogs controllers successfully.');
