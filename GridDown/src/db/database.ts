import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

export type Edibility = 'safe' | 'caution' | 'toxic' | 'deadly';
export type Severity = 'minor' | 'moderate' | 'severe' | 'life_threatening';
export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export interface Plant {
  id: number;
  common_name: string;
  latin_name: string;
  edibility: Edibility;
  habitat: string;
  season: string;
  regions: string;
  description: string;
  identification: string;
  look_alikes: string | null;
  preparation: string;
  medicinal: string | null;
  source: string;
  image_filename: string | null;
  is_favorite: number;
}

export interface Fungi {
  id: number;
  common_name: string;
  latin_name: string;
  edibility: Edibility;
  habitat: string;
  season: string;
  description: string;
  identification: string;
  look_alikes: string | null;
  deadly_look_alikes: string | null;
  preparation: string;
  source: string;
  image_filename: string | null;
  is_favorite: number;
}

export interface Condition {
  id: number;
  name: string;
  category: string;
  symptoms: string;
  severity: Severity;
  immediate_action: string;
  treatment_no_supplies: string;
  treatment_with_supplies: string;
  when_to_evac: string;
  source: string;
  is_favorite: number;
}

export interface Medication {
  id: number;
  name: string;
  generic_name: string;
  category: string;
  uses: string;
  dosage_adult: string;
  dosage_child: string;
  contraindications: string;
  side_effects: string;
  alternatives: string;
  storage: string;
  source: string;
}

export interface Procedure {
  id: number;
  name: string;
  category: string;
  difficulty: Difficulty;
  steps_json: string;
  required_tools: string;
  improvised_tools: string;
  warnings: string;
  source: string;
  is_favorite: number;
}

export interface Waypoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  notes: string;
  created_at: number;
}

export interface RecentItem {
  id: number;
  item_type: string;
  item_id: string;
  item_name: string;
  viewed_at: number;
}

