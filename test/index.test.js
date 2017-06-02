import _transform from './_transform';
import plugin from '../src/babel';

const transform = (file, opts) => _transform(file, {
  plugins: [
    [plugin, { pattern: /\.css$/ }]
  ],
  ...opts,
});

it('works', async () => {
  const { code } = await transform('./fixtures/index.fixture.js');
  expect(code).toMatchSnapshot();
});
