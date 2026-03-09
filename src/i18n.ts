export type Language = 
  | 'en' | 'hi' | 'ur' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as' | 'sa';

export interface TranslationSchema {
  dir: 'ltr' | 'rtl';
  common: {
    appName: string;
    tagline: string;
    verify: string;
    dashboard: string;
    admin: string;
    login: string;
    logout: string;
    language: string;
    retentionNotice: string;
  };
  home: {
    heroTitle: string;
    heroSub: string;
    inputPlaceholder: string;
    uploadLabel: string;
    urlPlaceholder: string;
    analyzeBtn: string;
    fetchBtn: string;
  };
  results: {
    credibilityScore: string;
    classification: string;
    reasoning: string;
    confidence: string;
    sources: string;
    verdict: string;
    detailedAnalysis: string;
    claimExtraction: string;
    ideologicalFraming: string;
    communalIntensity: string;
    rhetoricalPatterns: string;
    logicalFallacies: string;
    timelineVerification: string;
    detectedLanguage: string;
  };
  admin: {
    analytics: string;
    flagged: string;
    users: string;
    settings: string;
    trends: string;
    activity: string;
  };
  history: {
    title: string;
    subtitle: string;
    empty: string;
    back: string;
    expires: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    fullName: string;
    email: string;
    password: string;
    accountType: string;
    publicUser: string;
    administrator: string;
    continue: string;
    noAccount: string;
    hasAccount: string;
  };
}

const baseEn: TranslationSchema = {
  dir: 'ltr',
  common: {
    appName: "Bharat Civic Shield",
    tagline: "AI-Powered Misinformation Defense",
    verify: "Verify",
    dashboard: "Dashboard",
    admin: "Admin",
    login: "Login",
    logout: "Logout",
    language: "Language",
    retentionNotice: "Data is retained for 72-168 hours for analysis and then permanently deleted."
  },
  home: {
    heroTitle: "Protecting Truth in the Digital Age",
    heroSub: "Advanced AI detection for fake news, communal incitement, and manipulated content.",
    inputPlaceholder: "Paste text or claim here...",
    uploadLabel: "Upload Screenshot/PDF",
    urlPlaceholder: "Paste article URL...",
    analyzeBtn: "Analyze Content",
    fetchBtn: "Fetch"
  },
  results: {
    credibilityScore: "Credibility Score",
    classification: "Classification",
    reasoning: "Reasoning & Analysis",
    confidence: "Confidence Level",
    sources: "Verified Sources",
    verdict: "Verdict",
    detailedAnalysis: "Detailed Analysis Report",
    claimExtraction: "Claim Extraction",
    ideologicalFraming: "Ideological Framing",
    communalIntensity: "Communal Intensity",
    rhetoricalPatterns: "Rhetorical Patterns",
    logicalFallacies: "Logical Fallacies",
    timelineVerification: "Timeline Verification",
    detectedLanguage: "Detected Language"
  },
  admin: {
    analytics: "Analytics Dashboard",
    flagged: "Flagged Content",
    users: "User Management",
    settings: "System Settings",
    trends: "Misinformation Trends",
    activity: "Recent System Activity"
  },
  history: {
    title: "Verification History",
    subtitle: "Your recent analysis reports. Data is stored for 72-168 hours.",
    empty: "No recent verifications found.",
    back: "Back to Verify",
    expires: "Expires in"
  },
  auth: {
    signIn: "Sign In",
    signUp: "Create Account",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    accountType: "Account Type",
    publicUser: "Public User",
    administrator: "Administrator",
    continue: "Continue to Platform",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?"
  }
};