let db: SQLite.SQLiteDatabase;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('griddown.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      common_name TEXT NOT NULL,
      latin_name TEXT,
      edibility TEXT CHECK(edibility IN ('safe','caution','toxic')) NOT NULL,
      habitat TEXT,
      season TEXT,
      regions TEXT,
      description TEXT,
      identification TEXT,
      look_alikes TEXT,
      preparation TEXT,
      medicinal TEXT,
      source TEXT NOT NULL,
      image_filename TEXT,
      is_favorite INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fungi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      common_name TEXT NOT NULL,
      latin_name TEXT,
      edibility TEXT CHECK(edibility IN ('safe','caution','toxic','deadly')) NOT NULL,
      habitat TEXT,
      season TEXT,
      description TEXT,
      identification TEXT,
      look_alikes TEXT,
      deadly_look_alikes TEXT,
      preparation TEXT,
      source TEXT NOT NULL,
      image_filename TEXT,
      is_favorite INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS medical_conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      symptoms TEXT,
      severity TEXT CHECK(severity IN ('minor','moderate','severe','life_threatening')),
      immediate_action TEXT,
      treatment_no_supplies TEXT,
      treatment_with_supplies TEXT,
      when_to_evac TEXT,
      source TEXT NOT NULL,
      is_favorite INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT,
      uses TEXT,
      dosage_adult TEXT,
      dosage_child TEXT,
      contraindications TEXT,
      side_effects TEXT,
      alternatives TEXT,
      storage TEXT,
      source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS procedures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      difficulty TEXT CHECK(difficulty IN ('basic','intermediate','advanced')),
      steps_json TEXT,
      required_tools TEXT,
      improvised_tools TEXT,
      warnings TEXT,
      source TEXT NOT NULL,
      is_favorite INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_waypoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      lat REAL,
      lng REAL,
      notes TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS recently_viewed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT,
      item_id TEXT,
      item_name TEXT,
      viewed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      module TEXT,
      created_at INTEGER
    );
  `);

  // Seed plants if empty
  const plantCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM plants'
  );
  if (plantCount && plantCount.count === 0) {
    await seedPlants();
  }

  // Seed medical if empty
  const medCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM medical_conditions'
  );
  if (medCount && medCount.count === 0) {
    await seedMedical();
  }
}

async function seedPlants(): Promise<void> {
  const inserts = [
    // GREENS AND LEAFY PLANTS
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Dandelion', 'Taraxacum officinale', 'safe', 'Disturbed ground, lawns, meadows', 'Year-round', 'Worldwide',
    'Entire plant edible year-round. Roots can be roasted as a coffee substitute. One of the most nutritious wild plants.',
    'Toothed leaves in basal rosette, hollow stem exuding milky sap when broken, single yellow composite flower per stalk. No true stem — leaves emerge directly from root.',
    'None dangerous. Other dandelion relatives are also edible.',
    'Young leaves raw in salad, older leaves boiled to reduce bitterness. Flowers battered and fried. Roots roasted at 350F until dark brown, ground as coffee substitute.',
    'Diuretic. Leaves high in vitamins A, C, K and iron. Root used as digestive tonic.',
    'Stalking the Wild Asparagus, Euell Gibbons, Ch.3 p.28. Also FM 21-76 Appendix B (USDA reference).')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Stinging Nettle', 'Urtica dioica', 'safe', 'Moist disturbed ground, stream banks, forest edges', 'Spring (young tops)', 'North America, Europe, Asia',
    'Cook to neutralize sting. Extremely nutritious, high in protein, iron, and vitamins A and C.',
    'Opposite serrated leaves, hollow stinging hairs (trichomes) on stems and leaves. Square stem. Tiny greenish flowers in drooping clusters.',
    'Dead Nettle (Lamium) has no sting but similar leaves — still edible. Wood mint has square stem and mint smell.',
    'Boil or steam young tops 3-5 minutes — heat destroys sting. Use gloves or tongs to harvest. Use as spinach substitute in soups, pasta, pesto.',
    'Anti-inflammatory. Used for joint pain. High in chlorophyll. Historically used for anemia.',
    'Thayer Nature''s Garden p.112. FM 21-76 Appendix B.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Lamb''s Quarters', 'Chenopodium album', 'safe', 'Disturbed ground, gardens, roadsides, fields', 'Summer', 'Worldwide',
    'Superior nutritional profile to spinach. One of the most widely eaten wild greens globally.',
    'Diamond-shaped to rhomboid leaves with distinctive white mealy powder coating on underside and new growth. Tiny green flowers in dense clusters. Branching annual to 6 feet.',
    'None dangerous.',
    'Young leaves raw in salad. Older leaves boiled as potherb. Seeds can be ground into dark flour. Blanch to reduce mild oxalic acid.',
    'High in vitamins A, C, calcium, and protein.',
    'Gibbons Ch.7 Stalking the Wild Asparagus. FM 21-76 Appendix B.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Purslane', 'Portulaca oleracea', 'safe', 'Gardens, disturbed ground, cracks in pavement', 'Summer', 'Worldwide',
    'Highest omega-3 fatty acid content of any leafy plant. Succulent stems store water.',
    'Fleshy red-tinged succulent stems, paddle-shaped thick smooth leaves arranged alternately. Grows flat on ground in mats. Tiny yellow flowers. Smooth stems distinguish from spurge (spurge has milky sap).',
    'Spurge (Euphorbia) — milky sap, not edible. Spurge grows upright, purslane lies flat.',
    'Raw in salads with lemony flavor. Cooked as potherb. Can be pickled in vinegar. Mucilaginous when cooked, good as soup thickener.',
    'Extremely high omega-3 (ALA). Anti-inflammatory.',
    'Angier Field Guide to Edible Wild Plants p.178. FM 21-76 Appendix B.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Wood Sorrel', 'Oxalis', 'caution', 'Woodlands, lawns, disturbed areas', 'Spring-Fall', 'Worldwide',
    'Edible with lemony flavor, high in vitamin C. CAUTION: Contains oxalic acid. Eat in moderation only. Do not eat large amounts or if you have kidney issues.',
    'Clover-like trefoil leaves (three heart-shaped leaflets), yellow or white five-petal flowers. Leaves fold downward at night. Much smaller than true clover.',
    'True clover (Trifolium) — edible but without sour taste. Shamrock oxalis — same family, all edible.',
    'Small amounts raw as flavoring. Lemon substitute in drinks. Not a primary survival food due to oxalic acid — eat in moderation.',
    'Traditional cold remedy for vitamin C.',
    'FM 21-76 Appendix B. Brown Field Guide to Wild Edible and Medicinal Plants. Worldwide.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Chickweed', 'Stellaria media', 'safe', 'Disturbed ground, gardens, lawns', 'Spring', 'Worldwide temperate',
    'Mild flavor, easily digestible. Excellent survival green available very early in spring.',
    'Single line of hairs along one side of stem (distinctive field mark). Tiny star-shaped white flowers with 5 deeply-cleft petals appearing as 10. Opposite oval leaves. Low-growing mat.',
    'Mouse-eared chickweed (Cerastium) — hairy all over, also edible. Scarlet pimpernel — no hair line, toxic.',
    'Raw in salads or sandwiches. Cooked as potherb. Mild enough for any preparation.',
    'High in vitamin C. Traditional poultice for skin irritation.',
    'Angier Field Guide to Edible Wild Plants p.56. Spring. Worldwide.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Broadleaf Plantain', 'Plantago major', 'safe', 'Lawns, roadsides, disturbed ground', 'Spring-Fall', 'Worldwide',
    'Seeds and young leaves edible. One of the most important medicinal plants for field use.',
    'Oval leaves with parallel veins running length of leaf (distinctive). Leaves in basal rosette. Long leafless flower spike rising from center with tiny brown flowers. Ribwort plantain (P. lanceolata) has narrow leaves, same properties.',
    'None dangerous.',
    'Young leaves raw (tough and fibrous when older). Seeds stripped from spike and added to flour. Older leaves boiled.',
    'CRITICAL FIELD MEDICINE: Crushed leaves applied directly to insect stings, bee stings, small wounds, and blisters — draws out irritants. Significant antiseptic and anti-inflammatory properties.',
    'FM 21-76 Appendix B. Brown Field Guide to Wild Edible and Medicinal Plants p.89. Worldwide.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Watercress', 'Nasturtium officinale', 'caution', 'Running streams, cold clean springs', 'Spring-Fall', 'Worldwide near clean water',
    'Edible and nutritious near clean running water ONLY. CAUTION: Can carry liver fluke parasite (Fasciola hepatica) from standing or slow water. Only harvest from fast-running, unpolluted streams.',
    'Round to oval pinnate compound leaves. White cross-shaped four-petal flowers. Grows directly in or at edge of cold running water. Peppery taste.',
    'Fool''s watercress (Apium nodiflorum) — similar habitat, mildly toxic. True watercress grows IN water, has peppery taste.',
    'Raw in salads from clean fast-running water. Cook if water source is uncertain. Excellent peppery flavor and high vitamin C.',
    'High in iodine, vitamins A, C, K.',
    'Gibbons Stalking the Wild Asparagus Ch.12. Spring-Fall. Only clean running water.')`,

    // ROOTS AND TUBERS
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Cattail', 'Typha latifolia', 'safe', 'Wetlands, pond edges, marshes, stream banks', 'All seasons', 'Worldwide near water',
    'Complete survival food — multiple edible parts available in every season. Euell Gibbons called it the ''supermarket of the swamps.'' Gibbons devotes the entire first chapter of Stalking the Wild Asparagus to cattail.',
    'Distinctive brown sausage-shaped or hotdog-shaped cylindrical seed head (unmistakable). Flat strap-like leaves 3-10 feet tall. Grows in dense stands in shallow water or wet soil.',
    'No dangerous look-alikes when mature spike is present.',
    'Spring: peel young green shoots from base and eat raw or boiled (taste like cucumber/zucchini). Summer: male pollen head above female head — shake pollen into bag for yellow flour supplement. Fall/Winter: rhizomes (horizontal underground roots) dried and pounded into starch flour. Core of young shoots raw or cooked.',
    'Leaves used for weaving mats, baskets, and thatching emergency shelters.',
    'Gibbons Stalking the Wild Asparagus Ch.1 p.1-18. Brown Field Guide p.24. FM 21-76 Appendix B. All seasons. Worldwide near water.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Burdock', 'Arctium lappa', 'safe', 'Disturbed ground, roadsides, forest edges', 'Fall-Spring (first year root)', 'North America, Europe',
    'First-year rosette roots edible and nutritious. Cultivated as vegetable (gobo) in Japan.',
    'Very large heart-shaped basal leaves up to 18 inches across (first year rosette). Hooked burrs appear in second year. Deep taproot. Large plant hard to miss.',
    'None dangerous.',
    'Peel root of first-year plant, boil or roast. Tastes like mild artichoke. Slice thin and stir-fry. Young leaf stalks can be peeled and eaten raw in spring.',
    'Root used as digestive aid, blood purifier in traditional medicine.',
    'Thayer Forager''s Harvest p.201. Fall-Spring (first year root only). North America, Europe.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Wild Carrot / Queen Anne''s Lace', 'Daucus carota', 'caution', 'Fields, roadsides, disturbed ground', 'Summer-Fall (first year)', 'North America, Europe',
    'First-year taproot edible when it smells like carrot. EXTREME CAUTION: Has two deadly look-alikes. NEVER eat any member of the carrot family without positive identification of all features.',
    'IDENTIFICATION RULE: Wild carrot has (1) hairy stem, (2) smells unmistakably like carrot when crushed, (3) single small purple or dark red flower in exact center of white flower cluster, (4) involucre bracts forked like bird feet beneath flower cluster. Small taproot that smells like carrot.',
    'DEADLY LOOK-ALIKE 1: Poison Hemlock (Conium maculatum) — smooth purple-blotched stem, NO hair, musty unpleasant smell (not carrot). Taller plant. All parts lethal. DEADLY LOOK-ALIKE 2: Water Hemlock (Cicuta maculata) — near water, chambered hollow root when cut crosswise, musty smell. BOTH are lethal. If NO carrot smell: DO NOT EAT.',
    'First-year taproot boiled or roasted. Only eat if it clearly smells like carrot. Roots are small and fibrous unlike commercial carrot.',
    NULL,
    'FM 21-76 Appendix B. Angier Field Guide p.244. Summer-Fall. ALWAYS verify smell before eating.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Chicory', 'Cichorium intybus', 'safe', 'Roadsides, fields, disturbed ground', 'All seasons', 'North America, Europe',
    'Roots roasted as coffee substitute. Young greens edible raw or cooked.',
    'Bright sky-blue flowers (rarely white), deeply toothed basal leaves resembling dandelion, milky sap, rigid branching stems. Flowers close by noon.',
    'Dandelion (similar leaves) — also edible.',
    'Young leaves raw (bitter) or boiled to reduce bitterness. Roots roasted at 300F until dark brown, ground into excellent coffee substitute. Cultivated form is endive and radicchio.',
    'Root used as digestive aid, mild laxative.',
    'Gibbons Stalking the Wild Asparagus Ch.9. All seasons. North America, Europe.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Jerusalem Artichoke', 'Helianthus tuberosus', 'safe', 'Moist fields, roadsides, disturbed areas', 'Fall-Winter', 'North America',
    'Knobby tubers raw or cooked, nutty flavor. High calorie survival food. NOTE: Causes significant flatulence (contains inulin), especially when raw.',
    'Tall sunflower-like plant 5-10 feet. Small yellow sunflower-type flowers. Opposite rough hairy leaves. Knobby irregularly-shaped tubers 1-4 inches below soil.',
    'Other sunflower species — edible seeds but smaller tubers.',
    'Boil, roast, or eat raw. Peel thin skin. Cooking reduces flatulence somewhat.',
    NULL,
    'Thayer Forager''s Harvest p.86. Fall-Winter. Native to North America, widely naturalized.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Wild Onion', 'Allium canadense', 'safe', 'Meadows, open woods, fields', 'Spring', 'North America',
    'Entire plant edible. CRITICAL IDENTIFICATION RULE: ALL wild Allium species smell strongly of onion or garlic. If it does NOT smell like onion/garlic — it is NOT a wild onion and may be deadly.',
    'Grass-like leaves from bulb. White to pink flowers in rounded cluster (often replaced by small bulblets). Grows from small white bulb. MUST smell like onion when crushed.',
    'DEADLY LOOK-ALIKE: Death Camas (Anticlea elegans / Zigadenus) — similar grass-like leaves and white flowers, grows in similar habitat BUT HAS ABSOLUTELY NO ONION SMELL. All parts deadly. RULE: No onion smell = DO NOT EAT. This rule is absolute and non-negotiable.',
    'All parts edible: bulb, leaves, flowers. Raw or cooked. Use as onion in any recipe.',
    NULL,
    'FM 21-76 Appendix B. Angier Field Guide. Spring. North America. ALWAYS smell-test before eating.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Wild Leek / Ramps', 'Allium tricoccum', 'safe', 'Moist rich deciduous forest, often in large colonies', 'Spring only', 'Eastern North America',
    'Entire plant edible, strong garlic-onion flavor. Highly sought spring delicacy. Strong smell makes identification easy.',
    'Broad lance-shaped smooth shiny leaves (2-3 per plant) emerging in spring before trees leaf out. Leaves die back before white flowers appear in summer. Strong unmistakable garlic-onion smell. Small white bulb below.',
    'Lily of the Valley (Convallaria) — TOXIC, similar broad leaves but NO smell and appears after ramps have leafed out. ALWAYS confirm smell.',
    'Entire plant edible raw or cooked. Leaves, bulb, and flowers. Excellent in any onion/garlic application. Used raw in salads.',
    NULL,
    'Thayer Nature''s Garden p.312. Spring only. Eastern North America.')`,

    // BERRIES AND FRUITS
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Blackberry / Raspberry', 'Rubus species', 'safe', 'Forest edges, clearings, disturbed areas, thickets', 'Summer', 'Worldwide',
    'All Rubus species worldwide are edible. High calorie, widely available. Important survival food.',
    'Thorny arching canes. Compound leaves with 3-7 leaflets with serrated edges. White five-petal flowers. Aggregate drupelets forming the berry. Blackberry: solid core. Raspberry: hollow core when picked.',
    'None. All Rubus species are edible worldwide.',
    'Eat fresh. Dry into leather for preservation. Mash and strain for juice. Leaves make acceptable tea.',
    'High in vitamin C and antioxidants.',
    'Angier Field Guide to Edible Wild Plants p.40. Summer. Worldwide.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Elderberry', 'Sambucus nigra', 'caution', 'Forest edges, stream banks, roadsides', 'Late summer', 'North America, Europe',
    'Cooked berries edible and highly nutritious. CAUTION: Raw berries cause nausea and vomiting. All other parts (leaves, bark, unripe berries, roots) are toxic — contain cyanogenic glycosides.',
    'Compound leaves with 5-9 leaflets with serrated edges. Large flat-topped white flower clusters (elderflowers) in early summer. Small black-purple berries in umbrella-shaped clusters in late summer.',
    'Pokeweed (Phytolacca americana) — berries grow in elongated grape-like cluster on pink-purple stems, not umbrella cluster. Pokeweed berries are TOXIC. Elderberry berries hang in umbrella clusters.',
    'Cook berries thoroughly before eating — destroys toxic compounds. Excellent for jams, syrups, elderberry wine. Elderflowers safe raw, used for fritters and cordial.',
    'Elderberry syrup widely used for immune support and flu treatment.',
    'Brown Field Guide to Wild Edible and Medicinal Plants p.156. Late summer. North America, Europe.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Rose Hips', 'Rosa species', 'safe', 'Open areas, roadsides, thickets', 'Fall-Winter', 'North America, Europe, Asia',
    'Extremely high in vitamin C — 20 times more than oranges. Critical vitamin C source in winter survival. CAUTION: The seeds and inner hairs irritate the digestive tract. Process to remove them when eating in quantity.',
    'All wild rose species. Fleshy red to orange-red fruits (hips) appearing after flowers drop. Oval with small calyx lobes at end. Bright red when ripe.',
    'None dangerous when rose hips specifically identified.',
    'Eat flesh of ripe hips raw — avoid seeds and inner hairs. Better processed: cut in half, scoop out seeds and hairs, dry or cook. Make tea by simmering. Make jam. Dry and powder.',
    'Highest natural vitamin C of any common plant. Critical for preventing scurvy in long-term survival.',
    'FM 21-76 Appendix B. Gibbons. Fall-Winter. North America, Europe, Asia.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Wild Strawberry', 'Fragaria virginiana', 'safe', 'Open woods, meadows, hillsides', 'Summer', 'North America, Europe',
    'Smaller than commercial but intensely sweet. All strawberry species edible.',
    'Low-growing plant with trifoliate (three) leaflets with coarsely toothed edges. White five-petal flowers with yellow center. Red fruit smaller than commercial, very fragrant.',
    'Mock strawberry (Duchesnea indica) — similar but yellow flowers, tasteless fruit (still edible, not harmful).',
    'Eat fresh. Dry for preservation. The leaves make acceptable tea.',
    NULL,
    'Angier Field Guide to Edible Wild Plants p.208. Summer. North America, Europe.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Blueberry / Huckleberry', 'Vaccinium species', 'safe', 'Acidic soils, bogs, forest openings, mountain slopes', 'Summer', 'North America, Europe, Asia',
    'All Vaccinium species are edible. High sugar content makes these an important survival food.',
    'Low to medium shrubs with small oval leaves. Small urn-shaped white or pink flowers. Blue-black berries with characteristic 5-pointed star calyx scar at top.',
    'Pokeweed berries (grow on tall herb from ground in elongated cluster, toxic) — very different plant. Nightshade berries grow in small drooping clusters, NOT on shrubs.',
    'Eat fresh. Excellent dried. Mash into pemmican. Make into jam. High calorie when plentiful.',
    'High in antioxidants and vitamin C.',
    'Brown Field Guide to Wild Edible and Medicinal Plants p.142. Summer. North America, Europe, Asia.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Pawpaw', 'Asimina triloba', 'safe', 'Rich moist bottomland deciduous forest, river banks', 'Late summer', 'Eastern North America',
    'Largest native North American fruit. Custard-like texture, banana-mango flavor. High calorie. Forms large patches (clonal colonies).',
    'Large drooping tropical-looking leaves 6-12 inches. Dark maroon-purple six-petal flowers in spring before leaves. Oblong green fruit 2-6 inches turning yellowish when ripe, falls when ready.',
    'None dangerous.',
    'Eat fresh when soft and ripe (does not store well). Mash and dry into leather. High sugar and calories.',
    NULL,
    'Thayer Forager''s Harvest p.38. Late summer (August-October). Eastern North America.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Mulberry', 'Morus rubra / Morus alba', 'safe', 'Forest edges, roadsides, disturbed areas', 'Summer', 'North America, Europe, Asia',
    'Prolific producer, high calorie. Both red mulberry (native) and white mulberry (introduced) fully edible.',
    'Tree with alternate variable-shaped leaves (may be lobed or unlobed on same tree). Berries in elongated aggregate clusters resembling elongated blackberries. White berries turn red then dark purple-black when fully ripe.',
    'Unripe mulberries and leaves can cause hallucinogenic and mildly toxic effects — only eat fully ripe dark fruit.',
    'Eat ripe berries fresh. Dry for storage. Make jam. Extremely productive — one tree can drop pounds of fruit per day.',
    NULL,
    'Angier Field Guide to Edible Wild Plants p.148. Summer. North America, Europe, Asia.')`,

    // NUTS
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Acorns', 'Quercus species', 'safe', 'Oak woodland, forest, savanna', 'Fall', 'North America, Europe, Asia',
    'ALL acorn species are edible after leaching tannins. Critical high-calorie survival food — all-purpose flour source. Tom Brown Jr. devotes Chapter 4 entirely to acorn processing. Native American staple for millennia.',
    'Distinctive acorn shape with cap (cupule). All oak species (Quercus) produce acorns — no dangerous look-alikes. White oaks (rounded leaf lobes) have less tannin. Red oaks (pointed lobe tips) have more tannin.',
    'None. All acorns are edible after processing.',
    'ALL species require tannin leaching: Cold water method: change water daily 1-3 days until no bitterness. Hot water method: boil, drain, repeat 5-10 times until not bitter. Dry and grind into flour for bread, porridge, pancakes. High fat content provides long-lasting energy.',
    NULL,
    'Brown Field Guide to Wild Edible and Medicinal Plants Ch.4. Thayer Forager''s Harvest p.166. FM 21-76 Appendix B. Fall. North America, Europe, Asia.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Hickory Nuts', 'Carya species', 'safe', 'Deciduous forest', 'Fall', 'Eastern North America',
    'Very high calorie and fat content. One of the highest calorie wild foods available. Crack with rock against another rock if no tools.',
    'Compound leaves with 5-9 leaflets. Nuts in hard round to oval shell with thick green husk that splits in 4 sections when ripe.',
    'None dangerous.',
    'Crack open and eat nutmeat directly. Special technique: boil hickory nuts in large quantity of water — fat rises as hickory milk (oil-rich cooking medium). Traditional Native American technique for extracting oil.',
    NULL,
    'Thayer Forager''s Harvest. Fall. Eastern North America. High fat content critical for calorie-dense survival food.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Black Walnut', 'Juglans nigra', 'safe', 'Moist rich woodland, stream banks, roadsides', 'Fall', 'Eastern North America',
    'High fat, high calorie. Green husk contains juglone which stains skin dark for weeks. Crack the extremely hard shell with a hammer or large rock.',
    'Large compound leaves 1-2 feet long with 11-23 leaflets. Round to slightly oval fruit with green to black husk. Very hard inner shell. Distinctive walnut smell when crushed.',
    'Butternut (Juglans cinerea) — oblong husk, same family, also edible.',
    'Remove green husk (stains hands — use gloves or leave in sun until husk blackens). Crack very hard shell. Nutmeat is rich and flavorful. Can be dried for long storage.',
    NULL,
    'Gibbons Stalking the Wild Asparagus Ch.11. Fall. Eastern North America.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Hazelnut', 'Corylus species', 'safe', 'Woodland edges, thickets, stream banks', 'Fall', 'North America, Europe',
    'Small but very nutritious and high in fat. Harvest when husk turns brown and nut rattles loose.',
    'Shrub to small tree. Oval doubly-toothed leaves. Nuts in papery leafy husk cluster (2-6 nuts). Harvest when husk turns from green to tan-brown.',
    'None dangerous.',
    'Eat raw or roasted. Roasting greatly improves flavor. Grind into paste (hazelnut butter). High fat content.',
    NULL,
    'Angier Field Guide to Edible Wild Plants p.116. Fall. North America, Europe.')`,

    // TEAS AND MEDICINAL
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Yarrow', 'Achillea millefolium', 'safe', 'Meadows, roadsides, open forest', 'All seasons (flowers summer)', 'North America, Europe, Asia',
    'Both edible tea plant and critical field medicine plant. Named for Achilles who used it on soldiers'' wounds.',
    'Feathery fern-like (finely divided pinnate) aromatic leaves. Flat-topped white (or occasionally pink) flower clusters. Strong distinctive yarrow smell when crushed.',
    'Poison hemlock has finely divided leaves but smooth purple-blotched stems and musty smell. Yarrow has fine hair on stems and distinctive herbal smell.',
    'Tea from leaves and flowers — slightly bitter but medicinal. Young leaves added sparingly to salads.',
    'CRITICAL FIELD MEDICINE: Chew leaves and apply directly to wounds for antiseptic and hemostatic (bleeding control) effect. Tea for fever reduction. One of the most important medicinal plants available.',
    'Brown Field Guide to Wild Edible and Medicinal Plants p.213. FM 21-76. All seasons.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Peppermint / Spearmint', 'Mentha species', 'safe', 'Moist areas, stream banks, disturbed ground', 'Summer', 'North America, Europe',
    'All Mentha species are safe. Digestive aid, insect repellent, and flavor for food.',
    'Square stem (diagnostic for mint family). Opposite toothed leaves. Strong distinctive mint smell — unmistakable. Small pink-purple flowers in whorls.',
    'None dangerous — the mint smell is definitive. No toxic plants smell like mint.',
    'Tea from leaves. Flavor food and water. Apply crushed leaves to skin as insect repellent.',
    'Digestive aid — relieves nausea and stomach cramps. Antibacterial. Relieves headaches (topical).',
    'Gibbons Stalking the Wild Asparagus Ch.14. Summer. North America, Europe.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Chamomile', 'Matricaria chamomilla', 'safe', 'Fields, roadsides, disturbed ground', 'Summer', 'North America, Europe',
    'Calming tea, digestive aid. Safe for most people including children.',
    'Small white daisy-like flowers with yellow center. Apple-like scent when crushed (distinctive). Finely divided feathery leaves. Annual.',
    'Feverfew (similar flowers) — bitter, medicinal not beverage. Mayweed (Anthemis) — less pleasant smell.',
    'Tea from dried flowers — steep 5 minutes. Mild and pleasant.',
    'Calming effect. Reduces anxiety and promotes sleep. Digestive aid for cramps and nausea. Anti-inflammatory.',
    'Angier Field Guide to Edible Wild Plants p.52. Summer. North America, Europe.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Pine Needle Tea', 'Pinus species', 'safe', 'Coniferous forest and mixed woodland', 'Year-round', 'North America, Europe, Asia',
    'Extremely high in vitamin C — prevents scurvy. Critical for long-term survival. DEADLY LOOK-ALIKE WARNING: Yew (Taxus) needles are deadly.',
    'IDENTIFICATION CRITICAL: Pine needles grow in bundles (fascicles) of 2, 3, or 5 needles per bundle wrapped at base. Eastern white pine has 5 needles per bundle. Ponderosa pine has 3. Scots pine has 2. NEVER use yew — flat single needles in two opposite rows along twig, often with red berries.',
    'DEADLY LOOK-ALIKE: Yew (Taxus) — flat needles in two opposite rows (not bundled), red berry-like seed, EXTREMELY TOXIC. If needles are not bundled: do not use. Also avoid hemlock (Tsuga) — small needles in two rows, though hemlock tea is not recommended.',
    'Steep fresh GREEN pine needles in hot (not boiling — destroys vitamin C) water 10 minutes. Strain. Drink 1-2 cups daily for vitamin C.',
    'CRITICAL: Prevents scurvy in long-term survival. One cup provides approximately 5x the daily vitamin C requirement.',
    'FM 21-76 Appendix B. All seasons. North America, Europe, Asia.')`,

    // CAUTION/RESTRICTED
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Mayapple', 'Podophyllum peltatum', 'caution', 'Moist forest floor, often in large colonies', 'Late summer', 'Eastern North America',
    'ONLY the fully ripe yellow fruit is edible — and only in small amounts. All other parts are TOXIC: leaves, roots, unripe green fruit, and seeds inside ripe fruit.',
    'Large umbrella-like leaves 1-2 feet across, single or paired. White waxy six-petal flower beneath leaf junction. Single oval fruit turning from green to yellow when ripe.',
    'None dangerous but fruit timing is critical — must be fully yellow and soft.',
    'Only fully ripe, yellow, soft fruit. Eat flesh only — avoid seeds inside. Small amounts only as large quantities are toxic even when ripe.',
    'Roots historically used medicinally (podophyllin) but toxic — not for field use.',
    'Angier Field Guide to Edible Wild Plants p.136. Late summer (August-September). Eastern North America.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Bracken Fern', 'Pteridium aquilinum', 'caution', 'Open woodland, hillsides, forest clearings', 'Spring only', 'Worldwide',
    'Young fiddleheads edible in spring ONLY and MUST be well cooked. CAUTION: Raw bracken contains thiaminase (destroys vitamin B1) and a carcinogen (ptaquiloside). Thayer explicitly warns about this in Forager''s Harvest and recommends moderation.',
    'Large triangular frond on single stalk. Young growth in spring is tight coiled fiddlehead. Mature fronds large and spreading. Underground rhizomes horizontal.',
    'Other ferns — most are not choice edibles. Cinnamon fern, ostrich fern fiddleheads generally considered safer alternatives.',
    'Young fiddleheads only — boil thoroughly in multiple changes of water. NOT a primary survival food. The rhizomes can be processed for starch but are labor-intensive.',
    NULL,
    'Thayer Forager''s Harvest (with explicit cautionary note). Spring only. Worldwide.')`,

    // TOXIC (FOR ID AND AVOIDANCE)
    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Water Hemlock', 'Cicuta maculata', 'toxic', 'Wet areas, stream banks, marshes, wet meadows', 'Summer', 'North America',
    'MOST VIOLENTLY TOXIC plant in North America. A single bite of root can kill an adult in minutes through violent convulsions. IDENTIFICATION ONLY — never eat.',
    'Compound leaves with lance-shaped leaflets with serrated margins. White umbrella-shaped flower clusters. CRITICAL IDENTIFICATION: Cut root crosswise — shows distinctive horizontal chambers with yellowish sap. Musty smell (NOT carrot smell).',
    'Wild carrot / Queen Anne''s Lace (edible if carrot smell present). Wild parsnip. KEY DIFFERENCE: Wild carrot has hairy stem and carrot smell. Water hemlock has chambered root and musty smell and grows near water.',
    NULL,
    NULL,
    'FM 21-76 hazardous plants section. Brown Field Guide p.47 (identification for avoidance only). Worldwide near water.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Poison Hemlock', 'Conium maculatum', 'toxic', 'Disturbed ground, roadsides, stream banks', 'Summer', 'Worldwide',
    'ALL PARTS DEADLY. Killed Socrates. Causes ascending paralysis and respiratory failure. IDENTIFICATION ONLY — never eat.',
    'DISTINCTIVE IDENTIFICATION: Smooth hollow stem with purple-red blotches or spots (not hairy). Musty unpleasant mousy smell when crushed (NOT carrot smell). White umbrella flower clusters. Finely divided compound leaves. Tall plant 3-8 feet.',
    'Wild carrot (edible) — hairy stem, carrot smell, single purple flower in center. Wild parsley. KEY RULE: Smooth purple-blotched stems + musty smell = Poison Hemlock = deadly.',
    NULL,
    NULL,
    'FM 21-76 hazardous plants list. Worldwide disturbed ground and roadsides.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Death Camas', 'Anticlea elegans / Zigadenus', 'toxic', 'Meadows, grasslands, slopes', 'Spring', 'Western North America',
    'ALL PARTS DEADLY. Contains zygacine — cardiac toxin. CRITICAL: Has NO onion smell whatsoever. This is the only reliable field distinction from wild onion.',
    'Grass-like leaves from bulb. White to cream flowers with 6 petals in elongated clusters. Grows in similar habitat to wild onion. NO onion or garlic smell ever — this is the critical identification point.',
    'Wild onion (Allium species) — edible but MUST smell like onion. Death camas looks nearly identical but has ZERO onion smell. ABSOLUTE RULE: If any allium-looking plant has no onion smell, it is potentially Death Camas. DO NOT EAT.',
    NULL,
    NULL,
    'FM 21-76 hazardous plants. Western North America especially. Spring.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Pokeweed', 'Phytolacca americana', 'toxic', 'Disturbed ground, forest edges, roadsides', 'Summer-Fall', 'Eastern North America',
    'ALL PARTS TOXIC especially roots and mature leaves and berries. Only young shoots triple-boiled historically eaten but risk is not worth it. FM 21-76 lists as hazardous. Do not eat.',
    'Large plant 5-10 feet. Large smooth oval leaves. Magenta-pink to white flowers in elongated spike becoming elongated cluster of dark purple-black berries on vivid pink-magenta stems. Root is large, white, and toxic.',
    'Elderberry berries (edible when cooked) grow in flat umbrella clusters on woody shrub. Pokeweed grows on herbaceous stalk with elongated grape-like berry clusters on pink stems.',
    NULL,
    NULL,
    'FM 21-76 hazardous plants (listed as dangerous). Eastern North America.')`,

    `INSERT INTO plants (common_name, latin_name, edibility, habitat, season, regions, description, identification, look_alikes, preparation, medicinal, source) VALUES
    ('Yew', 'Taxus species', 'toxic', 'Forest understory, often planted ornamentally', 'Year-round', 'North America, Europe, Asia',
    'ALL PARTS EXCEPT red aril flesh are DEADLY. Seeds inside the red aril are toxic. Do not confuse with pine or spruce for needle tea.',
    'Flat needles arranged in two opposite rows along twig (NOT bundled like pine). Red fleshy berry-like aril surrounding seed. Dark green year-round.',
    'Pine needles (for tea) — BUNDLED needles in groups of 2-5. Spruce — needles attached singly but stiff and scratchy. Hemlock tree (Tsuga) — small needles in 2 rows but native forest tree. RULE: If needles are not bundled, do not make pine needle tea.',
    NULL,
    NULL,
    'FM 21-76 hazardous plants. North America, Europe, Asia. Commonly planted in gardens.')`,
  ];

  for (const sql of inserts) {
    await db.execAsync(sql);
  }
}

