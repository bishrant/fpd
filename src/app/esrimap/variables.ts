export const _basemap = 'topo';
export const _center: Array<number> = [-100, 32];
export const _zoom = 8;
export const ptSymbol = {
    type: 'simple-marker',
    color: [10, 10, 10],
    size: 5
};
export const lineSymbol = {
    type: 'simple-line',
    color: '#660404',
    width: 2,
    style: 'dash'
};
// export const masterLegend = [{'Biomass, wood pellet or landscape organic facility': {'type': 'Primary', 'color': 'red'},
// 'Paper mill or chip mill': {'type': 'Primary', 'color': 'blue'},
// 'Plywood, veneer, or oriented strandboard mill': {'type': 'Primary', 'color': 'orange'},
// 'Post, pole, piling, preservative treating plant': {'type': 'Primary', 'color': 'green'},
// 'Sawmill': {'type': 'Primary', 'color': 'purple'},
// 'Other Primary Industry': {'type': 'Primary', 'color': 'black'},
// 'Engineered wood product plant': {'type': 'Secondary', 'color': 'red'},
// 'Millwork, cabinetry, furniture, or flooring plant': {'type': 'Secondary', 'color': 'blue'},
// 'Pallet, container or remanufacture plant': {'type': 'Secondary', 'color': 'orange'},
// 'Panel or wood pellet plant': {'type': 'Secondary', 'color': 'green'},
// 'Preservative treating plant': {'type': 'Secondary', 'color': 'purple'},
// 'Other Secondary Industry': {'type': 'Secondary', 'color': 'black'}];
export const  polylineSymbol = {
    type: 'simple-line',  // autocasts as new SimpleMarkerSymbol()
    color: '#660404',
    width: '2',
    style: 'dash'
  };
export const  polygonSymbol = {
    type: 'simple-fill',  // autocasts as new SimpleMarkerSymbol()
    color: 'rgba(255,0,0, 0.3)',
    style: 'solid',
    outline: { // autocasts as new SimpleLineSymbol()
      color: '#660404',
      width: 1
    }
};
export const pointSymbol = {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    style: 'square',
    color: '#8A2BE2',
    size: '16px',
    outline: { // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 3
    }
  };


export const masterLegend = [{ name: 'Biomass, wood pellet or landscape organic facility', type: 'Primary', color: 'red' },
{ name: 'Paper mill or chip mill', type: 'Primary', color: 'blue' },
{ name: 'Plywood, veneer, or oriented strandboard mill', type: 'Primary', color: 'orange' },
{ name: 'Post, pole, piling, preservative treating plant', type: 'Primary', color: 'green' },
{ name: 'Sawmill', type: 'Primary', color: 'purple' },
{ name: 'Other Primary Industry', type: 'Primary', color: 'black' },
{ name: 'Engineered wood product plant', type: 'Secondary', color: 'red' },
{ name: 'Millwork, cabinetry, furniture, or flooring plant', type: 'Secondary', color: 'blue' },
{ name: 'Pallet, container or remanufacture plant', type: 'Secondary', color: 'orange' },
{ name: 'Panel or wood pellet plant', type: 'Secondary', color: 'green' },
{ name: 'Preservative treating plant', type: 'Secondary', color: 'purple' },
{ name: 'Other Secondary Industry', type: 'Secondary', color: 'black' }];
