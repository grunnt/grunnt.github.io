+++
title = "Falling Rust"
description = "Making sand fall down using Rust, Bevy and egui."
date = 2021-10-31
+++

Falling-sand game written in Rust, Bevy and egui.

![Screenshot](/falling-rust/screenshot.png)

Simulating simplified physics. The code is on [GitHub](https://github.com/grunnt/falling-rust).

## Features
- Simulation of many different elements: sand, rock, wood, water, acid, oil, lava, fire, ash, smoke
- Editor with several tools: place circle, square or spray
- 512 x 512 cells sandbox to play around with
- Place a source for any element
- Liquid drains
- Pause and step the simulation
- Clear the level

## What did I use to make this?
[Rust](https://www.rust-lang.org/) is a safe low-level programming language with nice zero-cost abstractions. It has a steep learning curve, but helps you along. [Bevy](https://bevyengine.org/) is an open-source data driven game-engine written in Rust. It is built around an entity component system (ECS). [egui](https://github.com/emilk/egui) is a simple immediate-mode GUI library for rust. Very easy integration into bevy using [bevy-egui plugin](https://github.com/mvlabat/bevy_egui).

## How does it work?
A Falling sand simulator 

Another great falling sand simulator made in rust is [Sandspiel](https://sandspiel.club). If you're interested in this kind of thing you should check it out, along with the accompaning ["Making sandspiel" article](https://maxbittker.com/making-sandspiel).
Cellular automata.

Sand falls down and slides diagonally.

![Falling sand](/falling-rust/falling-sand.gif)

Water falls down, diagonally but also sideways. Problem: piles of water.

![Falling water](/falling-rust/falling-water.gif)

Fire moves in all directions with a tendency upwards. It turns burnable elements into fire. Burns out over time.

![Burning fire](/falling-rust/burning-fire.gif)