async function seedFungi(): Promise<void> {
  const inserts = [
    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Chicken of the Woods', 'Laetiporus sulphureus', 'safe', 'On trees, stumps, especially oak', 'Summer-Fall',
    'Bright orange-yellow shelf fungus growing on trees. No dangerous look-alikes. One of the best beginner mushrooms.',
    'Bright orange-yellow overlapping fan-shaped shelves growing directly on wood. Soft and moist when young, tougher with age. No gills — pores on underside.',
    'None dangerous. Unmistakable when fresh.',
    NULL,
    'Cook thoroughly before eating. Some people have reactions when growing on locust or eucalyptus trees. Texture similar to chicken when cooked.',
    'Phillips Mushrooms p.186. Summer-Fall. North America, Europe.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Giant Puffball', 'Calvatia gigantea', 'safe', 'Meadows, fields, forest edges', 'Summer-Fall',
    'CRITICAL IDENTIFICATION RULE: Always cut in half before eating. Must be pure uniform white inside with no internal structure. If any sign of gills, outline of a figure, or any color — discard immediately.',
    'Large white to cream-colored ball 8-24 inches across. Smooth surface. MUST be cut in half: interior must be pure uniform white throughout with no differentiation.',
    'Earthball (Scleroderma) — smaller, has dark interior when cut. Hard exterior.',
    'Juvenile deadly Amanita species can be enclosed in white universal veil at ground level resembling small puffball. RULE: Cut in half — if you see any outline of a mushroom shape inside (gills, cap outline) = juvenile Amanita = deadly. Discard.',
    'Slice and fry like tofu. Excellent eating when pure white inside.',
    'Phillips Mushrooms p.272. Summer-Fall. North America, Europe.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Chanterelle', 'Cantharellus cibarius', 'safe', 'Forest floor, especially under oak and conifers', 'Summer-Fall',
    'Golden yellow, highly prized edible. One of the best edible mushrooms worldwide. Fruity apricot-like scent.',
    'Golden to egg-yolk yellow. Cap edges wavy and irregular. DIAGNOSTIC: Ridges on underside are forked and blunt-edged, running down stem (NOT sharp-edged true gills). Solid flesh, fruity smell.',
    'Jack O''Lantern mushroom (Omphalotus olearius) — TOXIC: true sharp gills (not forking ridges), orange color, grows in dense clusters on wood or buried wood, may glow faintly in dark.',
    'Jack O''Lantern (Omphalotus) — causes severe gastrointestinal illness. KEY: Chanterelle has FORKING RIDGES running down stem. Jack O''Lantern has sharp TRUE GILLS and grows in clusters.',
    'Sauté in butter. Excellent in any recipe. Do not overcook.',
    'Phillips Mushrooms p.14. Summer-Fall. North America, Europe.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Morel', 'Morchella esculenta', 'safe', 'Forest floor, often near old apple trees, ash, elm', 'Spring',
    'Hollow when cut lengthwise — this is the critical identification feature. Honeycomb-pitted cap. One of the most sought wild mushrooms.',
    'Distinctive pitted honeycomb cap fused to stem with no free edges. CRITICAL TEST: Cut in half lengthwise — true morel is completely hollow throughout cap and stem.',
    'False Morel (Gyromitra esculenta) — brain-like saddle-shaped wrinkled (not pitted) cap, NOT completely hollow when cut, stem may be chambered.',
    'False Morel (Gyromitra) — contains gyromitrin which converts to monomethylhydrazine (MMH), a rocket fuel component. Can be fatal. KEY: True morel has honeycomb PITS. False morel has brain-like WRINKLES and is not completely hollow.',
    'Sauté or cook thoroughly. Do not eat raw.',
    'Phillips Mushrooms p.326. Spring. North America, Europe. Always cut in half to verify.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Oyster Mushroom', 'Pleurotus ostreatus', 'safe', 'Dead or dying hardwood logs and stumps', 'Fall-Spring',
    'White to gray fan-shaped clusters on dead wood. No dangerous look-alikes in North America.',
    'Fan to oyster-shaped, white to gray-brown. Gills run down short off-center stem. Grows in overlapping clusters on wood. Slight anise to mushroom smell.',
    'None dangerous in North America.',
    NULL,
    'Excellent edible. Sauté, stir-fry. Widely cultivated.',
    'Phillips Mushrooms p.15. Fall-Spring. North America, Europe.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Hen of the Woods / Maitake', 'Grifola frondosa', 'safe', 'Base of oaks and other hardwoods', 'Fall',
    'Overlapping gray-brown fronds at tree base. Can reach 50+ pounds. No dangerous look-alikes.',
    'Multiple overlapping fan-shaped gray-brown to brownish fronds growing in large mass at base of oak trees. White pores on underside. No true gills.',
    'None dangerous.',
    NULL,
    'Excellent edible. All parts edible. Meaty texture.',
    'Phillips Mushrooms p.188. Fall. North America, Europe, Asia.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Death Cap', 'Amanita phalloides', 'deadly', 'Forest floor near trees (ectomycorrhizal)', 'Summer-Fall',
    'Responsible for 90% of fatal mushroom poisonings worldwide. No antidote. Liver and kidney failure 6-24 hours after onset of symptoms. Initial symptoms mimic food poisoning then temporarily improve before fatal organ failure.',
    'Pale greenish-white to olive cap. Pure white gills. Ring (annulus) on upper stem. Volva (cup-like sheath) at base of stem at or below soil level. Often partially buried. Typically 3-6 inches tall.',
    'White button mushrooms (grocery store) — no volva, no ring. Paddy straw mushroom (Asian cooking) — check for volva always.',
    'Any pale Amanita with volva. There is NO safe-looking version. When in doubt about any mushroom: do not eat it.',
    'FOR AVOIDANCE ONLY. No preparation makes this safe.',
    'Phillips Mushrooms p.246. DANGER section. Worldwide. No antidote exists.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Destroying Angel', 'Amanita bisporigera', 'deadly', 'Forest floor, mixed woodland', 'Summer-Fall',
    'Pure white throughout. No antidote. Liver failure begins 6-24 hours after onset of first symptoms. Initial symptoms of nausea/vomiting temporarily subside (false recovery) before fatal organ failure within days.',
    'Pure white cap, gills, stem, ring, and volva at base. Found in woodland soil. Can be confused with edible white mushrooms.',
    'Puffballs (edible when pure white inside — always cut in half to check). White Agaricus species.',
    'Any pure white mushroom with ring and volva. Check every white mushroom for base volva.',
    'FOR AVOIDANCE ONLY. No preparation makes this safe.',
    'Phillips Mushrooms p.248. DANGER section. North America. No antidote exists.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Lion''s Mane', 'Hericium erinaceus', 'safe', 'Wounds and cavities of hardwood trees, especially oak', 'Fall',
    'White shaggy cascading waterfall appearance. Completely unmistakable. One of the best beginner mushrooms — no dangerous look-alikes.',
    'White to cream-colored mass of cascading teeth or spines hanging downward. No cap or gills. Grows on wounds of hardwood trees.',
    'None.',
    NULL,
    'Excellent edible. Seafood-like texture. Sauté in butter.',
    'Phillips Mushrooms p.207. Fall. North America, Europe, Asia.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('King Bolete / Porcini', 'Boletus edulis', 'safe', 'Forest floor under conifers and mixed woodland', 'Summer-Fall',
    'Premium edible. Brown cap, thick white to tan stem with distinctive network (reticulation) pattern on upper stem. CAUTION: Some red-pored boletes are toxic.',
    'Brown to reddish-brown cap. Thick bulbous white to tan stem with net-like ridge pattern (reticulation) at top. White to yellow pores (not gills) on underside. Does not bruise blue when cut.',
    'Other edible boletes.',
    'Red-pored boletes (any bolete with red or orange pores) — TOXIC or suspect. RULE: If pores or flesh instantly turns bright blue when cut or broken — avoid. King bolete does not blue.',
    'Excellent raw or cooked. Dry for long-term storage.',
    'Phillips Mushrooms p.220. Summer-Fall. North America, Europe, Asia.')`,

    `INSERT INTO fungi (common_name, latin_name, edibility, habitat, season, description, identification, look_alikes, deadly_look_alikes, preparation, source) VALUES
    ('Turkey Tail', 'Trametes versicolor', 'safe', 'Dead hardwood logs, stumps, fallen branches', 'Year-round',
    'Use as medicinal tea only — too tough to eat directly. One of the most common woodland fungi worldwide.',
    'Thin fan-shaped brackets in overlapping tiers showing concentric zones of color (white, tan, gray, brown in bands). Velvety upper surface. Tiny white pores on underside. Very tough.',
    'None dangerous when identified correctly.',
    NULL,
    'Simmer strips in water 20+ minutes for medicinal tea. Too tough to eat directly.',
    'Missouri Botanical Garden species profile (CC-licensed). Year-round on dead wood. Worldwide.')`,
  ];

  for (const sql of inserts) {
    await db.execAsync(sql);
  }
}

async function seedMedical(): Promise<void> {
  const EVAC_PREFIX = 'SEEK EVACUATION AND PROFESSIONAL CARE. This is emergency reference only. | ';

  const conditions = [
    // TRAUMA
    {
      name: 'Arterial Bleeding',
      category: 'Trauma',
      symptoms: 'Bright red blood spurting in pulses with heartbeat. Rapid blood loss. Victim becoming pale, confused, weak. Blood may pulse out forcefully.',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'TOURNIQUET APPLICATION 2-3 inches above wound on limb. Note exact time applied on skin with marker. Direct pressure with both hands if tourniquet not possible. Do not remove tourniquet once applied.',
      treatment_no_supplies: 'Direct hand pressure — both hands. Elevate limb above heart. Pack wound tightly with cloth. Do not release pressure for at least 10 minutes.',
      treatment_with_supplies: 'Commercial tourniquet (CAT or SOFTT-W) applied 2-3 inches above wound. Hemostatic gauze (QuikClot/Celox) packed into wound. Pressure bandage over packing.',
      when_to_evac: 'Immediately. Arterial bleeding can cause death within 2-4 minutes.',
      source: 'SF Medical Handbook ST 31-91B Ch.4 Hemorrhage Control. FM 21-76 Ch.7 First Aid.',
    },
    {
      name: 'Venous Bleeding',
      category: 'Trauma',
      symptoms: 'Dark red blood flowing steadily (not spurting). Less immediately life-threatening than arterial but can become serious.',
      severity: 'moderate',
      immediate_action: 'Direct pressure with clean cloth immediately. Do not remove cloth once applied — add more cloth on top if saturated.',
      treatment_no_supplies: 'Sustained direct pressure minimum 10-15 minutes without releasing or peeking. Elevate above heart level.',
      treatment_with_supplies: 'Pressure bandage. Wound closure strips (steri-strips) for clean lacerations.',
      when_to_evac: 'If bleeding does not control with 20 minutes pressure, or if large volume lost.',
      source: 'SF Medical Handbook ST 31-91B Ch.4 Hemorrhage Control.',
    },
    {
      name: 'Closed Fracture',
      category: 'Trauma',
      symptoms: 'Pain at fracture site, swelling, deformity or unnatural angle, bruising, inability to bear weight or use limb, grating sensation.',
      severity: 'moderate',
      immediate_action: 'Immobilize in position found. Do NOT attempt to straighten or realign. Check circulation below fracture (pulse, sensation, movement).',
      treatment_no_supplies: 'Improvised splint: straight sticks or rigid materials on both sides of fracture, padded with cloth on bony prominences, tied with strips of cloth above and below fracture site.',
      treatment_with_supplies: 'SAM splint. Triangular bandage sling for arm fractures. Check CMS (circulation, motor, sensation) before and after splinting.',
      when_to_evac: 'All fractures require professional evaluation. Evacuate non-urgently if stable.',
      source: 'FM 21-76 Ch.7 First Aid. SF Medical Handbook ST 31-91B Ch.11 Orthopedic Injuries.',
    },
    {
      name: 'Open Fracture (Compound)',
      category: 'Trauma',
      symptoms: 'Bone visible through skin wound. High contamination risk. Severe pain. Deformity.',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'Cover bone and wound with moist clean cloth. Do NOT push bone back in. Splint in position found. Prevent contamination.',
      treatment_no_supplies: 'Sterile moist cover for wound. Improvised splint. Elevate if possible. Do not irrigate aggressively near exposed bone.',
      treatment_with_supplies: 'Moist sterile dressing. Antibiotics immediately (amoxicillin 500mg 3x daily if available).',
      when_to_evac: 'Urgent. Open fractures carry extreme infection risk. Osteomyelitis can develop within hours.',
      source: 'SF Medical Handbook ST 31-91B Ch.11 Open Fractures.',
    },
    {
      name: 'Burns — First Degree',
      category: 'Trauma',
      symptoms: 'Redness, pain, dry skin, no blisters. Sunburn level. Superficial epidermal layer only.',
      severity: 'minor',
      immediate_action: 'Cool with clean running water 10-20 minutes. Do NOT use ice (causes frostbite). Do not apply butter or oil.',
      treatment_no_supplies: 'Cool water immersion. Shade from further sun. Aloe vera gel if available.',
      treatment_with_supplies: 'Topical aloe vera. Ibuprofen or acetaminophen for pain.',
      when_to_evac: 'Rarely. Large burns covering >50% body surface even if first degree.',
      source: 'SF Medical Handbook ST 31-91B Ch.9 Burns.',
    },
    {
      name: 'Burns — Second Degree',
      category: 'Trauma',
      symptoms: 'Blisters, intense pain, weeping wound, red or blotchy skin beneath blisters. Partial thickness burn.',
      severity: 'moderate',
      immediate_action: 'Cool with clean water 15-20 minutes. Do NOT pop blisters (they protect wound). Cover loosely with clean non-stick cloth.',
      treatment_no_supplies: 'Keep clean and loosely covered. Change dressing daily with clean water rinse.',
      treatment_with_supplies: 'Non-stick dressing (Telfa). Topical silver sulfadiazine if available. Ibuprofen for pain and inflammation.',
      when_to_evac: 'Burns >10% body surface area, or involving face, hands, genitals, or circumferential burns of extremities.',
      source: 'SF Medical Handbook ST 31-91B Ch.9 Burns.',
    },
    {
      name: 'Burns — Third Degree',
      category: 'Trauma',
      symptoms: 'White, brown, or black charred skin. NO pain at burn site (nerve endings destroyed). Skin dry and leathery. May have pain at edges.',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'Do NOT cool extensively (hypothermia risk on large burns). Cover with dry clean cloth. Protect from contamination. Fluid management critical.',
      treatment_no_supplies: 'Keep dry and covered. Do not remove stuck clothing. Oral fluids if conscious.',
      treatment_with_supplies: 'Dry sterile dressing. IV fluids if available. Antibiotics preventively.',
      when_to_evac: 'All third degree burns require urgent evacuation. Lethal from fluid loss and infection without hospital care.',
      source: 'SF Medical Handbook ST 31-91B Ch.9 Burns.',
    },
    {
      name: 'Head Injury / TBI',
      category: 'Trauma',
      symptoms: 'Loss of consciousness (even brief), confusion, amnesia of event, headache worsening over time, vomiting (especially repeated), unequal pupil size, weakness on one side.',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'Immobilize cervical spine if mechanism suggests. Maintain airway — recovery position if unconscious and breathing. Do NOT give aspirin or ibuprofen (increases intracranial bleeding). Acetaminophen only for headache.',
      treatment_no_supplies: 'Serial neurological checks every 15 minutes. Note any deterioration. Keep awake for 4 hours if concussion suspected.',
      treatment_with_supplies: 'Cervical collar if spinal injury suspected. Monitor Glasgow Coma Scale.',
      when_to_evac: 'Any loss of consciousness, repeated vomiting, worsening headache, unequal pupils, weakness, confusion — urgent evacuation.',
      source: 'SF Medical Handbook ST 31-91B Ch.7 Head Trauma.',
    },
    {
      name: 'Spinal Injury',
      category: 'Trauma',
      symptoms: 'Neck or back pain after trauma mechanism. Numbness, tingling, or weakness in extremities. Paralysis. Incontinence.',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'Do NOT allow patient to walk. Log roll with minimum 3 persons to move. Improvised cervical collar from rolled sleeping pad or clothing.',
      treatment_no_supplies: 'Immobilize completely. Transport flat in log-roll position. Improvised backboard from sleeping pad or boards.',
      treatment_with_supplies: 'Commercial cervical collar. Backboard. IV fluids for spinal shock.',
      when_to_evac: 'All suspected spinal injuries. Urgent.',
      source: 'FM 21-76 Ch.7. SF Medical Handbook Spinal Trauma section.',
    },
    {
      name: 'Wound Infection',
      category: 'Trauma',
      symptoms: 'Increasing redness, warmth, and swelling around wound 24-72 hours after injury. Pus or purulent discharge. Red streaking extending FROM wound (serious sign). Fever. Wound odor.',
      severity: 'moderate',
      immediate_action: 'Irrigate wound aggressively with clean water under pressure (improvised syringe or squeeze bottle). Open wound if closed — allow drainage.',
      treatment_no_supplies: 'Hot water soaks 3-4 times daily to promote drainage. Keep wound open. Yarrow poultice as antiseptic field measure.',
      treatment_with_supplies: 'Amoxicillin 500mg 3x daily for 7 days OR Ciprofloxacin 500mg 2x daily for 7 days. Continue pressure irrigation daily.',
      when_to_evac: 'Red streaking from wound (lymphangitis — blood poisoning) = urgent evacuation. Fever >38.5C + wound = urgent.',
      source: 'Werner Where There Is No Doctor Ch.15 Infections. SF Medical Handbook Ch.6 Wound Care.',
    },
    // ENVIRONMENTAL
    {
      name: 'Hypothermia — Mild (32-35°C core)',
      category: 'Environmental',
      symptoms: 'Shivering (body still trying to rewarm — good sign). Confusion, impaired judgment. Clumsiness, stumbling. Slurred speech. Pale cold skin.',
      severity: 'moderate',
      immediate_action: 'Remove wet clothing immediately. Insulate from ground. Add external heat sources to axilla (armpits) and groin — NOT extremities.',
      treatment_no_supplies: 'Body-to-body warming: rescuer in sleeping bag with patient sharing body heat. Hot (not boiling) drinks if fully conscious and able to swallow.',
      treatment_with_supplies: 'Chemical heat packs to axilla and groin (NOT hands or feet — peripheral rewarming can cause afterdrop). Warm IV fluids if available.',
      when_to_evac: 'If not improving within 1 hour of active rewarming measures.',
      source: 'FM 21-76 Ch.20 Cold Weather Injuries. SF Medical Handbook hypothermia section.',
    },
    {
      name: 'Hypothermia — Severe (below 28°C core)',
      category: 'Environmental',
      symptoms: 'No shivering (thermoregulation has failed — grave sign). Rigid muscles. Dilated pupils. Slow or absent pulse. Semi-conscious or unconscious. May appear dead.',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'Handle EXTREMELY GENTLY — cardiac arrhythmia risk from movement. Keep horizontal. Rewarm SLOWLY with external heat only. "Not dead until warm and dead" — continue CPR until rewarmed if needed.',
      treatment_no_supplies: 'Passive rewarming in shelter. Insulate completely. Horizontal position. Body-to-body heat.',
      treatment_with_supplies: 'Warm IV fluids 40-42°C. Warm humidified oxygen if available. Monitor cardiac rhythm. Warm water gastric lavage if available.',
      when_to_evac: 'All severe hypothermia requires hospital core rewarming. Do not assume dead.',
      source: 'SF Medical Handbook Ch.20. Rule: "Not dead until warm and dead" — rescue breathing/CPR until rewarmed.',
    },
    {
      name: 'Frostbite',
      category: 'Environmental',
      symptoms: 'Numbness and loss of sensation. White, grayish-yellow, or waxy skin appearance. Skin firm or hard to touch. Blisters appear after rewarming.',
      severity: 'moderate',
      immediate_action: 'CRITICAL RULE: Do NOT rewarm if refreezing is possible — refreezing causes far greater tissue damage than staying frozen. Insulate and keep dry. Do NOT rub affected area. Remove jewelry.',
      treatment_no_supplies: 'Insulate from further cold. Protect from trauma. Do not walk on frostbitten feet unless necessary for evacuation (walking on frozen feet causes less damage than on thawed feet).',
      treatment_with_supplies: 'Rewarm in 40-42°C (104-108°F) water ONLY when evacuation to warm shelter is assured and refreezing is impossible. Ibuprofen to reduce tissue damage. Aloe vera on blisters after rewarming.',
      when_to_evac: 'All significant frostbite beyond superficial. Hospital care required for proper rewarming.',
      source: 'FM 21-76 Cold Weather Injuries. SF Medical Handbook. The refreezing rule is critical and counterintuitive.',
    },
    {
      name: 'Heat Exhaustion',
      category: 'Environmental',
      symptoms: 'Heavy sweating (skin still moist). Weakness, fatigue. Cold, pale, clammy skin. Weak rapid pulse. Nausea. Headache. Possible fainting. Core temperature normal or mildly elevated (<40°C).',
      severity: 'moderate',
      immediate_action: 'Move to cool shade immediately. Lay flat with feet elevated. Oral fluids with salt if conscious. Loosen or remove excess clothing.',
      treatment_no_supplies: 'Wet cloth on skin, fan to increase evaporation. Rest. Cool water to drink.',
      treatment_with_supplies: 'Oral rehydration solution. IV normal saline if available for severe cases.',
      when_to_evac: 'If confusion develops, if not improving with cooling, or if becoming heat stroke.',
      source: 'FM 21-76 Ch.19 Heat Injuries. SF Medical Handbook.',
    },
    {
      name: 'Heat Stroke',
      category: 'Environmental',
      symptoms: 'High body temperature ABOVE 40°C (104°F). HOT DRY SKIN (sweating has STOPPED — this distinguishes from heat exhaustion). Confusion, disorientation. Possible seizures. Rapid strong pulse. Medical emergency.',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'AGGRESSIVE COOLING IMMEDIATELY — every minute matters. Ice water immersion if possible. Wet entire body and fan aggressively. Ice packs to neck, armpits, groin. Remove to shade.',
      treatment_no_supplies: 'Wet patient completely. Fan. Move to coolest available location. Cool any available water on skin.',
      treatment_with_supplies: 'IV cold saline. Ice packs to neck/axilla/groin. Cooling blankets.',
      when_to_evac: 'Immediately. Can cause permanent brain damage and death. Cool aggressively during transport.',
      source: 'FM 21-76 Ch.19. SF Medical Handbook. CRITICAL: Hot DRY skin + confusion = heat stroke = emergency.',
    },
    {
      name: 'Dehydration',
      category: 'Environmental',
      symptoms: 'Thirst, dark concentrated urine, decreased urine output, dry mouth and lips, skin turgor test: skin tent stays up when pinched. Fatigue, headache. Severe: rapid heartbeat, confusion.',
      severity: 'moderate',
      immediate_action: 'Oral rehydration. ORS formula (verbatim): 1 liter clean water + 6 teaspoons sugar + 0.5 teaspoon salt. Mix and drink slowly.',
      treatment_no_supplies: 'Clean water in small frequent amounts. ORS formula if any salt and sugar available.',
      treatment_with_supplies: 'Oral rehydration salts (ORS packets). IV normal saline for severe cases with vomiting.',
      when_to_evac: 'If unable to keep fluids down due to vomiting, or severe confusion, or no urine output for 8+ hours.',
      source: 'Werner Where There Is No Doctor Ch.9 Diarrhea and Dehydration. ORS Formula: 1L water + 6tsp sugar + 0.5tsp salt.',
    },
    {
      name: 'Anaphylaxis',
      category: 'Environmental',
      symptoms: 'Hives, skin flushing, swelling of throat/tongue/face, difficulty breathing or stridor, drop in blood pressure, rapid weak pulse, within minutes of allergen exposure. Can be fatal in minutes.',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'Epinephrine auto-injector (EpiPen) into outer thigh immediately — through clothing is acceptable. Lay flat with legs elevated (shock position). Second EpiPen after 5-15 minutes if no improvement.',
      treatment_no_supplies: 'Position flat, legs elevated. Support airway. Diphenhydramine (Benadryl) 50mg is INSUFFICIENT alone without epinephrine but give if no epi available.',
      treatment_with_supplies: 'Epinephrine 0.3mg IM (EpiPen). Diphenhydramine 50mg IV/IM. Corticosteroids (dexamethasone). IV fluids.',
      when_to_evac: 'All anaphylaxis after epinephrine — biphasic reaction possible 4-8 hours later. Must monitor.',
      source: 'SF Medical Handbook anaphylaxis section. Werner Where There Is No Doctor Ch.14.',
    },
    {
      name: 'Snakebite (Venomous)',
      category: 'Environmental',
      symptoms: 'Two fang puncture marks. Immediate burning pain and swelling. Discoloration and bruising spreading from bite. Nausea. Weakness. Bleeding from bite site.',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'CRITICAL: Do NOT cut, suck, apply tourniquet, apply ice, or use electric shock. These cause additional damage and do not help. Immobilize limb below heart level. Remove jewelry and tight clothing from affected limb.',
      treatment_no_supplies: 'Keep calm — reduces venom spread. Immobilize limb. Walk out slowly if possible (running spreads venom faster).',
      treatment_with_supplies: 'Antivenom at hospital only. Mark swelling edge with pen and note time to track progression. IV fluids.',
      when_to_evac: 'All suspected venomous snakebite. Most bites are dry (no venom) but cannot be determined in field. Evacuate all bites.',
      source: 'FM 21-76 Ch.22. Werner Where There Is No Doctor. The no-cut-no-suck rule replaces outdated advice.',
    },
    {
      name: 'Altitude Sickness (AMS)',
      category: 'Environmental',
      symptoms: 'Headache at altitude (primary symptom). Nausea, poor appetite. Fatigue disproportionate to exertion. Poor sleep, Cheyne-Stokes breathing at night. Usually begins 6-12 hours after rapid ascent.',
      severity: 'moderate',
      immediate_action: 'Do not ascend further. Rest at current altitude. Descend 300-500m if not improving in 24 hours or if worsening.',
      treatment_no_supplies: 'Rest. Hydration. Descend if worsening. Light activity better than complete rest.',
      treatment_with_supplies: 'Acetazolamide (Diamox) 125-250mg twice daily both preventively and for treatment. Ibuprofen for headache.',
      when_to_evac: 'High Altitude Cerebral Edema (HACE): ataxia, altered consciousness = descend immediately. HAPE: fluid in lungs = descend immediately.',
      source: 'SF Medical Handbook altitude illness section. Wilderness Medical Society guidelines.',
    },
    // INFECTIONS
    {
      name: 'Sepsis',
      category: 'Infection',
      symptoms: 'SIRS criteria (any 2+): temperature >38°C OR <36°C, heart rate >90, respiratory rate >20, known or suspected infection. Confusion. Mottled skin. Very low blood pressure.',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'Identify and control source of infection. IV antibiotics as soon as possible — broad spectrum. Aggressive IV fluid resuscitation (30mL/kg in first 3 hours if available).',
      treatment_no_supplies: 'Oral antibiotics if available (ciprofloxacin + metronidazole). Oral fluids. Treat fever with acetaminophen.',
      treatment_with_supplies: 'IV antibiotics (piperacillin-tazobactam or ceftriaxone + metronidazole). IV crystalloid fluid bolus. Monitor urine output.',
      when_to_evac: 'All suspected sepsis. Life-threatening within hours to days without hospital care.',
      source: 'SF Medical Handbook. Surviving Sepsis Campaign International Guidelines 2021.',
    },
    {
      name: 'Diarrheal Disease',
      category: 'Infection',
      symptoms: 'Loose or watery stools. Cramping. Dehydration signs. If bloody: dysentery (more serious — bacterial or parasitic cause).',
      severity: 'moderate',
      immediate_action: 'Oral rehydration therapy (ORT) immediately. ORS formula: 1 liter clean water + 6 teaspoons sugar + 0.5 teaspoon salt.',
      treatment_no_supplies: 'ORS formula. Avoid dairy. BRAT diet if available (Bananas, Rice, Applesauce, Toast). Rest.',
      treatment_with_supplies: 'Loperamide (Imodium) for non-bloody diarrhea only. Metronidazole 500mg 3x daily for 7 days for amoebic dysentery (bloody diarrhea).',
      when_to_evac: 'Blood in stool, inability to maintain hydration (vomiting all fluids), high fever >39°C, symptoms >7 days.',
      source: 'Werner Where There Is No Doctor Ch.13 Diarrhea and Dysentery.',
    },
    {
      name: 'Appendicitis',
      category: 'Infection',
      symptoms: 'Pain usually starting around navel then migrating to right lower quadrant. Fever. Nausea and vomiting. Loss of appetite. Rebound tenderness at McBurney\'s point.',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'McBurney\'s point test: press right lower quadrant firmly, then release suddenly — pain worse on release (rebound tenderness) = strongly suggests appendicitis. No food or water by mouth.',
      treatment_no_supplies: 'Nothing by mouth. Position of comfort. Urgent evacuation.',
      treatment_with_supplies: 'Antibiotics (metronidazole + ciprofloxacin) may delay surgery temporarily. Pain management.',
      when_to_evac: 'Urgent. Perforation risk within 24-72 hours leads to peritonitis which is fatal without surgery.',
      source: 'Werner Where There Is No Doctor. SF Medical Handbook. McBurney\'s point test description.',
    },
    {
      name: 'Stroke',
      category: 'Neurological',
      symptoms: 'FAST test: Face drooping (one side). Arm weakness (one arm drifts down). Speech difficulty (slurred or confused). Time to act. Also: sudden severe headache, vision loss, sudden unsteadiness.',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'Lay patient flat if no breathing difficulty. Protect airway — recovery position if unconscious. NO aspirin (cannot distinguish hemorrhagic from ischemic stroke in field). Every minute without treatment = 2 million neurons lost.',
      treatment_no_supplies: 'Airway management. Positioning. Rapid evacuation.',
      treatment_with_supplies: 'Supplemental oxygen. IV access. Rapid evacuation.',
      when_to_evac: 'Immediately. "Time is brain." Thrombolytics must be given within 4.5 hours of ischemic stroke.',
      source: 'SF Medical Handbook. FAST mnemonic from American Stroke Association.',
    },
    {
      name: 'Heart Attack (AMI)',
      category: 'Cardiac',
      symptoms: 'Chest pressure, tightness, or pain (may radiate to left arm, jaw, neck, or back). Sweating. Nausea. Shortness of breath. Sense of impending doom. Women may have atypical symptoms (fatigue, jaw pain, nausea).',
      severity: 'life_threatening',
      immediate_action: EVAC_PREFIX + 'Aspirin 325mg chewed immediately (not swallowed whole) if not contraindicated and not known to be allergic. Complete rest — no exertion. Loosen tight clothing. Position of comfort (sitting up often helps breathing).',
      treatment_no_supplies: 'Rest. Reduce exertion to zero.',
      treatment_with_supplies: 'Aspirin 325mg chewed. Nitroglycerin if patient has prescription. Oxygen. Rapid evacuation.',
      when_to_evac: 'Immediately. Each minute of delay increases permanent heart muscle damage.',
      source: 'SF Medical Handbook cardiac section. American Heart Association guidelines.',
    },
    {
      name: 'Seizure',
      category: 'Neurological',
      symptoms: 'Convulsions (rhythmic jerking). Loss of consciousness. Possible loss of bladder/bowel control. Postictal confusion after convulsion stops. Aura before in some patients.',
      severity: 'moderate',
      immediate_action: 'Protect head with cushion or clothing. Remove sharp hazards from area. Do NOT restrain the person. Do NOT put anything in mouth (old advice — causes injury). Time the seizure.',
      treatment_no_supplies: 'Clear space. Protect head. Place in recovery position after convulsion stops. Time the event.',
      treatment_with_supplies: 'Diazepam rectal gel or intranasal midazolam if available for prolonged seizure.',
      when_to_evac: 'First-ever seizure, seizure >5 minutes, repeated seizures without recovery between (status epilepticus), seizure in known epileptic with no medications.',
      source: 'Werner Where There Is No Doctor. SF Medical Handbook neurology section.',
    },
    {
      name: 'Emergency Childbirth',
      category: 'Obstetric',
      symptoms: 'Regular contractions less than 5 minutes apart. Strong urge to push. Visible crowning (baby\'s head visible). Rupture of membranes (water breaking).',
      severity: 'severe',
      immediate_action: EVAC_PREFIX + 'Prepare clean delivery area. Do not pull on baby — support and guide. Apply gentle counter-pressure to prevent explosive delivery. Suction mouth then nose after head delivers.',
      treatment_no_supplies: 'Clean area. Clean hands. Towel or clothing to catch baby. Tie cord with clean string at 2 locations and cut between. Deliver placenta with gentle pushing.',
      treatment_with_supplies: 'Sterile gloves. Cord clamps. Oxytocin for postpartum hemorrhage if available.',
      when_to_evac: 'All deliveries if possible. Urgent if: placenta not delivered within 30 minutes, heavy bleeding, baby not breathing, umbilical cord presenting before baby.',
      source: 'Werner Where There Is No Doctor Ch.19 Childbirth and Related Problems (definitive reference for this procedure).',
    },
  ];

  for (const c of conditions) {
    await db.runAsync(
      `INSERT INTO medical_conditions (name, category, symptoms, severity, immediate_action, treatment_no_supplies, treatment_with_supplies, when_to_evac, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.name, c.category, c.symptoms, c.severity, c.immediate_action, c.treatment_no_supplies || '', c.treatment_with_supplies || '', c.when_to_evac || '', c.source]
    );
  }

  // Seed medications
  const medications = [
    { name: 'Amoxicillin', generic_name: 'Amoxicillin', category: 'Antibiotic', uses: 'Bacterial infections: wound infections, dental abscess, respiratory infections, ear infections', dosage_adult: '500mg every 8 hours (3x daily) for 7-10 days', dosage_child: '25-50mg/kg/day in 3 divided doses', contraindications: 'Penicillin allergy. Check carefully — cross-reactivity with cephalosporins possible.', side_effects: 'Diarrhea, nausea, rash. Severe: anaphylaxis (rare).', alternatives: 'Azithromycin if penicillin allergic. Honey as wound antiseptic.', storage: 'Cool dry place. Tablets stable for years beyond expiry if kept dry.', source: 'SF Medical Handbook ST 31-91B Formulary. Werner Where There Is No Doctor.' },
    { name: 'Ciprofloxacin', generic_name: 'Ciprofloxacin HCl', category: 'Antibiotic', uses: 'Gram-negative infections, urinary tract infections, wound infections, anthrax, traveler\'s diarrhea', dosage_adult: '500mg every 12 hours (2x daily) for 7-14 days', dosage_child: 'Not recommended for children — joint toxicity risk', contraindications: 'Pregnancy. Children. Tendon rupture risk especially with steroids or in elderly.', side_effects: 'GI upset, tendon rupture risk, photosensitivity, CNS effects.', alternatives: 'Amoxicillin for gram-positive infections.', storage: 'Room temperature, away from light.', source: 'SF Medical Handbook Formulary. CDC guidelines.' },
    { name: 'Metronidazole', generic_name: 'Metronidazole', category: 'Antibiotic/Antiparasitic', uses: 'Anaerobic infections, amoebic dysentery, giardia, wound infections, dental abscess', dosage_adult: '500mg every 8 hours (3x daily) for 7-10 days', dosage_child: '15mg/kg/day in 3 divided doses', contraindications: 'Avoid alcohol during treatment and 48 hours after (severe vomiting reaction). First trimester pregnancy.', side_effects: 'Metallic taste, nausea, headache. DO NOT drink alcohol.', alternatives: 'Tinidazole for giardia/amoeba.', storage: 'Room temperature, away from moisture.', source: 'SF Medical Handbook Formulary. Werner Where There Is No Doctor Ch.13.' },
    { name: 'Ibuprofen', generic_name: 'Ibuprofen', category: 'NSAID Analgesic/Anti-inflammatory', uses: 'Pain, fever, inflammation. Also reduces frostbite tissue damage.', dosage_adult: '400-800mg every 6-8 hours with food. Maximum 3200mg/day', dosage_child: '10mg/kg every 6-8 hours. Maximum 40mg/kg/day', contraindications: 'Active peptic ulcer, kidney disease, aspirin allergy, third trimester pregnancy. Caution in elderly.', side_effects: 'GI irritation, ulcer risk with prolonged use. Take with food.', alternatives: 'Acetaminophen (no GI effects, no anti-inflammatory effect). Willow bark tea (contains salicin, similar to aspirin).', storage: 'Room temperature.', source: 'SF Medical Handbook Formulary. Standard pharmacology.' },
    { name: 'Diphenhydramine (Benadryl)', generic_name: 'Diphenhydramine HCl', category: 'Antihistamine', uses: 'Allergic reactions, anaphylaxis adjunct (NOT substitute for epinephrine), sleep aid, motion sickness, local anesthetic', dosage_adult: '25-50mg every 4-6 hours. Maximum 300mg/day', dosage_child: '1.25mg/kg every 6 hours. Avoid under 2 years.', contraindications: 'Glaucoma, enlarged prostate, severe asthma. Do not use as sole treatment for anaphylaxis.', side_effects: 'Drowsiness (significant), dry mouth, urinary retention.', alternatives: 'Loratadine (non-drowsy) for mild allergic reactions.', storage: 'Room temperature.', source: 'SF Medical Handbook. Werner Where There Is No Doctor Ch.14.' },
    { name: 'Loperamide (Imodium)', generic_name: 'Loperamide HCl', category: 'Antidiarrheal', uses: 'Non-bloody diarrhea only. NOT for use with bloody diarrhea (dysentery) or high fever.', dosage_adult: '4mg initially then 2mg after each loose stool. Maximum 16mg/day', dosage_child: 'Weight-based dosing. Avoid under 2 years.', contraindications: 'NEVER use with bloody diarrhea, high fever, or suspected Clostridium difficile. Can worsen bacterial dysentery.', side_effects: 'Constipation, abdominal cramping.', alternatives: 'ORS for hydration (addresses cause). Bismuth subsalicylate.', storage: 'Room temperature.', source: 'Werner Where There Is No Doctor Ch.13. SF Medical Handbook.' },
  ];

  for (const m of medications) {
    await db.runAsync(
      `INSERT INTO medications (name, generic_name, category, uses, dosage_adult, dosage_child, contraindications, side_effects, alternatives, storage, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.name, m.generic_name, m.category, m.uses, m.dosage_adult, m.dosage_child, m.contraindications, m.side_effects, m.alternatives, m.storage, m.source]
    );
  }

  // Seed procedures
  const procedures = [
    {
      name: 'Tourniquet Application',
      category: 'Hemorrhage Control',
      difficulty: 'basic',
      steps_json: JSON.stringify([
        { step: 1, text: 'Identify arterial bleeding — bright red, spurting with heartbeat.' },
        { step: 2, text: 'If on limb, apply commercial tourniquet (CAT or SOFTT-W) 2-3 inches ABOVE the wound, not over joint.' },
        { step: 3, text: 'Pull strap tight and wind rod (windlass) until bleeding stops completely. Do not under-tighten.' },
        { step: 4, text: 'Lock windlass in place. Write time of application on patient\'s skin with marker — exact time is critical.', warning: 'Note time immediately. Do not remove tourniquet in field. Tourniquet can be left safely for 2 hours without permanent damage.' },
        { step: 5, text: 'Improvised tourniquet if no commercial: 3-4 inch wide cloth folded to strip, wrapped twice above wound, tied with overhand knot. Place stick over knot, tie stick with second knot. Twist stick until bleeding stops. Secure stick.' },
        { step: 6, text: 'Monitor patient. Check bleeding has stopped at wound site.' },
      ]),
      required_tools: 'Commercial tourniquet (CAT or SOFTT-W preferred). Marker for time notation.',
      improvised_tools: 'Strip of cloth 3-4 inches wide, minimum 24 inches long. Stick 6-8 inches for windlass. Additional strip to secure windlass.',
      warnings: 'Never apply over joint. Never remove in field. Note time applied. Pain from tourniquet is expected and acceptable — it means it is tight enough.',
      source: 'SF Medical Handbook ST 31-91B Ch.4. Tactical Combat Casualty Care (TCCC) guidelines.',
    },
    {
      name: 'Wound Irrigation',
      category: 'Wound Care',
      difficulty: 'basic',
      steps_json: JSON.stringify([
        { step: 1, text: 'Prepare clean water — boiled and cooled is ideal. Volume: at least 500mL for significant wound.' },
        { step: 2, text: 'Create pressure irrigation: fill zip-lock bag or improvised syringe (syringe with 18-gauge needle removed). Squeeze forcefully.' },
        { step: 3, text: 'Irrigate copiously directly into wound — the goal is high-pressure mechanical removal of bacteria and debris.', warning: 'Adequate irrigation is THE most important single factor in preventing wound infection. More is better — use at least 500mL.' },
        { step: 4, text: 'After irrigation, debride (remove) visible debris with clean tweezers if available.' },
        { step: 5, text: 'For clean wounds: close with wound closure strips. For contaminated wounds: leave open and irrigate daily.' },
        { step: 6, text: 'Cover loosely with clean dressing. Change daily with re-irrigation.' },
      ]),
      required_tools: 'Clean water minimum 500mL. Improvised syringe (plastic bag, water bottle with small hole, or actual syringe).',
      improvised_tools: 'Any clean bag with small hole creates pressure stream. Water bottle with nail hole in cap.',
      warnings: 'Do not close contaminated wounds — they must heal from inside out. Animal bites and puncture wounds especially should not be closed.',
      source: 'SF Medical Handbook ST 31-91B Ch.6 Wound Management. Werner Where There Is No Doctor.',
    },
    {
      name: 'CPR — Adult (30:2)',
      category: 'Cardiac Arrest',
      difficulty: 'basic',
      steps_json: JSON.stringify([
        { step: 1, text: 'Check scene safety. Check responsiveness: tap shoulders, shout. Call for help.' },
        { step: 2, text: 'Check for breathing — look, listen, feel for no more than 10 seconds. Gasping is not breathing.' },
        { step: 3, text: 'Begin compressions: heel of hand on center of chest (lower half of sternum). Arm straight, compress 2-2.4 inches deep at 100-120 compressions per minute.', warning: 'Press HARD and FAST. Inadequate depth is the most common error. It is acceptable to crack ribs — death is worse.' },
        { step: 4, text: 'After 30 compressions: open airway with head-tilt chin-lift. Give 2 rescue breaths, each 1 second, watching chest rise.' },
        { step: 5, text: 'Continue 30:2 ratio. Do not stop for more than 10 seconds.' },
        { step: 6, text: 'Switch compressors every 2 minutes to maintain quality. CPR is exhausting.' },
        { step: 7, text: 'Continue until: AED/defibrillator available, patient shows signs of life, you are physically unable to continue, or physician declares death.' },
      ]),
      required_tools: 'None. CPR mask or face shield reduces infection risk but compression-only CPR is acceptable.',
      improvised_tools: 'None required.',
      warnings: 'Compression-only CPR (no rescue breaths) is acceptable for untrained or unwilling rescuers. Still significantly effective for first 4-6 minutes.',
      source: 'American Heart Association 2020 Guidelines for CPR. Current 30:2 protocol.',
    },
    {
      name: 'ORS Preparation (Oral Rehydration Solution)',
      category: 'Fluid Management',
      difficulty: 'basic',
      steps_json: JSON.stringify([
        { step: 1, text: 'Gather: 1 liter clean (boiled and cooled) water, 6 level teaspoons of sugar, 0.5 level teaspoon of salt.' },
        { step: 2, text: 'Mix ingredients thoroughly until dissolved.' },
        { step: 3, text: 'Taste test: should taste no saltier than tears. If too salty: add more water.', warning: 'Too much salt can worsen dehydration. When in doubt, use less salt rather than more.' },
        { step: 4, text: 'Give in small frequent amounts: 1-2 tablespoons every 1-2 minutes for adults. For children: 1 teaspoon every minute.' },
        { step: 5, text: 'If vomiting occurs: wait 10 minutes then try again in even smaller amounts.' },
        { step: 6, text: 'Continue until patient urinates normal-colored urine.' },
      ]),
      required_tools: 'Clean water, measuring spoons, container.',
      improvised_tools: 'Clean water, salt, sugar. A pinch of salt and two sugar packets per bottle of water approximates.',
      warnings: 'ORS formula verbatim: 1 liter water + 6 teaspoons sugar + 0.5 teaspoon salt. This formula is based on WHO/UNICEF research and saves millions of lives annually.',
      source: 'WHO Oral Rehydration Salts formula. Werner Where There Is No Doctor Ch.9.',
    },
    {
      name: 'Improvised Splint',
      category: 'Fracture Management',
      difficulty: 'basic',
      steps_json: JSON.stringify([
        { step: 1, text: 'Check circulation, motor function, and sensation BELOW fracture site before splinting: Can they feel you touch? Can they move fingers/toes? Is there a pulse below?' },
        { step: 2, text: 'Gather rigid materials: straight sticks, boards, trekking poles, rolled sleeping pad.' },
        { step: 3, text: 'Pad the splint material with clothing, especially over bony prominences.', warning: 'Inadequate padding causes pressure sores and can compromise circulation. Pad well.' },
        { step: 4, text: 'Immobilize the joint ABOVE and BELOW the fracture site.' },
        { step: 5, text: 'Apply splint materials on both sides of limb (or all around for forearm/lower leg).' },
        { step: 6, text: 'Secure with strips of cloth tied above and below fracture but NOT over it. Tie firmly but not tightly enough to cut circulation.' },
        { step: 7, text: 'Check CMS again after splinting. If pulse or sensation has worsened: loosen immediately.' },
      ]),
      required_tools: 'Rigid material (sticks, SAM splint). Padding (clothing). Binding material (strips of cloth, bandages).',
      improvised_tools: 'Straight sticks padded with torn clothing. Folded sleeping pad. Cardboard padded.',
      warnings: 'Splint in position found — do not attempt to straighten deformity except to restore circulation if it has been cut off. Finger test under ties: should fit one finger comfortably.',
      source: 'FM 21-76 Ch.7. SF Medical Handbook Ch.11.',
    },
  ];

  for (const p of procedures) {
    await db.runAsync(
      `INSERT INTO procedures (name, category, difficulty, steps_json, required_tools, improvised_tools, warnings, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.category, p.difficulty, p.steps_json, p.required_tools, p.improvised_tools, p.warnings, p.source]
    );
  }

  // Seed fungi after medical since they are separate
  await seedFungi();
}

