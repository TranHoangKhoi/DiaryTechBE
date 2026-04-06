const fs = require('fs');
const fetch = require('node-fetch');

const hamletNames = [
  'Tường Thành',
  'Thanh Long',
  'Thanh Tân',
  'Thanh Bình',
  'Phước Trung',
  'Phước Sơn',
  'Phước Thới',
  'Hiệp Hòa',
  'Hòa Hội',
  'Tân Hòa',
  'Tân Hiệp',
  'Tân Thuận',
  'Phước Trung A',
  'Phước Thới A',
  'Phước Sơn A',
  'Gò Sầm',
  'Cây Cám',
  'Thanh An',
  'Láng Dài'
];

const bbox = '10.45,107.20,10.65,107.40';

const buildQuery = () => {
  const regex = hamletNames.join('|');

  return `
[out:json][timeout:60];
(
  node["place"~"village|hamlet|neighbourhood"]["name"~"${regex}", i](${bbox});
  way["place"~"village|hamlet|neighbourhood"]["name"~"${regex}", i](${bbox});
  relation["place"~"village|hamlet|neighbourhood"]["name"~"${regex}", i](${bbox});
);
out center;
`;
};

const run = async () => {
  const res = await fetch('https://overpass.kumi.systems/api/interpreter', {
    method: 'POST',
    body: buildQuery()
  });

  const data = await res.json();

  const features = data.elements.map((el) => {
    let coordinates;

    if (el.type === 'node') {
      coordinates = [el.lon, el.lat];
    } else {
      coordinates = [el.center.lon, el.center.lat];
    }

    return {
      type: 'Feature',
      properties: {
        name: el.tags?.official_name || el.tags?.name,
        osm_name: el.tags?.name,
        type: el.tags?.place
      },
      geometry: {
        type: 'Point',
        coordinates
      }
    };
  });

  fs.writeFileSync(
    'hamlets.geojson',
    JSON.stringify(
      {
        type: 'FeatureCollection',
        features
      },
      null,
      2
    )
  );

  console.log('✅ Done! hamlets.geojson');
};

run();
