/**
 * Official Product Catalog for The Laddu Story
 * Extracted directly from official price list & brand flyer.
 * Sweetener: Pure Cow Ghee & Unrefined Jaggery Powder (No Added Sugar, No Preservatives)
 * Minimum Order Quantity for Laddus: 500g
 * Contact Hotline: +91 9343207515
 */

const OFFICIAL_CATALOG = [
  {
    id: 1,
    sku: "RAGI-WALNUT",
    name: "Ragi Walnut Laddu",
    category: "LADDU",
    pricePerKg: 1200,
    minQtyGrams: 500,
    priceMinQty: 600, // 500g price
    unitDescription: "₹1,200/Kg (Min. 500g: ₹600)",
    tag: "Superfood Millet",
    ingredients: "Finger Millet (Ragi), Californian Walnuts, Pure Cow Ghee, Unrefined Jaggery",
    healthBenefit: "Rich in Calcium & Omega-3, Diabetic friendly, No White Sugar"
  },
  {
    id: 2,
    sku: "TILL-BLACK-SESAME",
    name: "Till Laddu (Black Sesame)",
    category: "LADDU",
    pricePerKg: 1000,
    minQtyGrams: 500,
    priceMinQty: 500,
    unitDescription: "₹1,000/Kg (Min. 500g: ₹500)",
    tag: "Winter Classic",
    ingredients: "Organic Black Sesame (Till), Pure Desi Cow Ghee, Unrefined Jaggery",
    healthBenefit: "High Iron & Bone Density Support, Warming Ayurvedic Formulation"
  },
  {
    id: 3,
    sku: "SATTU-ALMOND",
    name: "Sattu Almond Laddu",
    category: "LADDU",
    pricePerKg: 1100,
    minQtyGrams: 500,
    priceMinQty: 550,
    unitDescription: "₹1,100/Kg (Min. 500g: ₹550)",
    tag: "High Protein",
    ingredients: "Roasted Chana Sattu, Premium California Almonds, Desi Ghee, Jaggery",
    healthBenefit: "Natural Plant Protein & Sustained Energy, Excellent for Muscle Recovery"
  },
  {
    id: 4,
    sku: "GROUNDNUT",
    name: "Groundnut Laddu",
    category: "LADDU",
    pricePerKg: 800,
    minQtyGrams: 500,
    priceMinQty: 400,
    unitDescription: "₹800/Kg (Min. 500g: ₹400)",
    tag: "Traditional Favorite",
    ingredients: "Roasted Peanuts (Groundnuts), Pure Cow Ghee, Organic Jaggery",
    healthBenefit: "Heart-healthy fats, High satiety, Wholesome traditional snacking"
  },
  {
    id: 5,
    sku: "QUINOA-MOONG-DAL",
    name: "Quinoa Moong Dal Laddu",
    category: "LADDU",
    pricePerKg: 1250,
    minQtyGrams: 500,
    priceMinQty: 625,
    unitDescription: "₹1,250/Kg (Min. 500g: ₹625)",
    tag: "Ancient Superfood",
    ingredients: "Organic Quinoa, Yellow Moong Dal, Pure Cow Ghee, Jaggery Powder",
    healthBenefit: "Complete Amino Acid profile, Easy digestion, Low Glycemic index"
  },
  {
    id: 6,
    sku: "METHI-FENUGREEK",
    name: "Methi (fenugreek) Laddu",
    category: "LADDU",
    pricePerKg: 1250,
    minQtyGrams: 500,
    priceMinQty: 625,
    unitDescription: "₹1,250/Kg (Min. 500g: ₹625)",
    tag: "Joint Health & Wellness",
    ingredients: "Methi (Fenugreek seeds), Wheat flour, Gond, Dry fruits, Pure Cow Ghee, Jaggery",
    healthBenefit: "Relieves Joint stiffness, Balances Vata, Enhances Digestive fire"
  },
  {
    id: 7,
    sku: "DATES-DRY-FRUITS",
    name: "Dates & Dry Fruits Bites",
    category: "LADDU",
    pricePerKg: 1900,
    minQtyGrams: 500,
    priceMinQty: 950,
    unitDescription: "₹1,900/Kg (Min. 500g: ₹950)",
    tag: "Zero Added Sweetener",
    ingredients: "Medjool Dates, Almonds, Pistachios, Cashews, Walnuts, Pure Cow Ghee",
    healthBenefit: "Naturally sweetened purely with Dates, Instant Stamina & Antioxidants"
  },
  {
    id: 8,
    sku: "POST-DELIVERY-PANJEERI",
    name: "Post Delivery Panjeeri / Laddu",
    category: "LADDU",
    pricePerKg: 1800,
    minQtyGrams: 500,
    priceMinQty: 900,
    unitDescription: "₹1,800/Kg (Min. 500g: ₹900)",
    tag: "Postpartum Care",
    ingredients: "Kamarkas, Gond, Dry Fruits, Ayurvedic Herbs, Pure Cow Ghee, Jaggery",
    healthBenefit: "Traditional postpartum recovery, Strengthens spine & boosts lactation"
  },
  {
    id: 9,
    sku: "JAWAR-PANJEERI",
    name: "Jawar Panjeeri / Laddu",
    category: "LADDU",
    pricePerKg: 1900,
    minQtyGrams: 500,
    priceMinQty: 950,
    unitDescription: "₹1,900/Kg (Min. 500g: ₹950)",
    tag: "Gluten-Free Millet",
    ingredients: "Sorghum (Jawar), Assorted Dry Fruits, Gond, Pure Cow Ghee, Jaggery",
    healthBenefit: "Rich in Fiber & Micronutrients, Cooling and Gut-healthy superfood"
  },
  {
    id: 10,
    sku: "SAVORY-MAKHANA",
    name: "Savory Munchies (Makhana) - Roasted Makhana",
    category: "SAVORY",
    pricePerKg: 2750, // 275 / 100g
    minQtyGrams: 100,
    priceMinQty: 275,
    unitDescription: "₹275 / 100g",
    tag: "Guilt-Free Crunch",
    ingredients: "Fox Nuts (Phool Makhana), Roasted in Pure Cow Ghee, Rock Salt & Spices",
    healthBenefit: "Zero Cholesterol, Low Calorie, High Potassium & Magnesium snack"
  },
  {
    id: 11,
    sku: "SAVORY-MURMURA",
    name: "Savory Munchies (Murmura) - Millet Mudi Mix",
    category: "SAVORY",
    pricePerKg: 1000, // 200 / 200g
    minQtyGrams: 200,
    priceMinQty: 200,
    unitDescription: "₹200 / 200g",
    tag: "Tea-Time Crunch",
    ingredients: "Puffed Millets, Roasted Peanuts, Curry Leaves, Cold-pressed Oil, Spices",
    healthBenefit: "Light on stomach, 100% Roasted, Ancient Grain snack alternative"
  }
];

const BRAND_INFO = {
  name: "The Laddu Story",
  tagline: "Homemade healthy snacks: Ancient Indian traditions and superfoods",
  slogan: "Say No to Junk , Say Yes to The Laddu Story!",
  contactNumber: "9343207515",
  whatsappNumber: "+919343207515",
  googleAccount: "theladdustory@gmail.com",
  promises: [
    "Pure Desi Cow Ghee",
    "Unrefined Jaggery Powder as Sweetener",
    "No Added Sugar",
    "No Added Preservatives",
    "Minimum Order Quantity: 500g for Laddus"
  ]
};

module.exports = { OFFICIAL_CATALOG, BRAND_INFO };
