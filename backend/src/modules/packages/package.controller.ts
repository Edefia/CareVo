import type { Request, Response } from 'express';
import { PackageModel } from './package.model.js';

export const getActivePackages = async (req: Request, res: Response) => {
  try {
    const packages = await PackageModel.find({ isActive: true }).sort({ price: -1 });
    
    res.status(200).json({
      status: 'success',
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch packages',
    });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  try {
    const newPackage = await PackageModel.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: newPackage,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create package',
    });
  }
};
