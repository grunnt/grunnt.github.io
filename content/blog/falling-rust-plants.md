+++
title = "Growing plants in Falling Rust"
description = "Plants that grow upwards in a cellular automata world."
date = 2022-11-20
[extra]
blog_icon = "/falling-rust/plants-growing.gif"
+++

Falling Rust is a falling-sand toy I wrote. You can read more about it and download the application [here](/projects/falling-rust).

After receiving my first pull request for this toy (yay!) that added a simple plant element (growing where water was), I figured that I could make these plants a little bit more interesting based on some ideas I had lying around. 

# The goal

Instead of filling all space where water was I rather would have the plant grow upwards, and not stop growing after some time. Also, I'd like to have a "seed" that would turn into a plant whenever it was in contact with sand and water.

# Data structure 

Since Falling Rust is a cellular automata world, it consists of a grid of cells where each cell is governed by a somewhat simple set of rules. In addition each cell knows about the neighbouring cells. Each cell consists of a certain element (e.g. sand, rock, water, fire) that determines what it looks like and how it behaves. It also has a bit of state that allow for a little more complex behaviour:

```rust
pub struct Cell {
    pub element: Element,
    pub variant: u8,   // Usually used for bringing some variance in colors
    pub strength: u8,  // To limit the life of elements such as fire, smoke or plants
    pub visited: bool,
}
```

# Plant behaviour

Each element in the falling-sand world has its own update function with the following signature:

```rust
fn update_element(x: usize, y: usize, level: &mut SandBox) -> bool {
    // Update the element, using "level" to learn more about neighbouring elements
    // Return true if the element was changed
    false
}
```
During the simulation phase of each frame the code iterates over all cells in the grid and calls the appropriate update function based on its element, and sometimes on the state fields `variant` and `strength` as well.

The function for plants is one of the most extensive:

```rust
fn update_plant(x: usize, y: usize, level: &mut SandBox) -> bool {
    // Get a random value which we reuse several times, since random is relatively expensive
    let random = level.random(1000);
    // Get cell strength ("growth energy left") and variant ("distance from root")
    let (cell_strength, cell_variant) = {
        let cell = level.get(x, y);
        (cell.strength, cell.variant)
    };
    if cell_variant <= 1 {
        // This cell is at the tip. Sometimes the tip turns into a new seed.
        if random > 990 {
            level.set_element(x, y, Element::Seed);
        }
    }

    // Are we still attached to the plant?
    let mut attached = false;
    if cell_variant == Element::Seed.strength() {
        // Root cell
        attached = true;
    } else {
        // Check neighbours: if there is one which is closer to the root then we consider this cell "attached"
        for (nx, ny) in [(x - 1, y), (x + 1, y), (x, y + 1), (x, y + 1)] {
            let neighbour = level.get(nx, ny);
            if neighbour.element == Element::Plant && neighbour.variant > cell_variant {
                attached = true;
                break;
            }
        }
    }
    if !attached {
        // Not attached to the plant, so die
        level.set_element(x, y, Element::Ash);
        return true;
    }
    if cell_strength <= 1 {
        // Not growing anymore
        return false;
    }
    // Plant is still growing (at random intervals)
    if random > 970 {
        // Get random growth direction: up, left or right
        let random = random - 980;
        let (nx, ny) = match random {
            0 | 1 => (x - 1, y),
            2 | 3 => (x + 1, y),
            _ => (x, y - 1),
        };
        // Grow in that direction (if possible)
        let other_element = level.get(nx, ny).element;
        let new_cell_strength = cell_strength - 1;
        if other_element.allows_plant_growth() {
            level.set_element_with_strength(nx, ny, Element::Plant, new_cell_strength);
            level.get_mut(nx, ny).variant = cell_variant - 1;
            level.reduce_strength(x, y, new_cell_strength);
        }
    }
    false
}
```

In addition I made a "seed" element that turns into a plant whenever is neighbours contain water and nutrition. Determining this wat quite simple:

```rust
let mut nutrition = false;
let mut water = false;
for (nx, ny) in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)] {
    let neighbour_element = level.get(nx, ny).element;
    if !nutrition && neighbour_element.plant_nutrition() {
        nutrition = true;
    }
    if !water && neighbour_element.plant_watering() {
        water = true;
    }
}
```

Here `plant_nutrition` and `plant_watering` are functions of the element that return whether it supplies nutrition or, basically, is water. I was thinking of adding wet and dry sand as well, but haven't bothered yet.

The result using these functions is quite nice: whenever a seed comes into contact with water and nutrition (e.g. sand or ash), it turns into a plant an grows upwards. Once it is fully grown a seed is generated at its tip. This seed usually falls down and sometimes turns into a new plant:

<img src="/falling-rust/plants-growing.gif" alt="Plants growing animation" width="256"/>

You can now play with the plant element, and all other elements, by downloading [Falling Rust](/projects/falling-rust).