// ── Query functions ──────────────────────────────────────────────────────────

export async function searchPlants(
  query: string,
  edibility?: string,
  season?: string
): Promise<Plant[]> {
  let sql = 'SELECT * FROM plants WHERE 1=1';
  const params: string[] = [];

  if (query) {
    sql += ' AND (common_name LIKE ? OR latin_name LIKE ? OR description LIKE ?)';
    const q = `%${query}%`;
    params.push(q, q, q);
  }
  if (edibility && edibility !== 'all') {
    if (edibility === 'fungi') {
      return searchFungi(query);
    }
    sql += ' AND edibility = ?';
    params.push(edibility);
  }
  if (season && season !== 'all') {
    sql += ' AND season LIKE ?';
    params.push(`%${season}%`);
  }
  sql += ' ORDER BY common_name';

  return await db.getAllAsync<Plant>(sql, params);
}

export async function getPlant(id: number): Promise<Plant | null> {
  return await db.getFirstAsync<Plant>('SELECT * FROM plants WHERE id = ?', [id]);
}

export async function searchFungi(query: string): Promise<Fungi[]> {
  const q = `%${query}%`;
  return await db.getAllAsync<Fungi>(
    'SELECT * FROM fungi WHERE common_name LIKE ? OR latin_name LIKE ? OR description LIKE ? ORDER BY common_name',
    [q, q, q]
  );
}

