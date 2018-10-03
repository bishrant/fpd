// function to get color
const getColor = (attributes) => {
    return [10, 10, 10];
};
const gBorder = {color: [0, 255, 0], width: 1};
export const getSymbol = (attributes) => {
    return {
        type: 'simple-marker',
        color: getColor(attributes),
        style: (attributes['Prim_secon'] === 'Primary') ? 'circle' : 'square',
        size: 7,
        outline: gBorder
    };
};
