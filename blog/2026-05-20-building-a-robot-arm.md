---
title: building a robot arm from scratch
date: 2026-05-20
description: NEMA steppers, servo joints, and firmware in C — notes from the first prototype.
tag: hardware
---

# building a robot arm from scratch

i've wanted to build a proper multi-DOF arm for ages. here's where the first
prototype landed — and everything that went wrong along the way.

## the plan

a 5-axis arm driven by a mix of stepper and servo joints:

1. base rotation — NEMA 17 + belt reduction
2. shoulder — NEMA 23, geared
3. elbow — NEMA 17
4. wrist — micro servos
5. gripper — single servo, printed linkage

## what worked

the belt reduction on the base was the best decision. smooth, quiet, and
basically zero backlash. the firmware runs on an `ATmega` for now, talking over
`UART`.

| joint    | motor    | status        |
| -------- | -------- | ------------- |
| base     | NEMA 17  | solid         |
| shoulder | NEMA 23  | solid         |
| elbow    | NEMA 17  | sags          |
| wrist    | servo x2 | good enough   |

## what didn't

- the elbow **sags** under load. needs a counterweight or a stronger ratio.
- my first PSU *browned out* the moment two steppers moved at once.
- cable management is, generously, a work in progress.

## next steps

inverse kinematics, so i can hand it a target in XYZ instead of per-joint
angles. that's the fun part — and the next post.