export async function getFungi(id: number): Promise<Fungi | null> {
  return await db.getFirstAsync<Fungi>('SELECT * FROM fungi WHERE id = ?', [id]);
}

export async function searchConditions(query: string): Promise<Condition[]> {
  const q = `%${query}%`;
  return await db.getAllAsync<Condition>(
    'SELECT * FROM medical_conditions WHERE name LIKE ? OR symptoms LIKE ? ORDER BY name',
    [q, q]
  );
}

export async function getCondition(id: number): Promise<Condition | null> {
  return await db.getFirstAsync<Condition>('SELECT * FROM medical_conditions WHERE id = ?', [id]);
}

export async function getProcedures(category?: string): Promise<Procedure[]> {
  if (category) {
    return await db.getAllAsync<Procedure>(
      'SELECT * FROM procedures WHERE category LIKE ? ORDER BY name',
      [`%${category}%`]
    );
  }
  return await db.getAllAsync<Procedure>('SELECT * FROM procedures ORDER BY name');
}

export async function getMedications(query: string): Promise<Medication[]> {
  const q = `%${query}%`;
  return await db.getAllAsync<Medication>(
    'SELECT * FROM medications WHERE name LIKE ? OR generic_name LIKE ? ORDER BY name',
    [q, q]
  );
}

