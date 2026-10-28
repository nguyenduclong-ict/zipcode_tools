import { TranslationDictionary } from "./types";

export const en: TranslationDictionary = {
  nav: {
    lookup: "Lookup",
    countries: "Countries",
  },
  home: {
    heroTitlePrefix: "Global Postal & ZIP Code",
    heroTitleHighlight: "2-Way Lookup",
    heroSubtitle:
      "Find locations by postal code, or look up ZIP codes by city/town. Accurate and standardized worldwide postal coverage.",
    popularCountries: "Popular countries:",
    features: {
      biDirectionalTitle: "Flexible 2-Way Search",
      biDirectionalDesc:
        "Intelligent auto-detection. Look up addresses by ZIP code or find postal codes by typing district/city.",
      globalDbTitle: "Global Database",
      globalDbDesc:
        "Standardized international coverage from GeoNames and official national postal directories.",
      securityTitle: "Fast & Independent",
      securityDesc:
        "Sub-millisecond local B-Tree indexing. Safe queries with parameter binding and zero third-party dependency.",
    },
  },
  search: {
    allCountries: "🌐 All countries",
    placeholderDefault:
      "Enter postal code or place name (e.g. 90210, 10000, New York, Tokyo)...",
    placeholderCountry: (countryName: string, example: string) =>
      `Lookup ${countryName} postal code (e.g. ${example})...`,
    searchBtn: "Search",
    autocompleteHeader: "Quick suggestions",
    selectHint: "Select ↵",
    foundResults: (total: number, query?: string) =>
      `Found ${total} result${total !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}`,
    emptyTitle: "No postal codes found",
    emptyDesc: (query: string, country?: string) =>
      `No results matching "${query}"${country ? ` in ${country}` : ""}.`,
    emptyTipsHeader: "💡 Search tips:",
    emptyTip1: "• Double-check spelling and spaces",
    emptyTip2: "• Switch country filter to '🌐 All countries' to broaden search",
    emptyTip3: "• Try entering a major city (e.g. New York, London, Tokyo, Hanoi)",
  },
  card: {
    copyCode: "Copy code",
    copied: "Copied!",
    copyAddress: "Copy address",
    state: "State/Province:",
    district: "County/District:",
    ward: "Ward/Community:",
    coordinates: "Coordinates:",
    coordsPending: "Coordinates: Pending",
    viewDetails: "Details →",
    backToCountry: (country: string) => `Back to ${country} directory`,
    openInMaps: "Open on Google Maps ↗",
    postalAddressHeader: "Postal Address Details",
  },
  countries: {
    badge: "International Directory",
    title: "Supported Countries",
    subtitle:
      "Browse postal codes and administrative divisions by country.",
    exampleCode: "Example code:",
    format: "Format:",
    viewDirectory: "View directory",
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} ZipCode Tools.`,
    countries: "Countries",
    geoNamesSource: "GeoNames Data",
    vnPostSource: "VNPost Directory",
  },
};
