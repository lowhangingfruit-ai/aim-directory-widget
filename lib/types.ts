export interface VendorMarket {
  marketID: number;
  market: string;
  dates: string[];
}

export interface Vendor {
  vendorID: number;
  company: string;
  type: string;
  email: string;
  phone1: string;
  addr1: string;
  addr2: string;
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