export async function toggleFavorite(table: string, id: number): Promise<void> {
  const allowedTables = ['plants', 'fungi', 'medical_conditions', 'procedures'];
  if (!allowedTables.includes(table)) return;
  await db.runAsync(
    `UPDATE ${table} SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?`,
    [id]
  );
}

export async function addRecentlyViewed(
  type: string,
  id: string,
  name: string
): Promise<void> {
  await db.runAsync(
    'DELETE FROM recently_viewed WHERE item_type = ? AND item_id = ?',
    [type, id]
  );
  await db.runAsync(
    'INSERT INTO recently_viewed (item_type, item_id, item_name, viewed_at) VALUES (?, ?, ?, ?)',
    [type, id, name, Date.now()]
  );
  // Keep only last 20
  await db.runAsync(
    'DELETE FROM recently_viewed WHERE id NOT IN (SELECT id FROM recently_viewed ORDER BY viewed_at DESC LIMIT 20)'
  );
}

export async function getRecentlyViewed(limit = 6): Promise<RecentItem[]> {
  return await db.getAllAsync<RecentItem>(
    'SELECT * FROM recently_viewed ORDER BY viewed_at DESC LIMIT ?',
    [limit]
  );
}

export async function saveWaypoint(
  name: string,
  lat: number,
  lng: number,
  notes: string
): Promise<void> {
  await db.runAsync(
    'INSERT INTO user_waypoints (name, lat, lng, notes, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, lat, lng, notes, Date.now()]
  );
}

