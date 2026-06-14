import type { Request, Response, NextFunction } from 'express';
import { bookingService } from './booking.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const bookingController = {
  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.createBooking(
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, booking, 201);
    } catch (error) {
      next(error);
    }
  },

  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const patientIdFilter = req.query.patientId as string | undefined;
      const statusFilter = req.query.status as string | undefined;

      const paginatedData = await bookingService.getBookings(
        page,
        limit,
        req.user!.role,
        req.user!.id,
        patientIdFilter,
        statusFilter
      );
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getBookingById(
        req.params.id as string,
        req.user!.role,
        req.user!.id
      );
      sendSuccess(res, booking);
    } catch (error) {
      next(error);
    }
  },

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.updateBookingStatus(
        req.params.id as string,
        req.body.status,
        req.body.meetingLink,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, booking);
    } catch (error) {
      next(error);
    }
  },

  async updateInternalNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.updateInternalNotes(
        req.params.id as string,
        req.body.internalNotes,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, booking);
    } catch (error) {
      next(error);
    }
  },
};
