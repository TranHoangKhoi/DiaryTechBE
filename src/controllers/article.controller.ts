import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import axios from 'axios';
import ArticleModel from '../models/Article.model';

const parsePositiveInt = (value: unknown, fallback: number, max = 100) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const createArticleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional().default(''),
  content: z.string().trim().min(1, 'Content is required'),
  thumbnail: z.string().trim().optional().default(''),
  source_url: z.string().trim().optional().default(''),
  source_domain: z.string().trim().optional().default(''),
  crawl_at: z.string().optional().or(z.date())
});

export const crawlArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, message: 'URL is required' });
      return;
    }

    const apiUrl = process.env.OCR_API_URL + 'v1/crawl'; // Assuming OCR_API_URL is "https://api-ocr.bittechx.cloud/api/v1/"
    // wait, the .env.local has OCR_API_URL=https://api-ocr.bittechx.cloud/api/
    // and the user requested https://api-ocr.bittechx.cloud/api/v1/crawl
    // So let's just use the exact URL:
    const exactApiUrl = 'https://api-ocr.bittechx.cloud/api/v1/crawl';

    const apiKey = process.env.OCR_API_KEY;
    console.log('apiUrl: ', apiUrl);

    if (!apiKey) {
      res.status(500).json({ success: false, message: 'OCR_API_KEY is not configured' });
      return;
    }

    const response = await axios.post(
      exactApiUrl,
      { url },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.success) {
      res.status(200).json(response.data);
    } else {
      console.log('Failed to crawl article:', response.data);

      res.status(400).json({
        success: false,
        message: response.data?.message || 'Failed to crawl article'
      });
    }
  } catch (error: any) {
    console.error('Error in crawlArticle:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Internal server error during crawl'
    });
  }
};

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = createArticleSchema.parse(req.body);

    const article = await ArticleModel.create({
      ...payload,
      created_by: req.user?.id // Assuming req.user is set by auth middleware
    });

    res.status(201).json({
      success: true,
      message: 'Create article successfully',
      data: article
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      return;
    }
    console.error('Error in createArticle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [articles, total] = await Promise.all([
      ArticleModel.find({}).sort({ created_at: -1 }).skip(skip).limit(limitNumber),
      ArticleModel.countDocuments({})
    ]);

    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error in getArticles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid article id' });
      return;
    }

    const article = await ArticleModel.findById(id);
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error in getArticleById:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