export async function getWaypoints(): Promise<Waypoint[]> {
  return await db.getAllAsync<Waypoint>('SELECT * FROM user_waypoints ORDER BY created_at DESC');
}

export async function searchAll(query: string): Promise<{
  plants: Plant[];
  fungi: Fungi[];
  conditions: Condition[];
  procedures: Procedure[];
  medications: Medication[];
}> {
  const q = `%${query}%`;
  const [plants, fungi, conditions, procedures, medications] = await Promise.all([
    db.getAllAsync<Plant>('SELECT * FROM plants WHERE common_name LIKE ? OR latin_name LIKE ? OR description LIKE ? LIMIT 10', [q, q, q]),
    db.getAllAsync<Fungi>('SELECT * FROM fungi WHERE common_name LIKE ? OR description LIKE ? LIMIT 10', [q, q]),
    db.getAllAsync<Condition>('SELECT * FROM medical_conditions WHERE name LIKE ? OR symptoms LIKE ? LIMIT 10', [q, q]),
    db.getAllAsync<Procedure>('SELECT * FROM procedures WHERE name LIKE ? LIMIT 10', [q]),
    db.getAllAsync<Medication>('SELECT * FROM medications WHERE name LIKE ? OR generic_name LIKE ? LIMIT 10', [q, q]),
  ]);
  return { plants, fungi, conditions, procedures, medications };
}

