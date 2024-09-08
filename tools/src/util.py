from .localizations import get_name


def get_short_id(string):
    if not string:
        return None
    split = string.split("-")
    return "-".join(split[1 : len(split) - 5])


def find(list, id):
    return [i for i in list if i["id"] == id]


def get_wiki_url(name):
    return f"https://wiki.walkscape.app/wiki/{name.replace(' ', '_')}"


def get_realm(data_obj):
    # Used in old data files
    if "realm" in data_obj:
        return data_obj["realm"]
    if "realmName" in data_obj:
        return data_obj["realmName"]

    # Current key, as of beta-322
    if "faction" in data_obj:
        special = {"grand_duchy_of_trellin-erdwise": "gdte"}
        id = get_short_id(data_obj["faction"])
        return_value = special[id] if id in special else id
        return return_value
    return "Jarvonia"


def get_common_info(src_data, old_data):
    icon_keys = [key for key in src_data.keys() if "icon" in key.lower()]

    id = src_data["id"]
    short_id = get_short_id(id)
    name = get_name(src_data["name"])

    icon_path = None
    if len(icon_keys):
        assert len(icon_keys) == 1
        icon_path = src_data[icon_keys[0]].replace("assets/icons/", "")

    old_obj = find(old_data, short_id)
    return short_id, id, name, icon_path, old_obj
