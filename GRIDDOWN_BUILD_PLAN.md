# GridDown — Offline Apocalypse Survival App
## Complete Claude Code Build Plan

> **Mandate**: 100% offline. Zero HTTP calls at runtime. All data is either bundled, sourced from public-domain survival literature, or downloaded once to device storage. Assume no network connectivity during use.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React Native + Expo SDK 51 | Cross-platform, file system access, sensors |
| Language | TypeScript strict mode | Correctness matters when lives depend on it |
| Navigation | React Navigation 6 (bottom tabs + stack) | Standard, offline |
| Local DB | expo-sqlite (SQLite) | Structured plant/medical/tools data |
| Offline Wiki | kiwix-js + WebView | Proven ZIM reader, works offline |
| Maps | react-native-maps + MBTiles | Offline tile rendering |
| Sensors | expo-sensors, expo-location | GPS, compass, barometer |
| State | Zustand | Lightweight, no server sync needed |
| Storage | expo-file-system + AsyncStorage | Assets + preferences |
| UI Fonts | Load via expo-font: UnifrakturMaguntia (display) + Spectral (body) | Field-manual military aesthetic |
| Animations | React Native Reanimated 3 | Smooth, runs on UI thread |

---

## Design Direction (Frontend Skill Applied)

**Aesthetic**: Military field manual meets brutalist utility. Imagine a laminated survival handbook scanned and digitized. Every screen should feel like it was designed to be read by flashlight in a forest.

**Color Palette (StyleSheet constants)**:
```ts
export const Colors = {
  bg:         '#0D0F0A', // near-black, olive-tinted
  surface:    '#161A10', // card background
  surfaceAlt: '#1E2418', // elevated card
  border:     '#2E3526', // subtle grid lines
  accent:     '#7AB648', // military green — primary CTA
  accentDim:  '#4A6E28', // muted accent
  danger:     '#C0392B', // toxic / danger
  warn:       '#D4881E', // caution
  text:       '#C8D4B8', // off-white, slightly green
  textMuted:  '#6B7A5C', // secondary text
  textDim:    '#3D4A30', // hint text
  gold:       '#B8962E', // headings, section markers
}
```

**Typography**:
- Display: `UnifrakturMaguntia` — used ONLY for app name and major section headers. Evokes old field manuals.
- Body: `Spectral` — a serif designed for small screens and long reading. Readable at 14px.
- Mono: `SourceCodePro` — coordinates, codes, quantities.

**Layout Rules**:
- All cards have a 2px left border in the accent color, like a tabbed field guide
- Section headers have a thin horizontal rule below them in gold
- Danger items get a red left border + skull icon
- Every plant/food shows an edibility badge (SAFE / CAUTION / TOXIC) as a colored pill
- Use hairlineWidth() borders throughout — this is a utilitarian tool, not a consumer app

**Signature UX detail**: A persistent bottom status bar on every screen showing GPS coordinates, battery %, and a blinking [OFFLINE] badge in green. This is the one thing users will always remember.

---

## Phase 0 — Project Scaffold

```bash
claude "Create an Expo React Native app called GridDown with TypeScript.

Run:
  npx create-expo-app GridDown --template expo-template-blank-typescript
  cd GridDown

Install dependencies:
  npx expo install expo-sqlite expo-file-system expo-asset expo-location expo-sensors
  npx expo install expo-font expo-status-bar expo-sharing expo-battery expo-haptics
  npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
  npm install react-native-screens react-native-safe-area-context
  npm install react-native-maps
  npm install zustand
  npm install react-native-reanimated
  npx expo install react-native-webview

Create this exact folder structure:
  src/
    assets/
      fonts/          <- UnifrakturMaguntia.ttf, Spectral-Regular.ttf, Spectral-Bold.ttf, SourceCodePro-Regular.ttf
      images/         <- placeholder 200x200 green placeholder.png
      data/
        plants.sql
        medical.sql
        tools.json
        declination.json
    components/
      OfflineStatusBar.tsx
      EdibilityBadge.tsx
      SearchBar.tsx
      SectionHeader.tsx
      Card.tsx
      DangerBanner.tsx
      SkeletonLoader.tsx
    modules/
      home/
      foraging/
      medical/
      wikipedia/
      navigation/
      tools/
    navigation/
      RootNavigator.tsx
      TabNavigator.tsx
    store/
      useAppStore.ts
    db/
      database.ts
    theme/
      colors.ts
      typography.ts
      spacing.ts
    utils/
      coordinates.ts
      sensors.ts

In src/theme/colors.ts export the Colors object:
  bg: '#0D0F0A', surface: '#161A10', surfaceAlt: '#1E2418', border: '#2E3526',
  accent: '#7AB648', accentDim: '#4A6E28', danger: '#C0392B', warn: '#D4881E',
  text: '#C8D4B8', textMuted: '#6B7A5C', textDim: '#3D4A30', gold: '#B8962E'

Set up bottom tab navigator with 5 tabs:
  Forage (leaf icon), Medical (cross icon), Wiki (book icon), Navigate (compass icon), Tools (wrench icon)
Tab bar background: '#0D0F0A'. Active tint: '#7AB648'. Inactive: '#3D4A30'.

On boot: initialize SQLite, load fonts, show splash:
  Full screen '#0D0F0A'. Center: 'GridDown' in UnifrakturMaguntia 48px gold.
  Below: 'Offline Survival Reference' Spectral italic 16px textMuted.
  Bottom: blinking 'All systems offline. Ready.' in accent green."
```

---

## Phase 1 — Persistent Offline Status Bar

```bash
claude "Build src/components/OfflineStatusBar.tsx

This is a 28px tall bar rendered at the BOTTOM of every screen, above the tab bar.
Background: '#0D0F0A'. Border top: StyleSheet.hairlineWidth() in '#2E3526'.

Three sections in a horizontal row with flex:

  LEFT (flex 1): GPS coordinates in SourceCodePro 11px textMuted '#6B7A5C'
    Format: '23.7104°N  90.4074°E'
    If GPS not acquired: '-- acquiring GPS --' in textDim.

  CENTER (flex 0): Blinking badge '[OFFLINE]'
    Style: border 1px '#7AB648', paddingHorizontal 6, borderRadius 2
    Text: '#7AB648' 10px SourceCodePro
    Blink every 3 seconds using Animated.loop (opacity 1 -> 0.4 -> 1, 1500ms each way)

  RIGHT (flex 1, alignItems flex-end): Battery icon + percentage
    Use expo-battery getBatteryLevelAsync()
    Format: 'BATT 74%' in SourceCodePro 11px
    If battery < 0.20: color '#C0392B' red
    If battery >= 0.20: color textMuted

Use expo-location with accuracy: Location.Accuracy.Balanced.
Poll GPS every 30 seconds. Store coords in useAppStore Zustand state.
Export this component. It must be rendered inside every tab screen's root View."
```

---

## Phase 2 — Database Schema and Initialization

```bash
claude "Build src/db/database.ts

On first app launch, create SQLite database 'griddown.db'.
Run all CREATE TABLE IF NOT EXISTS statements:

plants table:
  id INTEGER PRIMARY KEY,
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

fungi table:
  id INTEGER PRIMARY KEY,
  common_name TEXT NOT NULL,
  latin_name TEXT,
  edibility TEXT CHECK(edibility IN ('safe','caution','toxic','deadly')) NOT NULL,
  habitat TEXT, season TEXT, description TEXT, identification TEXT,
  look_alikes TEXT, deadly_look_alikes TEXT, preparation TEXT,
  source TEXT NOT NULL, image_filename TEXT, is_favorite INTEGER DEFAULT 0

medical_conditions table:
  id INTEGER PRIMARY KEY,
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

medications table:
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL, generic_name TEXT, category TEXT,
  uses TEXT, dosage_adult TEXT, dosage_child TEXT,
  contraindications TEXT, side_effects TEXT, alternatives TEXT,
  storage TEXT, source TEXT NOT NULL

procedures table:
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL, category TEXT,
  difficulty TEXT CHECK(difficulty IN ('basic','intermediate','advanced')),
  steps_json TEXT,
  required_tools TEXT, improvised_tools TEXT, warnings TEXT,
  source TEXT NOT NULL, is_favorite INTEGER DEFAULT 0

user_waypoints:
  id INTEGER PRIMARY KEY, name TEXT, lat REAL, lng REAL,
  notes TEXT, created_at INTEGER

recently_viewed:
  id INTEGER PRIMARY KEY, item_type TEXT, item_id TEXT,
  item_name TEXT, viewed_at INTEGER

search_history:
  id INTEGER PRIMARY KEY, query TEXT, module TEXT, created_at INTEGER

After creating tables, if plants table is empty: run src/assets/data/plants.sql
If medical_conditions is empty: run src/assets/data/medical.sql

Export these functions:
  initDatabase()
  searchPlants(query: string, edibility?: string, season?: string): Promise<Plant[]>
  getPlant(id: number): Promise<Plant>
  searchFungi(query: string): Promise<Fungi[]>
  searchConditions(query: string): Promise<Condition[]>
  getCondition(id: number): Promise<Condition>
  getProcedures(category?: string): Promise<Procedure[]>
  getMedications(query: string): Promise<Medication[]>
  toggleFavorite(table: string, id: number): Promise<void>
  addRecentlyViewed(type: string, id: string, name: string): Promise<void>
  getRecentlyViewed(limit?: number): Promise<RecentItem[]>
  saveWaypoint(name: string, lat: number, lng: number, notes: string): Promise<void>
  getWaypoints(): Promise<Waypoint[]>"
```

