import { LaboratoryModel, type ILaboratory } from './laboratory.model.js';
import { NotFoundError, ConflictError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';

export const laboratoryService = {
  async createLaboratory(data: Partial<ILaboratory>): Promise<ILaboratory> {
    const existingLab = await LaboratoryModel.findOne({ code: data.code?.toUpperCase() });
    if (existingLab) {
      throw new ConflictError('A laboratory with this code already exists.');
    }

    const laboratory = new LaboratoryModel({
      ...data,
      code: data.code?.toUpperCase(),
    });

    return await laboratory.save();
  },

  async getLaboratoryById(id: string): Promise<ILaboratory> {
    const lab = await LaboratoryModel.findById(id);
    if (!lab) {
      throw new NotFoundError('Laboratory not found.');
    }
    return lab;
  },

  async getLaboratories(page: number, limit: number) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    const [laboratories, total] = await Promise.all([
      LaboratoryModel.find().skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      LaboratoryModel.countDocuments(),
    ]);

    return createPaginatedResponse(laboratories, page, limitNum, total);
  },

  async updateLaboratory(id: string, updateData: Partial<ILaboratory>): Promise<ILaboratory> {
    const lab = await LaboratoryModel.findById(id);
    if (!lab) {
      throw new NotFoundError('Laboratory not found.');
    }

    if (updateData.code && updateData.code.toUpperCase() !== lab.code) {
      const existingLab = await LaboratoryModel.findOne({ code: updateData.code.toUpperCase() });
      if (existingLab) {
        throw new ConflictError('A laboratory with this code already exists.');
      }
    }

    Object.assign(lab, {
      ...updateData,
      code: updateData.code ? updateData.code.toUpperCase() : lab.code,
    });

    return await lab.save();
  },

  async deleteLaboratory(id: string): Promise<void> {
    // Note: Deleting a lab should probably deactivate it or check for attached staff
    // In a real scenario we'd do a soft delete or cascading checks.
    // For now we will do a hard delete as per simple CRUD
    const result = await LaboratoryModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Laboratory not found.');
    }
  },
};
