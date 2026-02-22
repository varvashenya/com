# GitHub Copilot Instructions - Main Portfolio Page & Experience Chart

## Project Overview
This is the main portfolio page (`src/index.html`) with an interactive technology experience timeline chart (`src/experience.js`). The site showcases professional experience, certifications, and technology stack evolution over time.

## Local Development

### Running Locally
```bash
# Start PHP development server
php -S localhost:8000 -t src

# Then open in browser:
# http://localhost:8000
```

**Important:**
- **NEVER run parcel build commands** - builds are handled separately
- **NEVER look into the dist folder** - contains build artifacts only
- Always test changes using the PHP server on the `src/` folder

## File Structure

### Main Files
- `src/index.html` - Main portfolio page with HTML structure
- `src/experience.js` - Interactive technology timeline chart (vanilla JS canvas implementation)
- `src/files/styles.css` - All styling for the main page

### Critical Components
1. **Portfolio Header** - Name, title, location, bio
2. **Experience Chart** - Interactive canvas-based timeline showing technology usage over years
3. **Certifications Section** - Display of professional certifications
4. **Contact Information** - Email and social links

## Experience Chart (`src/experience.js`)

### Overview
A custom vanilla JavaScript implementation that renders an interactive line chart on HTML5 canvas showing technology usage intensity over time (1994-2026+).

### Key Features
- Canvas-based rendering with device pixel ratio support
- Interactive legend with show/hide/filter controls
- Hover tooltips showing exact values
- Timeline visualization at the bottom
- Responsive design that adapts to container width
- Technology logos from CDN (devicons)

### Data Structure
```javascript
const stack = [
  {
    'label': 'Technology Name',
    'years': {
      2023: 15,  // Usage intensity (0-100)
      2024: 35,
      2025: 50,
      2026: 55
    },
    borderColor: 'color',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/...'
  },
  // ... more technologies
];
```

### Updating Technology Data

#### Adding a New Year
When a new year begins, update all active technologies:
```javascript
// Example: Adding 2027 data
{
  'label': 'Symfony',
  'years': {
    2023: 15,
    2024: 35,
    2025: 50,
    2026: 55,
    2027: 60  // Add new year
  },
  // ...
}
```

**Note:** The chart automatically calculates the year range from `start_year` (1994) to current year. Data structure uses a sparse object format - only include years with non-zero values.

#### Adding a New Technology
```javascript
{
  'label': 'New Technology',
  'years': {
    2026: 10,
    2027: 25
  },
  borderColor: 'blue',  // Any CSS color
  fill: false,
  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/[tech]/[tech]-original.svg'
}
```

#### Marking Technology as Old/Deprecated
Add `isOld: true` property:
```javascript
{
  'label': 'Legacy Tech',
  'years': { /* ... */ },
  borderColor: 'gray',
  fill: false,
  isOld: true  // Will be hidden by "Active Only" filter
}
```

### Chart Rendering Details

#### Canvas Sizing
- Width: 100% of container
- Height: Calculated based on chart area + timeline
- Uses `requestAnimationFrame` for proper initial sizing
- Handles window resize events automatically

#### Performance Optimizations
- Device pixel ratio scaling for sharp rendering on retina displays
- Efficient redraw on data changes
- Hover state management without full redraws

### Common Issues & Solutions

#### Chart Cut Off on Initial Load
**Fixed with:** Double `requestAnimationFrame` in initialization to ensure layout is complete before sizing canvas.

#### Chart Not Showing Year Data
**Check:**
1. Year is within the calculated range (start_year to current year)
2. Data exists in the `years` object for that technology
3. Technology is not marked as `hidden: true` by default

#### Legend Not Updating
The legend recreation is controlled by the `isInitialized` flag and `redrawOnly` parameter. Toggle operations recreate legend, hover operations only redraw chart.

## Main Page (`src/index.html`)

### Structure
```html
<div id="page">
  <div id="columns">
    <div id="content-column">
      <!-- Header with name, title -->
      <!-- Professional bio -->
      <!-- Experience chart section -->
      <!-- Certifications -->
      <!-- Contact info -->
    </div>
  </div>
</div>
```

