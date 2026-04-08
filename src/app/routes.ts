import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { Tracks } from "./pages/Tracks";
import { Users } from "./pages/Users";
import { Artists } from "./pages/Artists";
import { Albums } from "./pages/Albums";
import { Playlists } from "./pages/Playlists";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: Users },
      { path: "artists", Component: Artists },
      { path: "albums", Component: Albums },
      { path: "tracks", Component: Tracks },
      { path: "playlists", Component: Playlists },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
    ],
  },
]);
