require("dotenv").config();
const express = require("express");
const {
  setupKinde,
  protectRoute,
  getUser,
} = require("@kinde-oss/kinde-node-express");
const app = express();
const port = 3000;
app.use(express.static("public"));
const config = {
  clientId: process.env.KINDE_CLIENT_ID,
  issuerBaseUrl: process.env.KINDE_ISSUER_URL,
  siteUrl: process.env.KINDE_SITE_URL,
  secret: process.env.KINDE_CLIENT_SECRET,
  redirectUrl: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
};

app.set("view engine", "pug");
setupKinde(config, app);

/**************************
 * Gets access token
 **************************/
const getAccessToken = async () => {
  try {
    const searchParams = {
      grant_type: "client_credentials",
      client_id: process.env.KINDE_CLIENT_ID,
      client_secret: process.env.KINDE_CLIENT_SECRET,
      audience: "https://devmobilia.kinde.com/api",
    };

    const res = await fetch("https://devmobilia.kinde.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(searchParams),
    });
    const token = await res.json();
    console.log({ token });
  } catch (err) {
    console.error(err);
  }
};

/*************************************
 * Returns a list of my organizations
 *************************************/
app.get("/", async (req, res) => {
  const apiUrl = "https://devmobilia.kinde.com/v1/organizations";
  try {
    // Get the access token at this point.
    const accessToken = await getAccessToken();
    const response = await axios.post(apiUrl, userData, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("User added successfully:", response.data);
  } catch (error) {
    console.error("Error adding user:", error.message);
  }
});

app.get("/", (req, res) => {
  if (req.session && req.session.kindeAccessToken) {
    res.redirect("/admin");
  } else {
    res.render("index", {
      title: "Hey",
      message: "Hello there! what would you like to do?",
    });
  }
});

app.get("/admin", protectRoute, getUser, (req, res) => {
  res.render("admin", {
    title: "Admin",
    user: req.user,
  });
});

app.listen(port, function () {
  console.log(`Kinde Express Starter Kit listening on port ${port}!`);
});