### Key Sections

#### Professional Header
- H1 with gradient text effect
- Current title and location
- Bio paragraph

#### Experience Chart Section
```html
<h2>Technology Stack Experience Over Time</h2>
<div id="legend-container" style="font-size: 0.6vw"></div>
<div>
    <canvas id="experience"></canvas>
</div>
<script type="module" src="experience.js"></script>
```

**Important:** Canvas container div is critical for proper sizing.

#### Certifications
Grid layout of certification cards with images and descriptions.

### HTML Guidelines
- Semantic HTML5 structure
- No unnecessary wrapper divs
- Maximum page width: 1140px (set in CSS)
- Keep structure clean - no legacy Drupal classes

## Styling (`src/files/styles.css`)

### Key CSS Rules

#### Experience Canvas
```css
#experience {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

**Critical:** `width: 100%` and `display: block` ensure proper canvas sizing on initial load.

#### Section Headers (h2)
- Left gradient bar (::before pseudo-element)
- Red dotted bottom border (#CC0000)
- Purple gradient for the bar (#667eea to #764ba2)

#### Page Layout
- Max-width: 1140px
- Centered with auto margins
- White background with subtle shadow
- Border radius: 12px

### Color Scheme
- **Primary gradient:** #667eea to #764ba2 (purple)
- **Accent:** #CC0000 (red for borders)
- **Background:** #fafafa
- **Cards:** White with shadows

### Responsive Design
- Mobile-first approach
- Flexbox and CSS Grid for layouts
- Canvas resizes based on container width
- Legend font size uses vw units for scaling

## Modification Guidelines

### DO:
✅ Update technology data when years change
✅ Add new technologies to the stack array
✅ Modify color schemes if requested
✅ Enhance accessibility features
✅ Add new sections to main page following existing patterns
✅ Test all changes with PHP server

### DON'T:
❌ Change the core chart rendering logic without explicit request
❌ Remove the requestAnimationFrame initialization fix
❌ Modify the canvas sizing calculations without testing
❌ Add external JavaScript libraries (keep it vanilla)
❌ Change the overall visual design without approval
❌ Use build tools for testing (PHP server only)

## Testing Checklist

### Before Committing Changes:
1. ✅ Start PHP server: `php -S localhost:8000 -t src`
2. ✅ Open http://localhost:8000 in browser
3. ✅ Check chart renders correctly on initial load (no resize needed)
4. ✅ Verify all years display correctly (current year included)
5. ✅ Test legend controls (Show All, Hide All, Active Only)
6. ✅ Test hover interactions on chart lines
7. ✅ Test responsive behavior (resize browser window)
8. ✅ Check mobile view (use browser dev tools)
9. ✅ Verify no console errors
10. ✅ Check all technologies have proper data for current year

## Annual Maintenance

### Beginning of Each Year:
1. Update all active technologies with new year data in `src/experience.js`
2. Technologies still in use: add current year with appropriate intensity value (0-100)
3. Technologies no longer used: don't add new year data (chart will show decline)
4. Test that chart displays new year correctly
5. Verify the year range includes the new year

### Example Update for 2027:
```javascript
// Active technology - add 2027
{
  'label': 'Symfony',
  'years': {
    // ...existing years...
    2026: 55,
    2027: 60  // New year added
  }
}

// Declining technology - no 2027 data
{
  'label': 'Drupal',
  'years': {
    // ...existing years...
    2025: 15,
    2026: 10
    // No 2027 = natural decline shown
  }
}
```

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Canvas API required (all modern browsers)
- ES6+ JavaScript support
- Mobile responsive design
- Progressive enhancement approach

## Performance Notes
- Chart renders efficiently even with 30+ technologies
- Canvas rendering is hardware-accelerated
- No jQuery or heavy frameworks
- Minimal bundle size (vanilla JS)
- Images loaded from CDN (devicons)

## Contact & Meta Information
Update in `src/index.html`:
- Meta descriptions
- OpenGraph tags
- Twitter card data
- Contact links
- Social media URLs

Remember: This is a professional portfolio - keep it clean, fast, and maintainable!

