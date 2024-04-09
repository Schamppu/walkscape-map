import { FilterCategory } from "../Interfaces/FilterCategory";

const iconUrl = (iconName: string) => {
  return `/icons/${iconName}.png`;
};

const filterGroups: { [key: string]: FilterCategory[] } = {
  Skills: [
    {
      name: "Agility",
      values: ["agility"],
      iconUrl: iconUrl("activities/activity_sprites/agility/dasboot3"),
    },
    {
      name: "Carpentry",
      values: ["carpentry"],
      iconUrl: iconUrl("activities/activity_sprites/carpentry/full"),
    },
    {
      name: "Cooking",
      values: ["cooking"],
      iconUrl: iconUrl("activities/activity_sprites/cooking/full"),
    },
    {
      name: "Crafting",
      values: ["crafting"],
      iconUrl: iconUrl("activities/activity_sprites/crafting/full"),
    },
    {
      name: "Fishing",
      values: ["fishing"],
      iconUrl: iconUrl("activities/activity_sprites/fishing/full"),
    },
    {
      name: "Foraging",
      values: ["foraging"],
      iconUrl: iconUrl("activities/activity_sprites/foraging/full"),
    },
    {
      name: "Mining",
      values: ["mining"],
      iconUrl: iconUrl("activities/activity_sprites/mining/pickaxe"),
    },
    {
      name: "Smithing",
      values: ["smithing"],
      iconUrl: iconUrl("activities/activity_sprites/smithing/full"),
    },
    {
      name: "Woodcutting",
      values: ["woodcutting"],
      iconUrl: iconUrl("activities/activity_sprites/woodcutting/axe"),
    },
  ],
  Buildings: [
    {
      name: "Store",
      values: [
        "generalStore",
        "fishingStore",
        "activityShop",
        "animalShelter",
        "marketStall",
        "tavern",
        "house",
        "castle",
      ],
      iconUrl: iconUrl("buildings/general_store"),
    },
    {
      name: "Other",
      values: ["temple"],
      iconUrl: iconUrl("buildings/cabin"),
    },
    {
      name: "Bank",
      values: ["bank"],
      iconUrl: iconUrl("buildings/bank"),
    },
  ],
  Services: [
    {
      name: "Forge",
      values: ["basic_forge", "advanced_forge", "frozen_forge"],
      iconUrl: iconUrl("services/forge"),
    },
    {
      name: "Kitchen",
      values: ["basic_kitchen", "advanced_kitchen"],
      iconUrl: iconUrl("services/kitchen"),
    },
    {
      name: "Sawmill",
      values: ["basic_sawmill", "advanced_sawmill"],
      iconUrl: iconUrl("services/sawmill"),
    },
    {
      name: "Workshop",
      values: ["basic_workshop", "advanced_workshop"],
      iconUrl: iconUrl("services/workshop"),
    },
  ],
};

export default filterGroups;
