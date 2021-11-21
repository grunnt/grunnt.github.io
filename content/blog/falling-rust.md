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
A falling-sand works like a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton). The world is divided into cells in a grid. For each cell we define a set of simple rules, based on what's in the neighbouring cells. For example:

![Sand falls down](/falling-rust/falling-sand-grid.svg)



A falling sand simulator 

Another great falling sand simulator made in rust is [Sandspiel](https://sandspiel.club). If you're interested in this kind of thing you should check it out, along with the accompanying ["Making sandspiel" article](https://maxbittker.com/making-sandspiel).
Cellular automata.

Sand falls down and slides diagonally.

<img src="/falling-rust/falling-sand.gif" alt="Falling sand" width="256"/>

Water falls down, diagonally but also sideways. Problem: piles of water.

<img src="/falling-rust/falling-water.gif" alt="Falling water" width="256"/>

Fire moves in all directions with a tendency upwards. It turns burnable elements into fire. Burns out over time.

<img src="/falling-rust/burning-fire.gif" alt="Burning fire" width="256"/>
 
The code is on [GitHub](https://github.com/grunnt/falling-rust).