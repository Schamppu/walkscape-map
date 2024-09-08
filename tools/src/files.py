import os
import yaml
import json
from functools import lru_cache
import __main__


def write_data(filepath, data, new_line=False):
    with open(filepath, "w") as outfile:
        for line in data:
            outfile.write(line)
            if new_line:
                outfile.write("\n")


def read_json(filepath):
    with open(filepath, "r") as jf:
        return json.load(jf)


def write_json(filepath, data):
    with open(filepath, "w") as jf:
        json.dump(data, jf, ensure_ascii=False, indent=2)


@lru_cache
def read_yaml(filename):
    with open(filename, "r") as file:
        return yaml.safe_load(file)


def list_files(folder_path, extension):
    folder = folder = os.path.join(
        os.path.dirname(os.path.realpath(__main__.__file__)), folder_path
    )
    return [
        os.path.join(folder_path, filename)
        for filename in os.listdir(folder)
        if filename.endswith(extension)
    ]


def json_files(data_folder):
    return list_files(data_folder, ".json")
