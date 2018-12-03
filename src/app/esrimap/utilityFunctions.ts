// function to get color
import {masterLegend} from './variables';
const getColor = (attributes) => {
    let _color: string;
    masterLegend.forEach((m) => {
        if (m.name === attributes['SpecificIndustryType']) {
            _color = m.color;
        }
    });
    return _color;
};
const gBorder = {color: [250, 250, 250], width: 1};
export const getSymbol = (attributes) => {
    return {
        type: 'simple-marker',
        color: getColor(attributes),
        style: (attributes['MainIndustryType'] === 'Primary') ? 'circle' : 'square',
        size: 7,
      //  outline: gBorder
    };
};
