// src/app/layout/MainLayout.tsx — FINAL WITH HEADER, BREADCRUMBS & AVATAR DROPDOWN
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
  Breadcrumbs,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
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
  Home as HomeIcon,
  Settings,
} from "@mui/icons-material";
import GopElephant from "../../assets/icons/gop-elephant.svg"; // if needed
import CandidateRosette from "../../assets/icons/candidate-rosette.svg";
import CountyChairCrown from "../../assets/icons/county-chair-crown.svg";
import AreaChairBadge from "../../assets/icons/area-chair-badge.svg";
import CommitteepersonShield from "../../assets/icons/committeeperson-shield.svg";
import SearchIcon from "@mui/icons-material/Search";
import Logo from "../../components/ui/Logo";

const drawerWidth = 260;

interface MainLayoutProps {
  children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const navigate = useNavigate();
  const location = useLocation();

  // Avatar dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAffiliation, setUserAffiliation] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user);

      // Force refresh token to get latest custom claims
      try {
        const idTokenResult = await user.getIdTokenResult(true);
        const claims = idTokenResult.claims;

        setUserRole((claims.role as string) || null);
        setUserAffiliation((claims.affiliation as string) || null);
      } catch (err) {
        console.error("Failed to get custom claims:", err);
      }
    });

    return unsubscribe;
  }, [navigate]);

  // Breadcrumb name
  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbName =
    pathnames.length > 0
      ? pathnames[pathnames.length - 1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : "Dashboard";

  const menuItems = [
    { text: "My Precincts", icon: <HomeWork />, path: "/my-precincts" },
    { text: "Reports", icon: <BarChart />, path: "/reports" },
    { text: "Analysis", icon: <Analytics />, path: "/analysis" },
    { text: "Actions", icon: <Campaign />, path: "/actions" },
    { divider: true },
    { text: "Voter List", icon: <Phone />, path: "/voters" },
    { text: "Walk Lists", icon: <DirectionsWalk />, path: "/walk-lists" },
    { text: "Name Search", icon: <SearchIcon />, path: "/name-search" },
    { divider: true },
    { text: "Settings", icon: <Settings />, path: "/settings" },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ mt: 2, mb: 2 }}>
        <Logo />
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
                  {item.icon}
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
        {/* Mobile Top Bar */}
        {!isDesktop && (
          <AppBar position="fixed" sx={{ bgcolor: "#B22234" }}>
            <Toolbar>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Logo />
            </Toolbar>
          </AppBar>
        )}

        {/* NEW PAGE HEADER — BREADCRUMBS + SETTINGS + AVATAR */}
        <Box
          sx={{
            bgcolor: "white",
            borderBottom: 1,
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 1099,
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              minHeight: "64px !important",
            }}
          >
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb">
              <IconButton
                onClick={() => navigate("/my-precincts")}
                size="small"
              >
                <HomeIcon sx={{ color: "#0A3161" }} />
              </IconButton>
              <Typography color="text.primary" fontWeight="medium">
                {breadcrumbName}
              </Typography>
            </Breadcrumbs>

            {/* Right Side: Settings + Avatar */}
            {userRole === "candidate" && (
              <img
                src={CandidateRosette}
                alt="Candidate"
                style={{ height: 28 }}
              />
            )}
            {userRole === "county_chair" && (
              <img
                src={CountyChairCrown}
                alt="County Chair"
                style={{ height: 28 }}
              />
            )}
            {userRole === "area_chair" && (
              <img
                src={AreaChairBadge}
                alt="Area Chair"
                style={{ height: 28 }}
              />
            )}
            {userRole === "committeeperson" && (
              <img
                src={CommitteepersonShield}
                alt="Committeeperson"
                style={{ height: 28 }}
              />
            )}
            {userRole === "gop" && (
              <img src={GopElephant} alt="g o p" style={{ height: 28 }} />
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Settings">
                <IconButton onClick={() => navigate("/settings")}>
                  <Settings />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={currentUser?.displayName || currentUser?.email || "User"}
              >
                <IconButton onClick={handleAvatarClick}>
                  <Avatar
                    src={currentUser?.photoURL || ""}
                    alt={currentUser?.displayName || ""}
                    sx={{ width: 36, height: 36 }}
                  >
                    {(currentUser?.displayName ||
                      currentUser?.email ||
                      "U")[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/settings");
                  }}
                >
                  <Settings fontSize="small" sx={{ mr: 1 }} />
                  Settings
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    signOut(auth);
                  }}
                >
                  <Logout fontSize="small" sx={{ mr: 1 }} />
                  Log Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Box>

        {/* Main Page Content */}
        <Box p={3}>{children || <Outlet />}</Box>
      </Box>
    </Box>
  );
}
