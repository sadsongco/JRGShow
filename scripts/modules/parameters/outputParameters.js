export const outputParameters = [
    {
        name: "bg_opacity",
        displayName: "Background Opacity",
        type: "val",
        range: [
            0, 255
        ],
        value: 255
    },
    {
        name: "bg_col",
        displayName: "Background Colour",
        type: "colour",
        value: "#000000",
    },
    {
        name: "transitionInTime",
        displayName: "Fade In Time",
        type: "val",
        range: [
            0, 10
        ],
        value: 3,
        step: 0.2
    },
    {
        name: "transitionOutTime",
        displayName: "Fade Out Time",
        type: "val",
        range: [
            0, 10
        ],
        value: 3,
        step: 0.2
    },
]

export let outputParamVals = {
    bg_opacity: 255,
    bg_r: 0,
    bg_g: 0,
    bg_b: 0,
    transitionInTime: 3,
    transitionOutTime: 3
};