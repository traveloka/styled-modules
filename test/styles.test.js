import _transform from './_transform';
import plugin from '../src/babel-external';

const transform = (file, opts) => _transform(file, {
  plugins: [plugin],
  ...opts,
});

it('works', async () => {
  const { code } = await transform('./fixtures/styles.fixture.js');
  expect(code).toMatchSnapshot();
});

it('generates source maps', async () => {
  const { code } = await transform('./fixtures/styles.fixture.js', {
    sourceMaps: true,
  });
  expect(code).toMatchSnapshot();
});
