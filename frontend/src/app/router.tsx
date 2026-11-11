import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

const MainMenu = lazy(() => import("../pages/MainMenu").then((m) => ({ default: m.MainMenu })));
const MapPage = lazy(() => import("../pages/MapPage").then((m) => ({ default: m.MapPage })));
const RegionPage = lazy(() => import("../pages/RegionPage").then((m) => ({ default: m.RegionPage })));
const ProvincePage = lazy(() => import("../pages/ProvincePage").then((m) => ({ default: m.ProvincePage })));
const ArPage = lazy(() => import("../pages/ArPage").then((m) => ({ default: m.ArPage })));
const QuizPage = lazy(() => import("../pages/QuizPage").then((m) => ({ default: m.QuizPage })));
const Profile = lazy(() => import("../pages/Profile").then((m) => ({ default: m.Profile })));
const Achievements = lazy(() => import("../pages/Achievements").then((m) => ({ default: m.Achievements })));
const Settings = lazy(() => import("../pages/Settings").then((m) => ({ default: m.Settings })));

function Wrap({ children }: { children: React.ReactNode }) {
  return <AppShell><Suspense fallback={<div className="p-8 text-center text-gray-600">Memuat...</div>}>{children}</Suspense></AppShell>;
}

function QuizRoute() {
  const { id } = useParams<{ id: string }>();
  return <QuizPage key={id} />;
}

const router = createBrowserRouter([
  { path: "/", element: <Wrap><MainMenu /></Wrap> },
  { path: "/peta", element: <Wrap><MapPage /></Wrap> },
  { path: "/pulau/:region", element: <Wrap><RegionPage /></Wrap> },
  { path: "/provinsi/:id", element: <Wrap><ProvincePage /></Wrap> },
  { path: "/pengalaman-ar", element: <Wrap><ArPage /></Wrap> },
  { path: "/kuis/:id", element: <Wrap><QuizRoute /></Wrap> },
  { path: "/profil", element: <Wrap><Profile /></Wrap> },
  { path: "/pencapaian", element: <Wrap><Achievements /></Wrap> },
  { path: "/pengaturan", element: <Wrap><Settings /></Wrap> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}