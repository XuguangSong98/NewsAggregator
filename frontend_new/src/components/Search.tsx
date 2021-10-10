import Grid from "@material-ui/core/Grid";
import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InfoButton from "./SlideAlert";
import Res from "./Res.js";
import FrontPageInfo from "./FrontPageInfo";
import { useHistory } from "react-router-dom";
import { customColours } from "../themes/customTheme";
import Box from "@material-ui/core/Box";
import { useTheme } from "@material-ui/core/styles";
import mainLogo from "./Light_Mode_Logo.png";
import darkLogo from "./Logo_Dark_Mode.png";
import App from "../App";

import {
  BrowserRouter as Router,
  useLocation,
  Route,
  Switch,
} from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      margin: theme.spacing(1),
      height: 50,
      color: "#FFFFF",
    },
    inputButton: {
      margin: theme.spacing(1),
      height: 50,
    },
    paper: {
      // paddingLeft: theme.spacing(45), //grid padding
      // paddingBottom: theme.spacing(3), //grid padding
      paddingTop: theme.spacing(1),
    },
  })
);
type props = {
  bookmarks: object;
  handlebookmark: (
    web_link: string,
    primary: string,
    secondary: string,
    id: number
  ) => void;
  isVisible: boolean;
};

const image_size = {
  height: 50,
  width: 200,
};

// Thinking of moving this to a folder/file that stores common functionality
export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchInfo(props: props) {
  const urlQuery = useQuery().get("query");
  const urlSearchType = useQuery().get("searchType");
  const history = useHistory();

  //input in search field
  const [searchInput, setSearchInput] = React.useState(urlQuery || "");
  //the query from searchInput when search button pressed
  const [query, setQuery] = React.useState(urlQuery || "");
  //two types of searches
  const [searchType, setSearchType] = React.useState(urlSearchType || "");

  function getRes(sinput: string, stype: boolean) {
    setQuery(sinput);
    let inputSearchType = stype ? "search" : "origin_search";
    setSearchType(inputSearchType);
    history.push(`/search?query=${searchInput}&searchType=${inputSearchType}`);
  }
  function enterPress(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!(searchInput === "")) {
        getRes(searchInput, false);
      }
    }
  }

  function resetInput() {
    setQuery("");
    history.push("/");
  }

  const classes = useStyles();
  const theme = useTheme();
  const css = `.main-search-input-field {background-color: gray;} `;
  return (
    <Grid
      container
      justifyContent="center"
      alignContent="center"
      direction="row"
      spacing={1}
    >
      <Grid item xs={12}>
        {!query && <Route path="/" component={FrontPageInfo} />}
      </Grid>
      {query && (
        <Box className={classes.paper}>
          {theme.palette.type === "dark" ? (
            <a onClick={resetInput}>
              <img style={image_size} src={darkLogo} alt="Dark Logo" />
            </a>
          ) : (
            <a onClick={resetInput}>
              <img style={image_size} src={mainLogo} alt="Light Logo" />
            </a>
          )}
        </Box>
      )}

      <Grid item xs={11} lg={6}>
        <style>{css}</style>
        <TextField
          id="search-input"
          variant="outlined"
          color="secondary"
          fullWidth
          defaultValue={searchInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchInput(e.currentTarget.value)
          }
          InputProps={{
            className: classes.input,
          }}
          onKeyPress={(e) => enterPress(e)}
        />
      </Grid>
      <Grid item xs={12} lg={2}>
        <Button
          className={classes.inputButton}
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => getRes(searchInput, false)}
        >
          Search
        </Button>
      </Grid>
      <InfoButton text="This is a description" />
      <Grid item xs={12} style={{ display: String(props.isVisible) }}>
        {query && (
          <Route path="/search">
            <Res
              search={searchType}
              query={query}
              handlebookmark={props.handlebookmark}
              bookmarks={props.bookmarks}
              isVisible={props.isVisible}
            />
          </Route>
        )}
      </Grid>
    </Grid>
  );
}

export default function Search(props: props) {
  return (
    <Router>
      <SearchInfo
        bookmarks={props.bookmarks}
        handlebookmark={props.handlebookmark}
        isVisible={props.isVisible}
      />
    </Router>
  );
}
