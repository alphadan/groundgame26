// src/app/layout/MainLayout.tsx
import { useState, useEffect, ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
} from "@mui/icons-material";
import People from "@mui/icons-material/People";
import HomeWork from "@mui/icons-material/HomeWork";

const drawerWidth = 260;

interface MainLayoutProps {
  children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return unsubscribe;
  }, [navigate]);

  const menuItems = [
    { text: "Reports", icon: <BarChart />, path: "/reports" },
    { text: "Analysis", icon: <Analytics />, path: "/analysis" },
    { text: "Actions", icon: <Campaign />, path: "/actions" },
    { text: "Manage Team", icon: <People />, path: "/manage-team" }, 
    { text: "My Precincts", icon: <HomeWork />, path: "/my-precincts" },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" color="#d32f2f" fontWeight="bold">
          groundgame26
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
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
      {/* Desktop permanent drawer */}
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

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {!isDesktop && (
          <AppBar position="fixed" sx={{ bgcolor: "#d32f2f" }}>
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
        <Toolbar /> {/* Spacer for mobile app bar */}
        <Box p={3}>
          {/* This is where page content goes */}
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
