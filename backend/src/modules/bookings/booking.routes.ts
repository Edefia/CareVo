import { Router } from 'express';
import { bookingController } from './booking.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema, updateBookingNotesSchema } from './booking.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const bookingRoutes = Router();

bookingRoutes.use(authenticate);

// Create booking (Patient can create their own, or staff with BOOKINGS_CREATE)
bookingRoutes.post('/', authorize([PERMISSIONS.BOOKINGS_CREATE, PERMISSIONS.PATIENTS_READ_OWN]), validate(createBookingSchema), bookingController.createBooking);

// List bookings
bookingRoutes.get('/', authorize([PERMISSIONS.PATIENTS_READ_OWN, PERMISSIONS.PATIENTS_READ_ANY]), bookingController.getBookings);

// Get booking by ID
bookingRoutes.get('/:id', authorize([PERMISSIONS.PATIENTS_READ_OWN, PERMISSIONS.PATIENTS_READ_ANY]), bookingController.getBookingById);

// Update status
bookingRoutes.patch('/:id/status', authorize([PERMISSIONS.BOOKINGS_CONFIRM]), validate(updateBookingStatusSchema), bookingController.updateBookingStatus);

// Update internal notes
bookingRoutes.put('/:id/notes', authorize([PERMISSIONS.BOOKINGS_CONFIRM]), validate(updateBookingNotesSchema), bookingController.updateInternalNotes);
