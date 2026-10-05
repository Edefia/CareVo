import { LaboratoryModel, type ILaboratory } from './laboratory.model.js';
import { LabServiceModel, type ILabService } from './lab-service.model.js';
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

  async getLaboratories(page: number, limit: number, packageId?: string, testName?: string) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    let query: any = {};
    let packagePrices: Record<string, number> = {};

    if (packageId || testName) {
      const filter: any = { approvalStatus: 'APPROVED' };
      if (packageId) filter.packageId = packageId;
      if (testName) filter.name = testName;

      const services = await LabServiceModel.find(filter);
      const labIds = services.map(s => s.laboratoryId);
      query = { _id: { $in: labIds } };
      
      services.forEach(s => {
        packagePrices[s.laboratoryId.toString()] = s.platformPrice;
      });
    }

    const [laboratories, total] = await Promise.all([
      LaboratoryModel.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
      LaboratoryModel.countDocuments(query),
    ]);

    if (packageId) {
      laboratories.forEach((lab: any) => {
        lab.packagePrice = packagePrices[lab._id.toString()];
      });
    }

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
    const result = await LaboratoryModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Laboratory not found.');
    }
  },

  // --- LAB SERVICES ---
  async createLabService(laboratoryId: string, data: Partial<ILabService>): Promise<ILabService> {
    const labService = new LabServiceModel({
      ...data,
      laboratoryId,
      platformPrice: data.platformPrice ?? data.labPrice, // Default platform price to lab price initially
      approvalStatus: 'PENDING',
    });
    return await labService.save();
  },

  async getLabServices(laboratoryId: string, page: number, limit: number, filters: any = {}) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    const query = { laboratoryId, ...filters };

    const [services, total] = await Promise.all([
      LabServiceModel.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      LabServiceModel.countDocuments(query),
    ]);

    return createPaginatedResponse(services, page, limitNum, total);
  },

  async getAllLabServices(page: number, limit: number, filters: any = {}) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    const [services, total] = await Promise.all([
      LabServiceModel.find(filters).populate('laboratoryId', 'name code').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      LabServiceModel.countDocuments(filters),
    ]);

    return createPaginatedResponse(services, page, limitNum, total);
  },

  async updateLabService(id: string, laboratoryId: string, updateData: Partial<ILabService>, isAdmin: boolean = false): Promise<ILabService> {
    const service = await LabServiceModel.findOne({ _id: id, laboratoryId });
    if (!service) {
      throw new NotFoundError('Lab service not found.');
    }

    // If it's a normal lab user updating their service, force approvalStatus back to PENDING if they touch sensitive fields
    if (!isAdmin && (updateData.name || updateData.labPrice || updateData.category)) {
      updateData.approvalStatus = 'PENDING';
      // They can't set platformPrice directly
      delete updateData.platformPrice;
    }

    Object.assign(service, updateData);
    return await service.save();
  },

  async updateLabServiceStatus(id: string, updateData: Partial<ILabService> & { adminComment?: string }): Promise<ILabService> {
    const service = await LabServiceModel.findById(id).populate('laboratoryId', 'name contactEmail');
    if (!service) {
      throw new NotFoundError('Lab service not found.');
    }

    const previousStatus = service.approvalStatus;
    Object.assign(service, updateData);
    const savedService = await service.save();

    // --- Send Notification ---
    const lab = service.laboratoryId as any;
    if (lab?.contactEmail && updateData.approvalStatus && updateData.approvalStatus !== previousStatus) {
      try {
        const { notificationService } = await import('../notifications/notification.service.js');
        const status = updateData.approvalStatus;

        if (status === 'APPROVED') {
          await notificationService.sendEmail(
            lab.contactEmail,
            `Service Approved: ${service.name}`,
            'labServiceApproved',
            {
              labName: lab.name,
              serviceName: service.name,
              category: service.category,
              labPrice: service.labPrice.toFixed(2),
              platformPrice: service.platformPrice.toFixed(2),
              adminComment: updateData.adminComment || undefined,
            }
          );
        } else if (status === 'REJECTED') {
          const wasApproved = previousStatus === 'APPROVED';
          const templateKey = wasApproved ? 'labServiceRevoked' : 'labServiceRejected';
          const subject = wasApproved ? `Service Revoked: ${service.name}` : `Service Review: ${service.name}`;

          await notificationService.sendEmail(
            lab.contactEmail,
            subject,
            templateKey,
            {
              labName: lab.name,
              serviceName: service.name,
              category: service.category,
              adminComment: updateData.adminComment || undefined,
            }
          );
        }
      } catch (emailErr) {
        // Log but don't block the status update
        const { logger } = await import('../../utils/logger.js');
        logger.error('Failed to send lab service notification email', { error: (emailErr as Error).message });
      }
    }

    return savedService;
  },

  async deleteLabService(id: string, laboratoryId: string): Promise<void> {
    const result = await LabServiceModel.deleteOne({ _id: id, laboratoryId });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Lab service not found.');
    }
  },
};
