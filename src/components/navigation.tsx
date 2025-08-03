import { useVirtualKeyboardVisible } from "hooks";
import React, { FC, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BottomNavigation, Icon } from "zmp-ui";
import { isAuthenticatedState, authTokenState, currentUserState } from "state";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  onClick?: () => void;
}

export type TabKeys = "/" | "/notification" | "/profile" | "/logout";

export const NO_BOTTOM_NAVIGATION_PAGES = ["/result", "/news-detail", "/login"];

export const Navigation: FC = () => {
  const keyboardVisible = useVirtualKeyboardVisible();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const setAuthToken = useSetRecoilState(authTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setAuthToken(null);
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  const tabs: Record<string, MenuItem> = {
    "/": {
      label: "首页",
      icon: <Icon icon="zi-home" />,
    },
    "/notification": {
      label: "通知",
      icon: <Icon icon="zi-notif" />,
    },
    "/profile": {
      label: "个人",
      icon: <Icon icon="zi-user" />,
    },
    "/logout": {
      label: "登出",
      icon: <Icon icon="zi-close" />,
      onClick: handleLogout,
    },
  };

  const noBottomNav = useMemo(() => {
    return NO_BOTTOM_NAVIGATION_PAGES.includes(location.pathname);
  }, [location]);

  // 如果未登录或在不显示导航的页面，不显示底部导航
  if (!isAuthenticated || noBottomNav || keyboardVisible) {
    return <></>;
  }

  return (
    <BottomNavigation
      id="footer"
      activeKey={location.pathname}
      onChange={(key) => {
        const tab = tabs[key];
        if (tab.onClick) {
          tab.onClick();
        } else {
          navigate(key);
        }
      }}
      className="z-50"
    >
      {Object.keys(tabs).map((path: TabKeys) => (
        <BottomNavigation.Item
          key={path}
          label={tabs[path].label}
          icon={tabs[path].icon}
          activeIcon={tabs[path].activeIcon}
        />
      ))}
    </BottomNavigation>
  );
};
