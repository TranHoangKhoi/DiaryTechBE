import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  source_url: string;
  source_domain: string;
  crawl_at: Date;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    content: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    source_url: { type: String, default: "" },
    source_domain: { type: String, default: "" },
    crawl_at: { type: Date },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.model<IArticle>("Article", ArticleSchema);