---

## Phase 3 — Wild Food Database (Source-Accurate, No Hallucination)

```bash
claude "Create src/assets/data/plants.sql

CRITICAL INSTRUCTION: Every single INSERT must have the source field populated with the exact book
title, author, and chapter/page number. This data will be used for survival decisions.
If you are uncertain about any plant's edibility, set edibility='caution' and explain in look_alikes.
NEVER mark a plant safe if there is any doubt. This is a life-safety application.

Source all data from these public-domain and open-license references:
  - U.S. Army Survival Manual FM 21-76 (public domain U.S. government document)
  - Bradford Angier 'Field Guide to Edible Wild Plants' 1974
  - Euell Gibbons 'Stalking the Wild Asparagus' 1962 (public domain)
  - USDA PLANTS Database profiles (public domain)
  - Samuel Thayer 'Forager's Harvest' and 'Nature's Garden'
  - Tom Brown Jr. 'Field Guide to Wild Edible and Medicinal Plants' 1985
  - Roger Phillips 'Mushrooms' (for fungi section)
  - Missouri Botanical Garden species profiles (CC-licensed)

INSERT at minimum these 80 entries across all categories:

GREENS AND LEAFY PLANTS (mark source for each):
  Dandelion (Taraxacum officinale) safe — entire plant edible year-round, roots roasted as coffee substitute.
    Identification: toothed leaves in basal rosette, hollow stem, yellow composite flower.
    Preparation: young leaves raw in salad, older leaves boiled to reduce bitterness, roots roasted.
    Source: 'Stalking the Wild Asparagus' Euell Gibbons Ch.3, p.28. Also FM 21-76 Appendix B.

  Stinging Nettle (Urtica dioica) safe — cook to neutralize sting, extremely nutritious, high protein.
    Identification: opposite serrated leaves, hollow stinging hairs on stems and leaves.
    Look-alikes: Dead Nettle (Lamium) has no sting — still edible.
    Preparation: boil or steam young tops 3-5 minutes, use gloves to harvest.
    Source: Thayer 'Nature's Garden' p.112. Season: spring (young tops only).

  Lamb's Quarters (Chenopodium album) safe — superior nutritional profile to spinach.
    Identification: white mealy coating on underside of leaves, diamond-shaped leaves.
    Source: Gibbons Ch.7 'Stalking the Wild Asparagus'. Summer. Worldwide disturbed ground.

  Purslane (Portulaca oleracea) safe — highest omega-3 of any leafy plant, succulent stems.
    Identification: fleshy red-tinged stems, paddle-shaped thick leaves, grows flat on ground.
    Preparation: raw in salads, cooked as potherb, or pickled.
    Source: Angier 'Field Guide to Edible Wild Plants' p.178. FM 21-76 Appendix B.

  Wood Sorrel (Oxalis) caution — edible, lemony flavor, high vitamin C.
    CAUTION: contains oxalic acid. Eat in moderation. Do not eat large amounts.
    Identification: clover-like trefoil leaves, yellow or white five-petal flowers.
    Source: FM 21-76 Appendix B. Worldwide.

  Chickweed (Stellaria media) safe — mild flavor, raw or cooked.
    Identification: single line of hairs along one side of stem, tiny star-shaped white flowers.
    Source: Angier p.56. Spring. Worldwide.

  Plantain (Plantago major and lanceolata) safe — seeds and young leaves edible, medicinal.
    Identification: parallel veins in leaves, flower spike rising from basal rosette.
    Medicinal: crushed leaves applied to insect stings and wounds.
    Source: FM 21-76 + Brown 'Field Guide to Wild Edible and Medicinal Plants' p.89.

  Watercress (Nasturtium officinale) caution — edible near clean running water only.
    CAUTION: Only harvest from unpolluted streams. Can carry liver fluke in stagnant water.
    Identification: round pinnate leaves, white cross-shaped flowers, grows in water.
    Source: Gibbons 'Stalking the Wild Asparagus' Ch.12. Spring-Fall.

  Wintercress (Barbarea vulgaris) safe — bitter raw, much better cooked. Early spring green.
    Identification: glossy dark green leaves, bright yellow four-petal flowers.
    Source: Angier p.230. Spring. North America, Europe.

  Cleavers (Galium aparine) safe — young shoots cooked. Seeds roasted as coffee substitute.
    Identification: whorls of 6-8 narrow leaves, sticky clinging stems and seeds.
    Source: Thayer 'Nature's Garden'. Spring. North America, Europe.

ROOTS AND TUBERS:
  Cattail (Typha latifolia) safe — complete survival food. Multiple edible parts all seasons.
    Identification: distinctive brown sausage-shaped flower head, flat strap leaves near water.
    Preparation: spring shoots eaten raw or boiled, summer pollen collected as flour supplement,
    fall and winter rhizomes dried and pounded into starch flour.
    NOTE: Gibbons devotes the entire first chapter of 'Stalking the Wild Asparagus' to cattail.
    Source: Gibbons Ch.1 p.1-18. Brown p.24. FM 21-76 Appendix B. All seasons. Worldwide near water.

  Burdock (Arctium lappa) safe — first-year rosette roots. Roasted or boiled.
    Identification: very large heart-shaped leaves (up to 18 inches), hooked burrs in second year.
    Preparation: peel root, boil or roast. Tastes like mild artichoke.
    Source: Thayer 'Forager's Harvest' p.201. Fall-Spring (first year root). North America, Europe.

  Wild Carrot / Queen Anne's Lace (Daucus carota) caution — first year taproot edible.
    DEADLY LOOK-ALIKE: Poison Hemlock (Conium maculatum) — smooth purple-blotched stem, no hair, musty smell NOT carrot.
    DEADLY LOOK-ALIKE: Water Hemlock (Cicuta) — near water, chambered root.
    IDENTIFICATION RULE: Wild carrot has hairy stem, smells like carrot when crushed, single purple flower in center of white cluster.
    Source: FM 21-76 + Angier p.244. Summer-Fall.

  Chicory (Cichorium intybus) safe — roots roasted as coffee. Young greens edible raw or cooked.
    Identification: blue flowers (rarely white), deeply toothed leaves, milky sap.
    Preparation: roots roasted at 300F until dark brown, ground.
    Source: Gibbons 'Stalking the Wild Asparagus' Ch.9. All seasons. North America, Europe.

  Jerusalem Artichoke (Helianthus tuberosus) safe — tubers raw or cooked, nutty flavor.
    Identification: tall sunflower-like plant, knobby tubers below.
    Source: Thayer 'Forager's Harvest' p.86. Fall-Winter. North America.

  Arrowhead (Sagittaria) safe — aquatic, corms boiled or roasted. Native American staple.
    Identification: arrow-shaped leaves above water, white three-petal flowers.
    Source: Brown p.67. Fall. North America, Asia.

  Wild Leek / Ramps (Allium tricoccum) safe — entire plant edible, strong garlic-onion.
    Identification: broad lance-shaped leaves emerging in spring before trees leaf out, garlic-onion smell.
    Source: Thayer 'Nature's Garden' p.312. Spring. Eastern North America.

  Wild Onion (Allium canadense) safe — CRITICAL IDENTIFICATION RULE: MUST smell like onion.
    LOOK-ALIKE WARNING: Death Camas (Zigadenus) is deadly and looks similar BUT has NO onion smell.
    Rule: No onion smell = do not eat. This is absolute.
    Source: FM 21-76 Appendix B. Spring. North America.

  Groundnut / Hopniss (Apios americana) safe — protein-rich tubers, nitrogen-fixer.
    Identification: vine with compound leaves, maroon-pink pea-like flowers, tubers in chain underground.
    Source: Thayer 'Forager's Harvest' p.120. Fall. Eastern North America.

BERRIES AND FRUITS:
  Blackberry and Raspberry (Rubus species) safe — all Rubus species are edible worldwide.
    Identification: thorny canes, white five-petal flowers, compound leaves.
    Source: Angier p.40. Summer. Worldwide. 

  Elderberry (Sambucus nigra) caution — berries must be cooked. Raw causes nausea and vomiting.
    Flowers are safe raw. All other parts (leaves, bark, unripe berries) toxic.
    LOOK-ALIKE: Pokeweed berries — grow in elongated cluster, not umbrella cluster.
    Preparation: cook berries thoroughly before eating. Do not eat raw.
    Source: Brown p.156. Late summer. North America, Europe.

  Hawthorn (Crataegus species) safe — berries (haws) edible, high pectin, good for jelly.
    Identification: thorny shrub or small tree, lobed leaves, white flowers, red or black berries.
    Source: Angier p.110. Fall. North America, Europe.

  Rose Hips (Rosa species) safe — extremely high in vitamin C (20x more than oranges).
    CAUTION: Seeds and hairs inside irritate digestive tract. Strain pulp if eating in quantity.
    Identification: all wild rose species. Fleshy red-orange fruits after flowers drop.
    Source: FM 21-76 + Gibbons. Fall-Winter. North America, Europe.

  Wild Strawberry (Fragaria virginiana) safe — smaller than commercial, intensely sweet.
    Source: Angier p.208. Summer. North America, Europe.

  Blueberry and Huckleberry (Vaccinium species) safe — all Vaccinium species edible.
    Source: Brown p.142. Summer. North America, Europe.

  Serviceberry / Saskatoon (Amelanchier species) safe — sweet apple-like, high calorie.
    Identification: white flowers very early spring, blue-black berries in summer.
    Source: Thayer 'Forager's Harvest' p.60. Early summer. North America.

  Pawpaw (Asimina triloba) safe — largest native North American fruit. Custard-like texture.
    Identification: large drooping leaves, dark purple flowers, tropical-looking fruit.
    Source: Thayer 'Forager's Harvest' p.38. Late summer. Eastern North America.

  Mulberry (Morus rubra and alba) safe — prolific, high calorie. Red and white both edible.
    Source: Angier p.148. Summer. North America, Europe.

  Persimmon (Diospyros virginiana) caution — ONLY eat after frost or fully ripe. Before ripe: extremely astringent.
    Identification: small orange fruit, distinctive black-checkered bark.
    Source: Gibbons Ch.6 'Stalking the Wild Asparagus'. Late fall. Eastern North America.

NUTS AND HIGH-CALORIE SEEDS:
  Acorns (Quercus species) safe — ALL acorn species edible after leaching tannins. Critical survival food.
    ALL species require tannin leaching: cold water leaching (change water daily, 1-3 days) or
    hot water leaching (boil, change water repeatedly until not bitter).
    High calorie, high fat. Can be dried and ground into flour.
    NOTE: Tom Brown Jr. devotes Chapter 4 entirely to acorn processing in his field guide.
    Source: Brown 'Field Guide to Wild Edible and Medicinal Plants' Ch.4.
    Thayer 'Forager's Harvest' p.166. Fall. North America, Europe, Asia.

  Hickory Nuts (Carya species) safe — very high calorie and fat. Crack with rock if no tools.
    Special technique: boil in water to render hickory milk (fat-rich cooking oil).
    Source: Thayer 'Forager's Harvest'. Fall. Eastern North America.

  Hazelnuts (Corylus species) safe — harvest when husk turns brown and nut loose.
    Source: Angier p.116. Fall. North America, Europe.

  Black Walnut (Juglans nigra) safe — tannins in green husk stain skin dark. Leach or dry.
    Source: Gibbons 'Stalking the Wild Asparagus' Ch.11. Fall. North America.

  Pine Nuts (Pinus species) safe — seeds inside pine cones. Most Pinus edible.
    Best species: pinyon pine (Pinus edulis) in Southwest North America.
    Preparation: harvest closed cones, heat near fire to open, shake out seeds.
    Source: FM 21-76 Appendix B. Fall. North America, Europe, Asia.

  Beechnuts (Fagus species) safe — small but high fat content. Roasted or raw.
    Source: Angier p.36. Fall. North America, Europe.

  Amaranth (Amaranthus species) safe — seeds and greens. One of most nutritious wild plants.
    Identification: coarse weed with red-green stem, long spike of tiny flowers and seeds.
    Source: Angier p.24. Summer-Fall. Worldwide.

TEAS AND MEDICINAL:
  Yarrow (Achillea millefolium) safe — fever reduction, wound poultice, tea.
    Identification: feathery fern-like leaves, flat-topped white flower clusters.
    Medicinal: fever reduction tea, chewed leaves applied to wounds for antiseptic effect.
    Source: Brown 'Field Guide to Wild Edible and Medicinal Plants' p.213. All seasons.

  Spearmint and Peppermint (Mentha species) safe — all Mentha species safe.
    Uses: digestive aid tea, insect repellent (rub on skin), flavor food.
    Identification: square stem, opposite toothed leaves, strong mint smell.
    Source: Gibbons Ch.14. Summer. North America, Europe.

  Chamomile (Matricaria chamomilla) safe — calming tea, digestive.
    Identification: small white daisy-like flowers with yellow center, apple scent when crushed.
    Source: Angier p.52. Summer. North America, Europe.

  Pine Needle Tea (Pinus species) safe — extremely high vitamin C.
    Preparation: steep fresh green needles in hot (not boiling) water 10 minutes.
    DEADLY LOOK-ALIKE: Yew (Taxus) — flat needles in two rows, red berries, DEADLY.
    NEVER use yew. Confirm: Pinus has needles in clusters of 2-5. Yew has single flat needles.
    Source: FM 21-76. All seasons. North America, Europe, Asia.

  Spruce Tips (Picea species) safe — spring growth only. Raw or tea. High vitamin C.
    Identification: bright lime-green new growth at branch tips in spring only.
    Source: Thayer 'Forager's Harvest'. Spring only. North America.

CAUTION AND RESTRICTED PLANTS:
  Wild Ginger (Asarum canadense) caution — use root as flavoring only in small amounts.
    Contains aristolochic acid — do not eat in large quantities.
    Source: Brown p.178. Spring-Fall. Eastern North America.

  Mayapple (Podophyllum peltatum) caution — ONLY the ripe yellow fruit is edible.
    All other parts — leaves, roots, green fruit — are TOXIC.
    Source: Angier p.136. Late summer. Eastern North America.

  Bracken Fern (Pteridium aquilinum) caution — young fiddleheads only, must be well cooked.
    Raw bracken contains thiaminase and carcinogens. Cook thoroughly.
    Thayer explicitly warns about this in 'Forager's Harvest' and recommends caution.
    Source: Thayer 'Forager's Harvest' with explicit cautionary note. Spring. Worldwide.

  Pokeweed (Phytolacca americana) toxic — mark as toxic.
    Most references including FM 21-76 recommend avoiding entirely.
    Only young shoots triple-boiled historically eaten but risk is not worth it.
    All other parts including roots, mature leaves, and berries are TOXIC.
    Source: FM 21-76 (listed as hazardous). Eastern North America.

TOXIC PLANTS (for identification and avoidance only — mark edibility='toxic'):
  Water Hemlock (Cicuta maculata) toxic — MOST VIOLENTLY TOXIC plant in North America.
    Resembles wild carrot and wild parsnip. One bite of root can kill.
    Identification: chambered hollow root (cut to check), musty smell (not carrot smell), grows near water.
    Source: FM 21-76 hazardous plants. Brown p.47 (identification for avoidance only). Worldwide near water.

  Poison Hemlock (Conium maculatum) toxic — killed Socrates. All parts deadly.
    Identification: smooth hollow purple-blotched stem, musty unpleasant smell, white flowers.
    Resembles wild carrot — wild carrot has hairy stem and smells like carrot.
    Source: FM 21-76. Worldwide disturbed ground and roadsides.

  Jimsonweed / Thornapple (Datura stramonium) toxic — all parts toxic, hallucinogenic and deadly.
    Identification: large toothed leaves, white trumpet flowers, spiny seed pod.
    Source: FM 21-76 hazardous plants list. Worldwide, especially disturbed ground.

  Death Camas (Anticlea elegans / Zigadenus) toxic — DEADLY. Resembles wild onion.
    CRITICAL: Has NO onion smell. This is the only way to distinguish from wild onion.
    All parts deadly. Do not eat any allium-looking plant that does not smell like onion.
    Source: FM 21-76. Western North America.

  Monkshood / Wolfsbane (Aconitum species) toxic — extreme contact and ingestion toxicity.
    Identification: distinctive purple helmet-shaped flowers.
    Source: Angier (hazardous plants list). North America, Europe.

  White Snakeroot (Ageratina altissima) toxic — caused historical milk sickness.
    Nancy Hanks Lincoln (Abraham Lincoln's mother) died from milk sickness caused by cows eating this.
    Identification: opposite toothed leaves, flat-topped white flower clusters.
    Source: USDA PLANTS Database historical records. Eastern North America.

  Yew (Taxus species) toxic — all parts except the red aril flesh are DEADLY.
    Seeds inside aril are toxic. Do not confuse with pine or spruce.
    Source: FM 21-76. North America, Europe, Asia.

FUNGI (20 species):
  Chicken of the Woods (Laetiporus sulphureus) safe — bright orange-yellow shelf fungus on trees.
    No dangerous look-alikes. Unmistakable when fresh.
    Preparation: cook thoroughly. Some people have reactions when growing on locust or eucalyptus.
    Source: Phillips 'Mushrooms' p.186. Summer-Fall. North America, Europe.

  Giant Puffball (Calvatia gigantea) safe — cut in half to confirm pure white interior before eating.
    If any sign of gills or outline of amanita inside = juvenile deadly amanita. Discard.
    Source: Phillips 'Mushrooms' p.272. Summer-Fall. North America, Europe.

  Hen of the Woods / Maitake (Grifola frondosa) safe — overlapping gray-brown fronds at tree base.
    Grows at base of oaks primarily. No dangerous look-alikes.
    Source: Phillips p.188. Fall. North America, Europe, Asia.

  Chanterelle (Cantharellus cibarius) safe — golden yellow, forking ridges (not true gills).
    LOOK-ALIKE: Jack O'Lantern (Omphalotus) toxic — true gills, grows in clusters, glows faintly at night.
    Rule: chanterelle has forking ridges that run down stem. Jack O'Lantern has sharp true gills.
    Source: Phillips p.14. Summer-Fall. North America, Europe.

  Morel (Morchella esculenta) safe — hollow when cut lengthwise. Honeycomb pitted cap.
    LOOK-ALIKE: False Morel (Gyromitra esculenta) caution/toxic — brain-like wrinkled cap, NOT hollow.
    RULE: cut in half — true morel is completely hollow cap and stem.
    Source: Phillips p.326. Spring. North America, Europe.

  Oyster Mushroom (Pleurotus ostreatus) safe — white to gray, grows on dead hardwood logs.
    No dangerous look-alikes in North America. Slight anise smell.
    Source: Phillips p.15. Fall-Spring. North America, Europe.

  Lion's Mane (Hericium erinaceus) safe — white, shaggy, looks like a cascading waterfall. Unmistakable.
    Source: Phillips p.207. Fall. North America, Europe, Asia.

  Turkey Tail (Trametes versicolor) safe — use as tea only. Tough, not eaten directly.
    Preparation: simmer strips in water 20 minutes for medicinal tea.
    Source: Missouri Botanical Garden profile. Year-round on dead wood. Worldwide.

  Death Cap (Amanita phalloides) deadly — pale greenish-white, white gills, ring on stem, volva at base.
    Responsible for 90% of fatal mushroom poisonings worldwide. No antidote.
    Source: Phillips 'Mushrooms' p.246 (DANGER section). Worldwide.

  Destroying Angel (Amanita bisporigera) deadly — pure white throughout. No antidote. 
    Liver failure 6-24 hours after onset of symptoms. Initial symptoms mimic food poisoning then pass.
    Source: Phillips p.248 (DANGER). North America.

  Fly Agaric (Amanita muscaria) toxic — red cap with white spots. Hallucinogenic toxins.
    Source: Phillips p.242. North America, Europe, Asia.

  Inky Caps (Coprinoid species) caution — edible alone but TOXIC when combined with alcohol.
    Do not eat any Coprinoid mushrooms and drink alcohol within 48 hours.
    Source: Phillips p.100. North America, Europe.

  King Bolete / Porcini (Boletus edulis) safe — brown cap, thick white stem with network pattern.
    CAUTION: Some red-pored boletes toxic. Rule: if pores or flesh turn blue when cut, avoid.
    Source: Phillips p.220. Summer-Fall. North America, Europe, Asia.

  Shaggy Mane (Coprinus comatus) safe — must be eaten before it auto-digests (within hours of picking).
    Identification: tall white shaggy cylindrical cap that turns black and dissolves.
    Source: Phillips p.98. Fall. North America, Europe.

  Blewit (Lepista nuda) safe — purple-blue coloring throughout. Mild pleasant smell.
    Cook thoroughly. Some people react to raw blewits.
    Source: Phillips p.123. Fall. North America, Europe.

  Sulfur Shelf (see Chicken of the Woods above — same species)

  Velvet Shank (Flammulina velutipes) safe — winter mushroom, grows on dead elms.
    Identification: small orange-brown cap, velvety dark stem, grows in winter.
    Domesticated version is enoki from stores.
    Source: Phillips p.58. Winter. North America, Europe.

  Horn of Plenty / Black Trumpet (Craterellus cornucopioides) safe — dark funnel, no gills.
    Difficult to spot due to dark color on forest floor. Excellent flavor.
    Source: Phillips p.20. Fall. North America, Europe.

  Wood Ear / Jelly Ear (Auricularia auricula-judae) safe — ear-shaped, gelatinous, grows on elder.
    Source: Phillips p.280. Year-round. North America, Europe, Asia.

  Earthball (Scleroderma species) toxic — looks like small puffball but has black interior.
    RULE: Always cut puffballs in half — earthball has dark interior, edible puffball is pure white.
    Source: Phillips p.278 (warning). North America, Europe."
```

