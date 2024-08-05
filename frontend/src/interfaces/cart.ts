export interface Cart {
    _id: string;
    products: Array<CartProduct>;
    }

export interface CartProduct {
    id: string;
    ordered_quantity: number;
    }
