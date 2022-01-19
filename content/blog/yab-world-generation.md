+++
title = "YAB-World procedural generation"
description = "Procedural world generation in YAB-World."
date = 2022-01-19
[extra]
blog_icon = "/yab-world-generation/terrain-generation.jpg"
+++

Yet Another Block-World is a prototype infinite fully editable world for multiple players. You can read more about it [here](/blog/yab-world). On this page I will explain a bit more about the procedural world generation I used.

The code is open source and available on [GitHub](https://github.com/grunnt/yab-world) (MIT License). The full world generator code can be found [here](https://github.com/grunnt/yab-world/tree/master/server/src/generator/generators) in the server crate.

# The terrain

![Resulting terrain](/yab-world-generation/terrain-generation.jpg)

A procedure for generating terrain for an infinite block-world needs to generate interesting terrain over a nearly infinite area. It should be quite fast as well, as we need to generate terrain in real-time.

## Blocks and chunks

But first I'll talk a bit about the data model used to store the world. A block world is built out of, well, blocks. Each block is stored as an integer number, e.g. 0 = empty space, 1 = rock, 2 = dirt, etc. For a good looking result you minimally need rock and some kind of soil, e.g. desert sand or dirt with grass on top. 

We can't generate an infinite world in one go, so we need to cut it up in small pieces, and generate it piece by piece. Like most block-world implementations I divide the world into chunks. A chunk is a 3D array of blocks, although I store it as a flat array since this speeds up iteration over the array somewhat. 

Note that in the coordinate system I use here x and y are horizontal and z is vertical (up).

```rust
// Define the data type of the block (can be u16 or u32 depending on your needs as well)
pub type Block = u8;

// We can define different types of blocks
pub const EMPTY_BLOCK: Block = 0;
pub const WATER_BLOCK: Block = 1;
pub const ROCK_BLOCK: Block = 2;
pub const DIRT_BLOCK: Block = 3;
pub const GRASS_BLOCK: Block = 4;
pub const SAND_BLOCK: Block = 5;

// The chunks are 16x16x16 blocks
pub const CHUNK_SIZE: usize = 16;

// For fast indexing we can use bit shifting
pub const BIT_SHIFT_Y: usize = 4;
pub const BIT_SHIFT_X: usize = 8;

pub struct Chunk {
  pub blocks: Vec<Block>,
}

impl Chunk {
  pub fn new() -> Self {
    let blocks = vec![EMPTY_BLOCK; CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE];
    Chunk { blocks }
  }

  pub fn get_block(&self, x: usize, y: usize, z: usize) -> Block {
    let index = z | y << BIT_SHIFT_Y | x << BIT_SHIFT_X;
    self.blocks[index]
  }

  pub fn set_block(&mut self, x: usize, y: usize, z: usize, block: Block) {
    let index = z | y << BIT_SHIFT_Y | x << BIT_SHIFT_X;
    self.blocks[index] = block;
  }
}
```

When iterating over the blocks in a chunk (for example when generating a mesh for rendering), it is best to iterate over the array from the first element to the last element in sequence as this results in fewer CPU cache misses. This means that with the chunk code described above we iterate in x, y, z order:

```rust
for x in 0..CHUNK_SIZE {
  for y in 0..CHUNK_SIZE {
    for z in 0..CHUNK_SIZE {
      let block = chunk.get_block(x, y, z);
      // Do something with the block
    }
  }
}
```

It's worth nothing that although the world is infinite horizontally, I do define a minimum and maximum z value, which makes a lot of the work involved quite a bit easier.

## World generator function

Back to world generation. Since we can't generate the entire world in one go, we need a function call that generates part of the world. A logical signature for such a function would take an x, y, z coordinate as input and tell us what block goes there as output:

```rust
fn generate(&mut self, x: i16, y: i16, z: i16) -> Block
```

This is a nice abstraction, but in practice I found it very difficult to get adequate performance when generating the world block-by-block. The main reason for this is that many optimizations require knowledge about blocks above or below the current block. For example, you need to know where rock ends to place soil on top of it. 

An alternative approach would be to generate chunks in one go, but this adds a lot of complexity (dealing with chunk borders) and offers very limited performance improvement as you still do not know about the chunks above or below the current chunk.

The best signature that I found was to give an x and y coordinate as input and generate an 1x1 column of blocks ranging from the lowest possible z to the highest z:

```rust
fn generate(&mut self, x: i16, y: i16) -> Vec<Block>
```

This avoids difficulties with chunk borders by generating every 1x1 column in isolation, allows optimizations based on knowledge of blocks below or above the current block, and is easy to parallelize. After a set of 16x16 columns is generated it can be copied over to column of chunks.

## A simple heightmap using noise

Now to the actual world generation. The most common approach to generating realistic looking terrain fast is by using procedural noise. Noise functions have the nice property that they are usually seeded, which means that given the same "seed", the output of the function will always be idential for a given input. In other words, we can generate the same terrain if we have the same seed.

One not so nice property of procedural noise is that generating it is **slow**. It's fast enough to do real-time world generation, but you should try to limit its use.

To generate noise I use the Rust [noise](https://github.com/Razaekel/noise-rs) library. A commonly used and relatively fast type of noise is Perlin noise. This type of noise typically results in smooth curves. So as a starting point we can use Perlin noise to generate "height" values which tell us how high the terrain at a given point is:

```rust
use common::block::*;
use common::chunk::{CHUNK_SIZE, WORLD_HEIGHT_CHUNKS};
use noise::*;

pub struct HeightmapGenerator {
  height_noise: Perlin,
}

impl HeightmapGenerator {
  pub fn new(seed: u32) -> Self {
    HeightmapGenerator {
      height_noise: Perlin::new().set_seed(seed),
    }
  }

  pub fn generate(&mut self, x: i16, y: i16) -> Vec<Block> {
    let roughness = 0.015; // How "rough" the terrain will be
    let terrain_min_z = 64.0; // Below this the world is rock
    let terrain_max_z = 128.0; // Above this the world is air
    let soil_thickness = 3; // How many "soil" blocks to place on top

    // Generate the height noise value for this coordinate
    let height_noise = self
      .height_noise
      .get([x as f64 * roughness, y as f64 * roughness])
      * 0.5
      + 0.5;
    // Convert it to a height value
    let height = terrain_min_z as usize + (height_noise * (terrain_max_z - terrain_min_z)) as usize;

    // Now create and fill the 1x1 column of blocks
    let mut blocks = vec![EMPTY_BLOCK; WORLD_HEIGHT_CHUNKS * CHUNK_SIZE];
    for z in 0..height {
      blocks[z] = ROCK_BLOCK;
    }
    // Put soil on top
    for z in height..height + soil_thickness {
      blocks[z] = SAND_BLOCK;
    }
    blocks
  }
}
```

By using a perlin heightmap we get terrain that looks like this:

![Perlin heightmap terrain](/yab-world-generation/heightmap_perlin.jpg)

It's a start but it looks way too smooth.

## Layered noise for  a more natural look

To give the terrain a more natural look we need to add some detail. This can be done by using a different noise function: Fractal Brownian motion (FBM) noise. FBM noise boils down to combining several "layers" of Perlin noise of increasingly greater detail. The result will be more detailed, but also a bit slower as more noise values need to be calculated.

```rust
use common::block::*;
use common::chunk::{CHUNK_SIZE, WORLD_HEIGHT_CHUNKS};
use noise::*;

pub struct FbmHeightmapGenerator {
    height_noise: Fbm,
}

impl FbmHeightmapGenerator {
    pub fn new(seed: u32) -> Self {
        FbmHeightmapGenerator {
            height_noise: Fbm::new().set_seed(seed),
        }
    }

    pub fn generate(&mut self, x: i16, y: i16) -> Vec<Block> {
      // Otherwise identical to the Perlin noise example
```

Using layered noise gives a somewhat more natural looking terrain:

![FBM heightmap terrain](/yab-world-generation/heightmap_fbm.jpg)

However, there are still no real cliffs (see any rock?) and no overhangs, so it is still not very interesting.

## Adding a third dimension

To allow overhangs and steep cliffs to exists, we need to add a third dimension to the noise. This is easily done by adding the z coordinate to the noise function:

```rust
for z in 1..WORLD_HEIGHT_CHUNKS * CHUNK_SIZE {
  // Get a noise value between 0 and 1
  let noise = self.noise.get([
      x as f64 * roughness,
      y as f64 * roughness,
      z as f64 * roughness,
    ]) * 0.5 + 0.5;
  // If its below some tweakable value place a block
  blocks[z] = if noise < 0.5 {
	  ROCK_BLOCK
  } else {
  	EMPTY_BLOCK
  }
}
```

This results in a fantastically weird structure of huge "caves" and holes in the terrain:

![3D noise terrain](/yab-world-generation/3d-noise-no-falloff.jpg)

The problem with this is that the 3D noise stretches vertically into infinity so we do not have a real landscape. We need to make sure that the generated terrain has a minimum and maximum z coordinate, and a natural looking transition between the two.

## Taming the noise using a height falloff

To get a real landscape using layered 3D noise we need to introduce a "height factor". The height factor goes from 0 at the minimum terrain z to 1 at the maximum terrain z.

```rust
use common::block::*;
use common::chunk::{CHUNK_SIZE, WORLD_HEIGHT_CHUNKS};
use noise::*;

pub struct TerrainGenerator {
  noise: Fbm,
}

impl TerrainGenerator {
  pub fn new(seed: u32) -> Self {
    TerrainGenerator {
      noise: Fbm::new().set_seed(seed),
    }
  }

  pub fn generate(&mut self, x: i16, y: i16) -> Vec<Block> {
    let roughness = 0.011; // How "rough" the terrain will be
    let terrain_min_z = 64; // Below this the world is rock
    let terrain_max_z = 192; // Above this the world is air
    let soil_thickness = 3; // How many blocks of soil to place on top of rock

    // Below the minimum terrain z we just place rock
    let mut blocks = vec![EMPTY_BLOCK; WORLD_HEIGHT_CHUNKS * CHUNK_SIZE];
    for z in 0..terrain_min_z {
      blocks[z] = ROCK_BLOCK;
    }

    // For the terrain we go from the minimum to maximum
    for z in terrain_min_z..terrain_max_z {
      // Get a noise value between 0 and 1
      let noise = self.noise.get([
        x as f64 * roughness,
        y as f64 * roughness,
        z as f64 * roughness,
      ]) * 0.5
        + 0.5;
      // Now calculate a "height factor"
      let h_factor = (z - terrain_min_z) as f64 / (terrain_max_z - terrain_min_z) as f64;
      // By adding the two we ensure that the higher we go,
      // the less likely it is that a block will appear.
      let block = if noise + h_factor < 1.0 {
        ROCK_BLOCK
      } else {
        EMPTY_BLOCK
      };
      blocks[z] = block;
    }

    // We make a final pass to place soil
    let mut soil_added = 0;
    for z in 0..blocks.len() {
      let block = blocks[z];
      if block == EMPTY_BLOCK {
        if soil_added < soil_thickness {
          if soil_added == soil_thickness - 1 {
            blocks[z] = GRASS_BLOCK;
          } else {
            blocks[z] = DIRT_BLOCK;
          }
          soil_added += 1;
        }
      } else {
        // Since we have overhangs we may need to place more
        soil_added = 0;
      }
    }
    blocks
  }
}
```

The constant values in the code (e.g. roughness or terrain min and max z) require a quite a lot of trial-and-error before it looks good. Most values result in either dull or completely crazy landscapes. Procedural world generation is more like engineering than science :-)

![Resulting terrain](/yab-world-generation/terrain-generation.jpg)

This gives a nice and interesting terrain with overhangs and cliffs, pretty similar to how Minecraft terrain was originally generated. One artefact that can occur is "floating islands": small clumps of blocks that are not attached to the terrain but float in the air, something you will be familiar with if you have played Minecraft. By increasing terrain roughness the chance of these floating islands occurring will also increase. 

![Floating islands](/yab-world-generation/floating-island.jpg)

## Placing resources

In YAB-world I also added resources such as gold or iron. To place resources, we need to determine which rock blocks should be changed into a resource, and what type of resouce it should be. There are many ways to do this, but I found that using one perlin noise value to determine where to place resources and another to determine what value it should be worked fine.

```rust
let rock_block = {
  let resource_scale = 0.1; // Larger scale means further apart and larger clumps
  let resource_density = 0.3; // Higher density means more ore

  // Determine whether resource should be placed here
  let resource_noise = (self.resource_density_noise.get([
    x as f64 * resource_scale,
    y as f64 * resource_scale,
    z as f64 * resource_scale,
  ]) * 0.5
    + 0.5)
    .powf(3.0);  // Another tweakable, increase power to make clumps smaller
  if resource_noise > 1.0 - resource_density {
    // We should place a resource. Of what type?
    let resource_type_scale = 0.002;
    let type_noise = self.resource_type_noise.get([
      x as f64 * resource_type_scale,
      y as f64 * resource_type_scale,
    ]) * 2.0;
    if type_noise < 1.0 {
      GOLD_BLOCK
    } else {
      IRON_BLOCK
    }
  } else {
    ROCK_BLOCK
  }
}
```

Using this code lets us place nice small clumps of resource to discover by digging, or along cliffs:

![Resource placement](/yab-world-generation/resources.jpg)

## Further steps

Placing water is quite easy: just place water at any block below water level that is empty. The soil at or below water level (and perhaps 1 or 2 blocks above) can be made sand to give an impression of beaches. This means that the water level will be the same everywhere. Unfortunately in an infinite world like this somethings are prohibitively difficult, and having varying water levels is one of them.

Another addition would be supporting different biomes. I experimented with different approaches to generate biomes, including voronoi diagrams and "emergent" generation based on temperature, humidity and other values. Voronoi diagrams are relatively easy to generate, but creating different biomes based on the diagrams and especially generating convincing transitions between biomes is a difficult task. Maybe something for another time!