---

## Phase 4 — Foraging Module UI

```bash
claude "Build src/modules/foraging/ with these files:
  ForagingNavigator.tsx
  ForagingScreen.tsx
  PlantDetailScreen.tsx
  FungiScreen.tsx

ForagingScreen layout using the dark military aesthetic from theme/colors.ts:

Header: 'Field Guide' in UnifrakturMaguntia 28px gold '#B8962E'
SearchBar: dark '#161A10' background, '#2E3526' border, placeholder 'Search plants, berries, roots...' in textDim
Filter pills row (horizontal ScrollView, no scroll indicator):
  [All] [Safe] [Caution] [Toxic] [Fungi] [Spring] [Summer] [Fall] [Winter]
  Active pill: border '#7AB648' text '#7AB648' bg '#1A3A1A'
  Inactive: border '#2E3526' text '#3D4A30' bg transparent

FlatList of PlantCard:
  Card: bg '#161A10', border-left 2px '#7AB648', marginVertical 4, padding 12
  Row layout:
    Left: 60x60 image, borderRadius 4, bg '#0D0F0A' (placeholder if no image)
    Right: 
      Top row: common_name Spectral Bold 16px '#C8D4B8' + latin_name italic Spectral 12px '#6B7A5C'
      Bottom row: EdibilityBadge + habitat snippet Spectral 12px textMuted
    Far right: chevron '›' 20px '#4A6E28'
  
  On toxic: card border-left changes to '#C0392B' red

EdibilityBadge (src/components/EdibilityBadge.tsx):
  safe    -> bg '#1A3A1A' text '#7AB648' border '#2E5A20' label 'SAFE'
  caution -> bg '#3A2A0A' text '#D4881E' border '#5A4010' label 'CAUTION'
  toxic   -> bg '#3A0A0A' text '#C0392B' border '#5A1010' label 'TOXIC'
  deadly  -> bg '#3A0A0A' text '#C0392B' border '#5A1010' label '☠ DEADLY'
  Font: SourceCodePro 10px, paddingHorizontal 6, paddingVertical 2, borderRadius 2

PlantDetailScreen:
  Header image (width 100%, height 200, borderRadius 0)
    Overlaid gradient from transparent to '#0D0F0A' at bottom
    Plant name in UnifrakturMaguntia 32px gold overlaid at bottom-left

  Scrollable body below:
  
  SectionHeader 'IDENTIFICATION'
    latin_name italic Spectral 14px textMuted
    habitat: Spectral 14px text
    season: Spectral 14px text
    regions: Spectral 12px textMuted

  SectionHeader 'HOW TO EAT'
    preparation field, Spectral 15px text, lineHeight 24

  SectionHeader 'IDENTIFICATION NOTES'
    description + identification fields

  Conditional: if look_alikes is not null:
    SectionHeader '⚠ LOOK-ALIKES'
    DangerBanner component (bg '#1E0A0A', left border 3px '#C0392B', icon '⚠', text '#C8D4B8')
    look_alikes text

  Conditional: if medicinal is not null:
    SectionHeader 'MEDICINAL USES'
    medicinal text

  SectionHeader 'DATA SOURCE'
    source field, Spectral italic 12px textMuted — this is the citation

  Bottom sticky button: [★ Favorite] accent green background if not favorited, dimmed if favorited

SectionHeader component (src/components/SectionHeader.tsx):
  title text: SourceCodePro 11px '#B8962E' gold, letterSpacing 2
  Below: hairlineWidth() horizontal rule in '#2E3526'
  marginTop 20, marginBottom 8

Call addRecentlyViewed('plant', id.toString(), common_name) on PlantDetailScreen mount."
```