const baseHi: TranslationSchema = {
  dir: 'ltr',
  common: {
    appName: "भारत सिविक शील्ड",
    tagline: "एआई-संचालित गलत सूचना रक्षा",
    verify: "सत्यापित करें",
    dashboard: "डैशबोर्ड",
    admin: "एडमिन",
    login: "लॉगिन",
    logout: "लॉगआउट",
    language: "भाषा",
    retentionNotice: "डेटा विश्लेषण के लिए 72-168 घंटों तक रखा जाता है और फिर स्थायी रूप से हटा दिया जाता है।"
  },
  home: {
    heroTitle: "डिजिटल युग में सत्य की रक्षा",
    heroSub: "फेक न्यूज, सांप्रदायिक उकसावे और हेरफेर की गई सामग्री के लिए उन्नत एआई पहचान।",
    inputPlaceholder: "यहाँ टेक्स्ट या दावा पेस्ट करें...",
    uploadLabel: "स्क्रीनशॉट/पीडीएफ अपलोड करें",
    urlPlaceholder: "लेख का यूआरएल पेस्ट करें...",
    analyzeBtn: "सामग्री का विश्लेषण करें",
    fetchBtn: "प्राप्त करें"
  },
  results: {
    credibilityScore: "विश्वसनीयता स्कोर",
    classification: "वर्गीकरण",
    reasoning: "तर्क और विश्लेषण",
    confidence: "आत्मविश्वास का स्तर",
    sources: "सत्यापित स्रोत",
    verdict: "निर्णय",
    detailedAnalysis: "विस्तृत विश्लेषण रिपोर्ट",
    claimExtraction: "दावा निष्कर्षण",
    ideologicalFraming: "वैचारिक ढांचा",
    communalIntensity: "सांप्रदायिक तीव्रता",
    rhetoricalPatterns: "अलंकारिक पैटर्न",
    logicalFallacies: "तार्किक भ्रम",
    timelineVerification: "समयरेखा सत्यापन",
    detectedLanguage: "पहचانی गई भाषा"
  },
  admin: {
    analytics: "एनालिटिक्स डैशबोर्ड",
    flagged: "ध्वजांकित सामग्री",
    users: "उपयोगकर्ता प्रबंधन",
    settings: "सिस्टम सेटिंग्स",
    trends: "गलत सूचना के रुझान",
    activity: "हालिया सिस्टम गतिविधि"
  },
  history: {
    title: "सत्यापन इतिहास",
    subtitle: "आपकी हालिया विश्लेषण रिपोर्ट। डेटा 72-168 घंटों के लिए संग्रहीत किया जाता है।",
    empty: "कोई हालिया सत्यापन नहीं मिला।",
    back: "सत्यापन पर वापस जाएं",
    expires: "समाप्त होने में"
  },
  auth: {
    signIn: "साइन इन करें",
    signUp: "खाता बनाएं",
    fullName: "पूरा नाम",
    email: "ईमेल पता",
    password: "पासवर्ड",
    accountType: "खाते का प्रकार",
    publicUser: "सार्वजनिक उपयोगकर्ता",
    administrator: "प्रशासक",
    continue: "प्लेटफॉर्म पर जारी रखें",
    noAccount: "खाता नहीं है?",
    hasAccount: "पहले से ही एक खाता है?"
  }
};

