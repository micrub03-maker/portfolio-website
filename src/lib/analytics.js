// Thin wrapper over Vercel Web Analytics' client queue for reporting virtual
// pageviews from anywhere in the tree — used for sub-section depth such as which
// project dropdowns visitors expand or which interests slide they view.
//
// The <Analytics> component (App.jsx) runs in manual mode, so these explicit
// pageviews are the only signal for that depth. We call window.va('pageview', …)
// directly because that's exactly what @vercel/analytics' internal pageview()
// helper does, and that helper isn't exported from the React entry. <Analytics>
// installs window.va on mount and queues calls until the script loads, so this
// is safe to call before the script is ready (and a no-op if it never loads).
export function trackPageview(path) {
  if (typeof window === 'undefined' || !path) return;
  window.va?.('pageview', { route: path, path });
}
