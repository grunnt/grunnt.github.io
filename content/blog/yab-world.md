+++
title = "YAB-World"
description = "Creating Yet Another Block World using Rust and OpenGL."
date = 2021-12-10
[extra]
blog_icon = "/yab-world/screenshot.png"
+++

The past years I worked on and off on Yet Another Block-World, for fun and to learn more about Rust and OpenGL. Like many developers I saw [Minecraft](https://www.minecraft.net) and wanted to experiment with a block world of my own. 

Getting a few blocks rendered on screen was relatively easy. However, getting from there to an infinite fully multi-user real-time generated smoothy performing block world was a whole lot more complex. I started working on this before any rust game engines were mature enough to use, so I built everything pretty much from the ground up.

Although the groundwork laid in YAB-world is quite solid, its features are still pretty much proof of concept and you can't do much more than dig and build with a limited set of blocks. 

![Screenshot](/yab-world/screenshot.png)

# How to run

Download a pre-built version for Windows [here](https://github.com/grunnt/yab-world/releases). Download the ZIP file, unpack it somewhere and run *yab-world.exe*.

## Current features:
- An infinite editable block-world
    - Generated in real-time using 3D noise
    - Server / client multiplayer
    - Generate rough hills (a la original Minecraft), a water world or a flat world
    - Automatic world saving
    - Placing and removing light-emitting blocks
    - View-direction-based prioritization of world generation
- Efficient rendering using OpenGL
    - Easily add block textures, can be different on each side
    - Transparent water
    - Screen Space Ambient Occlusion
    - Day/night cycle with sky dome, sun and dusk & dawn effects and block shading
    - Some particle effects
    - Sunlight propagation
- Interaction
    - Arcade style collision detection and player movement
    - Simple resource gathering and building
    - Built-in profiler for debugging performance issues
    - A basic GUI inspired by [druid](https://docs.rs/druid/latest/druid) with a main menu, settings screen etc.

# Development

The code is open source and available on [GitHub](https://github.com/grunnt/yab-world) (MIT License). It now is a whopping 80k lines of code (which are partially generated, e.g. the OpenGL bindings).

It is written in [Rust](https://www.rust-lang.org). I make extensive use of threading to speed things up and make the client run smoothly, and Rust has been a great help in that. [Fearless concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html) indeed!

## The Z fight (2018)

I started out by following the [Rust and OpenGL from scratch tutorial](https://nercury.github.io/rust/opengl/tutorial/2018/02/08/opengl-in-rust-from-scratch-00-setup.html). This got me going in OpenGL, and after some struggles I got blocks rendered!

![Screenshot 2018](/yab-world/screenshot-2018.png)

The original working title for this was "Octagia". I had some ideas about a revolution involving sloped blocks (octagon, hint), but that didnt turn out to be very interesting.

One thing you can clearly see on this screenshot is a phenomenon called "z-fighting". For the pixels at the corners of the blocks the view z coordinate (roughly the distance from the camera) was identical in most cases, so the renderer would not know which pixel to choose and take a random one instead. I'm not sure whether it was a depth buffer or coordinate rounding issue, but I got it fixed eventually.

Also, the z-fighting shows that initially I rendered *all* block surfaces, even the ones that were not visible. Fixing this is quite easy: simply do not generate a mesh for the sides of the block that are adjacent to another block. If the world is divided into chunks, this is somewhat more difficult as you need to check neighbouring chunks for the border blocks.

Finally, the colors in the screenshot are actually the *normals* of the surfaces. Rendering normals or other values as colors is a great trick in debugging rendering issues.

## Concurrent terrain generation (2019)

From those humble beginnings I moved on to get some actual terrain generated. After experimenting with several approaches I settled in a world generator function that takes an x and y coordinate as input and return a vertical column of blocks (from bedrock to maximum terrain height). This turned out to be optimal both for performance and was conceptually the easiest to work with. 

![Screenshot 2019](/yab-world/screenshot-2019.png)

The terrain on this screenshot is based on a simple heightmap. In the end I got the best results using layered 3D noise and reducing the noise strength proportionally to the world z coordinate, so higher positions would have a smaller chance of containing a block:

```rust
 let noise = self.terrain_noise.get(x as f64, y as f64, z as f64, roughness);
 let noise = noise.powf(2.0);
 let h_factor = (z - terrain_min_z) as f64 / terrain_z_range as f64;
 let block = if noise + h_factor < 0.5 {
   Block::rock_block()
 } else {
   Block::empty_block()
 };
```

This gives a nice and interesting terrain with overhangs and cliffs, pretty similar to how Minecraft terrain was originally generated. One artefact that can occur is "floating islands": small clumps of blocks that are not attached to the terrain but float in the air, something you will be familiar with if you have played Minecraft.

## Building together (2020)

To allow multiple players I had to split up the code in a server and client component. Multiple clients can connect to a single server. The server generates the world and distributes updates on player movements and actions.

![Screenshot 2020](/yab-world/screenshot-2020.png)

## Saving the world through superchunks

The world in memory is divided chunks of 16x16x16 blocks. This is neccessary to keep the meshing of a chunk of blocks fast enough for real-time editing. In YAB-World I store the chunks in vertical "columns" of chunks, and on the server-side these columns are stored in "super chunks" of 32x32 chunks. The super chunks are saved periodically to disk.

These super chunks make sure that only a limited number of files need to be created for each world, which is more efficient. The super chunks are compressed using run-length encoding and snappy compression. Whenever a chunk is requested by a client the server checks an in-memory cache whether it is already loaded, if not it tries to load the chunk from a super chunk. If this fails the chunk is generated anew. 

## Spreading the light

Adding light blocks to the world was also quite a challenge. In many games the lights are calculated in real-time, but in YAB-World the light propagation is precalculated whenever a block is placed or removed. Propagation light is done using a breadth-first search where the strength of the light is reduced for each step away from the light source. Getting this just right requires a lot of tweaking. 

Sunlight is propagated in a similar manner, but starts by propagating light from the top of the world downwards. 

# Ideas for improvements
Before losing inspiration for this project I was pondering a number of improvements to make / things to experiment with:
- Using [GL on whatever (glow)](https://github.com/grovesNL/glow) for gl bindings.
- Use [laminar UDP](https://docs.rs/laminar/latest/laminar) for networking. Currently networking is based on TCP.
- Use [egui](https://github.com/emilk/egui) for gui. 
- Rendering other players and player hands.
- Smoother movement of other players: movement prediction.
- Biomes: I actually made a working protype based on Voronoi cells but it didn't perform well enough.
- World objects (trees, houses).
- Something weird, e.g. change the setting to an asteroid field.
