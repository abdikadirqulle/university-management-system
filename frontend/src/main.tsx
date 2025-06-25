import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "https://3fd470ae546b435f3f009e9038eaac00@o4509558969139200.ingest.us.sentry.io/4509558984015872",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [],
});

createRoot(document.getElementById("root")!).render(<App />);
