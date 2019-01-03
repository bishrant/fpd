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
export const getSymbol = (attributes) => {
    return {
        type: 'simple-marker',
        color: getColor(attributes),
        style: (attributes['MainIndustryType'] === 'Primary') ? 'circle' : 'square',
        size: 7,
      //  outline: gBorder
    };
};
