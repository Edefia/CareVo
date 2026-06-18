import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { PatientModel } from '../patients/patient.model.js';
import { BookingModel } from '../bookings/booking.model.js';
import { InvoiceModel } from '../billing/invoice.model.js';
import { InterpretationModel } from '../interpretations/interpretation.model.js';
import { LaboratoryModel } from '../laboratories/laboratory.model.js';
import { UserModel } from '../auth/auth.model.js';

export const analyticsController = {
  async getDashboardMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalPatients,
        totalUsers,
        totalLabs,
        activeLabs,
        totalBookings,
        pendingBookings,
        completedBookings,
        unpaidInvoices,
        pendingInterpretations,
        monthlyRevenueResult,
        pendingPaymentsResult,
        recentUsers,
      ] = await Promise.all([
        PatientModel.countDocuments(),
        UserModel.countDocuments({ deletedAt: null }).catch(() => 0),
        LaboratoryModel.countDocuments(),
        LaboratoryModel.countDocuments({ isActive: true }),
        BookingModel.countDocuments(),
        BookingModel.countDocuments({ status: 'PENDING' }),
        BookingModel.countDocuments({ status: 'COMPLETED' }),
        InvoiceModel.countDocuments({ status: 'PENDING' }),
        InterpretationModel.countDocuments({ status: 'DRAFT' }),
        InvoiceModel.aggregate([
          { $match: { status: 'PAID', paidAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        InvoiceModel.aggregate([
          { $match: { status: 'PENDING' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        UserModel.find({ deletedAt: null })
          .select('firstName lastName role isActive createdAt lastLoginAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .catch(() => []),
      ]);

      const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
      const pendingPaymentsAmount = pendingPaymentsResult[0]?.total || 0;

      sendSuccess(res, {
        totalPatients,
        totalUsers,
        totalLabs,
        activeLabs,
        totalBookings,
        pendingBookings,
        completedBookings,
        unpaidInvoices,
        pendingInterpretations,
        monthlyRevenue,
        pendingPaymentsAmount,
        recentUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  async getRevenueChart(_req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const revenueData = await InvoiceModel.aggregate([
        {
          $match: {
            status: 'PAID',
            paidAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$paidAt' },
              month: { $month: '$paidAt' },
            },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const match = revenueData.find(
          (r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1
        );
        chartData.push({
          name: months[d.getMonth()],
          revenue: match ? match.revenue / 100 : 0, // Convert pesewas to GHS
        });
      }

      sendSuccess(res, chartData);
    } catch (error) {
      next(error);
    }
  },

  async getBookingStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const weeklyBookings = await BookingModel.aggregate([
        {
          $match: {
            scheduledAt: { $gte: startOfWeek },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: '$scheduledAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = days.map((day, idx) => {
        const match = weeklyBookings.find((b) => b._id === idx + 1);
        return { name: day, count: match ? match.count : 0 };
      });

      // Lab performance
      const labPerformance = await LaboratoryModel.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'laboratoryId',
            as: 'bookings',
          },
        },
        {
          $project: {
            name: 1,
            'address.city': 1,
            'address.state': 1,
            isActive: 1,
            bookingCount: { $size: '$bookings' },
            completedBookings: {
              $size: {
                $filter: {
                  input: '$bookings',
                  cond: { $eq: ['$$this.status', 'COMPLETED'] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            efficiency: {
              $cond: [
                { $gt: ['$bookingCount', 0] },
                { $multiply: [{ $divide: ['$completedBookings', '$bookingCount'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 10 },
      ]);

      sendSuccess(res, { weeklyBookings: chartData, labPerformance });
    } catch (error) {
      next(error);
    }
  },
};
