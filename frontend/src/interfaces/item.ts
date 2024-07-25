export interface Item {
    _id: number;
    name: string;
    price: number;
    quantity: number;
    description: string;
    cover: string;
    platform: Array<string>;
    photos: Array<string>;
    videos: Array<string>;
  }
