import mongoose, { Document } from 'mongoose';

export interface IReportTemplate extends Document {
  name: string;
  farm_type_id: mongoose.Types.ObjectId;
  report_code: string;
  template_url: string;
  data_sources: {
    activity_ids: mongoose.Types.ObjectId[];
    inventory_categories: string[];
  };
  aggregator_function: string;
  pad_empty_rows: number;
  is_active: boolean;
  created_by?: mongoose.Types.ObjectId;
}

const ReportTemplateSchema = new mongoose.Schema<IReportTemplate>(
  {
    name: { type: String, required: true, trim: true },
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', required: true },
    report_code: { type: String, required: true, uppercase: true, trim: true },
    template_url: { type: String, required: true, trim: true },
    data_sources: {
      activity_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activities' }],
      inventory_categories: [{ type: String }]
    },
    aggregator_function: { type: String, required: true, trim: true },
    pad_empty_rows: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

ReportTemplateSchema.index({ farm_type_id: 1, report_code: 1 }, { unique: true });

export default mongoose.model<IReportTemplate>('ReportTemplate', ReportTemplateSchema);
