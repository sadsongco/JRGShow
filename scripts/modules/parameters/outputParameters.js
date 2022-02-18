export const outputParameters = [
  {
    name: 'bg_opacity',
    displayName: 'Background Opacity',
    type: 'val',
    range: [0, 255],
    value: 255,
    tooltip: "This won't change the colour of the background, but lower values will mean less of the previous frame is erased, for a 'smearing' effect",
  },
  {
    name: 'bg_col',
    displayName: 'Background Colour',
    type: 'colour',
    value: '#000000',
  },
  {
    name: 'transitionInTime',
    displayName: 'Fade In Time',
    type: 'val',
    range: [0, 10],
    value: 3,
    step: 0.2,
    tooltip: 'Time in seconds to fade in when setlist item is activated',
  },
  {
    name: 'transitionOutTime',
    displayName: 'Fade Out Time',
    type: 'val',
    range: [0, 10],
    value: 3,
    step: 0.2,
    tooltip: 'Time in seconds to fade out when setlist item is deactivated',
  },
  {
    name: 'bumpChange',
    displayName: 'Bump Transition',
    type: 'toggle',
    value: false,
    tooltip: 'When selected in run show this visualiser will appear immediately - perhaps for changes within a song',
  },
];

export let outputParamVals = {
  bg_opacity: 255,
  bg_col: [0, 0, 0],
  transitionInTime: 3,
  transitionOutTime: 3,
  bumpChange: false,
};