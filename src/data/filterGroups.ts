import { iconUrl } from "../utils/utils";

export const filterGroups = {
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
      name: "Bank",
      values: ["bank"],
      iconUrl: iconUrl("buildings/bank"),
    },
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
      name: "Guild",
      values: ["outpost"],
      iconUrl: iconUrl("buildings/adventure_guild_outpost_cabin"),
    },
    {
      name: "Barber",
      values: ["barber"],
      iconUrl: iconUrl("buildings/barber"),
    },
    {
      name: "Clothing",
      values: ["clothingShop"],
      iconUrl: iconUrl("buildings/clothing_shop"),
    },
    {
      name: "Other",
      values: ["temple"],
      iconUrl: iconUrl("buildings/cabin"),
    },
  ],
  Services: [
    {
      name: "Forge",
      values: [
        "basic_forge",
        "advanced_forge",
        "frozen_forge",
        "underwater_forge",
      ],
      iconUrl: iconUrl("services/forge"),
    },
    {
      name: "Kitchen",
      values: [
        "basic_kitchen",
        "advanced_kitchen",
        "underwater_kitchen",
        "eberhart_mansion_kitchen",
      ],
      iconUrl: iconUrl("services/kitchen"),
    },
    {
      name: "Sawmill",
      values: [
        "basic_sawmill",
        "advanced_sawmill",
        "sawmill_of_barbantok",
        "underwater_sawmill",
      ],
      iconUrl: iconUrl("services/sawmill"),
    },
    {
      name: "Workshop",
      values: ["basic_workshop", "advanced_workshop", "tidal_workshop"],
      iconUrl: iconUrl("services/workshop"),
    },
    {
      name: "Wardrobe",
      values: ["wardrobe"],
      iconUrl: iconUrl("services/wardrobe"),
    },
    {
      name: "Job Boards",
      values: [
        "azurazera_job_board",
        "kallaheim_job_board",
        "vastalume_job_board",
        "granfiddich_job_board",
      ],
      iconUrl: iconUrl("services/job_boards"),
    },
  ],
  "Points of Interest": [
    {
      name: "Locations",
      values: ["location"],
      iconUrl: iconUrl("locations/castle_white"),
    },
    {
      name: "Realms",
      values: ["realm"],
      iconUrl: iconUrl("coatofarms/jarvonia"),
    },
    {
      name: "Routes",
      values: ["route"],
      iconUrl: iconUrl("activities/agility/traveling"),
    },
  ],
};