---

## Phase 5 — Medical Seed Data

```bash
claude "Create src/assets/data/medical.sql

Source all data from:
  - U.S. Army Special Forces Medical Handbook ST 31-91B (public domain)
  - U.S. Army Survival Manual FM 21-76 (public domain)
  - Where There Is No Doctor, David Werner, Hesperian Foundation (free for non-commercial use)

CRITICAL: Populate source field for every record. This is reference material for emergencies.
Add disclaimer text to the immediate_action field for every life_threatening condition:
  Prefix with: 'SEEK EVACUATION AND PROFESSIONAL CARE. This is emergency reference only. | '

Insert minimum 40 conditions across categories:

TRAUMA CONDITIONS:
  Arterial bleeding — life_threatening
    symptoms: bright red blood spurting in pulses, rapid blood loss, victim becoming pale/confused
    immediate_action: TOURNIQUET APPLICATION 2-3 inches above wound. Note time applied. Direct pressure if tourniquet not possible.
    treatment_no_supplies: Direct pressure with hands. Elevate limb. Pack wound tightly.
    treatment_with_supplies: Commercial tourniquet (CAT or SOFTT-W). Hemostatic gauze (QuikClot). Pressure bandage.
    when_to_evac: Immediately. Arterial bleeding is life-threatening within minutes.
    source: SF Medical Handbook ST 31-91B Ch.4 Hemorrhage Control. FM 21-76 Ch.7.

  Venous bleeding — moderate
    symptoms: dark red blood flowing steadily
    immediate_action: Direct pressure with clean cloth. Do not remove once applied.
    treatment_no_supplies: Sustained direct pressure 10-15 minutes minimum without releasing.
    treatment_with_supplies: Pressure bandage, wound closure strips.
    source: SF Medical Handbook ST 31-91B Ch.4.

  Closed fracture — moderate
    symptoms: pain at site, swelling, deformity, inability to bear weight or use limb
    immediate_action: Immobilize in position found. Do not attempt to straighten.
    treatment_no_supplies: Improvised splint from straight sticks and cloth strips. Pad bony prominences.
    treatment_with_supplies: SAM splint, triangular bandage sling for arm fractures.
    when_to_evac: All fractures require professional evaluation. Evacuate non-urgently.
    source: FM 21-76 Ch.7 First Aid. SF Medical Handbook Ch.11.

  Open fracture — severe
    symptoms: bone visible through skin wound
    immediate_action: Cover bone with moist clean cloth. Do not push bone back in. Splint. IV fluids if available.
    treatment_no_supplies: Sterile cover for wound. Improvised splint. Elevate if possible.
    when_to_evac: Urgent. Open fractures carry high infection risk.
    source: SF Medical Handbook ST 31-91B Ch.11.

  Shoulder dislocation — moderate
    symptoms: arm held away from body, squared-off shoulder, severe pain, unable to move arm
    immediate_action: Cunningham technique (patient seated, massaging bicep/deltoid) or Stimson technique.
    treatment_no_supplies: Cunningham technique requires no equipment. Takes 10-30 minutes of patient massage.
    treatment_with_supplies: After reduction, sling and swathe for 3-4 weeks.
    source: SF Medical Handbook Ch.12 Orthopedic Procedures.

  Burns first degree — minor
    symptoms: redness, pain, dry, no blisters (sunburn level)
    immediate_action: Cool with clean water 10-20 minutes. Do not use ice.
    treatment_no_supplies: Cool water immersion. Aloe vera gel if available.
    source: SF Medical Handbook Ch.9 Burns.

  Burns second degree — moderate
    symptoms: blisters, intense pain, weeping, red beneath blisters
    immediate_action: Cool with water. Do not pop blisters. Cover loosely with clean cloth.
    treatment_with_supplies: Non-stick dressing, topical silver sulfadiazine if available.
    when_to_evac: Burns >10% body surface area, or involving face/hands/genitals.
    source: SF Medical Handbook Ch.9.

  Burns third degree — severe
    symptoms: white, brown, or black charred skin, no pain (nerve damage), may be dry
    immediate_action: Do not cool extensively (hypothermia risk). Cover with dry clean cloth.
    treatment_no_supplies: Keep dry. Prevent infection. Fluid management critical.
    when_to_evac: All third degree burns require urgent evacuation.
    source: SF Medical Handbook Ch.9.

  Head injury TBI — severity varies
    symptoms: loss of consciousness, confusion, amnesia, unequal pupils, vomiting, headache
    immediate_action: Immobilize cervical spine. Monitor airway. Do not give aspirin or ibuprofen (increases bleeding).
    when_to_evac: Any loss of consciousness, repeat vomiting, worsening headache, unequal pupils = urgent evacuation.
    source: SF Medical Handbook Ch.7 Head Trauma.

  Spinal injury — severe
    symptoms: neck or back pain after trauma, numbness or tingling in extremities, weakness
    immediate_action: Log roll technique to move. Improvised cervical collar (rolled sleeping pad).
    treatment_no_supplies: Immobilize. Do not allow patient to walk. Log roll with minimum 3 persons.
    source: FM 21-76 + SF Medical Handbook spinal injury section.

  Wound infection — moderate to severe
    symptoms: increasing redness, warmth, swelling, pus, red streaking from wound, fever
    immediate_action: Irrigate wound aggressively with clean water (syringe pressure irrigation).
    treatment_no_supplies: Hot water soaks to promote drainage. Keep clean and open.
    treatment_with_supplies: Amoxicillin 500mg 3x daily or Ciprofloxacin 500mg 2x daily for 7 days.
    when_to_evac: Red streaking indicates spreading infection (cellulitis). Fever + wound = urgent evac.
    source: Werner 'Where There Is No Doctor' Ch.15. SF Medical Handbook Ch.6.

ENVIRONMENTAL CONDITIONS:
  Hypothermia mild (32-35C core) — moderate
    symptoms: shivering, confusion, clumsiness, slurred speech, skin pale
    immediate_action: Remove wet clothing. Insulate from ground and wind. Add heat sources to axilla and groin.
    treatment_no_supplies: Body-to-body warming in sleeping bag. Hot drinks if fully conscious.
    treatment_with_supplies: Chemical heat packs to axilla and groin only.
    source: FM 21-76 Ch.20 Cold Weather Injuries. SF Medical Handbook.

  Hypothermia severe (below 28C core) — life_threatening
    symptoms: no shivering, rigid muscles, dilated pupils, slow or absent pulse, may appear dead
    immediate_action: Handle extremely gently (cardiac arrhythmia risk). Horizontal position only. Rewarm slowly.
    when_to_evac: All severe hypothermia requires hospital care. Do not assume dead until warm and dead.
    source: SF Medical Handbook Ch.20. Rule: 'Not dead until warm and dead.'

  Frostbite — moderate to severe
    symptoms: numbness, white or grayish-yellow waxy skin, blisters after rewarming
    immediate_action: CRITICAL RULE: Do NOT rewarm if refreezing is possible. Refreeze causes more damage than staying frozen.
    treatment_no_supplies: Insulate. Keep dry. Do not rub.
    treatment_with_supplies: Rewarm in 40-42C (104-108F) water only when evacuation assured.
    source: FM 21-76. SF Medical Handbook. The refreezing rule is critical and counterintuitive.

  Heat exhaustion — moderate
    symptoms: heavy sweating, weakness, cold/pale/clammy skin, weak pulse, nausea, possible fainting
    immediate_action: Move to cool shade. Lay flat with feet elevated. Oral fluids if conscious.
    treatment_no_supplies: Wet cloth on skin, fan if possible. Rest.
    source: FM 21-76 Ch.19 Heat Injuries.

  Heat stroke — life_threatening
    symptoms: high body temperature (above 40C), hot DRY skin (sweating has stopped), confusion, seizures
    immediate_action: AGGRESSIVE COOLING IMMEDIATELY. Ice water immersion if available. Wet and fan. Evacuation.
    CRITICAL DISTINCTION from heat exhaustion: Heat stroke = hot dry skin + confusion = emergency.
    source: FM 21-76 Ch.19. SF Medical Handbook.

  Dehydration — moderate
    symptoms: thirst, dark urine, dry mouth, decreased urination, skin turgor test positive
    immediate_action: Oral rehydration. ORS formula: 1 liter clean water + 6 teaspoons sugar + 0.5 teaspoon salt.
    when_to_evac: If unable to keep fluids down, or severe confusion.
    source: Werner 'Where There Is No Doctor' Ch.9 Diarrhea and Dehydration.

  Anaphylaxis — life_threatening
    symptoms: hives, swelling throat/tongue, difficulty breathing, drop in blood pressure, within minutes of exposure
    immediate_action: Epinephrine auto-injector (EpiPen) in outer thigh immediately. Lay flat legs elevated. 911/evacuate.
    treatment_no_supplies: Position flat. Airway management. Diphenhydramine (Benadryl) 50mg if no epi available but this is insufficient alone.
    when_to_evac: All anaphylaxis. Second reaction can occur 4-8 hours later (biphasic).
    source: SF Medical Handbook. Werner Ch.14.

  Snakebite — moderate to severe
    symptoms: fang marks, pain, swelling, discoloration at bite site. Systemic: nausea, weakness
    immediate_action: CRITICAL: Do NOT cut, suck, apply tourniquet, or use shock treatment. Immobilize limb below heart. Remove jewelry.
    when_to_evac: All venomous snakebite. Most bites are dry bites but cannot be distinguished in field.
    source: FM 21-76 Ch.22. Werner. The no-cut-no-suck rule is critical and different from old advice.

  Altitude sickness AMS — moderate
    symptoms: headache at altitude, nausea, fatigue, poor sleep
    immediate_action: Do not ascend further. Rest. Descend 300-500m if not improving.
    treatment_with_supplies: Acetazolamide (Diamox) 125-250mg twice daily preventively.
    source: SF Medical Handbook altitude illness section.

  Near drowning — moderate to severe
    symptoms: coughing, difficulty breathing, confusion after water submersion
    immediate_action: CPR if no pulse. All near-drowning patients must be monitored for 24 hours for secondary drowning.
    when_to_evac: All near-drowning regardless of apparent recovery. Secondary drowning risk.
    source: SF Medical Handbook.

INFECTION AND DISEASE:
  Sepsis — life_threatening
    symptoms: fever or hypothermia, rapid heart rate (>90), rapid breathing (>20), confusion, originating infection
    immediate_action: IV antibiotics if available. Aggressive fluid resuscitation.
    when_to_evac: All suspected sepsis is life-threatening emergency.
    source: SF Medical Handbook. The Surviving Sepsis Campaign guidelines.

  Diarrheal disease — moderate
    symptoms: loose/watery stools, cramping. If bloody: dysentery.
    immediate_action: Oral rehydration (ORS formula: 1L water + 6tsp sugar + 0.5tsp salt).
    treatment_with_supplies: Loperamide for non-bloody diarrhea only. Metronidazole for amoebic dysentery.
    when_to_evac: Blood in stool, inability to maintain hydration, high fever.
    source: Werner 'Where There Is No Doctor' Ch.13.

  Appendicitis — severe
    symptoms: pain starting around navel then migrating to right lower quadrant, fever, nausea
    immediate_action: McBurney's point test: press right lower quadrant. Rebound tenderness on release = likely appendicitis.
    when_to_evac: Urgent. Perforation within 24-72 hours leads to peritonitis which is fatal without surgery.
    source: Werner + SF Medical Handbook. McBurney's point test description.

  Diabetic emergency hypoglycemia — moderate
    symptoms: patient knows they are diabetic, shakiness, sweating, confusion, rapid onset
    immediate_action: Give sugar immediately (glucose tablets, juice, candy, sugar water).
    source: Werner Ch.6.

  Seizure — moderate
    symptoms: convulsions, loss of consciousness, possible bladder/bowel incontinence
    immediate_action: Protect head. Remove hazards. Do NOT restrain. Do NOT put anything in mouth.
    treatment_no_supplies: Recovery position after convulsion stops. Time the seizure.
    when_to_evac: First seizure, seizure >5 minutes, or series of seizures without recovery.
    source: Werner + SF Medical Handbook.

  Stroke — life_threatening
    symptoms: FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call for help
    immediate_action: Lay patient flat if no breathing difficulty. Protect airway. Evacuate immediately.
    when_to_evac: Immediately. Every minute counts.
    source: SF Medical Handbook. FAST mnemonic from American Stroke Association.

  Acute myocardial infarction (heart attack) — life_threatening
    symptoms: chest pressure/pain, left arm pain, jaw pain, sweating, nausea, shortness of breath
    immediate_action: Aspirin 325mg chewed immediately if not contraindicated. Rest. No exertion.
    when_to_evac: Immediately.
    source: SF Medical Handbook.

  Emergency childbirth — severe
    symptoms: regular contractions less than 5 minutes apart, urge to push, baby crowning
    immediate_action: Prepare clean delivery area. Do not pull on baby. Support head as crowning.
    NOTE: Werner 'Where There Is No Doctor' Ch.19 is the definitive reference for this procedure.
    Source: Werner Ch.19 'Childbirth and Related Problems' — full chapter.

  Dental abscess — moderate
    symptoms: severe toothache, swollen gum or cheek, fever, pus
    treatment_no_supplies: Rinse with warm salt water. Oil of cloves (eugenol) as temporary analgesic.
    treatment_with_supplies: Amoxicillin 500mg 3x daily. Ibuprofen for pain.
    source: SF Medical Handbook dental section.

Insert also for medications:
  amoxicillin, metronidazole, ciprofloxacin, doxycycline, ibuprofen, acetaminophen, aspirin,
  diphenhydramine, loperamide, epinephrine (EpiPen), activated charcoal, sodium hypochlorite
  (water treatment doses: 2 drops per liter clear water, 4 drops per liter cloudy),
  potassium iodide (radiation), azithromycin, clindamycin.
  For each: source from SF Medical Handbook formulary or Werner treatment chapters.
  Include natural alternatives where they exist.

Insert procedures with full steps_json arrays for:
  tourniquet_application, wound_irrigation, improvised_splint, shoulder_reduction_cunningham,
  CPR_adult (30:2 current protocol), heimlich_maneuver, ORS_preparation,
  improvised_stretcher (two poles + shirts), wound_closure, burn_wound_management,
  hypothermia_rewarm, anaphylaxis_management, childbirth_emergency_delivery."
```

