DISTANCES = {
    "none": 0,
    "extremelyNear": 160,
    "veryNear": 280,
    "near": 390,
    "veryShort": 450,
    "short": 550,
    "lowModerate": 650,
    "moderate": 800,
    "moderateHigh": 1000,
    "lowHigh": 1300,
    "high": 1600,
    "veryHigh": 2000,
    "extensive": 3000,
    "veryExtensive": 4500,
    "extreme": 6000,
    "endless": 10000,
}

TERRAIN_LOCALIZATIONS = {
    "jarvonian_border_check": "Requires Jarvonian letter of passage",
    "challenging_wilderness_terrain": "Requires Level 25 Agility & Skis equipped",
    "glacier_map_requirement": "Requires Mysterious northern map",
    "black_eye_peak_wilderness_permit": "Requires Black eye peak wilderness permit",
    "diving_gear": "Requires 3 diving gear equipped",
    "advanced_diving_gear": "Requires 3 Advanced diving gear equipped",
    "expert_diving_gear": "Requires 3 Expert diving gear equipped",
}


def get_distance(distance, modifier):
    assert distance in DISTANCES, f"No such distance {distance}"
    return int(DISTANCES[distance] * modifier)


def get_terrain_modifier_name(id):
    assert id in TERRAIN_LOCALIZATIONS, f"No such terrain modifier {id}"
    return TERRAIN_LOCALIZATIONS[id]
