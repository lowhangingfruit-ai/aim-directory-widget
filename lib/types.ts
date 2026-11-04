export interface VendorMarket {
  marketID: number;
  market: string;
  dates: string[];
}

// A picture taken from the vendor's own website when they have no MMM photo
// (lib/websitePhotos.ts). "og" is the site's share image, "logo" its logo.
export interface WebsitePhoto {
  url: string;
  source: "og" | "logo";
  fit: "cover" | "contain"; // logos are shown whole, photos fill the tile
  background: "light" | "dark"; // dark only for light logos on a transparent background
}

export interface Vendor {
  vendorID: number;
  company: string;
  type: string;
  phone1: string;
  city: string;
  state: string;
  description: string;
  website: string;
  photo: string;
  twitter_handle: string;
  facebook_profile: string;
  instagram_profile: string;
  permission: boolean;
  markets: VendorMarket[];
  sitePhoto?: WebsitePhoto; // added on the server, not part of the MMM feed
}

export const MARKETS: Record<number, string> = {
  7776: "Sunday Marin",
  7781: "Newark",
  7782: "Clement St.",
  7783: "Stonestown",
  7784: "Hayward",
  7785: "Grand Lake",
  7786: "Thursday Marin",
  7803: "Point Reyes",
  8211: "San Rafael Summer",
};

export const ORG_ID = 913;
