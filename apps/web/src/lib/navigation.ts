import { sanityFetch } from "@workspace/sanity/live";
import {
  queryGlobalSeoSettings,
  queryNavbarData,
  queryPromoBannerData,
} from "@workspace/sanity/query";

export const getNavigationData = async () => {
  const [navbarData, settingsData, promoBannerData] = await Promise.all([
    sanityFetch({ query: queryNavbarData }),
    sanityFetch({ query: queryGlobalSeoSettings }),
    sanityFetch({ query: queryPromoBannerData }),
  ]);

  return {
    navbarData: navbarData.data,
    settingsData: settingsData.data,
    promoBannerData: promoBannerData.data,
  };
};
