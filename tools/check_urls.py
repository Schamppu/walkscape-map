import json
import os
import asyncio
import aiohttp

def json_files(data_folder):
    folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), data_folder)
    return [os.path.join(data_folder, filename) for filename in os.listdir(folder) if filename.endswith('.json')]

def read_json(filepath):
    with open(filepath, 'r') as jf:
        return json.load(jf)

def extract_links(data):
    links = []
    for data_point in data:
        if 'wikiUrl' in data_point:
            links.append(data_point['wikiUrl'])
    return links

def get_links():
    links = []
    for file in json_files('../public/data'):
        data = read_json(file)
        if 'wikiUrl' in data[0]:
            links += extract_links(data)
        else:
            for obj in data:
                links += extract_links(obj['layers'][0]['markers'])
    return links

async def check_url(session, url, failed_urls):
    try:
        async with session.get(url) as response:
            if response.status != 200:
                failed_urls.append((url, response.status))
    except aiohttp.ClientError as e:
        failed_urls.append((url, str(e)))

def remove_broken_urls(urls):
    for file in json_files('../public/data'):
      with open(file) as infile, open(file, 'w') as outfile:
        data = infile.read()
        for line in data:
            for src in urls:
                line = line.replace(src, '""')
        outfile.write(data)

async def main(urls):
    failed_urls = []
    async with aiohttp.ClientSession() as session:
        tasks = [check_url(session, url, failed_urls) for url in urls]
        await asyncio.gather(*tasks)
    
    if failed_urls:
        for url, error in failed_urls:
            print(f"{url} failed with error: {error}")
        print("removing broken urls from data")
        remove_broken_urls(failed_urls)
    else:
        print("All URLs passed.")

if __name__ == "__main__":
    urls = get_links()
    try:    
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(main(urls))
    finally:
        loop.close()