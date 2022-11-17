+++
title = "Java4K games"
description = "Three tiny games in four kilobytes each, written in particularly unreadable Java code."
date = 2022-11-09
[extra]
blog_icon = "/java4k/java4k-logo.jpg"
+++

Java4K was an online competition in which game programmers would try to create the best game possible in Java. I made three small games for this contest.

# My submissions

I wrote three tiny games for the 2012 and 2013 contests (one of which was improved and resubmitted a year later):

![List of games by Grunnt on Java4K website](/java4k/games-by-grunnt.jpg)

## Galactic Conquest 4K - strategy

![Galactic Conquest 4K screenshot](/java4k/gc4k.jpg)

> The year is 4096 and all hell just broke loose. Xenophobia got the upper hand, and now all races in the known galaxy are at war. Cruisers are cruising, blasters are blasting and aliens are screaming. There is no surrender, only extermination or victory!

The goal of the game is simple: conquer the galaxy. There are three opponents which will try to do the same. Gameplay is relatively easy: click a star to select it, then click another star to ships to that star. Each star builds new space ships over time.

I added some complexity to make things more interesting: you can select whether to move 1, half or all ships, a star builds infrastructure which increases ship building speed, and you can create a limited number of starbases for chokepoint defense.

I put a lot of love in this one, and it shows in some nice details. I managed to squeeze in an options screen where difficulty, game mode and race color could be chosen. The game itself looks colorful and interesting, and is really easy to get into, yet it does have a bit of depth. A semitransparent graph in the bottom of the screen shows the relative strengths of the opponents.

I made a basic version for the 2012 contest and a much improved on for the 2013 contest. Quite a few people found Galactic Conquest addictive, myself included.

## Farmer John and the Birds 4K - point and click shooter

![Farmer John 4K screenshot](/java4k/farmer-john4k.jpg)

> Farmer John wakes up to find a swarm of nasty birds coming to eat all his precious corn. Help him kill them all before it's too late!

This one was a bit simpler but still fun. Waves of birds move from the top of the screen towards your cornfield (much like space invaders). You need to shoot them all before they eat the corn.

What made this a bit more interesting is that the birds *avoid* the mouse cursor used to aim the farmer's gun. They also look in the direction of the cursor, which was kind of cute, and a little detail that brought the game alive. 

The difficulty of the waves increases over time, some upgrades drop, and new types of birds arrive. It becomes quite hectic over time.

## Wizzy 4K - platformer with a twist

![Wizzy 4K screenshot](/java4k/wizzy4k.jpg)

> "Wizzy, like most students, didn't pay attention in the boring dark magic classes. Which is a pity, because one of his fellow students did. And he took over the University, turning all teachers and students into green slimy monsters while Wizzy was taking a nap! Not knowing any offensive spells, Wizzy has no chance of beating the Evil Guy. Not that he wants to anyway, he just wants to get out! The only spells Wizzy knows are gravity inversion spells, which he thought were rather neat. Help him get out alive using these spells!

For this game I wanted to try making a platformer. The goal is simply to reach the exit of each leve. To make things more interesting the player can use two spells (if mana crystals are picked up first). One spell inverts gravity for the player, the other for everything else. This resulted in some nice puzzles, even though the number of available levels was limited.

# How it's made

Read more about how I made these games [here](/blog/making-java4k). The source code can be found [here](https://github.com/grunnt/java4k).