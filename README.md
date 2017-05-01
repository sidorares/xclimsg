# xclimsg

[![Greenkeeper badge](https://badges.greenkeeper.io/sidorares/xclimsg.svg)](https://greenkeeper.io/)
send ewmh ClientMessage to x11 window from command line

Currently only `_WM_NET_STATE` message type is supported - see http://standards.freedesktop.org/wm-spec/wm-spec-1.3.html#idm140130317598336

Example:

```
> xclimsg --wid 6291469 --type _NET_WM_STATE --action toggle --prop1 _NET_WM_STATE_MAXIMIZED_VERT
```
