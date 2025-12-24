# GitHub Copilot Instructions for varvashenia.com

## Project Overview
This is a personal portfolio website for Dmitrii Varvashenia, built with vanilla HTML, CSS, and JavaScript. The site showcases professional experience, certifications, and includes interactive elements like a technology timeline chart and a moon lander game.

## Development Guidelines

### Testing & Development
- **NEVER run parcel build commands** - The build process is handled separately
- **NEVER look into the dist folder** - It contains build artifacts only
- **Use local PHP server for testing**: `php -S localhost:8000 -t src`
- Test changes directly in the `src/` folder using the PHP server

### Project Structure
- `src/index.html` - Main portfolio page
- `src/files/styles.css` - All styling (modern, clean CSS - no legacy Drupal code)
- `src/experience.js` - Technology timeline chart (keep as-is unless explicitly requested)
- `src/moon/` - Moon lander game
- `src/playground/` - **IGNORE THIS FOLDER** - experimental code, do not modify

### Code Style & Standards

#### CSS
- Use modern CSS features (Grid, Flexbox, CSS custom properties)
- Mobile-first responsive design
- Include accessibility features (focus states, reduced motion support)
- No external CSS frameworks or libraries
- Color scheme: Purple gradient (#667eea to #764ba2) for accents
- Red dotted underline (#CC0000) for h2 headers

#### HTML
- Semantic HTML5 structure
- Clean markup - no Drupal-specific classes or unnecessary wrappers
- Maximum page width: 1140px
- H1 should be centered
- Keep existing structure unless explicitly asked to change

#### JavaScript
- Vanilla JavaScript only (no jQuery or other frameworks except Chart.js for experience.js)
- Modern ES6+ syntax
- Comment complex logic
- Keep `experience.js` unchanged unless explicitly requested

### Key Design Elements
- **Page title (h1)**: Left-aligned, gradient text effect
- **Section headers (h2)**: Left gradient bar + red dotted bottom border
- **Cards**: White background, rounded corners, subtle shadows with hover effects
- **Gradients**: Purple theme (#667eea to #764ba2)
- **Maximum page width**: 1140px

### What NOT to Change
- `src/experience.js` - technology timeline functionality
- `src/playground/` - ignore completely
- The overall visual design and color scheme
- Build configuration (package.json)

### Common Tasks

#### Adding new content
- Add to `src/index.html` directly
- Follow existing card/section patterns
- Maintain consistent spacing and styling

#### Styling changes
- Edit `src/files/styles.css` only
- Test with `php -S localhost:8000 -t src`
- Maintain responsive design for mobile devices

#### Adding new features
- Use vanilla JavaScript
- Keep code modular and well-commented
- Test thoroughly on both desktop and mobile

### File Organization
- Images and assets: `src/files/`
- CSS: `src/files/styles.css` (single file)
- Favicons: `src/files/favicon.svg` and `favicon.ico`

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive
- Progressive enhancement approach
- Accessibility-first design

## Remember
- Always test with PHP server, not parcel
- Keep code clean and maintainable
- Preserve existing functionality unless asked to change
- Mobile-first responsive design is critical

