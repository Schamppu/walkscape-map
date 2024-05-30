import os
from PIL import Image
TILESIZE = 512

def is_divisible_by_tilesize(img):
   x, y = img.size
   assert(x / TILESIZE == x // TILESIZE)
   assert(y / TILESIZE == y // TILESIZE)

def load_image(filename):
  with Image.open(filename) as img:
    img.load()
    return img
  
def mkdir(path):
  os.makedirs(path, exist_ok=True)
  
def square_borders(img):
  img_x, img_y = img.size
  for y in range(0, img_y // TILESIZE):
    for x in range(0, img_x // TILESIZE):
      x_out = x * TILESIZE
      y_out = y * TILESIZE
      yield (x_out, y_out, x_out + TILESIZE, y_out + TILESIZE), x, y

def split_to_tiles(zoom_level, img):
  is_divisible_by_tilesize(img)
  mkdir(f'out/{zoom_level}')
  for border, x, y in square_borders(img):
    tile = img.crop(border)
    tile.save(f"out/{zoom_level}/{x}_{y}.png", optimize=True)

def main():
  filename = "data/2.png"
  img = load_image(filename)

  base_zoom_level = 2
  for zoom_level in range(0,5):
    scaling_factor = base_zoom_level**(zoom_level - base_zoom_level)
    size = tuple([int(scaling_factor * x) for x in img.size])
    scaled_img = img.resize(size)
    split_to_tiles(zoom_level, scaled_img)

if __name__ == '__main__':
    # To use, add base image to data/{zoom_level}.png
    # fill in correct base_zoom_level
    # run script
    # copy output from out/ to public/tiles/
    main()