import copy
from src.localizations import get_name
from src.files import read_json, write_json
from src.util import get_wiki_url, get_short_id, get_realm, get_common_info
from src.routes import get_distance, get_terrain_modifier_name


def read_data(data_path, src_path):
    data = read_json(data_path)
    src_data = read_json(src_path)
    return data, src_data


def update_locations(filename, map_layer_name):
    data_path = f"../public/data/locations.json"
    data_full, src_data = read_data(data_path, f"./data/{filename}")
    layers = data_full[1]["layers"]
    data = None
    layer_index = -1
    for i, layer in enumerate(layers):
        if map_layer_name in layer["mapLayers"]:
            data = layers[0]["markers"]
            layer_index = i
    if data == None:
        data = layers[0]["markers"]

    locations = []
    for src_location in src_data:
        id, _, name, icon_path, _ = get_common_info(src_location, data)
        # hidden = False if 'hidden' not in old_loc[0] else old_loc[0]['hidden']
        realm = get_realm(src_location)
        buildings = (
            list(map(get_short_id, src_location["buildingList"]))
            if "buildingList" in src_location
            else []
        )
        job_boards = list(map(get_short_id, src_location["jobBoards"]))

        loc = {
            "id": id,
            "name": name,
            "realm": realm,
            "wikiUrl": get_wiki_url(name),
            "coords": src_location["locationPosition"][::-1],
            "icon": {"url": icon_path},
            # 'hidden': hidden,
            "activities": src_location["activityList"],
            "services": job_boards
            + list(map(get_short_id, src_location["serviceList"])),
            "buildings": buildings,
        }
        locations.append(loc)

    if layer_index > -1:
        data_full[1]["layers"][layer_index]["markers"] = locations
    else:
        layer = copy.deepcopy(layers[0])
        layer["mapLayers"] = [map_layer_name]
        layer["markers"] = locations
        data_full[1]["layers"].append(layer)
    write_json(data_path, data_full)
    location_ids = [l["id"] for l in locations]
    write_json("../public/params.json", location_ids)


def update_activities(filename):
    data_path = f"../public/data/{filename}"
    data, src_data = read_data(data_path, f"./data/{filename}")

    activities = []
    for src_activity in src_data:
        _, id, name, icon_path, _ = get_common_info(src_activity, data)

        level_requirements = src_activity["levelRequirementsMap"]
        skills = [i for i in level_requirements.keys()]
        required_keywords = [obj["keyword"] for obj in src_activity["requiredKeywords"]]

        activity = {
            "id": id,
            "name": name,
            "wikiUrl": get_wiki_url(name),
            "icon": {"url": icon_path},
            "skills": skills,
            "levelRequirements": level_requirements,
            "requiredKeywords": required_keywords,
        }
        activities.append(activity)
    write_json(data_path, activities)


def update_buildings(filename):
    data_path = f"../public/data/{filename}"
    data, src_data = read_data(data_path, f"./data/{filename}")

    buildings = []
    for src_building in src_data:
        _, id, name, icon_path, old_data = get_common_info(src_building, data)
        wiki_url = (
            old_data[0]["wikiUrl"]
            if len(old_data) and "wikiUrl" in old_data[0]
            else get_wiki_url(name)
        )

        building = {
            "id": id,
            "name": name,
            "wikiUrl": wiki_url,
            "icon": {"url": icon_path},
            "type": src_building["type"],
            "shop": get_short_id(src_building["shop"]),
        }
        buildings.append(building)
    write_json(data_path, buildings)


def update_services(filename):
    data_path = f"../public/data/{filename}"
    data, src_data = read_data(data_path, f"./data/{filename}")

    services = []
    for src_service in src_data:
        id, _, name, icon_path, old_data = get_common_info(src_service, data)
        skills = src_service["relatedSkills"]
        wiki_url = (
            old_data[0]["wikiUrl"]
            if len(old_data) and "wikiUrl" in old_data[0]
            else get_wiki_url(name)
        )

        service = {
            "id": id,
            "name": name,
            "wikiUrl": wiki_url,
            "icon": {"url": icon_path},
            "skills": skills,
        }
        services.append(service)
    write_json(data_path, services)


def update_routes(filename, map_layer_name):
    data_path = f"../public/data/{filename}"
    data_full, src_data = read_data(data_path, f"./data/{filename}")
    locations = [
        layer["markers"]
        for layer in read_json("../public/data/locations.json")[1]["layers"]
        if map_layer_name in layer["mapLayers"]
    ][0]

    def location_by_id(id):
        for location in locations:
            if location["id"] == id:
                return location

    layers = data_full[0]["layers"]
    data = None
    layer_index = -1
    for i, layer in enumerate(layers):
        if map_layer_name in layer["mapLayers"]:
            data = layers[0]["markers"]
            layer_index = i
    if data == None:
        data = layers[0]["markers"]

    routes = []
    for src_route in src_data:
        id = get_short_id(src_route["id"])

        pathpoints = [coords[::-1] for coords in src_route["pathPoints"]]
        middle = pathpoints[(len(pathpoints)) // 2]

        location_0 = location_by_id(get_short_id(src_route["locations"][0]))
        location_1 = location_by_id(get_short_id(src_route["locations"][1]))
        pathpoints.insert(0, location_0["coords"])
        pathpoints.append(location_1["coords"])
        name = f"{location_0['name']} to {location_1['name']}"
        realm = location_1["realm"]

        terrain = []
        if (
            len(src_route["options"]) > 0
            and "terrainModifiers" in src_route["options"][0]
        ):
            terrain = [
                get_terrain_modifier_name(get_short_id(i))
                for i in src_route["options"][0]["terrainModifiers"]
            ]
        route = {
            "id": id,
            "name": name,
            "realm": realm,
            "coords": middle,
            "distance": get_distance(
                src_route["distance"], src_route["distanceModifier"]
            ),
            "pathpoints": pathpoints,
            "terrainModifiers": terrain,
        }
        routes.append(route)

    if layer_index > -1:
        data_full[0]["layers"][layer_index]["markers"] = routes
    else:
        layer = copy.deepcopy(layers[0])
        layer["mapLayers"] = [map_layer_name]
        layer["markers"] = routes
        data_full[0]["layers"].append(layer)
    write_json(data_path, data_full)


def edit_locations():
    data_path = f"../public/data/locations.json"
    activity_data = read_json("./data/activities.json")
    building_data = read_json("./data/buildings.json")
    id_map = {get_short_id(i["id"]): i["id"] for i in building_data}

    def get_id(key):
        if key not in id_map:
            return key
        return id_map[key]

    full_locations_data = read_json(data_path)
    locations = full_locations_data[1]
    for loc_i, layer in enumerate(locations["layers"]):
        for mrk_i, marker in enumerate(layer["markers"]):
            # new_activity_ids = [get_id(act_id) for act_id in marker["activities"]]
            # marker["activities"] = new_activity_ids
            new_building_ids = [get_id(bui_id) for bui_id in marker["buildings"]]
            marker["buildings"] = new_building_ids

            layer["markers"][mrk_i] = marker
        locations["layers"][loc_i] = layer
    write_json(data_path, full_locations_data)


def main():
    map_layer_name = "beta-322"
    # edit_locations()
    update_locations("locations.json", map_layer_name)
    update_activities("activities.json")
    update_buildings("buildings.json")
    update_services("services.json")
    update_routes("routes.json", map_layer_name)


if __name__ == "__main__":
    main()
