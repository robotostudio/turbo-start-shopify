/** Custom line icons for the navbar actions (replace the lucide equivalents). */

export function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cart</title>
      <path
        d="M11.25 6C11.25 7.24264 10.2427 8.25 9 8.25C7.75732 8.25 6.75 7.24264 6.75 6M3.5625 2.8125L2.8125 15.1875H15.1875L14.4375 2.8125H3.5625Z"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function BookmarkIcon({ className }: { className?: string }) {
  return (
    // 18x18 box like BagIcon/SearchIcon, not the 13x16 it used to be. SVG fits a
    // non-square viewBox to the shorter axis, so at the same `size-*` the old
    // geometry drew ~26% taller than the bag it sits next to. The path below is
    // the same bookmark redrawn to the bag's exact ink bounds (2.8125 -> 15.1875
    // vertically), keeping its natural narrower width, so `size-5` now means the
    // same thing for both.
    <svg
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Wishlist</title>
      <path
        d="M13.85 15.1875V2.8125H4.15V15.1875L9 12.51L13.85 15.1875Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Search</title>
      <path
        d="M15 15L12.0949 12.0949M12.0949 12.0949C13.0789 11.1109 13.6875 9.7515 13.6875 8.25C13.6875 5.24696 11.2531 2.8125 8.25 2.8125C5.24696 2.8125 2.8125 5.24696 2.8125 8.25C2.8125 11.2531 5.24696 13.6875 8.25 13.6875C9.7515 13.6875 11.1109 13.0789 12.0949 12.0949Z"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>X</title>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Instagram</title>
      <rect
        height="18.5"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="18.5"
        x="2.75"
        y="2.75"
      />
      <circle
        cx="12"
        cy="12"
        r="4.25"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="1.1" />
    </svg>
  );
}

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>LinkedIn</title>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.53C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function RedditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Reddit</title>
      <path d="M24 11.78c0-1.45-1.18-2.63-2.63-2.63-.71 0-1.35.28-1.83.74-1.8-1.3-4.28-2.14-7.03-2.24l1.2-5.62 3.9.83a1.88 1.88 0 1 0 .2-1.32l-4.35-.93a.66.66 0 0 0-.78.51l-1.34 6.3c-2.79.09-5.3.92-7.12 2.24a2.63 2.63 0 1 0-2.9 4.3 5.2 5.2 0 0 0-.06.8c0 4.06 4.72 7.35 10.55 7.35 5.83 0 10.55-3.29 10.55-7.35 0-.27-.02-.53-.06-.79A2.63 2.63 0 0 0 24 11.78zM6.67 13.66a1.88 1.88 0 1 1 3.76 0 1.88 1.88 0 0 1-3.76 0zm10.44 4.94c-1.28 1.28-3.73 1.38-4.45 1.38-.72 0-3.17-.1-4.45-1.38a.48.48 0 0 1 .68-.68c.81.81 2.53.1 3.77.1 1.24 0 2.96.71 3.77-.1a.48.48 0 1 1 .68.68zm-.34-3.06a1.88 1.88 0 1 1 0-3.76 1.88 1.88 0 0 1 0 3.76z" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.125"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Copied</title>
      <path d="M3.375 9.5625L6.9375 13.125L14.625 4.875" />
    </svg>
  );
}

export function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.125"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Copy link</title>
      <path d="M5.8125 5.8125V4.3125C5.8125 3.48407 6.48407 2.8125 7.3125 2.8125H13.6875C14.5159 2.8125 15.1875 3.48407 15.1875 4.3125V10.695C15.1875 11.5235 14.5159 12.195 13.6875 12.195H12.1875M2.8125 7.3125V13.6875C2.8125 14.5159 3.48407 15.1875 4.3125 15.1875H10.6875C11.5159 15.1875 12.1875 14.5159 12.1875 13.6875V7.3125C12.1875 6.48407 11.5159 5.8125 10.6875 5.8125H4.3125C3.48407 5.8125 2.8125 6.48407 2.8125 7.3125Z" />
    </svg>
  );
}

export function UserIcon({ className }: Readonly<{ className?: string }>) {
  return (
    // Same 18x18 box and 1.3 stroke as BagIcon, ink spanning 2.8125 -> 15.1875.
    <svg
      className={className}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Account</title>
      <circle
        cx="9"
        cy="6.1"
        r="3.2875"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2.8125 15.1875C3.4 12.3 5.9 10.6 9 10.6C12.1 10.6 14.6 12.3 15.1875 15.1875"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="1.3"
      />
    </svg>
  );
}
