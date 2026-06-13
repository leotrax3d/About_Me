---
title: hello, world
date: 2026-06-13
description: first post — why this blog exists and how it works under the hood.
tag: meta
---

# hello, world

welcome to the corner of the internet where i write down the stuff i build,
break, and occasionally fix.

## why a blog

i make a lot of things — **robots**, web apps, physics sims, and a homelab
that's _slightly_ out of control. most of it never gets written down. this is
me trying to change that.

expect:

- build logs from the robot arm
- homelab notes (and the inevitable `docker compose` horror stories)
- 3d printing tips i wish someone had told me earlier
- the occasional half-baked idea

## how it works

this whole blog is just markdown files sitting in a `/blog` folder. drop a new
`.md` file, push it, and it shows up here automatically — sorted by date and
rendered in the site theme.

> simplicity is a prerequisite for reliability.
> — dijkstra, as always

a tiny taste of code, because why not:

```js
const make = (idea) => {
  while (!idea.works) idea.iterate();
  return idea.shipIt();
};
```

that's it for now. more soon.
