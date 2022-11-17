+++
title = "Making of Java4K games"
description = "Using ugly code to create lots of fun in few bytes."
date = 2022-11-17
[extra]
blog_icon = "/java4k/java4k-logo.jpg"
+++

Java4K was an online competition in which game programmers would try to create the best game possible in Java. I made three small games for this contest. You can see and download them [here](/projects/java4k).

# The contest

Java4K was an online competition in which game programmers would try to create the best game possible in Java. The catch was that there is a 4KB limit to the resulting jar binary, which is the smallest file size possible on most operating systems. The fun thing is that this limitation gives the programmer certain boundaries to work with, resulting in higher productivity and stimulating creative solutions.

The goal of this contest was *not* to create beautiful code, as the tricks used to reduce code size often resulted in ugly code devoid of any best practice. For example, it does not use fancy luxuries such as placing classes in packages. Still, squeezing the last drop of fun and performance from a very limited amount of code was fun in itself.

This contest ran from 2005 to 2013. Games were released as Java Applets, which could be run directly in the browser. The cool thing is that all the games were playable directly from the website, and visistors could leave comments and vote. After it became clear that Java Applets would be deprecated (as of Java 9), the contest eventually ended.

# Optimizing for size

To reduce the size of the final binary I had to use some tricks you would normally never use while developing an application. For example, I avoided the use of fancy luxuries such as classes since each class adds a bit of overhead. A key point was to be able to rapidly iterate so that I would quickly be able to see whether I reached the 4K boundary.

## Embedding images

The Wizzy game had a sprite sheet with a number of images used for rendering. To avoid the PNG file overhead I used a small utility class to convert the PNG images to a String that could be easily embedded inside the game source code. In addition, a palette array would be printed that would map the values in the String to actual colors for use rendering. 

```java
 private final int[][] palette = new int[][]{{119, 2, 47}, {188, 0, 221}, {255, 255, 255}, // And so on...
 private final static String spriteSheetString = "\u0000\u0000\u0000\u0000\u0000\u0001" // And so on...
```

Even though I would lose the lossless compression of the PNG format, the resulting jar file would be compressed anyway using a different approach.

## Generating sounds

Another rather neat way to save space was to procedurally generate some simple sounds (beep, crash). The nice thing about the extensive Java
runtime library is that it even has some easy to use tools for this. For example, this is how I made a "gun" like sound for Farmer John & The Birds:

```java

  Clip gunSound; // The variable used to control playback
  
  {
    // Buffer for the audio sample
    byte[] gunSoundData = new byte[3000];

    // Generate a simplistic boom using random noise
    float cycle = 0f;
    float cycleStep = 8f / 16000f;
    for (int i = 0; i < gunSoundData.length; i++) {
      gunSoundData[i] = (byte) ((cycle - 0.5f) * random.nextInt(250) * (1f - i / (float) gunSoundData.length));
      cycle = (cycle + cycleStep) % 1f;
      cycleStep += 0f;
    }

    // Convert it to a sound clip
    AudioFormat audioFormat8 = new AudioFormat(8000, 8, 1, true, true);
    gunSound = AudioSystem.getClip();
    gunSound.open(audioFormat8, gunSoundData, 0, gunSoundData.length);
  }

  // Play the sound (repeat this part only)
  gunSound.setFramePosition(0); // rewind to the beginning
  gunSound.start();

```

## Crazy build chains

Writing Java code efficiently was not sufficient to reduce the size of the resulting jar file. Additional tricks were also employed to compress the resulting jar, using e.g. the Proguard Java Obfuscator, pack200 (a JAR packing tool) and different compression tools to generated a gzipped jar file. The smallest gzipped jar would be chosen and deployed to the web.

![Build chain schematic](/java4k/build-chain.png)

## Being creative

This was the best part. All technical tricks won't help much if the game was not fun. I found the limitations posed by the size constraints to be stimulating: it puts the focus really well on what matters, which is creating a game that is fun first. Without constraints it is so easy to spend way too much time building a game engine or polishing unimportant details. I'm quite happy with the little games that were the result, as there's some actual fun to be had.

# Source code

The source code is available [here](https://github.com/grunnt/java4k) under the permissive MIT license (do not expect clean code, however). Since Java Applets are no longer supported I rewrote the code a bit to allow the games to be run as a desktop application.