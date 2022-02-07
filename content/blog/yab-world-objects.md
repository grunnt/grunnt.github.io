+++
title = "YAB-World procedural objects"
description = "Placing procedural objects in a block world."
date = 2022-02-07
[extra]
blog_icon = "/yab-world-objects/yab-world-objects.jpg"
+++

[Yet Another Block-World](/blog/yab-world) is a prototype infinite fully editable world for multiple players. On this page I will explain a bit more about the way the procedural objects are generated and placed. I will assume that you have read the earlier article about [world generation](/blog/yab-world-generation).

The code is open source and available on [GitHub](https://github.com/grunnt/yab-world) (MIT License). The code for generating objects can be found [here](https://github.com/grunnt/yab-world/tree/master/server/src/generator/object_generator) in the server crate. The code for placing the objects can be found [here](https://github.com/grunnt/yab-world/tree/master/server/src/generator/object_placer).

# The objects

![Objects in YAB-World](/yab-world-objects/yab-world-objects.jpg)

For YAB-World I wanted to figure out how to add objects to a block world such as trees or towers. This poses us with two problems: (1) how to procedually generate a tree or tower and (2) how to place the objects in an infinite block world.

There are several ways to go at this:
1. Only place objects after a chunk and all 8 neighbours are generated. This complicates the chunk generation workflow, however. It also puts a practical limit on the size of objects to avoid overlaps with additional chunks.
2. Place objects by procedurally generating the object during terrain generation. Although this would result in a nice and clean interface, generating complex objects this way is extremely difficult.
3. Procedurally generating a set of objects before the world is loaded and sampling the pregenerated objects to place them. This makes object placement relatively simple but limits the variety in possible object that can be encountered in a single world.

After experimenting with these approaches I settled on option 3: placing pregenerated objects. Although this limits the variety in a single world somewhat, in practice it can give a world a kind of character based on its seed since the objects in the world are specific to that world. Another cool thing about pregenerated objects is that they could be manually created (e.g. in a voxel editor) and loaded on startup instead of generated.

## Generating the objects

To place the objects I use a distorted grid, which I will explain later. But first the easy part: pregenerating some procedural objects. In our case, many different trees and several different towers.

Pregenerated objects can be stored much like the chunks as I described in my previous article: a flat array indexed by x, y, z. We need a width, height an depth, as this can be different for each object. We also need an "anchor" position: this is a position in the pregenerated object that will be aligned with the terrain.

For storing the pregenerated objects I use the following structure:

```rust
pub struct PregeneratedObject {
    // Anchor will be aligned with the terrain, e.g. a door
    pub anchor_x: usize,  
    pub anchor_y: usize,
    pub anchor_z: usize,
    // Size of the object
    pub size_x: usize,    
    pub size_y: usize,
    pub size_z: usize,
    // The array with the blocks
    // Indexed using z + y * size_z + x * size_z * size_y
    pub blocks: Vec<Block>,
}
```

To make things easier I implemented a few functions on `PregeneratedObject`, such as a `get` and `set` block function, and helpers such as `set_rectangle` and `fill_sphere`.

The function signature for generating an object is simple:
```rust
fn generate(&mut self) -> PregeneratedObject;
```

The object generator should be seeded as well (I pass the seed in the object generator's `new` function), so that each time the objects are generated for a world with a specific seed they are the same. Repeated calls to the `generate` function should generate different objects, e.g. trees in different sizes and shapes.

### Generating a tree

For YAB-World I made a generator for simple trees consisting of a single trunk and a spherical clump of leaves on top. The radius of the sphere of leaves and the height of the trunk are randomized:

```rust
fn generate(&mut self) -> PregeneratedObject {
  // Figure out how large our tree will be
  let radius = 2 + (self.random.next_u32() % 3) as usize;
  let size_xy = radius * 2 + 1;
  let size_z = size_xy + 1 + (self.random.next_u32() % 8) as usize;
  // Create an empty object that our tree will fit in
  let mut tree = PregeneratedObject::solid(
    size_xy,               // size_x
    size_xy,               // size_y
    size_z,                // size_z 
    Block::empty_block(),  // Block which the object is filled with initially
    Block::log_block(),    // Foundation block
  );
  // The anchor is below the trunk (which is in the middle)
  tree.anchor_x = size_xy / 2;
  tree.anchor_y = size_xy / 2;
  tree.anchor_z = 1; // Move the tree 1 block down 
  // Trees can stand close together or overlap, so lets keep existing blocks
  tree.overwrite_non_empty = false;
  // Align with the soil
  tree.place_on_soil = true;
  // Create leaves. "Spray" means to randomly place 80% of blocks in a sphere
  tree.spray_sphere(
    tree.anchor_x,
    tree.anchor_y,
    size_z - (radius + 1),
    radius,
    LEAVES_BLOCK,
    &mut self.random,
  );
  // Create the trunk
  tree.set_filled_rectangle(
    tree.anchor_x,
    tree.anchor_y,
    0,
    tree.anchor_x + 1,
    tree.anchor_y + 1,
    size_z - (radius + 1),
    Block::log_block(),
  );
  tree
}
```

The code used to generate tower objects can be found [here](https://github.com/grunnt/yab-world/blob/master/server/src/generator/object_generator/tower_generator.rs). This is a bit more involved as we want to place walls, crenelations, windows, a door, different floors, lights, etcetera. The anchor position is set to the door ground level, so it aligns nicely with the terrain level. It's fun to experiment with generating procedural objects, and not too difficult.

## Placing objects

Placing these pregenerated objects in an infinite procedurally generated world is a tricky subject. I ended up doing the object placement immediately after generating an 1x1 column of terrain. The function signature for the object place code is similar to the one used by the terrain generator code (described in the previous post):

```rust
pub fn place(
  &mut self,
  x: i16,  // X coordinate of 1x1 column to do object placement
  y: i16,  // Y coordinate of 1x1 column to do object placement
  blocks: &mut Vec<Block>,  // Column of blocks containing the terrain
  generator: &mut dyn Generator,  // Reference to the terrain generator
)
```

This way we do not need to worry about chunk boundaries and other exceptions as we treat every neighbouring block equally.  

One thing that stands out here is the *generator*. I quickly found out that in order to place objects on a sensible place in the terrain you need to know the terrain height at the location of the anchor (which is a tree root or bottom of a tower door). The anchor position should be aligned with the terrain at this point, so that the tree sits on the terrain and the door is accessible from ground level and not buried or high above the ground. 

To keep things simple, I added a function to each world generator that would supply 3 z coordinates: the highest rock, water and any block (including soil and water). This function can be much faster than the normal terrain generation as only the topmost blocks needs to be generated:

```rust
fn determine_rock_water_top(&mut self, x: i16, y: i16) -> (usize, usize, usize)
```

During object placement this function can be called for the anchor position to determine the terrain height at that location. This allows us to determine the height at which the object should be placed.

### Using a grid for object locations

A problem which I have not discussed yet is *where* to place the objects. Ideally the objects should be distributed in a natural looking manner and should not overlap. And we should be able to quickly determine the location of any objects overlapping with the current column of blocks. 

To do this I started out with a grid (as seen from above) in which each cell of the grid contains an object:

<img src="/yab-world-objects/regular-grid.svg" alt="Regular object grid" width="512"/>

This is of course much too regular to be interesting: trees are normally not lined up this way unless they're planted by a machine. Making this grid irregular is quite easy, however. We can use value noise to determine a random location of the anchor in the cell. Using seeded value noise ensures that the position is random and that the object position will be the same for a grid cell each time we calculate it:

```rust
// Determine the cell top-left coordinate (these are i16 values)
let grid_x = (x / self.grid_size) * self.grid_size;
let grid_y = (y / self.grid_size) * self.grid_size;
// Get position of anchor in the cell
let anchor_world_x = grid_x 
    + (self.grid_x_noise.get([x as f64, y as f64]) * 0.5 + 0.5) * self.grid_size;
let anchor_world_y = grid_y 
    + (self.grid_y_noise.get([x as f64, y as f64]) * 0.5 + 0.5) * self.grid_size;
```

We get a much nicer distorted grid using this approach:

<img src="/yab-world-objects/distorted-grid.svg" alt="Regular object grid" width="512"/>

However, if we use this in YAB-World we get something that looks funny, somewhat natural but not really realistic:

![Distorted grid with objects](/yab-world-objects/distorted-grid-screenshot.jpg)

Note that I used a larger grid size for the larger tower objects, so they are spaced further apart. Also, I allowed the trees to overlap a bit, which helps the natural look, but obviously this was not possible for the towers.

The reason that this looks wrong is that each and every cell contains an object. To improve on this we need to generate a *density* value using (again) FBM noise. Noise really is a terrain generator's best friend!

```rust
// Determine object density at the anchor position
let density_noise = self.fbm_density_noise
        .get(anchor_world_x, anchor_world_y, 0.01);
// If the density is below some tweakable value
if density_noise > self.object_density {
    // Place no object, so return without doing anything
    return;
}
```

By "filtering" the grid using the FBM noise we get a much better result:

![Distorted filtered grid with objects](/yab-world-objects/distorted-filtered-grid-screenshot.jpg)

We can tweak object placement by varying grid size and object density, and some other values. This allowed me to use a completely different distribution for the towers and trees. 

Of course there is more to the object generation and placement than I explained here. To learn more you can look at the full object placement code which can be found [here](https://github.com/grunnt/yab-world/blob/master/server/src/generator/object_placer/mod.rs). 

