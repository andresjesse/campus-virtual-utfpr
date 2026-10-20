export type VirtualMapSelectedEntity = {
  id: string;
  slug: string;
};

export type VirtualMapEvents = {
  entitySelected: VirtualMapSelectedEntity;
  selectionCleared: undefined;
};
