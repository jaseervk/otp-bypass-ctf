// vuln-otp-ctf.js
// FULL LOGIN + SESSION + OTP (username removed from OTP stage)

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "SUPER_SECRET_CTF_KEY",
    resave: false,
    saveUninitialized: true
}));

const PORT = 3000;

// Hardcoded login
const LOGIN_USER = "admin";
const LOGIN_PASS = "admin";

// OTP assigned to logged-in user
const ADMIN_OTP = "111111";

// Require login
function requireLogin(req, res, next) {
    if (!req.session.logged_in) {
        return res.redirect("/index.html");
    }
    next();
}

// =============================
// LOGIN
// =============================
app.post("/login", (req, res) => {
    const user = req.body.username || "";
    const pass = req.body.password || "";

    if (user === LOGIN_USER && pass === LOGIN_PASS) {
        req.session.logged_in = true;
        req.session.username = "admin";
        return res.redirect("/otp.html");
    }

    return res.send(`
        <h2>Login Failed</h2>
        <p>Incorrect username or password.</p>
        <a href="/index.html">Try again</a>
    `);
});

// =============================
// OTP VERIFY
// =============================
app.post('/verify', requireLogin, (req, res) => {

    // Check for missing OTP parameter (vulnerability)
    const otpPresent = Object.prototype.hasOwnProperty.call(req.body, "otp");

    if (!otpPresent) {
        return res.sendFile(path.join(__dirname, "public/verify-bypass.html"));
    }

    const otp = (req.body.otp || "").trim();

    if (otp === ADMIN_OTP) {
        return res.sendFile(path.join(__dirname, "public/verify-success.html"));
    }

    return res.sendFile(path.join(__dirname, "public/verify-fail.html"));
});

// =============================
app.listen(PORT, () => {
    console.log(`CTF running on http://localhost:${PORT}`);
    console.log("Login as admin/admin → OTP → remove otp param to get FLAG.");
});
