+++
title = "YAB-World"
description = "Yet Another Block World"
date = 2021-12-10
[extra]
blog_icon = "/yab-world/screenshot.png"
+++

The past years I worked on and off on Yet Another Block-World, for fun and to learn more about Rust and OpenGL. Like many developers I saw [Minecraft](https://www.minecraft.net) and wanted to experiment with a block world of my own. 

Although the groundwork laid in YAB-world is quite solid, its features are still pretty much proof of concept and you can't do much more than dig and build with a limited set of blocks. I started working on this before any rust game engines were mature enough to use, so I built everything pretty much from the ground up.

Getting a few blocks rendered on screen is relatively easy. However, creating an infinite fully multi-user real-time generated smoothy performing block world makes things a whole lot more complex.

![Screenshot](/yab-world/screenshot.png)

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

# How to run

Download a pre-built version for Windows [here](https://github.com/grunnt/yab-world/releases). Download the ZIP file, unpack it somewhere and run *yab-world.exe*.

# Development

The code is open source and available on [GitHub](https://github.com/grunnt/yab-world) (MIT License). It now is a whopping 80k lines of code (which are partially generated, e.g. the OpenGL bindings).

It is written in [Rust](https://www.rust-lang.org). I make extensive use of threading to speed things up and make the client run smoothly, and Rust has been a great help in that. Fearless concurrency indeed!

## 2018 - The Z fight

Followed [Rust and OpenGL from scratch tutorial](https://nercury.github.io/rust/opengl/tutorial/2018/02/08/opengl-in-rust-from-scratch-00-setup.html).

![Screenshot 2018](/yab-world/screenshot-2018.png)

- First screenshot
- Called it "Octagia" as working title. Initially some ideas about a sloped blocks revolution (octagon, hint), didnt turn out to be that interesting.
- Normals as colors for debugging
- For graphics it's cool to debug using visual tools

## 2019 - concurrent terrain generation
![Screenshot 2019](/yab-world/screenshot-2019.png)

Generating block columns
- Fastest and easiest
- Noise is expensive
- Best is 3D FBM noise with height factor

## 2020 - client & server
![Screenshot 2020](/yab-world/screenshot-2020.png)


Saving the world through superchunks
- The world is periodically saved server-side. Chunks are grouped in 32x32x32 "super chunks" and compressed using run-length encoding and snappy compression. Worlds are saved per seed. 
- Loading the world: saved chunks are loaded from disk, or from an in-memory cache of recently used super chunks to speed things up. 

Frequent refactoring
- Easy using vs code with rust analyzer

Spreading the light
- Placing and removing lights
- Sunlight and gradients
- Flaw in sun positioning

Mesh mania
- Meshing one of the most expensive tasks
- Done in separate thread that also receives generated chunks
- For meshing neighbouring chunks needed, order is important. Not sure if padding chunks isn't better

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
