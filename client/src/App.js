import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./components/accounts/Register";
import { Login } from "./components/accounts/Login";
import Profile from "./components/accounts/Profile";
import WithPrivateRoute from "./utils/WithPrivateRoute";
import ChatLayout from "./components/layouts/ChatLayout";
import Header from "./components/layouts/Header";
import ErrorMessage from "./components/layouts/ErrorMessage";
import { Authenticator } from "@aws-amplify/ui-react";
import { Layout } from "./components/layouts/Layout";
import { Home } from "./components/Home";
import { RequireAuth } from "./RequireAuth";
import { Protected } from "./components/Protected";
import { ProtectedSecond } from "./components/ProtectedSecond";
import { AuthProvider } from "./contexts/AuthContext";
// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Header />
//         <ErrorMessage />
//         <Routes>
//           <Route exact path="/register" element={<Register />} />
//           <Route exact path="/login" element={<Login />} />
//           <Route
//             exact
//             path="/profile"
//             element={
//               <WithPrivateRoute>
//                 <Profile />
//               </WithPrivateRoute>
//             }
//           />
//           <Route
//             exact
//             path="/"
//             element={
//               <WithPrivateRoute>
//                 <ChatLayout />
//               </WithPrivateRoute>
//             }
//           />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;



function MyRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ChatLayout />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/profile"
              element={
                <WithPrivateRoute>
                  <Profile />
                </WithPrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function App() {
  return (
    <Authenticator.Provider>
      <MyRoutes />
    </Authenticator.Provider>
  );
}

export default App;
