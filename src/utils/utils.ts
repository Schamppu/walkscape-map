export const iconUrl = (iconName: string) => {
  return `/icons/${iconName}.png`;
};

export const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);
