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

  const books = await ProductionBook.find({ farm_id: new mongoose.Types.ObjectId("6a224fbf3d3f252b8880bcd1") })
    .populate('zone_id', 'name zone_type properties area unit species');

  console.log(JSON.stringify(books, null, 2));
  process.exit(0);
}

test().catch(console.error);