export async function saveSearchHistory(query: string, module: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO search_history (query, module, created_at) VALUES (?, ?, ?)',
    [query, module, Date.now()]
  );
}

export async function getSearchHistory(): Promise<{ query: string; module: string }[]> {
  return await db.getAllAsync<{ query: string; module: string }>(
    'SELECT DISTINCT query, module FROM search_history ORDER BY created_at DESC LIMIT 10'
  );
}

export async function clearSearchHistory(): Promise<void> {
  await db.runAsync('DELETE FROM search_history');
}

export async function getFavorites(): Promise<{ plants: Plant[]; fungi: Fungi[]; conditions: Condition[]; procedures: Procedure[] }> {
  const [plants, fungi, conditions, procedures] = await Promise.all([
    db.getAllAsync<Plant>('SELECT * FROM plants WHERE is_favorite = 1 LIMIT 20'),
    db.getAllAsync<Fungi>('SELECT * FROM fungi WHERE is_favorite = 1 LIMIT 20'),
    db.getAllAsync<Condition>('SELECT * FROM medical_conditions WHERE is_favorite = 1 LIMIT 20'),
    db.getAllAsync<Procedure>('SELECT * FROM procedures WHERE is_favorite = 1 LIMIT 20'),
  ]);
  return { plants, fungi, conditions, procedures };
}

export async function clearAllFavorites(): Promise<void> {
  await db.execAsync(`
    UPDATE plants SET is_favorite = 0;
    UPDATE fungi SET is_favorite = 0;
    UPDATE medical_conditions SET is_favorite = 0;
    UPDATE procedures SET is_favorite = 0;
  `);
}

export async function exportWaypoints(): Promise<string> {
  const waypoints = await getWaypoints();
  return JSON.stringify(waypoints, null, 2);
}
