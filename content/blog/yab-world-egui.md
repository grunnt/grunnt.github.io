+++
title = "YAB-World & egui"
description = "An improved user interface in YAB-World using egui."
date = 2022-11-06
[extra]
blog_icon = "/yab-world-egui/block-select-gui.jpg"
+++

[Yet Another Block-World](/blog/yab-world) is a prototype infinite fully editable world for multiple players. I wanted to make some improvements to the user interface, but my homebrew UI framework was holding me back. Instead of spending a lot of time improving the UI framework I spent a lot of time switching to the [egui library](https://github.com/emilk/egui).

# What is egui?

The [egui library](https://github.com/emilk/egui) is a "simple, fast, and highly portable immediate mode GUI library for Rust." In an immediate GUI all elements are defined and drawn anew each frame. This in contrast to a retained GUI where the GUI elements are declared, e.g. on initialization, and the library handles most state.

One of the nice things of an immediate mode GUI, and especially egui, is that it is both extremely simple to use and highly flexible. This makes it a good fit for game development. Here's a minimal example of an egui interface:

```rust
// Executed every frame, e.g. in the game update method
egui::SidePanel::left("Main").show(gui, |ui| {
    // The line below concisely defines a button and a click handler
    if ui.button("Play").clicked() {
        // Start a new game
    }
});
```

There are some theoretical benefits and drawbacks for immediate and retained mode GUI libraries, but in practice it mostly boils down to how the library is implemented. In this case egui is extremely well-implemented: it's very simple, flexible and highly performant.

# Why did this take long?

After all, egui is an easy-to-use GUI. Well, in my case I chose to also switch the rendering backend to [glow (GL on Whatever)](https://github.com/grovesNL/glow). This helps me avoid platform-specific rendering code, and allowed me to use the [egui_glow](https://github.com/emilk/egui/tree/master/crates/egui_glow) integration. To do this I had to refactor pretty much every line of rendering code: 129 changed files with 1,236 additions and 453 deletions, according to GitHub. 

# The result

After converting the rendering backend to glow, actually implementing the GUI was a breeze:

![New game gui](/yab-world-egui/new-game-gui.jpg)

The dynamic nature of egui allowed me to easily implement some small additional features, such as a search filter for the block selection screen:

![Block selection gui](/yab-world-egui/block-select-gui.jpg)

Overall I can heartily recommend egui as a pleasant and powerful GUI library!

The new release is available [here](https://github.com/grunnt/yab-world/releases).