---

## Phase 6 — Medical Module UI

```bash
claude "Build src/modules/medical/ with:
  MedicalNavigator.tsx
  MedicalScreen.tsx (tabbed: Conditions / Medications / Procedures / Symptom Checker)
  ConditionDetailScreen.tsx
  ProcedureDetailScreen.tsx
  MedicationDetailScreen.tsx
  SymptomCheckerScreen.tsx

MedicalScreen header: 'Field Medicine' in UnifrakturMaguntia 28px gold
Top segment: 4 tabs [Conditions] [Medications] [Procedures] [Symptoms]
  Active: bg '#1E2418' text accent. Inactive: transparent text textMuted.

ConditionDetailScreen:
  Severity badge at top (full width colored bar):
    minor: '#1A3A1A' bg green text
    moderate: '#3A2A0A' amber
    severe: '#3A0A0A' red
    life_threatening: '#3A0A0A' bg + Animated.loop blinking border
  
  Sections with SectionHeader:
    SYMPTOMS — symptoms field
    IMMEDIATE ACTION — immediate_action field in BOLD, larger text (this is critical path)
    WITHOUT SUPPLIES — treatment_no_supplies
    WITH SUPPLIES — treatment_with_supplies
    EVACUATION CRITERIA — when_to_evac in DangerBanner component
    DATA SOURCE — source in italic textMuted

ProcedureDetailScreen:
  Difficulty badge (basic/intermediate/advanced)
  REQUIRED EQUIPMENT section
  IMPROVISED ALTERNATIVES section
  STEP-BY-STEP section: parse steps_json array
    Each step is its own card: step number in gold SourceCodePro, step text Spectral
    If step has 'warning' key: show red DangerBanner inline
  WARNINGS section in red
  DATA SOURCE section

SymptomCheckerScreen:
  Title 'Symptom Checker'
  Predefined symptom grid: buttons that toggle on/off (multi-select)
  Symptoms: fever, chills, headache, nausea, vomiting, diarrhea, abdominal pain, chest pain,
  shortness of breath, confusion, bleeding, swelling, rash, muscle weakness, rapid heart rate,
  low blood pressure, unconsciousness, burns, fracture suspected, wound present
  
  [Check Symptoms] button
  
  On check: query conditions table for each selected symptom text. Score by match count.
  Show ranked results list with condition name + severity badge + match score.
  
  PERMANENT DISCLAIMER at very bottom (cannot scroll away, sticky):
    bg '#1E0A0A', border '#C0392B', text '#C8D4B8':
    'FOR REFERENCE ONLY. This tool is designed for situations with no medical access.
    It does not replace professional medical training or care.'
  
  Never hide or dismiss this disclaimer."
```

