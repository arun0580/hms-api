export const VISIT_TYPES = ["NEW", "FOLLOW_UP", "EMERGENCY"] as const;
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export const BLOOD_GROUPS = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
  "UNKNOWN",
] as const;
export const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"] as const;
export const REFERENCE_TYPES = [
  "DOCTOR",
  "HOSPITAL",
  "FRIEND",
  "EMPLOYEE",
  "ONLINE",
  "CAMP",
  "INSURANCE",
  "SELF",
] as const;
export const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "CHEQUE", "NET_BANKING"] as const;
export const DISCOUNT_TYPES = ["NONE", "INSURANCE", "STAFF", "CAMP", "SENIOR", "OTHER"] as const;
export const PREGNANCY_STATUSES = ["NOT_APPLICABLE", "NOT_PREGNANT", "PREGNANT", "LACTATING"] as const;
export const REGISTRATION_STATUSES = ["ACTIVE", "CLOSED", "CANCELLED"] as const;

export const RELIGIONS = [
  "Hinduism",
  "Islam",
  "Christianity",
  "Sikhism",
  "Buddhism",
  "Jainism",
  "Other",
  "Prefer not to say",
] as const;

export const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Other",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
] as const;

export const COUNTRIES = ["India", "Nepal", "Bangladesh", "Sri Lanka", "Other"] as const;

export const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Spouse",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Friend",
  "Guardian",
  "Other",
] as const;

export const MARKETING_SOURCES = [
  "Google",
  "Facebook",
  "Instagram",
  "Newspaper",
  "TV/Radio",
  "Billboard",
  "Walk-in",
  "Website",
  "Referral App",
  "Other",
] as const;

export const EXISTING_DISEASES = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Thyroid",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
  "Epilepsy",
  "Arthritis",
  "COPD",
  "HIV/AIDS",
] as const;

export const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  UNKNOWN: "Unknown",
};

export const VISIT_TYPE_LABELS: Record<string, string> = {
  NEW: "New",
  FOLLOW_UP: "Follow-up",
  EMERGENCY: "Emergency",
};
