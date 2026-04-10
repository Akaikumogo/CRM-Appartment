import { listApartments, type ApartmentRow } from './apartments';
import { listBlocks, type BlockRow } from './blocks';
import { listFloors, type FloorRow } from './floors';

export type MergedFloorRow = FloorRow & {
  block?: BlockRow;
};

export type ApartmentWithContext = ApartmentRow & {
  floor?: MergedFloorRow;
};

/** Blocks + floors (with block) + apartments (scoped by API) for sales / inventory UI. */
export async function fetchSalesInventory(): Promise<{
  blocks: BlockRow[];
  floors: MergedFloorRow[];
  apartments: ApartmentWithContext[];
}> {
  const [blocks, floorsRaw, apartments] = await Promise.all([
    listBlocks(),
    listFloors(),
    listApartments(),
  ]);
  const bm = new Map(blocks.map((b) => [b.id, b]));
  const floors: MergedFloorRow[] = floorsRaw.map((f) => ({
    ...f,
    block: bm.get(f.blockId),
  }));
  const fm = new Map(floors.map((f) => [f.id, f]));
  const apartmentsWith: ApartmentWithContext[] = apartments.map((a) => ({
    ...a,
    floor: fm.get(a.floorId),
  }));
  return { blocks, floors, apartments: apartmentsWith };
}
