export const data: any = {};

const requireContext = require.context('./', true, /\.js$/);
requireContext.keys().forEach((filename) => {
  const locale = /(\w+)\.js$/.exec(filename)[1];
  data[locale] = requireContext(filename).default;
});
