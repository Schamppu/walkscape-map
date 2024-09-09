from .files import read_yaml
from os.path import exists


def get_name(key):
    assert len(key)

    parts = key.split(".")
    localization_file = f"localizations/{parts[0]}_en-US.yaml"
    assert exists(localization_file)

    data = read_yaml(localization_file)

    try:
        for part in parts[1:]:
            data = data[part]
    except:
        print(f"error with key {key}: {part}")

    return data
