+++
title = "Falling Rust"
description = "Making sand fall down using Rust, Bevy and egui."
date = 2021-11-16
+++

Falling Rust is a falling-sand toy written by me using Rust, Bevy and egui. It's a 2D sandbox that is simulating a simplified form of physics.

![Screenshot](/falling-rust/screenshot.png)

## How to run

You can download a Windows executable [here](https://github.com/grunnt/falling-rust/releases).

## Features
- Simulation of many different elements: sand, rock, wood, water, acid, oil, lava, fire, ash, smoke
- Editor with several tools: place circle, square or spray
- 512 x 512 cells sandbox to play around with
- Place a source for any element
- Liquid drains
- Pause and step the simulation
- Clear the level

## What did I use to make this?
The sandbox is programmed in the [Rust](https://www.rust-lang.org/) language. Rust is a safe low-level programming language with nice zero-cost abstractions. It has a steep learning curve, but there's plenty of help available.

[Bevy](https://bevyengine.org/) is an experimental open-source data driven game-engine written in Rust. It is built around an entity component system (ECS). [egui](https://github.com/emilk/egui) is a simple immediate-mode GUI library for rust, which is very easy to integrate into bevy using the [bevy-egui plugin](https://github.com/mvlabat/bevy_egui).

## How does it work?
A falling-sand works like a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton). The world is divided into cells in a grid. For each cell we define a set of simple rules, based on what's in the neighbouring cells. I'll explain this using a few example "elements" that occupy the cells in a falling-sand game.

### Sand

If there is air below sand the sand will fall down. If the cell below the sand is occupied, it can also slide diagonally downwards, if one of these cells contains air:

<img src="/falling-rust/falling-sand-grid.svg" alt="Sand falls down" width="256"/>

<img src="/falling-rust/falling-sand-diagonal.svg" alt="Sand slides diagonally" width="256"/>

These two simple rules result in a nice sand-like behaviour:

<img src="/falling-rust/falling-sand.gif" alt="Falling sand" width="256"/>

### Water

A little more complicated is water. This not only falls down and slides diagonally, but it flows horizontally as well. In other words: if one of the horizontally neighbouring cells contains air, move the water there:

<img src="/falling-rust/water-sideways.svg" alt="Water flows sideways" width="256"/>

This ensures that (eventually) the water will gain an equal level:

<img src="/falling-rust/falling-water.gif" alt="Falling water" width="256"/>

TODO: discuss piles of water, tricks to speed up horizontal flow

### Fire

Elements in a falling sand game can also interact with each other. One example is fire, which is relatively complex. Fire moves in all directions with a tendency upwards (this is done using a random number generator). Other elements that are burnable (like wood or oil) are turned into fire as well if they are fire's neighbours. Fire burns out over time. Some elements, like wood, turn to ash when they burn. And finally, fire generates some smoke.

<img src="/falling-rust/fire-everywhere.svg" alt="Fire moves in all directions" width="256"/>

This set of rules results in nice pseudo-realistic fire:

<img src="/falling-rust/burning-fire.gif" alt="Burning fire" width="256"/>

TODO: discuss strength and variant attributes for cells (needed for e.g. fire and visually interesting rendering).

## The code

The code is open source and available on [GitHub](https://github.com/grunnt/falling-rust).

## Other implementations

Another great falling sand simulator made in rust is [Sandspiel](https://sandspiel.club). This one also runs in the web and has some nice sharing features. If you're interested in this kind of thing you should check it out, along with the accompanying ["Making sandspiel" article](https://maxbittker.com/making-sandspiel).
