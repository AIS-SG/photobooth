import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Start from "../pages/Start";
import Count from "../pages/Count";
import Photostart from "../pages/PhotoStart";
import Phototime from "../pages/Phototime";
import Frameselect from "../pages/Frameselect"; 
import Loading from "../pages/Loading";
import Photoselect from "../pages/Photoselect";
import Qrcode from "../pages/Qrcode";
import Finish from "../pages/Finish"; 
import Photo from "../pages/Photo";


export const router = createBrowserRouter([
    {path: "/", element: <Start />},
    {path: "/count", element: <Count />},
    {path: "/photostart", element: <Photostart />},
    {path: "/phototime", element: <Phototime />},
    {path: "/frameselect", element: <Frameselect />},
    {path: "/loading", element: <Loading />},
    {path: "/photoselect", element: <Photoselect />},
    {path: "/qrcode", element: <Qrcode />},
    {path: "/finish", element: <Finish />},
    {path: "/photo", element: <Photo />},
]);

export default function AppRouter(){
    return <RouterProvider router={router} />;
}
