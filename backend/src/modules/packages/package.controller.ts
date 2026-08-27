import type { Request, Response, NextFunction } from 'express';
import { PackageModel } from './package.model.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';

export const packageController = {
  // Public: Get active packages only (for clients)
  async getActivePackages(_req: Request, res: Response, next: NextFunction) {
    try {
      const packages = await PackageModel.find({ isActive: true }).sort({ name: 1 });
      sendSuccess(res, packages);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get ALL packages (including inactive)
  async getAllPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const { skip, limit: limitNum } = getPaginationOptions(page, limit);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const [packages, total] = await Promise.all([
        PackageModel.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
        PackageModel.countDocuments(query),
      ]);

      res.status(200).json(createPaginatedResponse(packages, page, limitNum, total));
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get package by ID
  async getPackageById(req: Request, res: Response, next: NextFunction) {
    try {
      const pkg = await PackageModel.findById(req.params.id);
      if (!pkg) {
        res.status(404).json({ success: false, message: 'Package not found' }); return;
      }
      sendSuccess(res, pkg);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Create package
  async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const newPackage = await PackageModel.create(req.body);

      // Notify all active laboratories about the new package
      try {
        const { LaboratoryModel } = await import('../laboratories/laboratory.model.js');
        const { notificationService } = await import('../notifications/notification.service.js');
        const labs = await LaboratoryModel.find({ isActive: true }).select('name contactEmail');

        for (const lab of labs) {
          if (lab.contactEmail) {
            notificationService.sendEmail(
              lab.contactEmail,
              `New Package Available: ${newPackage.name}`,
              'newGlobalPackage',
              {
                labName: lab.name,
                packageName: newPackage.name,
                category: newPackage.category || 'General',
                description: newPackage.description,
                testsIncluded: newPackage.testsIncluded || [],
              }
            ).catch(() => {}); // Fire and forget
          }
        }
      } catch { /* Don't block package creation */ }

      sendSuccess(res, newPackage, 201);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Update package
  async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const pkg = await PackageModel.findById(req.params.id);
      if (!pkg) {
        res.status(404).json({ success: false, message: 'Package not found' }); return;
      }

      Object.assign(pkg, req.body);
      await pkg.save();
      sendSuccess(res, pkg);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Delete package
  async deletePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const pkg = await PackageModel.findByIdAndDelete(req.params.id);
      if (!pkg) {
        res.status(404).json({ success: false, message: 'Package not found' }); return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
