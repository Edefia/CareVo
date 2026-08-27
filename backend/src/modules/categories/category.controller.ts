import type { Request, Response, NextFunction } from 'express';
import { CategoryModel } from './category.model.js';
import { sendSuccess } from '../../utils/apiResponse.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const categoryController = {
  // Public: Get active categories
  async getActiveCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = { isActive: true };
      if (req.query.appliesTo) {
        filter.appliesTo = req.query.appliesTo;
      }
      const categories = await CategoryModel.find(filter).sort({ name: 1 });
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get all categories
  async getAllCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryModel.find().sort({ createdAt: -1 });
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Create category
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, appliesTo } = req.body;
      const slug = slugify(name);

      const existing = await CategoryModel.findOne({ slug });
      if (existing) {
        res.status(409).json({ success: false, message: 'A category with this name already exists.' });
        return;
      }

      const category = await CategoryModel.create({
        name,
        slug,
        description,
        appliesTo: appliesTo || ['PACKAGES', 'LAB_SERVICES'],
      });

      sendSuccess(res, category, 201);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Update category
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }

      if (req.body.name && req.body.name !== category.name) {
        req.body.slug = slugify(req.body.name);
      }

      Object.assign(category, req.body);
      await category.save();
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Delete category
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryModel.findByIdAndDelete(req.params.id);
      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
