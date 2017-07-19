import _transform from './_transform';
import plugin from '../src/babel';

const transform = (file, opts) => _transform(file, {
  plugins: [
    [plugin, { pattern: /\.css$/ }],
  ],
  ...opts,
});

it('does not do anything', async () => {
  const { code } = await transform('./fixtures/empty.fixture.js');
  expect(code).toMatchSnapshot();
});

it('works', async () => {
  const { code } = await transform('./fixtures/index.fixture.js');
  expect(code).toMatchSnapshot();
});

it('should not inject styled-modules/style', async () => {
  const { code } = await transform('./fixtures/import.fixture.js');
  expect(code).toMatchSnapshot();
});
