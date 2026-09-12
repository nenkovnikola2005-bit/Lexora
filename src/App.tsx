import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ConversationPage } from "./pages/ConversationPage";
import { FeedPage } from "./pages/FeedPage";
import { LawyerProfilePage } from "./pages/LawyerProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NetworkPage } from "./pages/NetworkPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SettingsSectionPage } from "./pages/SettingsSectionPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/feed" replace />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/network/:lawyerId" element={<LawyerProfilePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:conversationId" element={<ConversationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/:section" element={<SettingsSectionPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
