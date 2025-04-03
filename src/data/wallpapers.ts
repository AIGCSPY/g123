export const wallpapers = Array.from({ length: 72 }, (_, i) => ({
  id: i + 1,
  name: `壁纸 ${i + 1}`,
  path: `/wallspic/wallspic_${i + 1}.jpg`
}));

export type Wallpaper = {
  id: number;
  name: string;
  path: string;
}; 