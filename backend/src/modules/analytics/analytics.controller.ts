import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { PatientModel } from '../patients/patient.model.js';
import { BookingModel } from '../bookings/booking.model.js';
import { InvoiceModel } from '../billing/invoice.model.js';
import { InterpretationModel } from '../interpretations/interpretation.model.js';

export const analyticsController = {
  async getDashboardMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalPatients,
        pendingBookings,
        unpaidInvoices,
        pendingInterpretations
      ] = await Promise.all([
        PatientModel.countDocuments(),
        BookingModel.countDocuments({ status: 'PENDING' }),
        InvoiceModel.countDocuments({ status: 'PENDING' }),
        InterpretationModel.countDocuments({ status: 'DRAFT' })
      ]);

      sendSuccess(res, {
        totalPatients,
        pendingBookings,
        unpaidInvoices,
        pendingInterpretations
      });
    } catch (error) {
      next(error);
    }
  },
};
