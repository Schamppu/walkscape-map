import json
import re
import os
import copy
import yaml
from functools import lru_cache

def json_files(data_folder):
    folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), data_folder)
    return [os.path.join(data_folder, filename) for filename in os.listdir(folder) if filename.endswith('.json')]

def read_json(filepath):
    with open(filepath, 'r') as jf:
        return json.load(jf)
    
def write_json(filepath, data):
    with open(filepath, 'w') as jf:
        json.dump(data, jf, ensure_ascii=False, indent=2)

@lru_cache
def read_yaml(filename):
    with open(filename, 'r') as file:
        return yaml.safe_load(file)
    
def get_id(string):
    if not string:
        return None
    split = string.split('-')
    return '-'.join(split[1:len(split) - 5])

def get_name(key):
    if not key:
        return
    parts = key.split('.')
    localization_file = f"localizations/{parts[0]}_en-US.yaml"
    data = read_yaml(localization_file)
    try:
        for key in parts[1:]:
            data = data[key]
    except:
        print(f"error with key {".".join(parts)}: {key}")

    return data

def find(list, id):
    return [i for i in list if i['id'] == id]

def read_data(data_path, src_path):
    data = read_json(data_path)
    src_data = read_json(src_path)
    return data, src_data

def get_common_info(official_obj, old_data, icon_key=None):
    id = get_id(official_obj['id'])
    old_obj = find(old_data, id)
    exists = len(old_obj)

    # keep fixed capitalizations from old data if it exists
    name = get_name(official_obj['name'])
    if icon_key and icon_key in official_obj:
        icon_path = official_obj[icon_key].replace('assets/icons/', '')
    return id, name, icon_path, old_obj

def get_wiki_url(name):
    return f"https://wiki.walkscape.app/wiki/{name.replace(' ', '_')}"

def getRealm(official_obj):
    if 'realm' in official_obj:
        return official_obj['realm']
    if 'realmName' in official_obj:
        return official_obj['realmName']
    if 'faction' in official_obj:
        special = {
            'grand_duchy_of_trellin-erdwise': 'gdte'
        }
        id = get_id(official_obj['faction'])
        return_value = special[id] if id in special else id
        return return_value
    return 'Jarvonia'

def update_locations(filename, map_layer_name):
    data_path = f'../public/data/locations.json'
    data_full, src_data = read_data(data_path, f'./data/{filename}')
    layers = data_full[1]['layers']
    data = None
    layer_index = -1
    for i, layer in enumerate(layers):
        if map_layer_name in layer['mapLayers']:
            data = layers[0]['markers']
            layer_index = i
    if data == None:
        data = layers[0]['markers']

    locations = []
    for src_location in src_data:
        id, name, icon_path, old_loc = get_common_info(src_location, data, 'locationIcon')
        # hidden = False if 'hidden' not in old_loc[0] else old_loc[0]['hidden']
        realm = getRealm(src_location)
        buildings = list(map(get_id, src_location['buildingList'])) if 'buildingList' in src_location else []

        loc = {
            'id': id,
            'name': name,
            'realm': realm,
            'wikiUrl': get_wiki_url(name),
            'coords': src_location['locationPosition'][::-1],
            'icon': { 'url': icon_path },
            # 'hidden': hidden,
            'activities': list(map(get_id, src_location['activityList'])),
            'services': list(map(get_id, src_location['serviceList'])),
            'buildings': buildings,
        }
        locations.append(loc)

    if layer_index > -1:
        data_full[1]['layers'][layer_index]['markers'] = locations
    else:
        layer = copy.deepcopy(layers[0])
        layer['mapLayers'] = [map_layer_name]
        layer['markers'] = locations
        data_full[1]['layers'].append(layer)
    write_json(data_path, data_full)
    location_ids = [l["id"] for l in locations]
    write_json('../public/params.json', location_ids)

def update_activities(filename):
    data_path = f'../public/data/{filename}'
    data, src_data = read_data(data_path, f'./data/{filename}')

    activities = []
    for src_activity in src_data:
        id, name, icon_path, _ = get_common_info(src_activity, data, 'activityIcon')

        level_requirements = src_activity['levelRequirementsMap']
        skills = [i for i in level_requirements.keys()]
        required_keywords = [obj['keyword'] for obj in src_activity['requiredKeywords']]

        activity = {
            'id': id,
            'name': name,
            'wikiUrl': get_wiki_url(name),
            'icon': { 'url': icon_path },
            'skills': skills,
            'levelRequirements': level_requirements,
            'requiredKeywords': required_keywords,
        }
        activities.append(activity)
    write_json(data_path, activities)

