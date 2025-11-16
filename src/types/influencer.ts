export interface Influencer {
  id: number;
  name: string;
  title: string;
  description: string;
  followers: string;
  startingRate: string;
  tags: string[];
  imageUrl: string;
  badge?: string;
  verified: boolean;
}
