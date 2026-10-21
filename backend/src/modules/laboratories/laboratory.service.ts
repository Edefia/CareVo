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
    // Capture lab details before save in case populate is cleared
    const lab = service.laboratoryId as unknown as {
      _id: { toString(): string };
      name?: string;
      contactEmail?: string;
    } | null;
    const laboratoryId = lab?._id?.toString() || String(service.laboratoryId);
    const labName = lab?.name || 'Laboratory Partner';
    const labContactEmail = lab?.contactEmail?.toLowerCase().trim();

    Object.assign(service, updateData);
    const savedService = await service.save();

    const nextStatus = updateData.approvalStatus;
    if (!nextStatus || nextStatus === previousStatus) {
      return savedService;
    }

    try {
      const { notificationService } = await import('../notifications/notification.service.js');
      const { NotificationModel } = await import('../notifications/notification.model.js');
      const { UserModel } = await import('../auth/auth.model.js');
      const { logger } = await import('../../utils/logger.js');
      const { getIO } = await import('../../config/socket.js');

      const labUsers = await UserModel.find({
        laboratoryId,
        role: 'LABORATORY',
        isActive: true,
      }).select('_id email firstName lastName');

      const recipientEmails = new Set<string>();
      if (labContactEmail) recipientEmails.add(labContactEmail);
      for (const user of labUsers) {
        if (user.email) recipientEmails.add(user.email.toLowerCase().trim());
      }

      const isApproved = nextStatus === 'APPROVED';
      const wasApproved = previousStatus === 'APPROVED';
      const isRevoke = nextStatus === 'REJECTED' && wasApproved;

      let templateKey: 'labServiceApproved' | 'labServiceRejected' | 'labServiceRevoked';
      let subject: string;
      let inAppTitle: string;
      let inAppMessage: string;
      let templateData: Record<string, unknown>;

      if (isApproved) {
        templateKey = 'labServiceApproved';
        subject = `Service Approved: ${service.name}`;
        inAppTitle = 'Service approved';
        inAppMessage = `"${service.name}" is now live and available for bookings.`;
        templateData = {
          labName,
          serviceName: service.name,
          category: service.category,
          labPrice: Number(service.labPrice).toFixed(2),
          platformPrice: Number(service.platformPrice).toFixed(2),
          turnaroundTime: service.turnaroundTime,
          adminComment: updateData.adminComment || undefined,
        };
      } else if (isRevoke) {
        templateKey = 'labServiceRevoked';
        subject = `Service Revoked: ${service.name}`;
        inAppTitle = 'Service revoked';
        inAppMessage = `"${service.name}" has been revoked and is no longer visible to clients.`;
        templateData = {
          labName,
          serviceName: service.name,
          category: service.category,
          adminComment: updateData.adminComment || undefined,
        };
      } else {
        templateKey = 'labServiceRejected';
        subject = `Service Review Update: ${service.name}`;
        inAppTitle = 'Service needs changes';
        inAppMessage = `"${service.name}" was not approved. Please review the admin feedback and resubmit.`;
        templateData = {
          labName,
          serviceName: service.name,
          category: service.category,
          adminComment: updateData.adminComment || undefined,
        };
      }

      if (recipientEmails.size === 0) {
        logger.warn('No lab email recipients found for service status notification', {
          serviceId: id,
          laboratoryId,
          status: nextStatus,
        });
      } else {
        await Promise.all(
          Array.from(recipientEmails).map((email) =>
            notificationService.sendEmail(email, subject, templateKey, templateData)
          )
        );
        logger.info('Lab service status emails sent', {
          serviceId: id,
          laboratoryId,
          status: nextStatus,
          recipients: Array.from(recipientEmails),
        });
      }

      // In-app notifications for laboratory portal users
      if (labUsers.length > 0) {
        const notificationType = isApproved
          ? 'SERVICE_APPROVED'
          : isRevoke
            ? 'SERVICE_REVOKED'
            : 'SERVICE_REJECTED';

        await NotificationModel.insertMany(
          labUsers.map((user) => ({
            recipientId: user._id,
            title: inAppTitle,
            message: inAppMessage,
            type: notificationType,
            metadata: {
              serviceId: service._id.toString(),
              serviceName: service.name,
              approvalStatus: nextStatus,
              adminComment: updateData.adminComment || null,
            },
          }))
        );

        try {
          const io = getIO();
          for (const user of labUsers) {
            io.to(`user:${user._id.toString()}`).emit('new_notification', {
              title: inAppTitle,
              message: inAppMessage,
              type: notificationType,
              createdAt: new Date(),
              isRead: false,
            });
          }
        } catch {
          // Socket may be unavailable in some environments
        }
      }
    } catch (notifyErr) {
      const { logger } = await import('../../utils/logger.js');
      logger.error('Failed to send lab service status notifications', {
        serviceId: id,
        error: (notifyErr as Error).message,
      });
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
