# web90: Bringing the web back to the 90s!

[Github](https://github.com/zardus/web90)
[Deployment](https://yancomm.net/web90)

⚠️ **Warning**: This entire project was 100% vibecoded. Proceed with appropriate expectations.

A drop-in JavaScript library that adds nostalgic 90s/2000s web aesthetics to any website.
Relive the glory days of GeoCities, AngelFire, and the early web with animated GIFs, visitor counters, mouse trails, WordArt, and more.

## Why?

Because the modern web is boring.
Remember when websites had personality?
When every page had a visitor counter, an "under construction" GIF, and a guestbook?
When cursors left trails and text blinked?
web90 brings that energy back.

Use it for:
- Adding retro flair to your personal site
- April Fools' day pranks
- Nostalgia trips
- Making your professor's eyes twitch

## Quick Start

### Option 1: Use the hosted version (easiest)

Just add these two lines to your page:

```html
<link rel="stylesheet" href="https://yancomm.net/web90/retros.css">
<script src="https://yancomm.net/web90/retros.js"></script>
```

### Option 2: Self-host

Clone this repo into your site, then:

```html
<link rel="stylesheet" href="web90/retros.css">
<script src="web90/retros.js"></script>
```

### Then...

1. Add a slot for retro elements:

```html
<div data-retro-slot="0"></div>
```

2. That's it! Visit your page with `?retros=badges` or any other retro name.

## Available Retros

### DOM Retros (visual elements)

| Name | Description |
|------|-------------|
| `badges` | 90s-style badge images (under construction, vim, any browser, AIM) |
| `media-player` | Retro media player with audio visualizer |
| `webring` | Remember webrings? Embed one! |
| `counter` | Animated visitor counter with glitch effect |
| `guestbook` | Embedded guestbook iframe |

### JS Retros (effects)

| Name | Description |
|------|-------------|
| `mouse-trail` | Characters/emojis follow your cursor (12 styles!) |
| `blink` | Makes h1 text blink (the `<blink>` tag lives on!) |
| `marquee` | Scrolling marquee h1 text |
| `wordart` | Microsoft Word 97-style text effects (22 styles!) |
| `custom-cursor` | Replace the cursor with a retro image |
| `dividers` | Animated GIF dividers between sections (8 included) |
| `image-rotate` | 3D rotating images (add `data-image-rotate="true"` to img tags) |
| `retheme` | Full page theme transformation (8 themes!) |
| `perspective` | 3D tilt effect - page follows your mouse |
| `glitch` | VHS-style glitch overlay effect |

### Special

| Name | Description |
|------|-------------|
| `control-panel` | Windows 95-style control panel to toggle retros |

## Mouse Trail Styles

Use `?trail-style=NAME` to pick a specific style:

| Style | Description |
|-------|-------------|
| `binary` | Classic 0s and 1s (with rare 2s) |
| `sparkles` | Rainbow sparkle characters |
| `fire` | 🔥 Fire emojis rising up |
| `rainbow` | Colorful dots with hue cycling |
| `stars` | ⭐ Star emojis |
| `hearts` | 💖 Heart emojis |
| `neon` | Glowing neon shapes |
| `bubbles` | Rising bubble circles |
| `snow` | ❄️ Falling snowflakes |
| `matrix` | Falling Matrix-style katakana |
| `ghost` | Fading ghost cursor trail |
| `elastic` | Stretchy cursor trail |

## Page Themes

Use `?theme=NAME` with the `retheme` retro:

| Theme | Description |
|-------|-------------|
| `matrix` | Falling green Matrix rain background |
| `crt` | CRT monitor scanlines and screen curvature |
| `neon` | Neon cyberpunk lines |
| `y2k` | Chrome/Y2K floating emoji shapes |
| `hampsterdance` | Tiled dancing hampster background |
| `table` | Classic table-based layout styling |
| `flash` | Full Macromedia Flash-style site takeover with loader, intro, and navigation |
| `snow` | TV static/snow overlay |

## URL Parameters

Control retros via URL parameters:

```
?retros=badges,dividers,wordart    # Enable specific retros
?retros=all                        # Enable ALL retros (chaos mode)
?retros=none                       # Disable all retros
?retros=april-fools                # Random chaos mode
?retro=badges                      # Single retro (legacy param)
```

Style parameters:
```
?song=track_name                   # Select specific music track
?viz=psychedelic                   # Visualizer: waveform, spectrogram, spectrum, psychedelic, radial
?wordart-style=five                # WordArt style (one through twentytwo)
?cursor-style=hourglass            # Cursor: custom, hourglass
?trail-style=matrix                # Trail style (see list above)
?theme=flash                       # Page theme (see list above)
?divider-style=3                   # Specific divider (1-8)
```

## Configuration

Configure web90 by setting `window.WEB90_CONFIG` before loading the script:

```html
<script>
  window.WEB90_CONFIG = {
    // Custom badge images
    badges: [
      { src: '/badges/construction.gif' },
      { src: '/badges/netscape.gif', href: 'https://firefox.com' },
      { src: '/badges/chat.gif', onclick: 'openChatWindow' }
    ],

    // Divider images for the dividers retro
    dividers: [
      '/dividers/rainbow.gif',
      '/dividers/fire.gif'
    ],

    // Music tracks for the media player
    music: [
      { src: '/music/song.ogg', label: '♪ My Song' }
    ],

    // URLs for iframe-based retros (leave empty to disable)
    webringUrl: 'https://example.com/webring',
    guestbookUrl: 'https://example.com/guestbook',
    chatUrl: 'https://example.com/chat',

    // Custom cursor image URL (leave empty to disable)
    cursorUrl: '/cursor.png',

    // Text that glitches on the visitor counter (leave empty to disable)
    counterGlitchText: 'My Fans',

    // Limit which retros can be randomly selected (when no ?retros= param is set)
    // null/omitted = all retros; empty array = no retros; array = only these retros
    randomRetros: ['badges', 'counter', 'wordart', 'dividers'],

    // Limit which retros can appear on April Fools day (same rules as randomRetros)
    aprilFoolsRetros: null
  };
</script>
<script src="web90/retros.js"></script>
```

All config options are optional. Sensible defaults are provided.

## Multiple Slots

For complex layouts, you can distribute retro elements across multiple slots:

```html
<div data-retro-slot="0"></div>  <!-- Primary slot -->
<div data-retro-slot="1"></div>  <!-- Overflow slot -->
<div data-retro-slot="2"></div>  <!-- Additional slot -->
```

When multiple DOM retros are enabled, they'll be distributed across available slots.

## Dividers

Add dividers between sections of your page:

```html
<div class="divider"><hr></div>
```

When the `dividers` retro is enabled, the `<hr>` is replaced with a tiling animated GIF. Otherwise, it's just a normal horizontal rule.

## Control Panel

Enable the Windows 95-style control panel with `?retros=control-panel` (or include it in your retro list). This gives users a GUI to toggle retros on and off.

**Easter eggs**: Enter the Konami code (↑↑↓↓←→←→BA) or swipe up from the bottom of the screen on mobile to open the control panel without URL params.

## Files

```
web90/
├── retros.js           # Main JavaScript
├── retros.css          # Styles for all retros
├── retro-elements.html # HTML templates for DOM retros
├── control-panel.html  # Windows 95 control panel template
├── chat-window.html    # AIM-style chat window template
├── hampsters.gif       # Hampster dance animation
├── badges/             # Badge GIF images (4 included)
├── cursors/            # Cursor PNG images (win95, hourglass)
└── dividers/           # Divider GIF images (8 included)
```

## License

BSD 3-Clause License. Copyright (c) 2025 Yan Shoshitaishvili. See [LICENSE](LICENSE) for details.

Honestly? AI stuff doesn't seem to be copywritable, so this is probably basically public domain in practice.
