export interface CetusToken {
  name: string;
  symbol: string;
  decimals: number;
  logoURL: string;
  coinType: string;
  isVerified: boolean;
}

export interface CetusTokenResponse {
  code: number;
  msg: string;
  data: {
    list: CetusToken[];
  };
}
