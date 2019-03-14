export const _basemap = 'topo';
export const _center: Array<number> = [-100, 31];
export const _zoom = 7;
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

export const pointSymbol = {
  type: 'simple-marker',
  style: 'circle',
  color: '#8A2BE2',
  size: '4px',
};

export const emptypointSymbol = {
  type: 'simple-marker',
  style: 'circle',
  color: '#8A2BE2',
  size: '0px',
};

export const polylineSymbol = {
  type: 'simple-line',
  color: '#8A2BE2',
  width: '2',
  style: 'solid',
  cap: 'butt'
};

export const polygonSymbol = {
  type: 'simple-fill',
  color: 'rgba(138,43,226, 0.05)',
  style: 'solid',
  outline: {
    color: '#8A2BE2',
    width: 1
  }
};

export const masterLegend = [{ name: 'Biomass, wood pellet or landscape organic facility', type: 'Primary', color: '#04f704', order: 1 },
{ name: 'Paper mill or chip mill', type: 'Primary', color: '#6909ed', order: 2 },
{ name: 'Plywood, veneer, or oriented strandboard mill', type: 'Primary', color: '#f97c04', order: 3 },
{ name: 'Post, pole, piling, preservative treating plant', type: 'Primary', color: '#adad3a', order: 4 },
{ name: 'Sawmill', type: 'Primary', color: '#680944', order: 5 },
{ name: 'Other Primary Industry', type: 'Primary', color: '#bbbdc1', order: 6 },
{ name: 'Engineered wood product plant', type: 'Secondary', color: '#04f704', order: 1 },
{ name: 'Millwork, cabinetry, furniture, or flooring plant', type: 'Secondary', color: '#6909ed', order: 2 },
{ name: 'Pallet, container or remanufacture plant', type: 'Secondary', color: '#f97c04', order: 3 },
{ name: 'Panel or wood pellet plant', type: 'Secondary', color: '#adad3a', order: 4 },
{ name: 'Preservative treating plant', type: 'Secondary', color: '#680944', order: 5 },
{ name: 'Other Secondary Industry', type: 'Secondary', color: '#bbbdc1', order: 6 }];

export const industriesPopupTemplate = {
  title: '{Company}',
  content: '<table class="esri-widget__table" summary="List of attributes and values"><tbody>' +
    '<tr><th>County</th><td>{County}</td></tr>' +
    '<tr><th>Address</th><td>{Address}</td></tr>' +
    '<tr><th>Phone</th><td>{Phone}</td></tr>' +
    '<tr><th>Website</th><td><a href="http://{Homepage}" target="blank" style="color:blue">{Homepage} </a></td></tr>' +
    '<tr><th>Email</th><td>{Email}</td></tr>' +
    '<tr><th>Main Industry Type</th><td>{MainIndustryType}</td></tr>' +
    '<tr><th>Industry Type</th><td>{SpecificIndustryType}</td></tr>' +
    '<tr><th>Products</th><td>{Products}</td></tr>' +
    '<tr><th>Species</th><td>{Species}</td></tr>' +
    '</tbody></table>'
};

export const tourRoutes = [{
  anchorId: 'sidebar-search',
  content: 'Search by attributes allows users to find industries by their name, county that they are located in, along with their main category (i.e. Primary and Secondary) as well as specific industry type',
  title: 'Search by Attributes',
  enableBackdrop: true
}, {
  anchorId: 'sidebar-mapsearch',
  content: 'Industries could be selected directly on the map by drawing buffer(circle), polygon, rectangle as well as counties.',
  title: 'Search on the map',
  enableBackdrop: true
}, {
  anchorId: 'sidebar-export',
  content: 'Selected and/or complete list and map of industries could be exported as PDF as well as excel file formats.',
  title: 'Export maps and tables',
  enableBackdrop: true,
  preventScrolling: false
}, {
  anchorId: 'mainmap',
  content: 'Use your mouse/keyboard to interact with the map. Click on the dots/squares for industires to view their detail information.',
  title: 'Interacting with map',
  enableBackdrop: true,
  preventScrolling: true
}, {
  anchorId: 'basemap-tour',
  content: 'Use layers button to select between different basemaps. Zoom icons and zoom to home eases map navigation.',
  title: 'Map Controls',
  enableBackdrop: true,
},
{
  anchorId: 'industries-list',
  content: 'Single click to select industries and double-click to zoom and center map on them. Navigate to different pages using buttons on top bar. Entries could be sorted by clicking on header row.',
  title: 'List of industries',
  enableBackdrop: true,
}, {
  anchorId: 'more-menu',
  content: 'More menu icons such as Help and links to  Texas A&M Forest Service are located here.',
  title: 'More menu',
  enableBackdrop: true,
},
];
