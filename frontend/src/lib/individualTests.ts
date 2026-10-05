export interface IndividualTest {
  id: string;
  name: string;
  category: string;
  description: string;
  sampleType: string;
  fastingRequired: boolean;
  fastingHours?: string;
  turnaroundTime: string;
  commonFor: string;
  color?: string;
  packageId?: string;
}
