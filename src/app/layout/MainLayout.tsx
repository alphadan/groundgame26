// src/app/layout/MainLayout.tsx — FINAL: Clean & Professional Active State
import { useState, useEffect, ReactNode } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Analytics,
  Campaign,
  Logout,
  Menu as MenuIcon,
  HomeWork,
  Phone,
  DirectionsWalk,
  LocationOn,
} from "@mui/icons-material";

const drawerWidth = 260;

interface MainLayoutProps {
  children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return unsubscribe;
  }, [navigate]);

  const menuItems = [
    { text: "My Precincts", icon: <HomeWork />, path: "/my-precincts" },
    { text: "Reports", icon: <BarChart />, path: "/reports" },
    { text: "Analysis", icon: <Analytics />, path: "/analysis" },
    { text: "Actions", icon: <Campaign />, path: "/actions" },
    { divider: true },
    { text: "Voter List", icon: <Phone />, path: "/voters" },
    { text: "Walk Lists", icon: <DirectionsWalk />, path: "/walk-lists" },
    { divider: true },
    { text: "Interactive Map", icon: <LocationOn />, path: "/maps" },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" color="#B22234" fontWeight="bold">
          groundgame26
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item, index) => {
          if ("divider" in item) {
            return (
              <Box
                key={`divider-${index}`}
                sx={{
                  my: 2,
                  mx: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              />
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderLeft: isActive ? 4 : 0,
                  borderColor: "#B22234",
                  pl: isActive ? 2.5 : 3,
                  backgroundColor: isActive
                    ? "rgba(211, 47, 47, 0.05)"
                    : "transparent",
                  "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.08)" },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#B22234" : "inherit",
                    minWidth: 40,
                  }}
                >
                  {isActive && item.text === "Interactive Map" ? (
                    <LocationOn color="error" />
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? "bold" : "medium",
                    color: isActive ? "#B22234" : "inherit",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Log Out */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => signOut(auth)}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Desktop drawer */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {!isDesktop && (
          <AppBar position="fixed" sx={{ bgcolor: "#B22234" }}>
            <Toolbar>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" ml={2}>
                groundgame26
              </Typography>
            </Toolbar>
          </AppBar>
        )}
        <Toolbar />
        <Box p={3}>{children || <Outlet />}</Box>
      </Box>
    </Box>
  );
}
