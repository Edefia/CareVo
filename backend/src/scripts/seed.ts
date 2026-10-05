import mongoose from 'mongoose';
import { env } from '../config/env.js';
import * as argon2 from 'argon2';
import { UserModel, PermissionModel } from '../modules/auth/auth.model.js';
import { ROLE_PERMISSIONS } from '../shared/constants/permissions.js';
import { LaboratoryModel } from '../modules/laboratories/laboratory.model.js';
import { BookingModel } from '../modules/bookings/booking.model.js';
import { PatientModel } from '../modules/patients/patient.model.js';
import { PackageModel } from '../modules/packages/package.model.js';
import { LabServiceModel } from '../modules/laboratories/lab-service.model.js';

const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/carebis-prime';

async function runSeed() {
  console.log('🌱 Starting CareBis Prime database seed...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing realistic test data if needed (optional, here we just insert if not exists)
    // We'll use upsert logic based on emails/codes
    
    console.log('📦 Seeding Packages...');
    await PackageModel.deleteMany({});
    
    console.log('🔑 Seeding Permissions...');
    await PermissionModel.deleteMany({});
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      await PermissionModel.create({
        role,
        permissions: perms,
      });
    }

    await PackageModel.create([
      {
        name: 'General Health Panel',
        description: 'Every test we offer serves a clear purpose — to screen for a real condition before symptoms appear.',
        category: 'General Health',
        testsIncluded: [
          'Full Blood Count (FBC)',
          'Fasting Blood Glucose',
          'Lipid Profile',
          'Kidney Function Test',
          'Liver Function Test',
          'Urinalysis',
          'Blood Pressure Measurement',
          'Blood Group and Rhesus Factor',
        ],
        turnaroundTime: '24 hours',
      },
      {
        name: 'Infectious Disease Panel',
        description: 'Comprehensive screening for common infectious diseases.',
        category: 'Infectious Disease',
        testsIncluded: [
          'HIV Rapid Test',
          'Hepatitis B Surface Antigen (HBsAg)',
          'Hepatitis C Antibody Test',
          'Syphilis Screening (VDRL or RPR)',
          'Malaria Rapid Diagnostic Test (RDT)',
          'Typhoid Test (Widal)',
        ],
        turnaroundTime: '24 hours',
      },
      {
        name: 'Sexual & Reproductive Health Panel',
        description: 'Screening for reproductive health and sexually transmitted infections.',
        category: 'Sexual Health',
        testsIncluded: [
          'HIV Test',
          'Syphilis',
          'Hepatitis B and C Screening',
          'Gonorrhoea',
          'Chlamydia',
          'Pregnancy Test',
        ],
        turnaroundTime: '24 hours',
      },
      {
        name: 'Chronic Disease Risk Panel',
        description: 'Evaluate your risk factors for chronic conditions like diabetes and heart disease.',
        category: 'Chronic Disease',
        testsIncluded: [
          'HbA1c',
          'Fasting Blood Glucose',
          'Blood Pressure Measurement',
          'Full Lipid Profile',
          'BMI and Waist Circumference Assessment',
          'Kidney Function Test',
        ],
        turnaroundTime: '24 hours',
      }
    ]);

    // 1. Real Labs in Ghana
    console.log('🏢 Seeding Laboratories...');
    await LaboratoryModel.deleteMany({});
    
    const medicanLab = await LaboratoryModel.findOneAndUpdate(
      { code: 'MDS-LANCET' },
      {
        name: 'MDS-Lancet Laboratories',
        code: 'MDS-LANCET',
        contactEmail: 'info@mds-lancet.com',
        contactPhone: '+233 30 261 0480',
        address: {
          street: '27 Maseru St, East Legon',
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
      { code: 'SYNLAB' },
      {
        name: 'Synlab Ghana',
        code: 'SYNLAB',
        contactEmail: 'ghana@synlab.com',
        contactPhone: '+233 30 276 9951',
        address: {
          street: 'Roman Ridge, 11th Lane',
          city: 'Accra',
          state: 'Greater Accra',
          zipCode: 'GA-000',
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
    await UserModel.findOneAndUpdate(
      { email: 'dieudonneladzekpo@gmail.com' },
      {
        email: 'dieudonneladzekpo@gmail.com',
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
        laboratoryId: medicanLab._id,
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
    console.log('📅 Seeding Bookings & Lab Services...');
    
    const packages = await PackageModel.find({});
    if (packages.length < 2) throw new Error("Packages not seeded correctly");

    console.log('🔬 Seeding Lab Services...');
    await LabServiceModel.deleteMany({});
    
    for (const pkg of packages) {
      // Add to Medican
      await LabServiceModel.create({
        laboratoryId: medicanLab._id,
        packageId: pkg._id,
        name: pkg.name,
        category: pkg.category,
        turnaroundTime: pkg.turnaroundTime || '24 hours',
        labPrice: (pkg as any).price || 20000,
        platformPrice: (pkg as any).price || 20000,
        approvalStatus: 'APPROVED'
      });
      // Add to Synlab
      await LabServiceModel.create({
        laboratoryId: acculab._id,
        packageId: pkg._id,
        name: pkg.name,
        category: pkg.category,
        turnaroundTime: pkg.turnaroundTime || '24 hours',
        labPrice: ((pkg as any).price || 20000) * 1.1, // Synlab is 10% more expensive
        platformPrice: ((pkg as any).price || 20000) * 1.1,
        approvalStatus: 'APPROVED'
      });
    }

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
