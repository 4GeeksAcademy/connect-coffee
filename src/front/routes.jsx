// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About.jsx";
import { Provider } from "./pages/Provider";
import CafeDetails from "./pages/CafeDetails";
import UserDetails from "./pages/UserDetails";
import StoreIndex from "./components/StoreIndex.jsx";
import Donations from "./pages/Donations.jsx";
import Subscription from "./pages/Subscription.jsx";
import NotFound from "./pages/NotFound.jsx";
import { Terms } from "./pages/Terms";
import Hero from "./pages/Hero.jsx";
import MenuPreview from "./components/MenuPreview.jsx";
import AdminDetails from "./pages/AdminDetails";
import StoreBuilder from "./pages/StoreBuilder.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import CafeMenu from "./components/CafeMenu.jsx";

// Si tiene {} al importar es que esta llamando a un page especifico al importarlo y sino el default 

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<StoreIndex />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/about" element={<About />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/provider/:id" element={<Provider />} />
      <Route path="/cafedetails" element={<CafeDetails />} />
      <Route path="/user/:userId" element={<UserDetails />} />
      <Route path="/admindetails" element={<AdminDetails />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/hero" element={<Hero />} />
      <Route path="/donations" element={<Donations />} />
      <Route path="/payment" element={<Subscription />} />
      <Route path="/success" element={<PaymentSuccess />} />
      <Route path="/cancel" element={<div>❌ Cancelaste la donación.</div>} />
      {/* <Route path="/menu/:id" element={<MenuPreview />} /> */}
      <Route path="/menu/:id" element={<CafeMenu />} />
      <Route path="/store-builder" element={<StoreBuilder />} />
      <Route path="/*" element={<NotFound />} />

    </Route>
  )
);