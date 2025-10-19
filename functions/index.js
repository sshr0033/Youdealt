

require("dotenv").config();
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const corsLib = require("cors");
const { send } = require("@emailjs/nodejs");


setGlobalOptions({ region: "australia-southeast2", maxInstances: 10 });
if (!admin.apps.length) admin.initializeApp();

const cors = corsLib({ origin: true, methods: ["GET", "POST", "OPTIONS"] });


function bad(res, code, msg) {
  return res.status(code).json({ error: msg });
}


const GOOGLE = {
  PLACES_TEXT: "https://maps.googleapis.com/maps/api/place/textsearch/json",
  PLACES_NEARBY: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  DIRECTIONS: "https://maps.googleapis.com/maps/api/directions/json",
};


exports.placesText = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const key = process.env.GOOGLE_API_KEY;
      if (!key) return bad(res, 500, "Server key missing");

      const { query, lat, lng, radius = "30000" } = req.query || {};
      if (!query) return bad(res, 400, "query required");

      const params = new URLSearchParams({ query, key });
      if (lat && lng) {
        params.set("location", `${lat},${lng}`);
        params.set("radius", radius);
      }

      const r = await fetch(`${GOOGLE.PLACES_TEXT}?${params.toString()}`);
      const j = await r.json();
      res.set("Cache-Control", "public, max-age=120");
      return res.status(200).json(j);
    } catch (e) {
      console.error("placesText error:", e);
      return bad(res, 500, "placesText failed");
    }
  });
});

exports.placesNearby = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const key = process.env.GOOGLE_API_KEY;
      if (!key) return bad(res, 500, "Server key missing");

      const { keyword, lat, lng, radius = "30000" } = req.query || {};
      if (!keyword || !lat || !lng) return bad(res, 400, "keyword, lat, lng required");

      const params = new URLSearchParams({ keyword, location: `${lat},${lng}`, radius, key });
      const r = await fetch(`${GOOGLE.PLACES_NEARBY}?${params.toString()}`);
      const j = await r.json();
      res.set("Cache-Control", "public, max-age=120");
      return res.status(200).json(j);
    } catch (e) {
      console.error("placesNearby error:", e);
      return bad(res, 500, "placesNearby failed");
    }
  });
});


exports.directions = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const key = process.env.GOOGLE_API_KEY;
      if (!key) return bad(res, 500, "Server key missing");

      const { fromLat, fromLng, toLat, toLng, mode = "driving" } = req.query || {};
      if (!fromLat || !fromLng || !toLat || !toLng)
        return bad(res, 400, "fromLat, fromLng, toLat, toLng required");

      const params = new URLSearchParams({
        origin: `${fromLat},${fromLng}`,
        destination: `${toLat},${toLng}`,
        mode: mode.toString().toLowerCase(),
        key,
      });

      const r = await fetch(`${GOOGLE.DIRECTIONS}?${params.toString()}`);
      const j = await r.json();
      res.set("Cache-Control", "public, max-age=120");
      return res.status(200).json(j);
    } catch (e) {
      console.error("directions error:", e);
      return bad(res, 500, "directions failed");
    }
  });
});

exports.sendEmail = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { to_email, name, title, message } = req.body || {};
      if (!to_email || !message)
        return bad(res, 400, "Missing to_email or message");

      // Load secrets from .env
      const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY  = process.env.EMAILJS_PUBLIC_KEY;
      const PRIVATE_KEY = process.env.EMAILJS_SERVER_KEY;

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY)
        return bad(res, 500, "Missing EmailJS environment variables");


      const payload = {
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_email,
          name,
          title,
          message,
          time: new Date().toLocaleString(),
        },
      };


      const r = await fetch("https://api.emailjs.com/api/v1.0/email/send-server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PRIVATE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const text = await r.text();
        console.error("EmailJS server error:", text);
        return bad(res, 500, text);
      }

      console.log(`Email sent successfully to ${to_email}`);
      return res.status(200).json({ message: "Email sent successfully!" });
    } catch (e) {
      console.error("sendEmail error:", e);
      return bad(res, 500, e.message || "Email sending failed");
    }
  });
});

