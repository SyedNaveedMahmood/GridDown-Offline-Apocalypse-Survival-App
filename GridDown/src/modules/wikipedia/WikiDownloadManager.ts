import * as FileSystem from 'expo-file-system';

export interface WikiPack {
  id: string;
  name: string;
  description: string;
  sizeMB: number;
  url: string;
}

export interface DownloadProgress {
  packId: string;
  bytesWritten: number;
  totalBytes: number;
  fraction: number;
}

export const WIKI_PACKS: WikiPack[] = [
  {
    id: 'medicine',
    name: 'Medicine & First Aid',
    description: 'Wikipedia medical articles — emergency care, anatomy, pharmacology',
    sizeMB: 600,
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_en_medicine_maxi_2024-01.zim',
  },
  {
    id: 'nature',
    name: 'Nature & Ecology',
    description: 'Plants, animals, ecosystems, foraging and natural history',
    sizeMB: 800,
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_en_ecology_maxi_2024-01.zim',
  },
  {
    id: 'wikispecies',
    name: 'Wikispecies',
    description: 'Complete species taxonomy and identification database',
    sizeMB: 300,
    url: 'https://download.kiwix.org/zim/wikispecies/wikispecies_en_all_maxi_2024-01.zim',
  },
  {
    id: 'wikivoyage',
    name: 'Wikivoyage',
    description: 'Regional geography, terrain, and navigation reference',
    sizeMB: 600,
    url: 'https://download.kiwix.org/zim/wikivoyage/wikivoyage_en_all_maxi_2024-01.zim',
  },
];

const ZIM_DIR = (FileSystem.documentDirectory ?? '') + 'zim/';

async function ensureZimDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(ZIM_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ZIM_DIR, { intermediates: true });
  }
}

export function getZimPath(packId: string): string {
  return ZIM_DIR + packId + '.zim';
}

export async function getDownloadedPacks(): Promise<string[]> {
  await ensureZimDir();
  const downloaded: string[] = [];
  for (const pack of WIKI_PACKS) {
    const info = await FileSystem.getInfoAsync(getZimPath(pack.id));
    if (info.exists) downloaded.push(pack.id);
  }
  return downloaded;
}

export async function downloadPack(
  packId: string,
  onProgress: (p: DownloadProgress) => void
): Promise<void> {
  await ensureZimDir();
  const pack = WIKI_PACKS.find((p) => p.id === packId);
  if (!pack) throw new Error(`Unknown pack: ${packId}`);

  const dest = getZimPath(packId);
  const callback = (progress: FileSystem.DownloadProgressData) => {
    onProgress({
      packId,
      bytesWritten: progress.totalBytesWritten,
      totalBytes: progress.totalBytesExpectedToWrite,
      fraction:
        progress.totalBytesExpectedToWrite > 0
          ? progress.totalBytesWritten / progress.totalBytesExpectedToWrite
          : 0,
    });
  };

  const downloadResumable = FileSystem.createDownloadResumable(
    pack.url,
    dest,
    {},
    callback
  );

  await downloadResumable.downloadAsync();
}

export async function deletePack(packId: string): Promise<void> {
  const path = getZimPath(packId);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path);
  }
}

export async function getStorageUsed(): Promise<number> {
  await ensureZimDir();
  let total = 0;
  for (const pack of WIKI_PACKS) {
    const info = await FileSystem.getInfoAsync(getZimPath(pack.id));
    if (info.exists && 'size' in info) {
      total += (info as any).size ?? 0;
    }
  }
  return total;
}
