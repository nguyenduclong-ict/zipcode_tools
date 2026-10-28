export type Language = "en" | "vi";

export interface TranslationDictionary {
  nav: {
    lookup: string;
    countries: string;
  };
  home: {
    heroTitlePrefix: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    popularCountries: string;
    features: {
      biDirectionalTitle: string;
      biDirectionalDesc: string;
      globalDbTitle: string;
      globalDbDesc: string;
      securityTitle: string;
      securityDesc: string;
    };
  };
  search: {
    allCountries: string;
    placeholderDefault: string;
    placeholderCountry: (countryName: string, example: string) => string;
    searchBtn: string;
    autocompleteHeader: string;
    selectHint: string;
    foundResults: (total: number, query?: string) => string;
    emptyTitle: string;
    emptyDesc: (query: string, country?: string) => string;
    emptyTipsHeader: string;
    emptyTip1: string;
    emptyTip2: string;
    emptyTip3: string;
  };
  card: {
    copyCode: string;
    copied: string;
    copyAddress: string;
    state: string;
    district: string;
    ward: string;
    coordinates: string;
    coordsPending: string;
    viewDetails: string;
    backToCountry: (country: string) => string;
    openInMaps: string;
    postalAddressHeader: string;
  };
  countries: {
    badge: string;
    title: string;
    subtitle: string;
    exampleCode: string;
    format: string;
    viewDirectory: string;
  };
  footer: {
    copyright: string;
    countries: string;
    geoNamesSource: string;
    vnPostSource: string;
  };
}
