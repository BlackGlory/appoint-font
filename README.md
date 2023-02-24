# Appoint Font
![appoint-font-logo]

The easiest font setting extension.

[appoint-font-logo]: src/assets/images/icon-128.png

## Supported browsers and platforms
- [x] [Chrome]
- [x] [Edge]

[Chrome]: https://chrome.google.com/webstore/detail/lmjdabbpgabigbonekfpjhfgjekpnkge
[Edge]: https://microsoftedge.microsoft.com/addons/detail/dclbmfdeofbiogggabbggfochlhcmppa

## FAQ
### How does it work?
It works by dynamically generating `@font-face` rules and injecting them into the page.

### Does it break web fonts?
This extension will not break web fonts,
unless the corresponding web font is already installed locally.

### The font I wanted to use didn't work, while other fonts did.
Chromium-based browsers have issues with font support,
which causes some local fonts to not be used in `@font-face`.

Upon research, new font technologies such as variable fonts do not seem to trigger the issue.
Popular fonts usually release their variable font versions,
it is recommended that you download and install the latest version of them.
