import { TranslationDictionary } from "./types";

export const en: TranslationDictionary = {
  nav: {
    lookup: "Lookup",
    countries: "Countries",
  },
  home: {
    heroTitlePrefix: "Global Postal & ZIP Code",
    heroTitleHighlight: "Directory",
    heroSubtitle:
      "Fast two-way postal lookup. Enter a postal code to identify administrative divisions, or type a city name to find destination postal codes.",
    popularCountries: "Popular jurisdictions:",
    statsHeadline: "330,000+ verified postal records",
    statsSub: "Standardized data across 8 major jurisdictions, indexed for instant local edge resolution.",
    guideTitle: "How Two-Way Lookup Works",
    guideByCodeTitle: "Lookup by Postal Code",
    guideByCodeDesc:
      "Enter any code (e.g. 10000, 90210, SW1A 1AA, 75001) to locate the exact province, district, ward, and latitude/longitude coordinates.",
    guideByPlaceTitle: "Lookup by Place Name",
    guideByPlaceDesc:
      "Enter a city, county, or ward name (e.g. Hanoi, Tokyo, Beverly Hills, Paris) to retrieve all assigned postal codes in that area.",
    formatsTitle: "Standard Postal Code Formats",
    formatsDesc: "Quick reference for international postal addressing structures.",
    browseAllBtn: "Browse all countries →",
  },
  search: {
    allCountries: "All countries",
    placeholderDefault:
      "Enter postal code or place name (e.g. 90210, 10000, Tokyo, Paris)...",
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
    emptyTipsHeader: "Search tips:",
    emptyTip1: "Double-check spelling and spacing",
    emptyTip2: "Switch country filter to 'All countries' to broaden search scope",
    emptyTip3: "Try searching by major administrative center (e.g. Hanoi, London, New York)",
  },
  card: {
    copyCode: "Copy code",
    copied: "Copied",
    copyAddress: "Copy address",
    state: "State / Province:",
    district: "County / District:",
    ward: "Ward / Community:",
    coordinates: "Coordinates:",
    coordsPending: "Coordinates pending",
    viewDetails: "Details →",
    backToCountry: (country: string) => `Back to ${country} directory`,
    openInMaps: "Open on Google Maps ↗",
    postalAddressHeader: "Postal Address Details",
  },
  countries: {
    badge: "International Directory",
    title: "Supported Countries & Formats",
    subtitle:
      "Browse postal codes, administrative hierarchies, and code structures by country.",
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
