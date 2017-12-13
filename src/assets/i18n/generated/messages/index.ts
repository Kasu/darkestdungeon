export const messages: any = [];

const requireContext = require.context('./', true, /\.json$/);
requireContext.keys().forEach((filename) => {
  const locale = /(\w+)\.json$/.exec(filename)[1];
  messages[locale] = requireContext(filename);
});
