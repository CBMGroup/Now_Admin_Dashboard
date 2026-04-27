import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    lazy: () => import("./pages/Login").then(m => ({ Component: m.Login })),
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { 
        index: true, 
        lazy: () => import("./pages/Dashboard").then(m => ({ Component: m.Dashboard })) 
      },
      { 
        path: "users", 
        lazy: () => import("./pages/Users").then(m => ({ Component: m.Users })) 
      },
      { 
        path: "artists", 
        lazy: () => import("./pages/Artists").then(m => ({ Component: m.Artists })) 
      },
      { 
        path: "albums", 
        lazy: () => import("./pages/Albums").then(m => ({ Component: m.Albums })) 
      },
      { 
        path: "tracks", 
        lazy: () => import("./pages/Tracks").then(m => ({ Component: m.Tracks })) 
      },
      { 
        path: "playlists", 
        lazy: () => import("./pages/Playlists").then(m => ({ Component: m.Playlists })) 
      },
      { 
        path: "analytics", 
        lazy: () => import("./pages/Analytics").then(m => ({ Component: m.Analytics })) 
      },
      { 
        path: "settings", 
        lazy: () => import("./pages/Settings").then(m => ({ Component: m.Settings })) 
      },
    ],
  },
]);
