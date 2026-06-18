import mongoose from 'mongoose';
import { env } from '../config/env.js';
import * as argon2 from 'argon2';
import { UserModel } from '../modules/auth/auth.model.js';
import { LaboratoryModel } from '../modules/laboratories/laboratory.model.js';
import { BookingModel } from '../modules/bookings/booking.model.js';
import { PatientModel } from '../modules/patients/patient.model.js';
import { PackageModel } from '../modules/packages/package.model.js';

const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/carevo';

async function runSeed() {
  console.log('🌱 Starting CareVo database seed...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing realistic test data if needed (optional, here we just insert if not exists)
    // We'll use upsert logic based on emails/codes
    
    console.log('📦 Seeding Packages...');
    await PackageModel.deleteMany({});
    
    await PackageModel.create([
      {
        name: 'Comprehensive Wellness Screen',
        description: 'A complete overview of your health including cardiovascular, renal, and metabolic markers.',
        price: 450,
        currency: 'GHS',
        features: ['Cardio', 'Renal', 'Metabolic'],
        pillarIcon: 'COMPREHENSIVE',
        color: 'text-[#DC2626]',
        bgColor: 'bg-[#DC2626]/10'
      },
      {
        name: 'Cardio Essentials',
        description: 'Focused screening on heart health and lipid profile.',
        price: 250,
        currency: 'GHS',
        features: ['Lipid Panel', 'ECG', 'Blood Pressure'],
        pillarIcon: 'CARDIO',
        color: 'text-[#0F76E0]',
        bgColor: 'bg-[#0F76E0]/10'
      },
      {
        name: 'Metabolic Check',
        description: 'Key indicators for diabetes and metabolic syndrome.',
        price: 200,
        currency: 'GHS',
        features: ['Fasting Glucose', 'HbA1c', 'Insulin'],
        pillarIcon: 'METABOLIC',
        color: 'text-[#D97706]',
        bgColor: 'bg-[#D97706]/10'
      }
    ]);

    // 1. Mock Labs
    console.log('🏢 Seeding Laboratories...');
    const medicanLab = await LaboratoryModel.findOneAndUpdate(
      { code: 'MEDISCAN' },
      {
        name: 'MediScan Ghana',
        code: 'MEDISCAN',
        contactEmail: 'hello@mediscanghana.com',
        contactPhone: '+233 24 123 4567',
        address: {
          street: '12 Independence Ave',
          city: 'Accra',
          state: 'Greater Accra',
          zipCode: 'GA-000',
          country: 'Ghana'
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const acculab = await LaboratoryModel.findOneAndUpdate(
      { code: 'ACCULAB' },
      {
        name: 'AccuLab Diagnostics',
        code: 'ACCULAB',
        contactEmail: 'contact@acculab.com',
        contactPhone: '+233 50 987 6543',
        address: {
          street: '5 Prempeh II St',
          city: 'Kumasi',
          state: 'Ashanti',
          zipCode: 'AK-000',
          country: 'Ghana'
        },
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // 2. Mock Users
    console.log('👥 Seeding Users...');
    const hashedPassword = await argon2.hash('12345hdA$');

    const clientUser = await UserModel.findOneAndUpdate(
      { email: 'hebradalton@gmail.com' },
      {
        email: 'hebradalton@gmail.com',
        passwordHash: hashedPassword,
        firstName: 'Hebra',
        lastName: 'Dalton',
        role: 'CLIENT',
        phone: '+233 556893894',
        isActive: true,
        mfaEnabled: false,
      },
      { upsert: true, new: true }
    );

    // Admin
    const adminUser = await UserModel.findOneAndUpdate(
      { email: 'admin@carevo.com' },
      {
        email: 'admin@carevo.com',
        passwordHash: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        phone: '+233 20 000 0000',
        isActive: true,
        mfaEnabled: false, // Will use email OTP by default
      },
      { upsert: true, new: true }
    );

    const clientPatient = await PatientModel.findOneAndUpdate(
      { userId: clientUser._id },
      {
        userId: clientUser._id,
        dateOfBirth: new Date('1985-04-12'),
        gender: 'Male',
        bloodType: 'O+',
        laboratoryIds: [medicanLab._id, acculab._id],
        address: {
          street: '45 Osu Badu St',
          city: 'Accra',
          state: 'Greater Accra',
          zipCode: 'GA-111',
          country: 'Ghana'
        }
      },
      { upsert: true, new: true }
    );

    // Lab Tech
    const labTechUser = await UserModel.findOneAndUpdate(
      { email: 'mcdaltonhebra@gmail.com' },
      {
        email: 'mcdaltonhebra@gmail.com',
        passwordHash: hashedPassword,
        firstName: 'McHebra',
        lastName: 'Dalton',
        role: 'LABORATORY',
        phone: '+233 24 333 4444',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Clinical Interpreter
    await UserModel.findOneAndUpdate(
      { email: 'deo.waye@gmail.com' },
      {
        email: 'deo.waye@gmail.com',
        passwordHash: hashedPassword,
        firstName: 'DEO',
        lastName: 'Wayne',
        role: 'INTERPRETER',
        phone: '+233 55 555 6666',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // 3. Mock Bookings (Using Referral Codes instead of meetingLink or generic reason)
    console.log('📅 Seeding Bookings...');
    
    const packages = await PackageModel.find({});
    if (packages.length < 2) throw new Error("Packages not seeded correctly");

    // Booking 1
    await BookingModel.findOneAndUpdate(
      { referralCode: 'CRV-2025-A7K3P2' },
      {
        patientId: clientPatient._id,
        packageId: packages[0]?._id,
        locationType: 'HOME',
        referralCode: 'CRV-2025-A7K3P2',
        staffId: labTechUser._id,
        status: 'PENDING',
        scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
        durationMinutes: 30,
        reason: 'General checkup',
        internalNotes: 'Complete Wellness Package - Assigned to MediScan',
      },
      { upsert: true }
    );

    // Booking 2
    await BookingModel.findOneAndUpdate(
      { referralCode: 'CRV-2025-X2L8J4' },
      {
        patientId: clientPatient._id,
        packageId: packages[1]?._id,
        locationType: 'CLINIC',
        referralCode: 'CRV-2025-X2L8J4',
        staffId: null,
        status: 'CONFIRMED',
        scheduledAt: new Date(Date.now() + 172800000), // Day after tomorrow
        durationMinutes: 30,
        reason: 'Renal follow up',
        internalNotes: 'Renal Check - Assigned to AccuLab',
      },
      { upsert: true }
    );

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
