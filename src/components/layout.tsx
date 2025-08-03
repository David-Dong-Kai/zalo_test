import React, { FC } from "react";
import { Route, Routes } from "react-router";
import { Box } from "zmp-ui";
import { Navigation } from "./navigation";
import { ProtectedRoute, PublicRoute } from "./route-guard";
import HomePage from "pages/index";
import LoginPage from "pages/login";
import NotificationPage from "pages/notification";
import ProfilePage from "pages/profile";
import CheckoutResultPage from "pages/result";
import NewsDetailPage from "pages/news-detail";
import { getSystemInfo } from "zmp-sdk";
import { ScrollRestoration } from "./scroll-restoration";
import { useHandlePayment } from "hooks";

if (import.meta.env.DEV) {
  document.body.style.setProperty("--zaui-safe-area-inset-top", "24px");
} else if (getSystemInfo().platform === "android") {
  const statusBarHeight =
    window.ZaloJavaScriptInterface?.getStatusBarHeight() ?? 0;
  const androidSafeTop = Math.round(statusBarHeight / window.devicePixelRatio);
  document.body.style.setProperty(
    "--zaui-safe-area-inset-top",
    `${androidSafeTop}px`
  );
}

export const Layout: FC = () => {
  useHandlePayment();

  return (
    <Box flex flexDirection="column" className="h-screen">
      <ScrollRestoration />
      <Box className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          {/* 公共路由 - 登录页面 */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          
          {/* 受保护的路由 - 需要登录才能访问 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/notification" 
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/result" 
            element={
              <ProtectedRoute>
                <CheckoutResultPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/news-detail" 
            element={
              <ProtectedRoute>
                <NewsDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
      <Navigation />
    </Box>
  );
};
