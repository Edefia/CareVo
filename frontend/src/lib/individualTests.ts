export interface IndividualTest {
  id: string;
  name: string;
  category: 'General Health' | 'Chronic & Metabolic' | 'Infectious Disease' | 'Sexual & Reproductive Health';
  packageCategoryKeyword: string;
  description: string;
  sampleType: 'Blood (Venous)' | 'Blood (Fingerprick)' | 'Urine' | 'Swab' | 'Clinical Vitals';
  fastingRequired: boolean;
  fastingHours?: string;
  turnaroundTime: string;
  commonFor: string;
  color: string;
  packageId?: string;
}

export const INDIVIDUAL_TESTS_DATA: Omit<IndividualTest, 'packageId'>[] = [
  // ─── GENERAL HEALTH ────────────────────────────────────────────────────────
  {
    id: 'fbc',
    name: 'Full Blood Count (FBC)',
    category: 'General Health',
    packageCategoryKeyword: 'General',
    description: 'Comprehensive evaluation of red cells, white cells, platelets, and hemoglobin to detect anemia, infections, and immune vitality.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '12–24 hours',
    commonFor: 'Fatigue, infection screening, overall baseline wellness',
    color: '#DC2626',
  },
  {
    id: 'kft',
    name: 'Kidney Function Test (KFT)',
    category: 'General Health',
    packageCategoryKeyword: 'General',
    description: 'Evaluates renal clearance through Serum Creatinine, Blood Urea Nitrogen (BUN), and eGFR to verify kidney filtration health.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '24 hours',
    commonFor: 'Renal health, medication monitoring, hypertension baseline',
    color: '#0F76E0',
  },
  {
    id: 'lft',
    name: 'Liver Function Test (LFT)',
    category: 'General Health',
    packageCategoryKeyword: 'General',
    description: 'Measures key hepatic enzymes (ALT, AST, ALP), total proteins, and Bilirubin to detect liver strain or bile duct conditions.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '24 hours',
    commonFor: 'Liver wellness, alcohol/medication impact, routine baseline',
    color: '#16A34A',
  },
  {
    id: 'urinalysis',
    name: 'Urinalysis',
    category: 'General Health',
    packageCategoryKeyword: 'General',
    description: 'Microscopic and chemical assessment of urine to detect urinary tract infections, microscopic blood, kidney stress, or glucose.',
    sampleType: 'Urine',
    fastingRequired: false,
    turnaroundTime: 'Same day (4–6 hours)',
    commonFor: 'UTI symptoms, renal screening, routine health',
    color: '#D97706',
  },
  {
    id: 'blood-group',
    name: 'Blood Group and Rhesus Factor',
    category: 'General Health',
    packageCategoryKeyword: 'General',
    description: 'Determines your ABO blood group (A, B, AB, O) and Rh D positive/negative status for emergency safety and prenatal compatibility.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '12–24 hours',
    commonFor: 'Emergency ID, blood compatibility, pregnancy preparation',
    color: '#DC2626',
  },

  // ─── CHRONIC & METABOLIC ──────────────────────────────────────────────────
  {
    id: 'hba1c',
    name: 'HbA1c',
    category: 'Chronic & Metabolic',
    packageCategoryKeyword: 'Chronic',
    description: 'Gold-standard biomarker assessing your 3-month average blood glucose. Essential for diagnosing prediabetes and managing diabetes.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '24 hours',
    commonFor: 'Diabetes screening, glucose regulation, metabolic wellness',
    color: '#D97706',
  },
  {
    id: 'fasting-glucose',
    name: 'Fasting Blood Glucose',
    category: 'Chronic & Metabolic',
    packageCategoryKeyword: 'Chronic',
    description: 'Direct measurement of circulating plasma glucose after an overnight fast to detect acute insulin resistance and early prediabetes.',
    sampleType: 'Blood (Venous)',
    fastingRequired: true,
    fastingHours: '8–12 hours',
    turnaroundTime: '12–24 hours',
    commonFor: 'Diabetes screening, metabolic risk check, morning baseline',
    color: '#D97706',
  },
  {
    id: 'lipid-profile',
    name: 'Full Lipid Profile',
    category: 'Chronic & Metabolic',
    packageCategoryKeyword: 'Chronic',
    description: 'Comprehensive panel measuring Total Cholesterol, HDL (good), LDL (bad), and Triglycerides to evaluate cardiovascular risk.',
    sampleType: 'Blood (Venous)',
    fastingRequired: true,
    fastingHours: '9–12 hours',
    turnaroundTime: '24 hours',
    commonFor: 'Heart disease prevention, cholesterol tracking, arterial health',
    color: '#DC2626',
  },
  {
    id: 'bp-vitals',
    name: 'Blood Pressure Measurement',
    category: 'Chronic & Metabolic',
    packageCategoryKeyword: 'Chronic',
    description: 'Calibrated clinical systolic and diastolic pressure assessment to detect early or silent hypertension before vascular damage occurs.',
    sampleType: 'Clinical Vitals',
    fastingRequired: false,
    turnaroundTime: 'Immediate',
    commonFor: 'Cardiovascular screening, hypertension check, stress check',
    color: '#0F76E0',
  },
  {
    id: 'bmi-assessment',
    name: 'BMI and Waist Circumference Assessment',
    category: 'Chronic & Metabolic',
    packageCategoryKeyword: 'Chronic',
    description: 'Clinical evaluation of body mass index, waist-to-hip ratio, and visceral adiposity index to evaluate metabolic syndrome risk.',
    sampleType: 'Clinical Vitals',
    fastingRequired: false,
    turnaroundTime: 'Immediate',
    commonFor: 'Weight management, metabolic health index, lifestyle baseline',
    color: '#16A34A',
  },

  // ─── INFECTIOUS DISEASE ───────────────────────────────────────────────────
  {
    id: 'hiv-rapid',
    name: 'HIV Rapid Test',
    category: 'Infectious Disease',
    packageCategoryKeyword: 'Infectious',
    description: 'High-accuracy, confidential antibody and p24 antigen screening for HIV 1 & 2 with immediate laboratory verification.',
    sampleType: 'Blood (Fingerprick)',
    fastingRequired: false,
    turnaroundTime: 'Same day (1–2 hours)',
    commonFor: 'Routine preventive wellness, confidential sexual health',
    color: '#0F76E0',
  },
  {
    id: 'hbsag',
    name: 'Hepatitis B Surface Antigen (HBsAg)',
    category: 'Infectious Disease',
    packageCategoryKeyword: 'Infectious',
    description: 'Screens for active or chronic Hepatitis B viral infection. Crucial for timely liver protection and vaccination decisions.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '12–24 hours',
    commonFor: 'Viral hepatitis screen, liver protection, pre-employment',
    color: '#0F76E0',
  },
  {
    id: 'hcv-ab',
    name: 'Hepatitis C Antibody Test',
    category: 'Infectious Disease',
    packageCategoryKeyword: 'Infectious',
    description: 'Serological antibody test screening for past or current exposure to the Hepatitis C virus to safeguard hepatic longevity.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '24 hours',
    commonFor: 'Liver health, blood safety, comprehensive viral screen',
    color: '#0F76E0',
  },
  {
    id: 'syphilis-vdrl',
    name: 'Syphilis Screening (VDRL or RPR)',
    category: 'Infectious Disease',
    packageCategoryKeyword: 'Infectious',
    description: 'Serological non-treponemal antibody screening for Treponema pallidum. Highly responsive to treatment when caught early.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '12–24 hours',
    commonFor: 'Routine STI screen, pre-marital health check, reproductive safety',
    color: '#7C3AED',
  },
  {
    id: 'malaria-rdt',
    name: 'Malaria Rapid Diagnostic Test (RDT)',
    category: 'Infectious Disease',
    packageCategoryKeyword: 'Infectious',
    description: 'Rapid antigen detection of Plasmodium falciparum parasites for prompt diagnostic verification and clinical intervention.',
    sampleType: 'Blood (Fingerprick)',
    fastingRequired: false,
    turnaroundTime: 'Same day (1 hour)',
    commonFor: 'Fever, chills, body ache, endemic acute screening',
    color: '#D97706',
  },
  {
    id: 'typhoid-widal',
    name: 'Typhoid Test (Widal)',
    category: 'Infectious Disease',
    packageCategoryKeyword: 'Infectious',
    description: 'Serological test detecting Salmonella enterica O and H antibodies to aid in evaluating enteric fever and gastrointestinal illness.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '12–24 hours',
    commonFor: 'Prolonged fever, abdominal discomfort, food hygiene screening',
    color: '#D97706',
  },

  // ─── SEXUAL & REPRODUCTIVE HEALTH ─────────────────────────────────────────
  {
    id: 'hiv-confidential',
    name: 'HIV Test',
    category: 'Sexual & Reproductive Health',
    packageCategoryKeyword: 'Sexual',
    description: 'Discreet and strictly confidential screening for Human Immunodeficiency Virus with comprehensive medical counseling.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: 'Same day (2–4 hours)',
    commonFor: 'Confidential sexual wellness, relationship peace of mind',
    color: '#7C3AED',
  },
  {
    id: 'hepatitis-bc-screen',
    name: 'Hepatitis B and C Screening',
    category: 'Sexual & Reproductive Health',
    packageCategoryKeyword: 'Sexual',
    description: 'Dual serological viral screening covering both Hepatitis B and Hepatitis C for thorough liver protection.',
    sampleType: 'Blood (Venous)',
    fastingRequired: false,
    turnaroundTime: '24 hours',
    commonFor: 'Pre-marital testing, liver wellness, viral exposure check',
    color: '#7C3AED',
  },
  {
    id: 'gonorrhoea-screen',
    name: 'Gonorrhoea',
    category: 'Sexual & Reproductive Health',
    packageCategoryKeyword: 'Sexual',
    description: 'Molecular / swab screening for Neisseria gonorrhoeae to prevent asymptomatic progression and reproductive complications.',
    sampleType: 'Swab',
    fastingRequired: false,
    turnaroundTime: '24–48 hours',
    commonFor: 'STI symptom check, routine sexual wellness, partner safety',
    color: '#7C3AED',
  },
  {
    id: 'chlamydia-screen',
    name: 'Chlamydia',
    category: 'Sexual & Reproductive Health',
    packageCategoryKeyword: 'Sexual',
    description: 'Highly sensitive nucleic acid detection for Chlamydia trachomatis. Easy to treat when detected early through screening.',
    sampleType: 'Swab',
    fastingRequired: false,
    turnaroundTime: '24–48 hours',
    commonFor: 'Asymptomatic screening, reproductive protection, STI checkup',
    color: '#7C3AED',
  },
  {
    id: 'pregnancy-test',
    name: 'Pregnancy Test',
    category: 'Sexual & Reproductive Health',
    packageCategoryKeyword: 'Sexual',
    description: 'Laboratory-grade qualitative and quantitative beta-hCG hormone detection for early and definitive confirmation of pregnancy.',
    sampleType: 'Urine',
    fastingRequired: false,
    turnaroundTime: 'Same day (1–2 hours)',
    commonFor: 'Early pregnancy detection, prenatal baseline health',
    color: '#EC4899',
  },
];

