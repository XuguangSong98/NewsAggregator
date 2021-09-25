import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { dark, light } from "./themes/customTheme";
import "./App.css";
import TopBar from "./components/TopBar";
import Search from "./components/Search";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FrontPageInfo from "./components/FrontPageInfo";
import Grow from "@material-ui/core/Grow";

//using colors from theme - bit hacky but works
function App() {
  let themeColourSaved =
    localStorage.getItem("themeChoice") === "dark" ? dark : light;
  const [themeChoice, setThemeChoice] = React.useState(
    themeColourSaved || dark
  );
  React.useEffect(() => {
    document.body.style.backgroundColor =
      themeChoice.palette.background.default;
  }, [themeChoice]);
  const themeSwitch = () => {
    let themeColourSwitch = themeChoice.palette.type === "dark" ? light : dark;
    setThemeChoice(themeColourSwitch);
    localStorage.setItem("themeChoice", themeColourSwitch.palette.type);
  };
  return (
    <ThemeProvider theme={{ ...themeChoice }}>
      <TopBar themeSwitch={() => themeSwitch()} themeChoice={themeChoice} />
      <Grow in={true} timeout={600}>
        <Grid
          container
          justifyContent="center"
          alignItems="stretch"
          direction="row"
          spacing={3}
          style={{
            width: "100%",
          }}
        >
          <Grid item xs={12}>
            <Search whichTheme={themeChoice} />
          </Grid>
        </Grid>
      </Grow>
    </ThemeProvider>
  );
}

export default App;
