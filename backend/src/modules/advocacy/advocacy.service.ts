import { AdvocacyTaskModel } from './advocacy-task.model.js';
import { AdvocacyContentModel } from './advocacy-content.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { UserModel } from '../auth/auth.model.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { AuditService } from '../audit/audit.service.js';

export const advocacyService = {
  // Content Management (Cards & Tips)
  async getContent(type?: 'EDUCATION_CARD' | 'PREVENTIVE_TIP') {
    const query = type ? { type, status: 'PUBLISHED' as const } : { status: 'PUBLISHED' as const };
    return AdvocacyContentModel.find(query).sort({ createdAt: -1 });
  },

  async createContent(data: any, authorId: string, authorRole: string, ipAddress: string, userAgent: string) {
    const content = new AdvocacyContentModel({
      title: data.title,
      type: data.type,
      category: data.category,
      content: data.content,
      imageUrl: data.imageUrl,
      authorId,
      status: data.status || 'DRAFT'
    });

    const saved = await content.save();

    await AuditService.log({
      actorId: authorId,
      actorRole: authorRole,
      action: 'ADVOCACY_CONTENT_CREATED',
      resourceType: 'AdvocacyContent',
      resourceId: saved.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { title: saved.title, type: saved.type },
    });

    return saved;
  },

  async updateContentStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED', userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const content = await AdvocacyContentModel.findById(id);
    if (!content) throw new NotFoundError('Content not found.');

    const oldStatus = content.status;
    content.status = status;
    await content.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'ADVOCACY_CONTENT_STATUS_UPDATED',
      resourceType: 'AdvocacyContent',
      resourceId: content.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      previousState: { status: oldStatus },
      newState: { status: content.status },
    });

    return content;
  },

  // Task Management
  async createTask(data: any, creatorId: string, creatorRole: string, ipAddress: string, userAgent: string) {
    const patient = await PatientModel.findById(data.patientId);
    if (!patient) throw new NotFoundError('Patient not found.');

    if (data.assignedTo) {
      const assignee = await UserModel.findById(data.assignedTo);
      if (!assignee) throw new NotFoundError('Assignee user not found.');
    }

    const task = new AdvocacyTaskModel({
      patientId: data.patientId,
      assignedTo: data.assignedTo || null,
      createdBy: creatorId,
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: [],
    });

    const saved = await task.save();

    await AuditService.log({
      actorId: creatorId,
      actorRole: creatorRole,
      action: 'ADVOCACY_TASK_CREATED',
      resourceType: 'AdvocacyTask',
      resourceId: saved.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { title: saved.title, patientId: saved.patientId.toString() },
    });

    return saved;
  },

  async getTasks(page: number, limit: number, filters: { patientId?: string; assignedTo?: string; status?: string }) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.status) query.status = filters.status;

    const [tasks, total] = await Promise.all([
      AdvocacyTaskModel.find(query).skip(skip).limit(limitNum).sort({ dueDate: 1, createdAt: -1 }),
      AdvocacyTaskModel.countDocuments(query),
    ]);

    const decrypted = tasks.map((task) => {
      const obj = task.toObject();
      obj.notes = obj.notes.map(note => {
        try {
          note.text = decrypt(note.text);
        } catch {
          note.text = '[Decryption Failed]';
        }
        return note;
      });
      return obj;
    });

    return createPaginatedResponse(decrypted, page, limitNum, total);
  },

  async getTaskById(id: string) {
    const task = await AdvocacyTaskModel.findById(id).populate('assignedTo', 'firstName lastName').populate('notes.authorId', 'firstName lastName role');
    if (!task) throw new NotFoundError('Task not found.');

    const obj = task.toObject();
    obj.notes = obj.notes.map(note => {
      try {
        note.text = decrypt(note.text);
      } catch {
        note.text = '[Decryption Failed]';
      }
      return note;
    });

    return obj;
  },

  async updateTaskStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const task = await AdvocacyTaskModel.findById(id);
    if (!task) throw new NotFoundError('Task not found.');

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'ADVOCACY_TASK_STATUS_UPDATED',
      resourceType: 'AdvocacyTask',
      resourceId: task.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      previousState: { status: oldStatus },
      newState: { status: task.status },
    });

    return this.getTaskById(id);
  },

  async addTaskNote(id: string, text: string, authorId: string, userRole: string, ipAddress: string, userAgent: string) {
    const task = await AdvocacyTaskModel.findById(id);
    if (!task) throw new NotFoundError('Task not found.');

    const encryptedText = encrypt(text);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    task.notes.push({
      text: encryptedText,
      authorId: authorId as any,
      createdAt: new Date(),
    });

    await task.save();

    await AuditService.log({
      actorId: authorId,
      actorRole: userRole,
      action: 'ADVOCACY_TASK_NOTE_ADDED',
      resourceType: 'AdvocacyTask',
      resourceId: task.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
    });

    return this.getTaskById(id);
  }
};