/**
 * Associates each individual test with its corresponding MongoDB package
 * from the database by matching category or testsIncluded.
 */
export function getIndividualTestsWithPackages(packages: any[]): IndividualTest[] {
  if (!packages || packages.length === 0) {
    return INDIVIDUAL_TESTS_DATA.map(t => ({ ...t }));
  }

  return INDIVIDUAL_TESTS_DATA.map(test => {
    // 1. Try finding package where testsIncluded contains the test name
    let matchedPkg = packages.find(pkg => {
      const tests = pkg.testsIncluded || pkg.features || [];
      return tests.some((t: string) => 
        t.toLowerCase().trim() === test.name.toLowerCase().trim() ||
        test.name.toLowerCase().includes(t.toLowerCase().trim()) ||
        t.toLowerCase().includes(test.name.toLowerCase().trim())
      );
    });

    // 2. Fallback: match by category keyword
    if (!matchedPkg) {
      matchedPkg = packages.find(pkg => 
        (pkg.category || '').toLowerCase().includes(test.packageCategoryKeyword.toLowerCase()) ||
        (pkg.name || '').toLowerCase().includes(test.packageCategoryKeyword.toLowerCase())
      );
    }

    // 3. Fallback: first available package
    if (!matchedPkg && packages.length > 0) {
      matchedPkg = packages[0];
    }

    return {
      ...test,
      packageId: matchedPkg ? (matchedPkg._id || matchedPkg.id) : undefined,
    };
  });
}
