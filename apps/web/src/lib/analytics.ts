import { sendGTMEvent } from "@next/third-parties/google";

type AddToCartEvent = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
};

type ProductViewEvent = {
  productId: string;
  title: string;
  price: number;
};

type SearchEvent = {
  query: string;
  resultCount: number;
};

export function trackAddToCart(data: AddToCartEvent) {
  sendGTMEvent({ event: "add_to_cart", ...data });
}

export function trackProductView(data: ProductViewEvent) {
  sendGTMEvent({ event: "view_item", ...data });
}

export function trackSearch(data: SearchEvent) {
  sendGTMEvent({ event: "search", ...data });
}

export function trackCheckoutStart() {
  sendGTMEvent({ event: "begin_checkout" });
}
