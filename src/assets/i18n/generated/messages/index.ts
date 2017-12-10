export const messages: any = [];

const requireContext = require.context("./", true, /\.yml$/);
requireContext.keys().forEach((filename) => {
  const locale = /(\w+)\.yml$/.exec(filename)[1];
  messages[locale] = requireContext(filename);
});
