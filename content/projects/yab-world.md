+++
title = "YAB-World"
description = "Yet Another Block World created using Rust and OpenGL."
date = 2021-12-10
[extra]
blog_icon = "/yab-world/screenshot.png"
+++

Yet Another Block-World is a prototype infinite fully editable world for multiple players. It is not by any means a finished game, but can be a fun toy to fool around with.

<!-- more -->

![Screenshot](/yab-world/screenshot.png)

<a href="https://github.com/grunnt/yab-world/releases" target="_blank" class="action-button">Download for Windows</a>
<a href="https://github.com/grunnt/yab-world" target="_blank" class="action-button">Source code</a>

# Controls

- Look around using mouse
- Left mouse button: mine blocks
- Right mouse button: place blocks
- WASD = movement
- Space = jump
- Tab = select block
- L = toggle line rendering
- K = toggle fog rendering
- X = toggle mouse capture
- Shift + F = toggle "god mode" which enables flight and disables collision detection
- Escape = return to menu

## Features:
- An infinite editable block-world, generated in real-time using 3D noise
- Different world types: rough hills (a la original Minecraft), an alien ice landscape, a water world or a flat world
- Arcade style collision detection and player movement
- Simple resource gathering and building
- Placing and removing light-emitting blocks
- Server / client multiplayer
- Automatic world saving
- Efficient rendering using OpenGL, allowing huge render distances
- Day/night cycle with sky dome, sun and dusk & dawn effects and block shading
- Screen Space Ambient Occlusion (SSAO)
- Transparent water
- Some particle effects
- GUI based on [egui](https://github.com/emilk/egui)
- Built-in visual profiler

There are some obvious things missing in this prototype such as rendering of the player's hands or other players. There are no different biomes. And of course, there is no meaningful gameplay. Still, it's nice to fool around and build things!

# Development

The code is open source and available on [GitHub](https://github.com/grunnt/yab-world) (MIT License). It now is a whopping 80k lines of code (which are partially generated, e.g. the OpenGL bindings).

It is written in [Rust](https://www.rust-lang.org). I make extensive use of threading to speed things up and make the client run smoothly, and Rust has been a great help in that. [Fearless concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html) indeed!

Read more about the development of YAB-World:
- [YAB-World procedural generation](/blog/yab-world-generation)
- [YAB-World procedural objects](/blog/yab-world-objects)