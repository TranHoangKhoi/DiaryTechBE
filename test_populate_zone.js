const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://diary_tech:123456@127.0.0.1:27018/diary_tech?replicaSet=rs0&authSource=diary_tech&directConnection=true');
  
  const FarmZoneSchema = new mongoose.Schema({
    name: String
  });
  const FarmZone = mongoose.model('FarmZone', FarmZoneSchema, 'farmzones');

  const ProductionBookSchema = new mongoose.Schema({
    name: String,
    zone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmZone' }
  });
  const ProductionBook = mongoose.model('ProductionBook', ProductionBookSchema, 'productionbooks');

  // Find a book that actually has a zone_id
  const bookWithZone = await ProductionBook.findOne({ zone_id: { $ne: null } })
    .populate('zone_id', 'name zone_type properties area unit species');

  console.log(JSON.stringify(bookWithZone, null, 2));
  process.exit(0);
}

test().catch(console.error);
