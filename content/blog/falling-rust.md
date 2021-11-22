+++
title = "Falling Rust"
description = "Making sand fall using Rust, Bevy and egui."
date = 2021-11-16
[extra]
blog_icon = "/falling-rust/screenshot.png"
+++

After seeing the falling sand simulator [Sandspiel](https://sandspiel.club), along with the accompanying ["Making sandspiel" article](https://maxbittker.com/making-sandspiel), I just had to make one of my own! I'm fascinated by how a set of simple rules can result in such complex behaviour.

On this page I describe my own falling-sand toy, written using Rust, Bevy and egui. It's a 2D sandbox that is simulating a simplified form of physics.

![Screenshot](/falling-rust/screenshot.png)

## How to run

You can download a Windows executable [here](https://github.com/grunnt/falling-rust/releases). Unfortunately I do not have Linux or Mac executables, but the code should compile on these platforms. 

## Features
- 512 x 512 cells sandbox to play around with
- Simulation of many different elements: sand, rock, wood, water, acid, oil, lava, fire, ash, smoke
- Sources for several liquids which generate an infinite supply of the liquid
- Liquid drains: a "black hole" which will make neighbouring liquids disappear
- A "life" element that functions somewhat like Conway's "game of life" (it also burns)
- Editor with several tools: place circle, square or spray in different sizes
- Pause and step the simulation
- Clear the sandbox

## What did I use to make this?
The sandbox is programmed in the [Rust](https://www.rust-lang.org/) language. Rust is a safe low-level programming language with nice zero-cost abstractions. It has a steep learning curve, but there's plenty of help available. It comes with a wonderful package manager called [Cargo](https://doc.rust-lang.org/cargo/) that makes managing dependencies and building applications a breeze.

[Bevy](https://bevyengine.org/) is an experimental open-source data driven game-engine written in Rust. It is built around an entity component system (ECS). [egui](https://github.com/emilk/egui) is a simple immediate-mode GUI library for rust, which is very easy to integrate into bevy using the [bevy-egui plugin](https://github.com/mvlabat/bevy_egui). They all work together quite elegantly.

## How does it work?
A falling-sand works like a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton). The world is divided into cells in a grid. For each cell we define a set of simple rules, based on what's in the neighbouring cells. I'll explain this using a few example "elements" that occupy the cells in a falling-sand game. Each element is governed by its own set of rules.

### Sand

Sand will fall down if the cell below is empty. It will also slide diagonally down if there is room:

<img src="/falling-rust/falling-sand-grid.svg" alt="Sand falls down" width="256"/>

<img src="/falling-rust/falling-sand-diagonal.svg" alt="Sand slides diagonally" width="256"/>

These two simple rules result in a nice sand-like behaviour where piles of sand are formed:

<img src="/falling-rust/falling-sand.gif" alt="Falling sand" width="256"/>

### Water

Water is a little more complicated. Water not only falls down and slides diagonally, but it flows horizontally as well. In other words: if one of the horizontally neighbouring cells contains air, move the water there:

<img src="/falling-rust/water-sideways.svg" alt="Water flows sideways" width="256"/>

This ensures that (eventually) the water will gain an equal level:

<img src="/falling-rust/falling-water.gif" alt="Falling water" width="256"/>

### Fire

Elements in a falling sand game can also interact with each other. One example is fire, which is relatively complex. Fire moves in all directions with a tendency upwards (this is done using a random number generator). Other elements that are burnable (like wood or oil) are turned into fire as well if they are fire's neighbours. Fire burns out over time. Some elements, like wood, turn to ash when they burn. And finally, fire generates some smoke.

<img src="/falling-rust/fire-everywhere.svg" alt="Fire moves in all directions" width="256"/>

This set of rules results in nice pseudo-realistic fire:

<img src="/falling-rust/burning-fire.gif" alt="Burning fire" width="256"/>

## The code

The code is open source and available on [GitHub](https://github.com/grunnt/falling-rust).