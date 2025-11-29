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
| `badges` | 90s-style badge images (under construction, best viewed in, etc.) |
| `media-player` | Retro media player with visualizer |
| `webring` | Remember webrings? Embed one! |
| `counter` | Animated visitor counter |
| `guestbook` | Embedded guestbook iframe |

### JS Retros (effects)

| Name | Description |
|------|-------------|
| `mouse-trail` | Binary digits follow your cursor |
| `blink` | Makes text blink (the `<blink>` tag lives on!) |
| `marquee` | Scrolling marquee text |
| `wordart` | Microsoft Word 97-style text effects (22 styles!) |
| `table` | Classic table-based layout styling |
| `hampsterdance` | Animated background hamsters |
| `custom-cursor` | Replace the cursor with a custom image |
| `dividers` | Animated GIF dividers between sections |
| `flash` | Full Y2K Macromedia Flash-style site takeover with loader, intro, and navigation |
| `image-rotate` | 3D rotating images (add `data-image-rotate="true"` to img tags) |

### Special

| Name | Description |
|------|-------------|
| `control-panel` | Windows 95-style control panel to toggle retros |

## URL Parameters

Control retros via URL parameters:

```
?retros=badges,dividers,wordart    # Enable specific retros
?retros=all                        # Enable ALL retros (chaos mode)
?retros=none                       # Disable all retros
?retro=badges                      # Single retro (legacy param)
```

Additional parameters:
```
?song=track_name                   # Select specific music track
?viz=psychedelic                   # Visualizer mode: waveform, spectrogram, spectrum, psychedelic, radial
?wordart-style=five                # WordArt style (one through twentytwo)
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

## Files

```
web90/
├── retros.js           # Main JavaScript
├── retros.css          # Styles for all retros
├── retro-elements.html # HTML templates for DOM retros
├── control-panel.html  # Windows 95 control panel template
├── chat-window.html    # AIM-style chat window template
├── badges/             # Badge GIF images
└── dividers/           # Divider GIF images
```

## License

BSD 3-Clause License. Copyright (c) 2025 Yan Shoshitaishvili. See [LICENSE](LICENSE) for details.

Honestly? AI stuff doesn't seem to be copywritable, so this is probably basically public domain in practice.
