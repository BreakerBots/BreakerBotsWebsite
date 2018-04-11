// Postcss task 

module.exports = function(grunt, data){

  return {
    options: {
      map: {
        inline: false,
        annotation: false
      },
      processors: [
        require('postcss-flexbugs-fixes')(),
        require('autoprefixer')({browsers: [
          //
          // Official browser support policy:
          // https://getbootstrap.com/docs/4.0/getting-started/browsers-devices/#supported-browsers
          //
          'Chrome >= 45', // Exact version number here is kinda arbitrary
          // Rather than using Autoprefixer's native "Firefox ESR" version specifier string,
          // we deliberately hardcode the number. This is to avoid unwittingly severely breaking the previous ESR in the event that:
          // (a) we happen to ship a new Bootstrap release soon after the release of a new ESR,
          //     such that folks haven't yet had a reasonable amount of time to upgrade; and
          // (b) the new ESR has unprefixed CSS properties/values whose absence would severely break webpages
          //     (e.g. `box-sizing`, as opposed to `background: linear-gradient(...)`).
          //     Since they've been unprefixed, Autoprefixer will stop prefixing them,
          //     thus causing them to not work in the previous ESR (where the prefixes were required).
          'Firefox ESR', // Current Firefox Extended Support Release (ESR); https://www.mozilla.org/en-US/firefox/organizations/faq/
          // Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine version,
          // NOT the Edge app version shown in Edge's "About" screen.
          // For example, at the time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12.
          // See also https://github.com/Fyrd/caniuse/issues/1928
          'Edge >= 12',
          'Explorer >= 10',
          // Out of leniency, we prefix these 1 version further back than the official policy.
          'iOS >= 9',
          'Safari >= 9',
          // The following remain NOT officially supported, but we're lenient and include their prefixes to avoid severely breaking in them.
          'Android >= 4.4',
          'Opera >= 30'
        ]}),
      ]
    },
    dist: {
      src: "dist/html/assets/css/*.css"
    }
  };
};