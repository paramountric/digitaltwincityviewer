import { circularSankey } from './Sankey.js';

test('sankey extent', () => {
  const sankey = circularSankey();
  const { nodes, links } = sankey(
    [
      {
        id: '1',
      },
      {
        id: '2',
      },
    ],
    [
      {
        source: '1',
        target: '2',
        value: 10,
      },
    ]
  );
});