def update_buildings(filename):
    data_path = f'../public/data/{filename}'
    data, src_data = read_data(data_path, f'./data/{filename}')
    
    buildings = []
    for src_building in src_data:
        id, name, icon_path, _ = get_common_info(src_building, data, 'iconPath')

        building = {
            'id': id,
            'name': name,
            'wikiUrl': get_wiki_url(name),
            'icon': { 'url': icon_path },
            'type': src_building['type'],
            'shop': get_id(src_building['shop'])
        }
        buildings.append(building)
    write_json(data_path, buildings)

def update_services(filename):
    data_path = f'../public/data/{filename}'
    data, src_data = read_data(data_path, f'./data/{filename}')
    
    services = []
    for src_service in src_data:
        id, name, icon_path, _ = get_common_info(src_service, data, 'serviceIcon')
        skills = src_service['relatedSkills']

        service = {
            'id': id,
            'name': name,
            'wikiUrl': get_wiki_url(name),
            'icon': { 'url': icon_path },
            'skills': skills,
        }
        services.append(service)
    write_json(data_path, services)

def calculate_distance(distance, modifier):
    distances = { 
        'veryShort': 450, 
        'short': 550, 
        'extremelyNear': 160, 
        'veryNear': 280, 
        'near': 390, 
        'lowModerate': 650, 
        'moderate': 800, 
        'moderateHigh': 1000, 
        'lowHigh': 1300,
    }
    base = 1000 
    if distance in distances:
        base = distances[distance]
    return int(base * modifier)

def get_terrain_modifier_name(id):
    terrain_localizations = {
        "jarvonian_border_check": "Requires Jarvonian letter of passage",
        "challenging_wilderness_terrain": "Requires Level 30 Agility",
        "glacier_map_requirement": "Requires Mysterious northern map",
        "black_eye_peak_wilderness_permit": "Requires Black eye peak wilderness permit"
    }
    assert id in terrain_localizations.keys(), f"No such terrain modifier {id}"
    return terrain_localizations[id]


def update_routes(filename, map_layer_name):
    data_path = f'../public/data/{filename}'
    data_full, src_data = read_data(data_path, f'./data/{filename}')
    locations = [layer['markers'] for layer in read_json('../public/data/locations.json')[1]['layers'] if map_layer_name in layer['mapLayers']][0]
    def location_by_id(id):
        for location in locations:
            if location['id'] == id:
                return location
    
    layers = data_full[0]['layers']
    data = None
    layer_index = -1
    for i, layer in enumerate(layers):
        if map_layer_name in layer['mapLayers']:
            data = layers[0]['markers']
            layer_index = i
    if data == None:
        data = layers[0]['markers']

    routes = []
    for src_route in src_data:
        id = get_id(src_route['id'])

        pathpoints = [coords[::-1] for coords in src_route['pathPoints']]
        middle = pathpoints[(len(pathpoints))//2]

        location_0 = location_by_id(get_id(src_route['locations'][0]))
        location_1 = location_by_id(get_id(src_route['locations'][1]))
        pathpoints.insert(0, location_0['coords'])
        pathpoints.append(location_1['coords'])
        name = f"{location_0['name']} to {location_1['name']}"
        realm = location_1['realm']

        terrain = []
        if 'terrainModifiers' in src_route:
            terrain = [get_terrain_modifier_name(get_id(i)) for i in src_route['terrainModifiers']]
        route = {
            'id': id,
            'name': name,
            'realm': realm,
            'coords': middle,
            'distance': calculate_distance(src_route['distance'], src_route['distanceModifier']),
            'pathpoints': pathpoints,
            'terrainModifiers': terrain,
        }
        routes.append(route)

    if layer_index > -1:
        data_full[0]['layers'][layer_index]['markers'] = routes
    else:
        layer = copy.deepcopy(layers[0])
        layer['mapLayers'] = [map_layer_name]
        layer['markers'] = routes
        data_full[0]['layers'].append(layer)
    write_json(data_path, data_full)

def main():
    map_layer_name = 'beta-322'
    update_locations('locations.json', map_layer_name)
    update_activities('activities.json')
    update_buildings('buildings.json')
    update_services('services.json')
    update_routes('routes.json', map_layer_name)

if __name__ == '__main__':
    main()