const baseUr: TranslationSchema = {
  dir: 'rtl',
  common: {
    appName: "بھارت سوک شیلڈ",
    tagline: "مصنوعی ذہانت سے چلنے والا غلط معلومات کا دفاع",
    verify: "تصدیق کریں",
    dashboard: "ڈیش بورڈ",
    admin: "ایڈمن",
    login: "لاگ ان",
    logout: "لاگ آؤٹ",
    language: "زبان",
    retentionNotice: "ڈیٹا تجزیہ کے لیے 72-168 گھنٹوں تک رکھا جاتا ہے اور پھر مستقل طور پر حذف کر دیا جاتا ہے۔"
  },
  home: {
    heroTitle: "ڈیجیٹل دور میں سچائی کی حفاظت",
    heroSub: "جعلی خبروں، فرقہ وارانہ اشتعال انگیزی، اور ہیرا پھیری والے مواد کے لیے جدید اے آئی کا پتہ لگانا۔",
    inputPlaceholder: "یہاں متن یا دعویٰ چسپاں کریں...",
    uploadLabel: "اسکرین شاٹ/پی ڈی ایف اپ لوڈ کریں",
    urlPlaceholder: "مضمون کا یو آر ایل چسپاں کریں...",
    analyzeBtn: "مواد کا تجزیہ کریں",
    fetchBtn: "حاصل کریں"
  },
  results: {
    credibilityScore: "معتبریت کا اسکور",
    classification: "درجہ بندی",
    reasoning: "استدلال اور تجزیہ",
    confidence: "اعتماد کی سطح",
    sources: "تصدیق شدہ ذرائع",
    verdict: "فیصلہ",
    detailedAnalysis: "تفصیلی تجزیہ رپورٹ",
    claimExtraction: "دعوے کا اخراج",
    ideologicalFraming: "نظریاتی فریم ورک",
    communalIntensity: "فرقہ وارانہ شدت",
    rhetoricalPatterns: "بیان بازی کے نمونے",
    logicalFallacies: "منطقی مغالطے",
    timelineVerification: "ٹائم لائن کی تصدیق",
    detectedLanguage: "پتہ چلنے والی زبان"
  },
  admin: {
    analytics: "تجزیاتی ڈیش بورڈ",
    flagged: "نشان زد مواد",
    users: "صارف کا انتظام",
    settings: "سسٹم کی ترتیبات",
    trends: "غلط معلومات کے رجحانات",
    activity: "حالیہ سسٹم کی سرگرمی"
  },
  history: {
    title: "تصدیق کی تاریخ",
    subtitle: "آپ کی حالیہ تجزیہ رپورٹس۔ ڈیٹا 72-168 گھنٹوں کے لیے محفوظ کیا جاتا ہے۔",
    empty: "کوئی حالیہ تصدیق نہیں ملی۔",
    back: "تصدیق پر واپس جائیں",
    expires: "ختم ہونے میں"
  },
  auth: {
    signIn: "سائن ان کریں",
    signUp: "اکاؤنٹ بنائیں",
    fullName: "پورا نام",
    email: "ای میل پتہ",
    password: "پاس ورڈ",
    accountType: "اکاؤنٹ کی قسم",
    publicUser: "عوامی صارف",
    administrator: "ایڈمنسٹریٹر",
    continue: "پلیٹ فارم پر جاری رکھیں",
    noAccount: "اکاؤنٹ نہیں ہے؟",
    hasAccount: "پہلے سے ہی اکاؤنٹ ہے؟"
  }
};

export const translations: Record<Language, TranslationSchema> = {
  en: baseEn,
  hi: baseHi,
  ur: baseUr,
  ta: { ...baseEn, common: { ...baseEn.common, appName: "பாரத் சிவிக் ஷீல்ட்" } },
  te: { ...baseEn, common: { ...baseEn.common, appName: "భారత్ సివిక్ షీల్డ్" } },
  bn: { ...baseEn, common: { ...baseEn.common, appName: "ভারত সিভিক শিল্ড" } },
  mr: { ...baseEn, common: { ...baseEn.common, appName: "भारत सिविक शील्ड" } },
  gu: { ...baseEn, common: { ...baseEn.common, appName: "ભારત સિવિક શીલ્ડ" } },
  kn: { ...baseEn, common: { ...baseEn.common, appName: "ಭಾರತ್ ಸಿವಿಕ್ ಶೀಲ್ಡ್" } },
  ml: { ...baseEn, common: { ...baseEn.common, appName: "ഭാരത് സിവിക് ഷീൽഡ്" } },
  pa: { ...baseEn, common: { ...baseEn.common, appName: "ਭਾਰਤ ਸਿਵਿਕ ਸ਼ੀਲਡ" } },
  or: { ...baseEn, common: { ...baseEn.common, appName: "ଭାରତ ସିଭିକ ଶିଲ୍ଡ" } },
  as: { ...baseEn, common: { ...baseEn.common, appName: "ভাৰত চিভিক শ্বিল্ড" } },
  sa: { ...baseEn, common: { ...baseEn.common, appName: "भारत सिविक शील्ड" } },
};

export const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  ur: "اردو",
  ta: "தமிழ்",
  te: "తెలుగు",
  bn: "বাংলা",
  mr: "मराठी",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  as: "অসমীয়া",
  sa: "संस्कृतम्"
};
