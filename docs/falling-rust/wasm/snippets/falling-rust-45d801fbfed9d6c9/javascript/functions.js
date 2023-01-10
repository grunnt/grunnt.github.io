// Based on Bevy Web Utils by Louis (https://lab.lcr.gr/microhacks/bevy-web-utils)
export function bind_touch_events(element) {
    function touch(evt) {
        let bounding_rect = window.document.documentElement.getBoundingClientRect();
        for (const touch of evt.changedTouches) {
            console.log(touch)
            window.touch_events.push({
                id: touch.identifier,
                phase: evt.type,
                position: [bounding_rect.width - touch.pageX, touch.pageY],
            })
        }
    }

    if (window.touch_events == null) {
        window.touch_events = []
        window.touch_handlers = window.touch_handlers || {}
    }

    const el = document.querySelector(element)
    if (el != null) {
        window.touch_handlers[element] = touch
        el.addEventListener('touchstart', touch)
        el.addEventListener('touchend', touch)
        el.addEventListener('touchcancel', touch)
        el.addEventListener('touchmove', touch)
    }
}

export function take_touch_events() {
    if (window.touch_events) {
        let events = window.touch_events
        window.touch_events = []
        return JSON.stringify(events)
    }
    return '[]'
}
