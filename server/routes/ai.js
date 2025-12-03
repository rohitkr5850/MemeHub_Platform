import express from "express";

const router = express.Router();
import axios from "axios";

router.get("/proxy-image", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL missing");

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Failed to load image");
  }
});

// Manual-Caption
router.post("/generate-caption", (req, res) => {
  try {
    const captions = [
      "When you try to act normal but your brain says 'error 404'.",
      "Me: I will sleep early today. Also me at 3AM: one more meme.",
      "When you open the fridge for the 10th time hoping new food appears.",
      "My last 2 brain cells trying to work on Monday morning.",
      "When you accidentally open front camera and instantly regret life.",
      "That moment you realize the 'group study' is just chitchat.",
      "Me pretending to understand what’s happening in class.",
      "When you charge your phone for 5 minutes and expect 100%.",
      "When your mom says 'we need to talk'.",
      "When you're hungry but too lazy to cook.",
      "Me after doing 1 productive thing: I deserve a vacation.",
      "When WiFi stops working and your whole life falls apart.",
      "When you tell a joke and even you regret it instantly.",
      "Trying to act cool when the teacher calls your name.",
      "When you clean your room and can't find anything anymore.",
      "Me watching my clothes wash like it's a Netflix show.",
      "When autocorrect makes you look stupid.",
      "When your crush says 'bro'.",
      "That awkward moment when someone waves… but not at you.",
      "When you click 'add to cart' knowing damn well you won't buy it."
    ];

    // pick 3 random captions
    const random = captions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    res.json({ captions: random });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});


// Tag Generate
router.post("/generate-tags", (req, res) => {
  try {
    const tags = ["funny", "relatable", "lol", "meme", "daily"];

    res.json({ tags });
  } catch (err) {
    res.status(500).json({ message: "Error generating tags" });
  }
});

export default router;
