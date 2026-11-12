import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { PageTransition } from "../components/layout/PageTransition";

const MainMenu = lazy(() => import("../pages/MainMenu").then((m) => ({ default: m.MainMenu })));
const MapPage = lazy(() => import("../pages/MapPage").then((m) => ({ default: m.MapPage })));
const RegionPage = lazy(() => import("../pages/RegionPage").then((m) => ({ default: m.RegionPage })));
const ProvincePage = lazy(() => import("../pages/ProvincePage").then((m) => ({ default: m.ProvincePage })));
const TantanganPage = lazy(() =>
  import("../pages/tantangan/TantanganPage").then((m) => ({ default: m.TantanganPage }))
);
const JodohkanPage = lazy(() =>
  import("../pages/tantangan/JodohkanPage").then((m) => ({ default: m.JodohkanPage }))
);
const IngatanPage = lazy(() =>
  import("../pages/tantangan/IngatanPage").then((m) => ({ default: m.IngatanPage }))
);
const PetunjukPage = lazy(() =>
  import("../pages/tantangan/PetunjukPage").then((m) => ({ default: m.PetunjukPage }))
);
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
      { path: "tantangan", element: <TantanganPage /> },
      { path: "tantangan/jodohkan", element: <JodohkanPage /> },
      { path: "tantangan/ingatan", element: <IngatanPage /> },
      { path: "tantangan/petunjuk", element: <PetunjukPage /> },
      { path: "pengalaman-ar", element: <Navigate to="/tantangan" replace /> },
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