---

## Phase 7 — Offline Wikipedia (ZIM)

```bash
claude "Build src/modules/wikipedia/

Files:
  WikipediaNavigator.tsx
  WikipediaScreen.tsx
  WikiArticleScreen.tsx
  WikiDownloadManager.ts

WikiDownloadManager.ts:
  Use expo-file-system to track downloaded ZIM files in documentDirectory/zim/
  Available packs with actual Kiwix CDN URLs:
    Medicine: https://download.kiwix.org/zim/wikipedia/wikipedia_en_medicine_maxi_2024-01.zim (~600MB)
    Nature: https://download.kiwix.org/zim/wikipedia/wikipedia_en_ecology_maxi_2024-01.zim (~800MB)
    Wikispecies: https://download.kiwix.org/zim/wikispecies/wikispecies_en_all_maxi_2024-01.zim (~300MB)
    Wikivoyage: https://download.kiwix.org/zim/wikivoyage/wikivoyage_en_all_maxi_2024-01.zim (~600MB)
  
  downloadPack(packId): uses FileSystem.downloadAsync with progress callback
  getDownloadedPacks(): returns list of local ZIM paths
  deletePack(packId): deletes local file
  getStorageUsed(): total bytes used

WikipediaScreen — state machine:
  
  STATE: NO_PACKS_DOWNLOADED
    Full screen centered message (dark, like terminal output):
      'NO OFFLINE ENCYCLOPEDIA LOADED'
      'Download a subject pack while connected to internet.'
      'Once stored on device, it functions indefinitely without connection.'
    Pack cards scrollable below:
      Each: pack name, estimated size, description, [Download] green button
      On download: show progress bar (green fill, percent, bytes)
      Allow pause (save progress) and resume
    Storage bar at bottom showing device free space

  STATE: PACKS_AVAILABLE
    SearchBar at top
    On search: pass query to kiwix-js WebView via postMessage
    Results list: article titles
    On tap: navigate to WikiArticleScreen

WikiArticleScreen:
  react-native-webview with source pointing to local kiwix-js reader
  Inject CSS overrides after load:
    document.body.style.background = '#0D0F0A'
    Override all text colors to '#C8D4B8'
    Override link colors to '#7AB648'
    Change font-family to serif (matches Spectral feel)
    Remove Wikipedia header/footer navigation
  Header: back button + article title truncated + [★] favorite button
  
Bundle kiwix-js distribution files in src/assets/kiwix/ directory.
kiwix-js is MIT licensed and reads ZIM files in JavaScript.
Source from: https://github.com/kiwix/kiwix-js"
```

