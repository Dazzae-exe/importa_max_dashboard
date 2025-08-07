import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./layout/RootLayout";
import ProductsPage from "./pages/Products";
import OrdersPage from "./pages/Orders";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: "orders", element: <OrdersPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
