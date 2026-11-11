import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { PageTransition } from "../components/layout/PageTransition";

const MainMenu = lazy(() => import("../pages/MainMenu").then((m) => ({ default: m.MainMenu })));
const MapPage = lazy(() => import("../pages/MapPage").then((m) => ({ default: m.MapPage })));
const RegionPage = lazy(() => import("../pages/RegionPage").then((m) => ({ default: m.RegionPage })));
const ProvincePage = lazy(() => import("../pages/ProvincePage").then((m) => ({ default: m.ProvincePage })));
const ArPage = lazy(() => import("../pages/ArPage").then((m) => ({ default: m.ArPage })));
const QuizPage = lazy(() => import("../pages/QuizPage").then((m) => ({ default: m.QuizPage })));
const Profile = lazy(() => import("../pages/Profile").then((m) => ({ default: m.Profile })));
const Achievements = lazy(() => import("../pages/Achievements").then((m) => ({ default: m.Achievements })));
const Settings = lazy(() => import("../pages/Settings").then((m) => ({ default: m.Settings })));

function Layout() {
  return (
    <AppShell>
      <PageTransition>
        <Suspense fallback={<div className="p-8 text-center text-gray-600">Memuat...</div>}>
          <Outlet />
        </Suspense>
      </PageTransition>
    </AppShell>
  );
}

function QuizRoute() {
  const { id } = useParams<{ id: string }>();
  return <QuizPage key={id} />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainMenu /> },
      { path: "peta", element: <MapPage /> },
      { path: "pulau/:region", element: <RegionPage /> },
      { path: "provinsi/:id", element: <ProvincePage /> },
      { path: "pengalaman-ar", element: <ArPage /> },
      { path: "kuis/:id", element: <QuizRoute /> },
      { path: "profil", element: <Profile /> },
      { path: "pencapaian", element: <Achievements /> },
      { path: "pengaturan", element: <Settings /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
