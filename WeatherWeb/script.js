function toggleTheme() {
            const root = document.documentElement;
            const currentPrimary = getComputedStyle(root)
              .getPropertyValue("--primary")
              .trim();

            // Define themes
            const themes = [
              {
                primary: "#ff2d75", // Pink
                secondary: "#00f0ff", // Cyan
                accent: "#ffcc00", // Yellow
                bg: "#1a1a2e", // Original background
                card: "#16213e", // Original card
              },
              {
                primary: "#E1A730", // Mustard Yellow (Sun / Highlights)
                secondary: "#3A9188", // Teal Green (Rain / Cool tones)
                accent: "#D95D39", // Burnt Orange (Sunset / Alerts)
                bg: "#F2E2C4", // Cream Beige (Retro background)
                card: "#4A2C2A", // Deep Brown (Panels / Contrast)
                },
            ];

            // Get the current theme index
            const currentThemeIndex = themes.findIndex(
              (theme) => theme.primary === currentPrimary
            );

            // Calculate the next theme index
            const nextThemeIndex = (currentThemeIndex + 1) % themes.length;

            // Apply the next theme
            const nextTheme = themes[nextThemeIndex];
            root.style.setProperty("--primary", nextTheme.primary);
            root.style.setProperty("--secondary", nextTheme.secondary);
            root.style.setProperty("--accent", nextTheme.accent);
            root.style.setProperty("--bg", nextTheme.bg);
            root.style.setProperty("--card", nextTheme.card);
          }

