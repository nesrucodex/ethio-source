import type { Locale } from "./i18n";
type LandingCopy = {
  connection: string;
  china: string;
  ethiopia: string;
  shopNote: string;
  edit: string;
  whyLabel: string;
  whyTitle: string;
  whyIntro: string;
  paymentTitle: string;
  paymentBody: string;
  trackingTitle: string;
  trackingBody: string;
  languageTitle: string;
  languageBody: string;
  departmentsLabel: string;
  departmentsTitle: string;
  journeyLabel: string;
  journeyTitle: string;
  steps: readonly { title: string; body: string }[];
  faqLabel: string;
  faqTitle: string;
  questions: readonly { title: string; body: string }[];
  closingLabel: string;
  closingTitle: string;
  closingBody: string;
};
export const landingCopy: Record<Locale, LandingCopy> = {
  en: {
    connection: "Two places. One thoughtful connection.",
    china: "China",
    ethiopia: "Ethiopia",
    shopNote: "Discover in your language. Shop in Birr.",
    edit: "A closer look",
    whyLabel: "THE ETHIOSOURCE DIFFERENCE",
    whyTitle: "A world of choice.\nA familiar way to shop.",
    whyIntro:
      "Cross-border shopping should feel clear, from your first find to the moment you collect it.",
    paymentTitle: "Global finds. Local currency.",
    paymentBody:
      "See product prices in Ethiopian Birr and review your total before paying through Chapa.",
    trackingTitle: "The journey, made visible.",
    trackingBody:
      "Follow your order from confirmation through shipping and customs to pickup. Your order page keeps the details together.",
    languageTitle: "Feels like your kind of place.",
    languageBody:
      "Browse in English, አማርኛ or Afaan Oromoo. Choose the language that feels most natural to you.",
    departmentsLabel: "FIND YOUR EVERYDAY",
    departmentsTitle: "A little something for every part of life.",
    journeyLabel: "FROM THERE TO HERE",
    journeyTitle: "A few simple steps.\nA whole new world of finds.",
    steps: [
      {
        title: "Find your next favorite.",
        body: "Explore the collection, compare the details, and add your picks to your bag.",
      },
      {
        title: "Make it yours in Birr.",
        body: "Review your order and delivery details, then complete payment through Chapa.",
      },
      {
        title: "Follow it closer to home.",
        body: "Check your order for shipping updates, customs progress, and pickup instructions.",
      },
    ],
    faqLabel: "BEFORE YOUR FIRST ORDER",
    faqTitle: "A little clarity goes a long way.",
    questions: [
      {
        title: "How do I pay?",
        body: "Product prices are shown in Ethiopian Birr. At checkout, Chapa shows the payment methods available for your purchase. Review the order total before confirming payment.",
      },
      {
        title: "How long does delivery take?",
        body: "Timing depends on supplier dispatch, shipping, and customs clearance. Follow progress on your order page; pickup instructions appear in the tracking notes.",
      },
      {
        title: "Where can I track my order?",
        body: "Sign in and open Your orders. You can see payment status and follow your parcel from confirmation to pickup.",
      },
      {
        title: "What should I know before ordering?",
        body: "Read the product details and the delivery and returns policy before checkout. During the store preview, sample products and prices are marked; live orders depend on merchant and payment setup.",
      },
    ],
    closingLabel: "SOURCED THERE. CHOSEN BY YOU.",
    closingTitle: "Your next good find\nis closer than you think.",
    closingBody:
      "From China’s possibilities to your everyday in Ethiopia. Start with something you love.",
  },
  am: {
    connection: "ሁለት ቦታዎች። አንድ ግንኙነት።",
    china: "ቻይና",
    ethiopia: "ኢትዮጵያ",
    shopNote: "በቋንቋዎ ያስሱ። በብር ይግዙ።",
    edit: "በቅርብ ይመልከቱ",
    whyLabel: "የኢትዮሶርስ ልዩነት",
    whyTitle: "የዓለም ምርጫ።\nየሚያውቁት የግዢ መንገድ።",
    whyIntro: "ከመጀመሪያ ምርጫዎ እስከ መረከቢያ ድረስ ግልጽ የድንበር ተሻጋሪ ግዢ።",
    paymentTitle: "የዓለም ምርቶች። የአገር ውስጥ ገንዘብ።",
    paymentBody: "ዋጋዎችን በኢትዮጵያ ብር ይመልከቱ። በቻፓ ከመክፈልዎ በፊት ጠቅላላውን ያረጋግጡ።",
    trackingTitle: "ጉዞውን ይከታተሉ።",
    trackingBody: "ከማረጋገጫ እስከ ማጓጓዣ፣ ጉምሩክ እና መረከቢያ ድረስ በትዕዛዝዎ ገጽ ይከታተሉ።",
    languageTitle: "በሚመችዎ ቋንቋ።",
    languageBody: "በእንግሊዝኛ፣ በአማርኛ ወይም በአፋን ኦሮሞ ያስሱ።",
    departmentsLabel: "ለዕለት ተዕለትዎ",
    departmentsTitle: "ለእያንዳንዱ የሕይወትዎ ክፍል።",
    journeyLabel: "ከዚያ ወደዚህ",
    journeyTitle: "ቀላል እርምጃዎች።\nአዲስ የምርጫ ዓለም።",
    steps: [
      { title: "የሚወዱትን ያግኙ።", body: "ስብስቡን ያስሱ፣ ዝርዝሮችን ያነጻጽሩ እና ወደ ቦርሳዎ ያክሉ።" },
      { title: "በብር ይክፈሉ።", body: "ትዕዛዝዎን እና ማድረሻዎን ያረጋግጡ፣ በቻፓ ክፍያውን ያጠናቅቁ።" },
      { title: "ጉዞውን ይከታተሉ።", body: "የማጓጓዣ፣ የጉምሩክ እና የመረከቢያ መረጃዎችን ይመልከቱ።" },
    ],
    faqLabel: "ከመጀመሪያ ትዕዛዝዎ በፊት",
    faqTitle: "ለጥያቄዎችዎ ግልጽ መልሶች።",
    questions: [
      {
        title: "እንዴት እከፍላለሁ?",
        body: "ዋጋዎች በብር ይታያሉ። በክፍያ ጊዜ ቻፓ ያሉትን የክፍያ አማራጮች ያሳያል።",
      },
      {
        title: "ማድረስ ምን ያህል ጊዜ ይወስዳል?",
        body: "ጊዜው በአቅራቢው፣ በማጓጓዣ እና በጉምሩክ ሂደት ይወሰናል። በትዕዛዝዎ ገጽ ይከታተሉ።",
      },
      {
        title: "ትዕዛዜን የት እከታተላለሁ?",
        body: "ይግቡ እና ትዕዛዞችዎን ይክፈቱ። የክፍያ ሁኔታን እና ጉዞውን ይመልከቱ።",
      },
      {
        title: "ከማዘዜ በፊት ምን ማወቅ አለብኝ?",
        body: "የምርቱን ዝርዝር እና የማድረስ እና የመመለስ ፖሊሲ ያንብቡ። በሙከራ ጊዜ ያሉ ምርቶች እና ዋጋዎች ናሙና ናቸው።",
      },
    ],
    closingLabel: "ከዚያ የተመረጠ። በእርስዎ የተወደደ።",
    closingTitle: "የሚወዱት ምርት\nከሚያስቡት ቅርብ ነው።",
    closingBody: "ከቻይና ወደ ኢትዮጵያ ዕለት ተዕለት ኑሮዎ።",
  },
  om: {
    connection: "Bakka lama. Walitti dhufeenya tokko.",
    china: "Chaayinaa",
    ethiopia: "Itoophiyaa",
    shopNote: "Afaan keetiin barbaadi. Birriin bitadhu.",
    edit: "Dhiheenyatti ilaali",
    whyLabel: "GARAAGARUMMAA ETHIOSOURCE",
    whyTitle: "Filannoo addunyaa.\nBittaa siif baratame.",
    whyIntro:
      "Filannoo jalqabaa irraa hanga fudhattutti bittaa daangaa qaxxaamuru ifa taʼe.",
    paymentTitle: "Meeshaalee addunyaa. Maallaqa biyya keessaa.",
    paymentBody:
      "Gatii Birrii Itoophiyaatiin ilaali; Chapaʼn kaffaluu dura idaʼama mirkaneessi.",
    trackingTitle: "Imala isaa hordofi.",
    trackingBody:
      "Mirkaneessa, ergaa, gumurukaa fi fudhannaa fuula ajaja keetii irratti hordofi.",
    languageTitle: "Afaan siif mijatuun.",
    languageBody: "Ingliffa, Amaariffa yookaan Afaan Oromootiin barbaadi.",
    departmentsLabel: "GUYYAA GUYYAA KEETIIF",
    departmentsTitle: "Kutaa jireenya keetii hundaaf.",
    journeyLabel: "ACHI IRRAA GARA ASITTI",
    journeyTitle: "Tarkaanfiiwwan salphaa.\nAddunyaa filannoo haaraa.",
    steps: [
      {
        title: "Waan jaallattu argadhu.",
        body: "Filannoo ilaali, balʼina walbira qabi, boorsaatti dabali.",
      },
      {
        title: "Birriin kaffali.",
        body: "Ajajaa fi odeeffannoo geejjibaa mirkaneessi; Chapaʼn kaffali.",
      },
      {
        title: "Imala isaa hordofi.",
        body: "Odeeffannoo ergaa, gumurukaa fi fudhannaa ilaali.",
      },
    ],
    faqLabel: "AJAJA JALQABAA DURA",
    faqTitle: "Deebii ifa taʼe gaaffii keetiif.",
    questions: [
      {
        title: "Akkamittan kaffala?",
        body: "Gatiin Birriin mulʼata. Chapa yeroo kaffaltii filannoo kaffaltii jiru si agarsiisa.",
      },
      {
        title: "Geejjibni yeroo hammam fudhata?",
        body: "Yeroon dhiyeessaa, geejjibaa fi gumuruka irratti hundaaʼa. Fuula ajaja kee irratti hordofi.",
      },
      {
        title: "Ajaja koo eessattan hordofa?",
        body: "Seeniitii Ajajawwan kee bani. Haala kaffaltii fi imala isaa ilaali.",
      },
      {
        title: "Ajajuu dura maal beekuu qaba?",
        body: "Balʼina meeshaa fi imaammata geejjibaa fi deebii dubbisi. Yeroo agarsiisaatti meeshaaleen fi gatiin fakkeenyaaf kennamu.",
      },
    ],
    closingLabel: "ACHI IRRAA. FILANNOO KEETIIN.",
    closingTitle: "Wanti gaariin itti aanu\nsiitti dhiyaateera.",
    closingBody:
      "Chaayinaa irraa gara jireenya guyyaa guyyaa kee Itoophiyaatti.",
  },
};
