 🗺️ VectorPlan

Interactive floorplans for Home Assistant can be a huge task for anyone new to the scene. Well, this app is a friendly visual editor that makes the whole process a bit more easier!

It will generate YAML, CSS, or SVG code for you. Just drop in your floorplan picture, drag and drop your items (like lights and fans), trace your rooms, and wow! It generates the exact code you need for the Home Assistant `custom:floorplan-card`. Piece of cake!

## Live Demo: https://zoft123.github.io/VectorPlan/

## ✨ What makes it easier?

- **Drag and Drop:** Just click and move your smart home devices right where you want them.

- **Room Lighting:** Trace a room, and when you turn on a light, the app creates the CSS to light up that exact spot. It looks amazing!

- **Live Sync:** Securely connect it to your Home Assistant with a Long-Lived Access Token, and it pulls all your real Entity IDs for you.

- **Custom SVGs:** Do you want to use your own icons for fans or lights? Go right ahead!

- **One-Click Code:** Click a single button to grab all your YAML, SVG, and CSS, ready to copy and paste.

- **Docker Friendly:** You can get it running on your server in just a few seconds.

## 🚀 Want to try it out?

You can either run this using Docker (which is probably the best way for most people) or start up the development server if you feel like tinkering with the code.

### Option 1: Docker (Recommended)

Do you have Docker installed? Great!

1. Clone the project:

   ```
   git clone https://github.com/Zoft123/VectorPlan.git
   cd VectorPlan
   ```

2. Fire it up:

   ```
   docker-compose up -d --build
   ```

3. Open up `http://localhost:8080` in your web browser, and you are all set!

### Option 2: Local Development Mode

If you want to add features or change the interface, you will need Node.js (v18 or higher).

1. Clone and enter the folder:

   ```
   git clone https://github.com/Zoft123/VectorPlan.git
   cd VectorPlan
   ```

2. Install the required packages:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Check your terminal for the local link (it is usually `http://localhost:5173`).

## 🛠️ Putting it in Home Assistant

So, you finished your map. What is next?

1. Click that **Generate Code** button in the top right corner.

2. **SVG:** Copy the SVG code and save it as `floorplan_generated.svg` in your Home Assistant `/www/floorplan/` folder.

3. **CSS:** Do the exact same thing for the CSS, saving it as `floorplan_generated.css` in that same spot.

4. **YAML:** Create a "Custom: Floorplan" card on your Home Assistant dashboard and paste in the YAML code. Just double-check that the file paths match where you saved everything!

## 🤝 Welcome contributions!

Do you have an idea for new icons? Would you like to improve the CSS or add new features? Yes, please! Just fork the project and send over a Pull Request.

1. Fork the project

2. Make a branch (`git checkout -b feature/CoolThing`)

3. Commit your changes (`git commit -m 'Added a cool thing'`)

4. Push to your branch (`git push origin feature/CoolThing`)

5. Open a Pull Request so we can see it!

## 📝 License

This project is licensed under the GNU General Public License (GPL). Check out the `LICENSE` file for details.



# **Disclaimer**

This project is almost entirely vibe-coded. It's not claiming to be anything else other than that. 