---

## Phase 8 — Navigation Module

```bash
claude "Build src/modules/navigation/

Files:
  NavigationNavigator.tsx
  NavigationScreen.tsx     — main map + GPS
  CompassScreen.tsx        — full compass
  WaypointScreen.tsx       — saved locations
  CoordinatesDisplay.tsx   — coordinate format component

NavigationScreen layout:
  Top panel (35% height):
    CoordinatesDisplay: shows lat/lng decimal, MGRS, DMS formats
    Toggle between formats on tap
    Elevation if GPS provides it
    GPS accuracy radius
    Buttons: [Save Waypoint] [Compass] [Track Path]

  Map panel (65% height):
    react-native-maps MapView
    Provider: PROVIDER_DEFAULT
    If MBTiles file present in documentDirectory/maps/: use offline tile overlay
    Else: show gray placeholder with text 'Download offline map in Settings'
    User location blue dot
    Saved waypoints as custom markers (SVG pin, green)
    If tracking: polyline showing path walked

Waypoint save modal:
  On [Save Waypoint]: bottom sheet modal
  TextInput: waypoint name (required)
  TextInput: notes (optional)
  [Save] button → saveWaypoint() to SQLite
  Show success haptic + brief toast

CompassScreen:
  Full screen dark, large circular compass 280px diameter
  Use expo-sensors Magnetometer subscription (update every 100ms)
  Rotate compass rose image based on magnetometer heading
  Show: bearing in degrees (SourceCodePro 48px gold)
  Cardinal direction label (N / NE / E etc.)
  Toggle: True North / Magnetic North
    Magnetic declination from src/assets/data/declination.json
    Lookup by nearest degree of lat/lng

src/utils/coordinates.ts:
  Import 'mgrs' npm package
  Export:
    decimalToMGRS(lat, lng): string
    decimalToDMS(lat, lng): {latDMS: string, lngDMS: string}
    formatCoordinates(lat, lng, format: 'decimal'|'dms'|'mgrs'): string"
```

---

## Phase 9 — Survival Tools Module

```bash
claude "Build src/modules/tools/ with a tools home screen and 8 sub-tool screens.

ToolsHomeScreen: grid of 8 tool cards (2 columns)
Each card: icon (large, 48px), tool name, brief descriptor
Background: '#161A10'. Cards: '#1E2418'. Border-left 2px accent green.

Tool 1 — WaterScreen.tsx
Source: FM 21-76 Ch.6 Water Procurement and Purification
Decision tree: which water source type? (river/rain/standing/tap/unknown)
For each source: recommended purification sequence
Show purification methods as ordered steps:
  1. Boiling: 1 min rolling boil at sea level, 3 min above 2000m. Removes bacteria, viruses, protozoa.
  2. Chemical Sodium Hypochlorite (bleach 5.25%): 2 drops/liter clear, 4 drops/liter cloudy. Wait 30 min.
  3. Iodine tablets: per packet instructions. Not for pregnant women or thyroid conditions.
  4. Improvised filter then treat: layer grass/sand/gravel/charcoal in fabric. Removes sediment then treat chemically.
  5. SODIS: clean clear plastic bottle, 6+ hours direct sunlight on clear day. 2 days if cloudy.
Show comparison table: which method kills bacteria/viruses/protozoa/removes chemicals (none do).
Source each row.

Tool 2 — FireScreen.tsx
Source: FM 21-76 Ch.7 + Brown 'Tom Brown's Field Guide to Wilderness Survival'
Methods with full step-by-step cards: bow drill, hand drill, flint and steel, lens/magnifying, fire lays
For bow drill: step list from Brown's guide — spindle wood species list, fireboard species, technique details
For each method: success conditions (humidity, technique, materials)
Fire lay types: teepee, log cabin, star, long fire — when to use each

Tool 3 — ShelterScreen.tsx
Source: FM 21-76 Ch.5 Shelter Construction
Shelter types: debris hut, lean-to, tarp configurations (6), snow quinzhee, underground
Each shelter: step cards, required materials, time estimate, insulation rating
Site selection checklist: flood plain (no), dead trees overhead (no), water access (yes), windbreak (yes)

Tool 4 — SignalScreen.tsx
Source: FM 21-76 Ch.9 Signaling
Ground-to-air signal symbols: full table from FM 21-76 public domain content
Morse code full chart. SOS emphasized: --- (3 short, 3 long, 3 short)
Signal mirror technique: step by step
Whistle codes: 3 blasts = international distress
Fire signals: day = smoke (green vegetation), night = flame (dry wood)

Tool 5 — KnotsScreen.tsx
Source: The Ashley Book of Knots (public domain) + FM 21-76
12 essential knots:
  Bowline (rescue loop), Clove hitch (quick attachment), Bowline on bight,
  Sheet bend (join two ropes), Square knot (bandaging), Taut-line hitch (adjustable tension),
  Trucker's hitch (mechanical advantage), Prusik (rope climbing), Double fisherman's,
  Alpine butterfly, Figure-eight, Round turn and two half hitches
Each knot: use case, strength notes, animated step description as numbered cards
Use SVG rope-like illustrations for each step using path elements

Tool 6 — ChecklistScreen.tsx
Source: FEMA Ready.gov + SF Load Lists FM 3-05.70
Three tiers accessible via top tabs: [72 HR] [2 WEEK] [LONG TERM]
Each item: checkbox (AsyncStorage), quantity, explanation on tap
Categories: Water, Food, Medical, Tools, Communication, Documents, Shelter
Progress bar at top: X of Y items
Export as plain text: Share sheet via expo-sharing

Tool 7 — CalorieScreen.tsx
Source: FM 21-76 energy expenditure tables
Inputs: weight (kg), activity level (4 options), temperature (hot/temperate/cold)
Output: daily caloric need with formula shown
Table: how many calories per common foraged food to meet daily need
  Acorns (processed flour): ~400 cal/100g
  Hickory nuts: ~650 cal/100g
  Cattail pollen flour: ~326 cal/100g
  Wild berries: ~50-80 cal/100g

Tool 8 — WeatherScreen.tsx
Source: FM 21-76 weather chapter + USN weather guides (public domain)
Cloud identification cards: 10 cloud types with descriptions and weather implications
  Cumulonimbus: imminent storm. Cirrus: weather change 24-48hrs. Nimbostratus: steady rain.
Device barometer: expo-sensors Barometer subscription
3-hour pressure trend graph (simple line chart using react-native-svg)
Falling pressure: storm approaching. Rising: clearing.
Natural signs: red sky at morning (warning), red sky at evening (fair weather) — with meteorological explanation."
```

---

## Phase 10 — Home Dashboard

