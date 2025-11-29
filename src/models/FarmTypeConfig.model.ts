// models/FarmTypeConfig.model.ts
import mongoose from 'mongoose';

// -------- FIELD SCHEMA (dùng cho form thường) ----------
const FieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true }, // text, number, date, select
    required: { type: Boolean, default: false },
    options: [
      {
        label: String,
        value: String
      }
    ] // chỉ dùng khi type = select
  },
  { _id: false }
);

// -------- TABLE COLUMN SCHEMA (dùng cho table) ----------
const TableColumnSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true }, // text | number | select
    required: { type: Boolean, default: false },
    options: [
      {
        label: String,
        value: String
      }
    ] // CẦN THÊM để chạy select trong table
  },
  { _id: false }
);

// -------- SECTION SCHEMA (section/table) ----------
const SectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['section', 'table'], required: true },
    fields: [FieldSchema],
    columns: [TableColumnSchema]
  },
  { _id: false }
);

// -------- MAIN CONFIG SCHEMA ----------
const FarmTypeConfigSchema = new mongoose.Schema(
  {
    farm_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmtype',
      required: true,
      unique: true
    },
    title: String,
    description: String,
    sections: [SectionSchema]
  },
  { timestamps: true }
);

export default mongoose.model('FarmTypeConfig', FarmTypeConfigSchema);
