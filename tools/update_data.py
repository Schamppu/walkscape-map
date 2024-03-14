import json
import re

def read_json(filepath):
    with open(filepath, 'r') as jf:
        return json.load(jf)
    
def write_json(filepath, data):
    with open(filepath, 'w') as jf:
        json.dump(data, jf, ensure_ascii=False, indent=2)
    
def get_id(string):
    split = string.split('-')
    return '-'.join(split[1:len(split) - 5])

def get_name(official_location):
    name_data = official_location['name'].split('.')[-2]
    name = re.sub(r'((?<=[a-z])[A-Z]|(?<!\A)[A-Z](?=[a-z]))', r' \1', name_data)
    return name.capitalize()

def find(list, id):
    return [i for i in list if i['id'] == id]

def update_locations():
    locations_path = '../public/data/locations.json'
    src_path = './locations_official.json'

    location_json_full = read_json(locations_path)
    locations = location_json_full[1]['layers'][0]['markers']
    official_data = read_json(src_path)

    new_locations = []

    for off_location in official_data:
        id = get_id(off_location['id'])
        old_loc = find(locations, id)
        exists = len(old_loc)

        # keep fixed capitalizations from old data if it exists
        name = old_loc[0]['name'] if exists else get_name(off_location)
        icon_path = off_location['locationIcon'].replace('assets/icons/', '')
        hidden = False if 'hidden' not in old_loc[0] else old_loc[0]['hidden']

        loc = {
            'id': id,
            'name': name,
            'realm': off_location['realm'],
            'coords': off_location['locationPosition'][::-1],
            'icon': { 'url': icon_path },
            'hidden': hidden,
            'activities': list(map(get_id, off_location['activityList'])),
            'services': list(map(get_id, off_location['serviceList'])),
            'buildings': list(map(get_id, off_location['buildingList'])),
        }
        new_locations.append(loc)

    location_json_full[1]['layers'][0]['markers'] = new_locations
    write_json(locations_path, location_json_full)

def update_activities():
    activities_path = '../public/data/activities.json'
    src_path = './activities_official.json'
    
    activities_data = read_json(activities_path)
    official_data = read_json(src_path)

    activities = []
    for off_activity in official_data:
        id = get_id(off_activity['id'])
        old_activity = find(activities_data, id)
        exists = len(old_activity)

        # keep fixed capitalizations from old data if it exists
        name = old_activity[0]['name'] if exists else get_name(off_activity)
        icon_path = off_activity['activityIcon'].replace('assets/icons/', '')
        level_requirements = off_activity['levelRequirementsMap']
        skills = [i for i in level_requirements.keys()]
        required_keywords = [obj['keyword'] for obj in off_activity['requiredKeywords']]

        activity = {
            'id': id,
            'name': name,
            'icon': icon_path,
            'skills': skills,
            'levelRequirements': level_requirements,
            'requiredKeywords': required_keywords,
        }
        activities.append(activity)
    write_json(activities_path, activities)

def main():
    #update_locations()
    update_activities()

if __name__ == '__main__':
    main()