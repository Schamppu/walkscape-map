import csv
import json

def read_csv(filepath):
  with open(filepath) as csvfile:
    reader = csv.DictReader(csvfile)
    return [row for row in reader]

def write_json(filepath, data):
    with open(filepath, 'w') as jf:
        json.dump(data, jf, ensure_ascii=False, indent=2)

def main(filename):
  input_file = f"{filename}.csv"
  output_file = f"{filename}.json"

  data = read_csv(input_file)

  for key in data[0]:
    column = list(map(lambda x: x[key], data))
    all_empty = all([len(val) == 0 for val in column])
    all_empty_or_number = all([val.replace('.','',1).isdigit() or len(val) == 0 for val in column])

    for row in data:
      if all_empty_or_number and not all_empty:
        row[key] = float(row[key]) if row[key] else None
  write_json(output_file, data)

if __name__ == '__main__':
  main('routes')