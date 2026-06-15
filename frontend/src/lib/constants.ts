export const HEALTH_PILLARS = {
  CARDIO: {
    id: 'CARDIO',
    label: 'Cardio Health',
    icon: 'Heart',
    colour: '#DC2626',
    focus: 'Heart disease prevention and monitoring',
  },
  RENAL: {
    id: 'RENAL',
    label: 'Renal Health',
    icon: 'Droplets',
    colour: '#0F76E0',
    focus: 'Kidney function and protection',
  },
  METABOLIC: {
    id: 'METABOLIC',
    label: 'Metabolic Health',
    icon: 'Activity',
    colour: '#D97706',
    focus: 'Diabetes and related conditions',
  },
};

export const RISK_LEVELS = {
  LOW: {
    id: 'LOW',
    label: 'Low Risk',
    colour: '#16A34A',
    bgColour: '#F0FDF4',
    message: 'Your results are within healthy ranges.',
    followUp: 'Next screening recommended in 12 months.',
  },
  MODERATE: {
    id: 'MODERATE',
    label: 'Moderate Risk',
    colour: '#D97706',
    bgColour: '#FFFBEB',
    message: 'Some of your values need attention.',
    followUp: 'Follow-up recommended in 6 months.',
  },
  HIGH: {
    id: 'HIGH',
    label: 'High Risk',
    colour: '#DC2626',
    bgColour: '#FEF2F2',
    message: 'Your results indicate elevated health risk.',
    followUp: 'Please act on recommendations promptly.',
  },
};

export const SCREENING_PACKAGES = [
  {
    id: 'CARDIO_ESSENTIALS',
    name: 'Cardio Essentials',
    pillar: ['CARDIO'],
    price: 180,
    duration: 45,
    description: 'Assess your heart disease risk with a comprehensive lipid profile and blood pressure measurement.',
    tests: [
      'Blood Pressure (Systolic & Diastolic)',
      'Total Cholesterol',
      'LDL Cholesterol',
      'HDL Cholesterol',
      'Triglycerides',
    ],
    requiresFasting: false,
  },
  {
    id: 'RENAL_GUARD',
    name: 'Renal Guard',
    pillar: ['RENAL'],
    price: 220,
    duration: 60,
    description: 'Evaluate your kidney health and detect early signs of renal impairment before symptoms appear.',
    tests: [
      'Creatinine', 'eGFR', 'Urea', 'Uric Acid',
      'Urine Protein', 'Urine Blood',
    ],
    requiresFasting: false,
  },
  {
    id: 'METABOLIC_CHECK',
    name: 'Metabolic Check',
    pillar: ['METABOLIC'],
    price: 150,
    duration: 30,
    description: 'Screen for diabetes and metabolic syndrome with a full glucose and insulin panel.',
    tests: [
      'Fasting Blood Glucose', 'HbA1c', 'Insulin',
      'BMI', 'Waist Circumference',
    ],
    requiresFasting: true,
  },
  {
    id: 'COMPLETE_WELLNESS',
    name: 'Complete Wellness Screen',
    pillar: ['CARDIO', 'RENAL', 'METABOLIC'],
    price: 450,
    duration: 120,
    description: 'The most comprehensive CareVo screening. Covers your heart, kidneys, and metabolic function in one visit.',
    tests: [
      'Blood Pressure (Systolic & Diastolic)',
      'Total Cholesterol',
      'LDL Cholesterol',
      'HDL Cholesterol',
      'Triglycerides',
      'Creatinine',
      'eGFR',
      'Urea',
      'Uric Acid',
      'Urine Protein',
      'Urine Blood',
      'Fasting Blood Glucose',
      'HbA1c',
      'Insulin',
      'BMI',
      'Waist Circumference',
    ],
    requiresFasting: true,
    isMostPopular: true,
  },
  {
    id: 'CARDIO_METABOLIC_COMBO',
    name: 'Cardio & Metabolic Combo',
    pillar: ['CARDIO', 'METABOLIC'],
    price: 290,
    duration: 75,
    description: 'For patients managing or preventing heart disease and diabetes together.',
    tests: [
      'Blood Pressure (Systolic & Diastolic)',
      'Total Cholesterol',
      'LDL Cholesterol',
      'HDL Cholesterol',
      'Triglycerides',
      'Fasting Blood Glucose',
      'HbA1c',
      'Insulin',
      'BMI',
      'Waist Circumference',
    ],
    requiresFasting: true,
  },
];

export const TEST_PARAMETERS = {
  BLOOD_PRESSURE_SYSTOLIC: {
    name: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    pillar: 'CARDIO',
    referenceRange: '90–120',
    refMin: 90, refMax: 120,
  },
  BLOOD_PRESSURE_DIASTOLIC: {
    name: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    pillar: 'CARDIO',
    referenceRange: '60–80',
    refMin: 60, refMax: 80,
  },
  TOTAL_CHOLESTEROL: {
    name: 'Total Cholesterol',
    unit: 'mmol/L',
    pillar: 'CARDIO',
    referenceRange: '< 5.2',
    refMax: 5.2,
  },
  LDL_CHOLESTEROL: {
    name: 'LDL Cholesterol',
    unit: 'mmol/L',
    pillar: 'CARDIO',
    referenceRange: '< 3.4',
    refMax: 3.4,
  },
  HDL_CHOLESTEROL: {
    name: 'HDL Cholesterol',
    unit: 'mmol/L',
    pillar: 'CARDIO',
    referenceRange: '> 1.0',
    refMin: 1.0,
    invertedFlag: true, // LOW HDL is the risk, not HIGH
  },
  TRIGLYCERIDES: {
    name: 'Triglycerides',
    unit: 'mmol/L',
    pillar: 'CARDIO',
    referenceRange: '< 1.7',
    refMax: 1.7,
  },
  CREATININE: {
    name: 'Creatinine',
    unit: 'μmol/L',
    pillar: 'RENAL',
    referenceRange: '62–106',
    refMin: 62, refMax: 106,
  },
  EGFR: {
    name: 'eGFR',
    unit: 'mL/min/1.73m²',
    pillar: 'RENAL',
    referenceRange: '> 90',
    refMin: 90,
    invertedFlag: true, // LOW eGFR is the risk
  },
  UREA: {
    name: 'Urea',
    unit: 'mmol/L',
    pillar: 'RENAL',
    referenceRange: '2.5–6.7',
    refMin: 2.5, refMax: 6.7,
  },
  FASTING_GLUCOSE: {
    name: 'Fasting Blood Glucose',
    unit: 'mmol/L',
    pillar: 'METABOLIC',
    referenceRange: '3.9–5.6',
    refMin: 3.9, refMax: 5.6,
  },
  HBA1C: {
    name: 'HbA1c',
    unit: '%',
    pillar: 'METABOLIC',
    referenceRange: '< 5.7',
    refMax: 5.7,
  },
  BMI: {
    name: 'BMI',
    unit: 'kg/m²',
    pillar: 'METABOLIC',
    referenceRange: '18.5–24.9',
    refMin: 18.5, refMax: 24.9,
  },
};

export const REFERRAL_CODE_PREFIX = 'CRV';

export function generateReferralCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${REFERRAL_CODE_PREFIX}-${year}-${suffix}`;
}
