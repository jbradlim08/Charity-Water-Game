# Charity Water Game

A snake-style browser game built for **charity: water** awareness.

Players control a water train, collect clean water, avoid wasted water, and race against the timer.

## Gameplay Summary

- Collect the **clean water** block before it expires.
- If clean water is not collected in time, it becomes **dirty water** and increases the dirty score.
- Every clean water pickup adds 1 growth charge.
- At **3 growth charges**, the train grows and your clean score increases by 1.
- Hitting the wall or your own train ends the game.
- If the countdown reaches 0, the round ends with a time-up result.

## HUD Guide

- Top-left icons:
  - `clean_water.png` + number = clean water collected score
  - `dirty_water.png` + number = dirty/wasted water score
- Center emoji + status text:
  - `Good` when clean score >= dirty score
  - `Risk` when dirty score is higher
- Top-right clock + number = seconds remaining

## Controls

### Desktop

- Arrow keys
- `W`, `A`, `S`, `D`

### Mobile / Touch

- Swipe anywhere from your screen

## Difficulty Modes

- **Easy**: 60s round, slower movement, slower clean-to-dirty conversion
- **Medium**: 90s round, faster movement, faster conversion
- **Hard**: 120s round, fastest movement, fastest conversion, smaller unit size

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API

## Project Structure

```text
.
├── index.html      # Game layout and HUD
├── style.css       # Styling and responsive layout
├── script.js       # Game logic, controls, rendering, audio cues
└── media/
    ├── clean_water.png
    └── dirty_water.png
```

## Run Locally

1. Clone or download this repository.
2. Open `index.html` in a browser.

No build step or package installation is required.