```bash
claude "Build src/modules/home/HomeScreen.tsx

ScrollView with dark '#0D0F0A' background:

TOP HERO SECTION:
  App name: 'GridDown' UnifrakturMaguntia 44px '#B8962E' gold
  Subtitle: 'Offline Survival Reference' Spectral italic 14px textMuted
  OfflineStatusBar component (GPS / OFFLINE / Battery)
  Hairline rule in '#2E3526'

QUICK ACCESS GRID (2x2):
  Four cards in a 2-column grid. Each card: bg '#161A10', border-left 2px '#7AB648'
  Tap sends to respective screen and focuses search if applicable:
    [FORAGE] — 'Find wild food' — navigates ForagingScreen
    [MEDICAL] — 'Emergency reference' — navigates SymptomChecker
    [WATER] — 'Purification guide' — navigates WaterScreen
    [FIRE] — 'Starting fire' — navigates FireScreen
  Icons: simple geometric SVG shapes (leaf, cross, water drop, flame)

CONDITIONS (uses device data, no internet):
  Section header: 'CURRENT CONDITIONS'
  Row 1: barometric pressure reading + trend arrow (↑ ↓ →)
  Row 2: estimated season from device date + 'Best forage: [season-appropriate plant]'
  Row 3: sunrise/sunset calculated from GPS coordinates (implement SunCalc algorithm or use suncalc npm package)

RECENTLY VIEWED:
  Section header: 'RECENTLY VIEWED'
  FlatList horizontal: last 6 items from recently_viewed table
  Each chip: item_type icon + item_name text, tap navigates to detail

FAVORITES:
  Section header: 'SAVED REFERENCES'
  Horizontal scroll of favorited items grouped by type
  Plants + conditions + procedures

SYSTEM STATUS:
  Section header: 'SYSTEM STATUS'
  Checklist of indicators (green check / red X):
    Wikipedia pack downloaded? (check documentDirectory/zim/)
    Offline maps downloaded?
    Plant database loaded? (plants count > 0)
    GPS acquired?
  All done without any network calls."
```

---

## Phase 11 — Global Search and Settings

```bash
claude "Build two remaining screens:

src/modules/search/GlobalSearchScreen.tsx:
  SearchBar at top — queries ALL tables simultaneously:
    plants WHERE common_name OR latin_name OR description LIKE query
    fungi same fields
    medical_conditions WHERE name OR symptoms LIKE query
    procedures WHERE name LIKE query
    medications WHERE name OR generic_name LIKE query
  Results grouped by section headers (PLANTS / FUNGI / MEDICAL / PROCEDURES / MEDICATIONS)
  Each result row shows module icon + name + brief descriptor
  Tap → navigate to respective detail screen
  Save to search_history
  Show recent searches below empty bar

src/modules/settings/SettingsScreen.tsx:
  Sections:

  CONTENT PACKS:
    All downloadable content in one place
    ZIM files: Medicine Wiki, Nature Wiki, Wikispecies, Wikivoyage
    Map packs: Africa, Asia, Europe, North America, South America, Oceania
    Each: name, download size, status badge, [Download]/[Delete] button
    Total storage used bar

  DISPLAY:
    Font scale: [Small 0.9x] [Normal 1x] [Large 1.15x] [XL 1.3x]
    Store in AsyncStorage, apply globally via Context

  DATA SOURCES:
    Full list of references used in database
    Each: title, author, year, ISBN if applicable, domain (public domain / open license)
    This is both transparency and legal compliance

  LEGAL:
    'All medical and survival data is for reference purposes only.'
    'Not a substitute for professional medical training.'
    'Always seek professional care when available.'

  DANGER ZONE:
    [Clear All Favorites] — confirmation required
    [Clear Search History]
    [Reset All Checklists]
    [Export Waypoints as JSON] — expo-sharing"
```

---

## Phase 12 — Polish and Performance

```bash
claude "Apply final production polish to GridDown:

TRANSITIONS:
  PlantCard → PlantDetail: shared element transition on image using Reanimated
  Tab switches: fade 150ms
  Modal presentations: slide up from bottom

HAPTICS (expo-haptics):
  Light impact: toggle favorites, check checklist item, filter pill press
  Medium impact: dangerous look-alike warning appears, DangerBanner renders
  Heavy impact: life_threatening severity condition is opened

LOADING STATES:
  SkeletonLoader component: animated shimmer effect
    bg '#161A10' with shimmer '#1E2418' animated across
    Use Animated.loop translateX for shimmer effect
  All FlatLists show skeleton while SQLite query runs

EMPTY STATES:
  No search results: centered text 'NOT IN DATABASE' SourceCodePro + dim hint
  No favorites: 'TAP ★ TO SAVE CRITICAL REFERENCES'
  No GPS: show manual coordinate entry option

OFFLINE WALL MODAL:
  When any feature needs a content pack not yet downloaded:
  Full-screen dark modal with message and [Download Now] button
  Never show blank screen or error

PERFORMANCE:
  All SQLite queries: useCallback with deps array
  FlatList: getItemLayout for fixed-height rows
  PlantCard height: fixed 84px (allows getItemLayout optimization)
  Images: use expo-image (better caching than Image)
  Memo: PlantCard, FungiCard, ConditionCard all wrapped in React.memo

ACCESSIBILITY:
  All touch targets minimum 44x44
  accessibilityLabel on every interactive element
  accessibilityRole='button' on all touchable items
  EdibilityBadge accessibilityLabel: 'Edibility rating: Safe' (or Caution, Toxic)
  DangerBanner accessibilityLiveRegion='assertive'

APP CONFIG (app.json):
  name: GridDown
  slug: griddown
  version: 1.0.0
  orientation: portrait
  backgroundColor: '#0D0F0A'
  splash: backgroundColor '#0D0F0A', image centered
  ios: bundleIdentifier: com.griddown.app, supportsTablet: false
  android: package: com.griddown.app, adaptiveIcon background '#0D0F0A'
  permissions: ACCESS_FINE_LOCATION, READ_EXTERNAL_STORAGE"
```

---

## Data Integrity Policy

**Every row in every table must have `source` populated.**

This is a survival reference application. Users may make life-or-death decisions based on this content. The following rules apply to all database seeding:

1. **Never fabricate botanical or medical data.** If a fact cannot be sourced to the listed references, do not include it.
2. **When uncertain about edibility, default to `caution`.** Never mark something `safe` if any doubt exists.
3. **All toxic plants must include identification notes** sufficient to distinguish them from edible look-alikes.
4. **The Death Camas / Wild Onion rule** (no onion smell = do not eat) must appear in the wild_onion entry.
5. **All mushroom entries** must include look-alike warnings. The giant puffball entry must include the amanita-inside test.
6. **Medical data** must match current public-domain military medical doctrine (ST 31-91B).
7. **The ORS formula** (1L water + 6tsp sugar + 0.5tsp salt) must appear verbatim in the dehydration entry.

---

## Authoritative Sources Used

| Reference | Coverage | License |
|-----------|----------|---------|
| FM 21-76 U.S. Army Survival Manual | Survival, foraging, water, shelter, signals, first aid | Public domain |
| ST 31-91B Special Forces Medical Handbook | Trauma, procedures, medications | Public domain |
| Where There Is No Doctor — Werner (Hesperian) | Medical, disease, childbirth | Free non-commercial |
| Stalking the Wild Asparagus — Euell Gibbons 1962 | Foraging | Public domain |
| Field Guide to Edible Wild Plants — Bradford Angier 1974 | Foraging | Cited reference |
| Forager's Harvest + Nature's Garden — Samuel Thayer | Foraging | Cited reference |
| Field Guide to Wild Edible Plants — Tom Brown Jr. 1985 | Foraging, survival | Cited reference |
| Mushrooms — Roger Phillips | Fungi identification | Cited reference |
| USDA PLANTS Database | Botanical data | Public domain |
| Missouri Botanical Garden profiles | Botanical descriptions | CC-licensed |
| NOAA World Magnetic Model | Magnetic declination grid | Public domain |
| The Ashley Book of Knots | Knot techniques | Public domain |

---

## Build Order

```
Phase 0  → Scaffold, theme, fonts, navigation shell
Phase 1  → OfflineStatusBar (used everywhere)
Phase 2  → Database schema (foundation for all data)
Phase 3  → Plant/fungi seed SQL (most critical — accuracy over speed)
Phase 4  → Foraging UI
Phase 5  → Medical seed SQL
Phase 6  → Medical UI + Symptom Checker
Phase 7  → Wikipedia ZIM integration
Phase 8  → Navigation + compass + maps
Phase 9  → Tools (all 8 sub-tools)
Phase 10 → Home dashboard
Phase 11 → Global search + settings
Phase 12 → Polish, performance, accessibility
```

**Start Phase 3 (plant data) before any UI.** Get the data layer right first. Bad data in a survival app is dangerous. Accurate data with a rough UI is recoverable. The reverse is not.
