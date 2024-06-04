import json
import re
import os
import copy
from urllib.request import urlopen


def json_files(data_folder):
    folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), data_folder)
    return [os.path.join(data_folder, filename) for filename in os.listdir(folder) if filename.endswith('.json')]

def read_json(filepath):
    with open(filepath, 'r') as jf:
        return json.load(jf)
    
def write_json(filepath, data):
    with open(filepath, 'w') as jf:
        json.dump(data, jf, ensure_ascii=False, indent=2)
    
def get_id(string):
    if not string:
        return None
    split = string.split('-')
    return '-'.join(split[1:len(split) - 5])

def get_name(official_location):
    name_data = official_location['name'].split('.')[-2]
    name = re.sub(r'(\w)([A-Z])', r'\1 \2', name_data)
    name.replace(" Of ", " of ")
    return name.title()

def find(list, id):
    return [i for i in list if i['id'] == id]

def read_data(data_path, src_path):
    data = read_json(data_path)
    src_data = read_json(src_path)
    return data, src_data

def get_common_info(official_obj, old_data, icon_key):
    id = get_id(official_obj['id'])
    old_obj = find(old_data, id)
    exists = len(old_obj)

    # keep fixed capitalizations from old data if it exists
    name = old_obj[0]['name'] if exists else get_name(official_obj)
    icon_path = official_obj[icon_key].replace('assets/icons/', '')
    return id, name, icon_path, old_obj

def get_wiki_url(name):
    return f"https://wiki.walkscape.app/wiki/{name.replace(' ', '_')}"

def getRealm(official_obj):
    if 'realm' in official_obj:
        return official_obj['realm']
    if 'realmName' in official_obj:
        return official_obj['realmName']
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
        hidden = False if 'hidden' not in old_loc[0] else old_loc[0]['hidden']
        realm = getRealm(src_location)
        buildings = list(map(get_id, src_location['buildingList'])) if 'buildingList' in src_location else []

        loc = {
            'id': id,
            'name': name,
            'realm': realm,
            'wikiUrl': get_wiki_url(name),
            'coords': src_location['locationPosition'][::-1],
            'icon': { 'url': icon_path },
            'hidden': hidden,
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

def main():
    map_layer_name = 'locations_old_4'
    update_locations('locations_old_4.json', map_layer_name)
    update_activities('activities.json')
    update_buildings('buildings.json')
    update_services('services.json')

if __name__ == '__main__':
    main()
