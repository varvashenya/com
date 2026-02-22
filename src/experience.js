// Vanilla JS implementation - no external dependencies
function hexToRgb(hex) {
  // Handle named colors
  const colorMap = {
    'red': '#FF0000',
    'green': '#008000',
    'darkgreen': '#006400',
    'RebeccaPurple': '#663399',
    'Teal': '#008080',
    'lightblue': '#ADD8E6',
    'blue': '#0000FF',
    'orange': '#FFA500',
    'gray': '#808080',
    'SeaGreen': '#2E8B57',
    'black': '#000000',
    'Crimson': '#DC143C',
    'FireBrick': '#B22222',
    'DarkRed': '#8B0000'
  };

  const color = colorMap[hex] || hex;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function transparentize(color, opacity) {
  const rgb = hexToRgb(color);
  const alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function createLegend(datasets, toggleCallback, hoverCallback) {
  const legendContainer = document.getElementById('legend-container');
  legendContainer.innerHTML = '';

  // Add control buttons with modern styling
  const controlsDiv = document.createElement('div');
  controlsDiv.style.display = 'flex';
  controlsDiv.style.justifyContent = 'center';
  controlsDiv.style.marginBottom = '15px';
  controlsDiv.style.gap = '12px';
  controlsDiv.style.flexWrap = 'wrap';

  // Helper function to create modern button
  const createModernButton = (text, icon, gradient, hoverGradient) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span style="margin-right: 6px;">${icon}</span>${text}`;
    btn.style.padding = '10px 20px';
    btn.style.cursor = 'pointer';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.background = gradient;
    btn.style.color = 'white';
    btn.style.fontSize = '13px';
    btn.style.fontWeight = '600';
    btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    btn.style.transition = 'all 0.3s ease';
    btn.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';

    btn.onmouseenter = () => {
      btn.style.background = hoverGradient;
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    };

    btn.onmouseleave = () => {
      btn.style.background = gradient;
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    };

    btn.onmousedown = () => {
      btn.style.transform = 'translateY(0) scale(0.98)';
    };

    btn.onmouseup = () => {
      btn.style.transform = 'translateY(-2px) scale(1)';
    };

    return btn;
  };

  const showAllBtn = createModernButton(
    'Show All',
    '👁️',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
  );
  showAllBtn.onclick = () => {
    datasets.forEach(d => d.hidden = false);
    toggleCallback();
  };

  const hideAllBtn = createModernButton(
    'Hide All',
    '🚫',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
  );
  hideAllBtn.onclick = () => {
    datasets.forEach(d => d.hidden = true);
    toggleCallback();
  };

  const showActiveBtn = createModernButton(
    'Active Only',
    '⚡',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
  );
  showActiveBtn.onclick = () => {
    datasets.forEach(d => d.hidden = d.isOld);
    toggleCallback();
  };

  controlsDiv.appendChild(showAllBtn);
  controlsDiv.appendChild(hideAllBtn);
  controlsDiv.appendChild(showActiveBtn);
  legendContainer.appendChild(controlsDiv);

  const ul = document.createElement('ul');
  ul.style.display = 'flex';
  ul.style.flexDirection = 'row';
  ul.style.flexWrap = 'wrap';
  ul.style.margin = '0';
  ul.style.padding = '0';
  ul.style.listStyle = 'none';

  // Sort datasets by last usage year (newest first)
  const sortedDatasets = [...datasets].sort((a, b) => {
    // Find last year with non-zero value for each dataset
    const getLastYear = (dataset) => {
      let lastYear = 0;
      dataset.data.forEach((value, index) => {
        if (value > 0) {
          const year = start_year + index;
          if (year > lastYear) lastYear = year;
        }
      });
      return lastYear;
    };

    const aLastYear = getLastYear(a);
    const bLastYear = getLastYear(b);

    // Sort by last year descending (newest first)
    return bLastYear - aLastYear;
  });

  sortedDatasets.forEach((dataset) => {
    const li = document.createElement('li');
    li.style.alignItems = 'center';
    li.style.cursor = 'pointer';
    li.style.display = 'flex';
    li.style.flexDirection = 'row';
    li.style.marginLeft = '10px';
    li.style.marginBottom = '8px';
    li.style.padding = '8px 12px';
    li.style.borderRadius = '6px';
    li.style.border = `2px solid ${dataset.hidden ? '#ddd' : dataset.borderColor}`;
    li.style.transition = 'all 0.2s ease';
    li.style.minWidth = '140px';

    // Add hover effect to highlight the line on the chart
    li.onmouseenter = () => {
      dataset.highlighted = true;
      li.style.transform = 'translateY(-2px)';
      li.style.boxShadow = `0 4px 8px ${dataset.borderColor}40`;
      if (hoverCallback) {
        hoverCallback();
      } else {
        toggleCallback(true);
      }
    };

    li.onmouseleave = () => {
      dataset.highlighted = false;
      li.style.transform = 'translateY(0)';
      li.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      if (hoverCallback) {
        hoverCallback();
      } else {
        toggleCallback(true);
      }
    };

    // Logo placeholder (you can add actual logo URLs later)
    const logoSpan = document.createElement('span');
    logoSpan.style.display = 'inline-flex';
    logoSpan.style.alignItems = 'center';
    logoSpan.style.justifyContent = 'center';
    logoSpan.style.width = '24px';
    logoSpan.style.height = '24px';
    logoSpan.style.marginRight = '10px';
    logoSpan.style.borderRadius = '4px';
    logoSpan.style.background = dataset.borderColor;
    logoSpan.style.color = 'white';
    logoSpan.style.fontSize = '12px';
    logoSpan.style.fontWeight = 'bold';
    logoSpan.style.flexShrink = '0';
    logoSpan.textContent = dataset.label.substring(0, 2).toUpperCase();

    // If dataset has a logo URL, use it
    if (dataset.logo) {
      const img = document.createElement('img');
      img.src = dataset.logo;
      img.style.width = '24px';
      img.style.height = '24px';
      img.style.objectFit = 'contain';
      logoSpan.innerHTML = '';
      logoSpan.appendChild(img);
      logoSpan.style.background = 'transparent';
    }

    // Text container
    const textContainer = document.createElement('span');
    textContainer.style.color = '#333';
    textContainer.style.fontSize = '13px';
    textContainer.style.fontWeight = '500';
    textContainer.style.flex = '1';
    textContainer.style.opacity = dataset.hidden ? '0.5' : (dataset.isOld ? '0.7' : '1');
    textContainer.style.fontStyle = dataset.isOld ? 'italic' : 'normal';
    textContainer.textContent = dataset.label;

    // Toggle switch (checkbox style)
    const toggleSwitch = document.createElement('div');
    toggleSwitch.style.position = 'relative';
    toggleSwitch.style.width = '40px';
    toggleSwitch.style.height = '20px';
    toggleSwitch.style.borderRadius = '10px';
    toggleSwitch.style.background = dataset.hidden ? '#ccc' : dataset.borderColor;
    toggleSwitch.style.transition = 'background 0.3s ease';
    toggleSwitch.style.marginLeft = '10px';
    toggleSwitch.style.flexShrink = '0';

    const toggleKnob = document.createElement('div');
    toggleKnob.style.position = 'absolute';
    toggleKnob.style.top = '2px';
    toggleKnob.style.left = dataset.hidden ? '2px' : '20px';
    toggleKnob.style.width = '16px';
    toggleKnob.style.height = '16px';
    toggleKnob.style.borderRadius = '50%';
    toggleKnob.style.background = 'white';
    toggleKnob.style.transition = 'left 0.3s ease';
    toggleKnob.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';

    toggleSwitch.appendChild(toggleKnob);

    // Click handler
    li.onclick = () => {
      dataset.hidden = !dataset.hidden;
      toggleCallback();
    };

    li.appendChild(logoSpan);
    li.appendChild(textContainer);
    li.appendChild(toggleSwitch);
    ul.appendChild(li);
  });

  legendContainer.appendChild(ul);
}


const currentTime = new Date();
const start_year = 1994;
const years_of_experience = currentTime.getFullYear() - start_year + 1;
const years = [...Array(years_of_experience)].map((x, index) => start_year + index);

const stack = [
  {
    'label': 'Python',
    'years': {
      2022: 2,
      2023: 5
    },
    borderColor: 'red',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg'
  },
  {
    'label': 'GoLang',
    'years': {
      2021: 15,
      2022: 35,
      2023: 40,
      2024: 15,
      2025: 0
    },
    borderColor: 'green',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg'
  },
  {
    'label': 'Laravel',
    'years': {
      2022: 20,
      2023: 10,
      2024: 15,
      2025: 30,
      2026: 35
    },
    borderColor: 'darkgreen',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg'
  },
  {
    'label': 'Symfony',
    'years': {
      2023: 15,
      2024: 35,
      2025: 50,
      2026: 55
    },
    borderColor: 'purple',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/symfony/symfony-original.svg'
  },
  {
    'label': 'API Platform',
    'years': {
      2023: 10,
      2024: 23,
      2025: 33,
      2026: 38
    },
    borderColor: 'indigo',
    fill: false,
    logo: 'https://api-platform.com/logo.svg'
  },
  {
    'label': 'Drupal',
    'years': {
      2010: 5,
      2011: 10,
      2012: 20,
      2013: 40,
      2014: 80,
      2015: 100,
      2016: 100,
      2017: 100,
      2018: 90,
      2019: 80,
      2020: 70,
      2021: 65,
      2022: 60,
      2023: 60,
      2024: 50,
      2025: 15,
      2026: 10
    },
    borderColor: 'RebeccaPurple',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/drupal/drupal-original.svg'
  },
  {
    'label': 'CSS',
    'years': {
      2005: 2,
      2006: 6,
      2007: 6,
      2008: 7,
      2009: 8,
      2010: 9,
      2011: 10,
      2012: 15,
      2013: 15,
      2014: 9,
      2015: 2,
      2016: 2,
      2017: 2,
      2018: 2,
      2019: 2,
      2020: 2,
      2021: 2,
      2022: 2,
      2023: 2,
      2024: 2,
      2025: 1,
      2026: 1
    },
    borderColor: 'Teal',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg'
  },
  {
    'label': 'JavaScript/TypeScript',
    'years': {
      2009: 6,
      2010: 8,
      2011: 9,
      2012: 10,
      2013: 10,
      2014: 8,
      2015: 5,
      2016: 3,
      2017: 3,
      2018: 3,
      2019: 3,
      2020: 3,
      2021: 3,
      2022: 3,
      2023: 15,
      2024: 15,
      2025: 25,
      2026: 30
    },
    borderColor: 'navy',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg'
  },
  {
    'label': 'PHP',
    'years': {
      2005: 25,
      2006: 40,
      2007: 50,
      2008: 65,
      2009: 75,
      2010: 78,
      2011: 83,
      2012: 88,
      2013: 90,
      2014: 90,
      2015: 90,
      2016: 90,
      2017: 90,
      2018: 90,
      2019: 88,
      2020: 82,
      2021: 75,
      2022: 63,
      2023: 55,
      2024: 70,
      2025: 75,
      2026: 78
    },
    borderColor: 'blue',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg'
  },
  {
    'label': 'GNU/Linux',
    'years': {
      2004: 4,
      2005: 30,
      2006: 90,
      2007: 25,
      2008: 15,
      2009: 10,
      2010: 5,
      2011: 5,
      2012: 5,
      2013: 5,
      2014: 5,
      2015: 5,
      2016: 5,
      2017: 5,
      2018: 5,
      2019: 5,
      2020: 5,
      2021: 5,
      2022: 5,
      2023: 5,
      2024: 5,
      2025: 5,
      2026: 5
    },
    borderColor: 'orange',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg'
  },
  {
    'label': 'C/C++',
    'years': {
      2002: 15,
      2003: 20,
      2004: 40
    },
    borderColor: 'gray',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg'
  },
  {
    'label': 'Adobe: Photoshop, Illustrator, PageMaker',
    'years': {
      1997: 15,
      1998: 50,
      1999: 80,
      2000: 90,
      2001: 90,
      2002: 90,
      2003: 90,
      2004: 90,
      2005: 100,
      2006: 100,
      2007: 100,
      2008: 50,
      2009: 20,
      2010: 10,
      2011: 9,
      2012: 8,
      2013: 7,
      2014: 6,
      2015: 5,
      2016: 3,
      2017: 3,
      2018: 2,
      2019: 2,
      2020: 2,
      2021: 1
    },
    borderColor: 'SeaGreen',
    fill: false,
  },
  {
    'label': 'Perl',
    'years': {
      1998: 10,
      1999: 10,
      2000: 50,
      2001: 50,
      2002: 50,
      2003: 50,
      2004: 50,
      2005: 25
    },
    borderColor: 'black',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/perl/perl-original.svg'
  },
  {
    'label': 'HTML',
    'years': {
      1998: 25,
      1999: 50,
      2000: 50,
      2001: 30,
      2002: 10,
      2003: 10,
      2004: 10,
      2005: 10,
      2006: 10,
      2007: 10,
      2008: 10,
      2009: 10,
      2010: 10,
      2011: 10,
      2012: 10,
      2013: 10,
      2014: 8,
      2015: 6,
      2016: 6,
      2017: 6,
      2018: 6,
      2019: 6,
      2020: 6,
      2021: 6,
      2022: 6,
      2023: 6,
      2024: 5,
      2025: 5,
      2026: 2
    },
    borderColor: 'Crimson',
    fill: false,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg'
  },
  {
    'label': 'Assembler 86',
    'years': {
      1995: 10,
      1996: 10
    },
    borderColor: 'FireBrick',
    fill: false,
  },
  {
    'label': 'Pascal',
    'years': {
      1994: 50,
      1995: 75,
      1996: 75,
    },
    borderColor: 'blue',
    fill: false,
  },
  {
    'label': 'Basic',
    'years': {
      1994: 50,
      1995: 15
    },
    borderColor: 'DarkRed',
    fill: false,
  }
];

const data = {
  labels: years,
  datasets: [...Array(stack.length)].map((x, index) => {
    // Find the last year this technology was used
    const lastUsedYear = Math.max(
      ...Object.keys(stack[index].years)
        .map(y => parseInt(y))
        .filter(y => stack[index].years[y] > 0)
    );

    // Check if not used in last 10 years (before 2016)
    const isOld = lastUsedYear < 2016;

    return {
      label: stack[index].label,
      data: [...Array(years_of_experience)].map((xx, iindex) => {
        let year = start_year + iindex
        // console.log(stack[index].years[year])
        if (stack[index] !== undefined && stack[index].years[year] !== undefined) {
          return stack[index].years[year]
        }
        return 0;
      }),
      borderColor: stack[index].borderColor,
      backgroundColor: transparentize(stack[index].borderColor),
      fill: stack[index].fill,
      isOld: isOld,
      logo: stack[index].logo // Pass through logo URL if it exists
    };
  })
};

// Vanilla Canvas Chart Implementation
class LineChart {
  constructor(canvas, data, datasets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = data;
    this.datasets = datasets;
    this.padding = { top: 40, right: 40, bottom: 200, left: 60 }; // Initial value, will be adjusted in resize()
    this.hoveredPoint = null;
    this.hoveredTimeline = null;
    this.tooltip = this.createTooltip();

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Add mouse move event for tooltips and timeline hover
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

    this.draw();
  }

  createTooltip() {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.display = 'none';
      tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '6px';
      tooltip.style.fontSize = '13px';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '1000';
      tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
      tooltip.style.whiteSpace = 'nowrap';
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundPoint = null;
    let minDistance = 15; // Threshold for hover detection
    let foundTimeline = null;

    // Check if hovering over timeline area
    const timelineTop = this.padding.top + this.chartHeight + 50;
    const rowHeight = 18;

    // Build the same visibleDatasets structure used in drawTimelineLabels
    const visibleDatasets = this.datasets
      .filter(dataset => !dataset.hidden)
      .map(dataset => {
        // Find first and last non-zero value years
        let firstYear = null;
        let lastYear = null;

        dataset.data.forEach((value, index) => {
          if (value > 0) {
            if (firstYear === null) firstYear = index;
            lastYear = index;
          }
        });

        if (firstYear === null) return null;

        // Include the first year with 0 after the last non-zero value
        let endYear = lastYear;
        for (let i = lastYear + 1; i < dataset.data.length; i++) {
          if (dataset.data[i] === 0) {
            endYear = i;
            break;
          }
        }

        const firstX = this.padding.left + (this.chartWidth / (this.data.length - 1)) * firstYear;
        const lastX = this.padding.left + (this.chartWidth / (this.data.length - 1)) * endYear;

        return {
          dataset,
          firstYear,
          lastYear: endYear,
          firstX,
          lastX
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.firstYear - b.firstYear); // Sort by first year

    // Check timeline bars for hover
    visibleDatasets.forEach((item, index) => {
      const timelineY = timelineTop + index * rowHeight;

      // Check if mouse is within timeline bar area (vertical)
      if (Math.abs(y - timelineY) < 6) {
        // Check if mouse X is within the timeline bar (horizontal)
        if (x >= item.firstX && x <= item.lastX) {
          foundTimeline = item.dataset;
        }
      }
    });

    // Check all visible datasets for nearby points (existing logic)
    this.datasets.forEach(dataset => {
      if (!dataset.hidden) {
        dataset.data.forEach((value, index) => {
          if (value > 0) {
            const px = this.padding.left + (this.chartWidth / (this.data.length - 1)) * index;
            const maxValue = Math.max(...this.datasets.flatMap(d => d.hidden ? [] : d.data));
            const scaledMax = Math.ceil(maxValue / 10) * 10 || 100;
            const py = this.padding.top + this.chartHeight - (value / scaledMax * this.chartHeight);

            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (distance < minDistance) {
              minDistance = distance;
              foundPoint = {
                dataset,
                value,
                year: this.data[index],
                x: px,
                y: py,
                screenX: e.clientX,
                screenY: e.clientY
              };
            }
          }
        });
      }
    });

    // Handle timeline hover
    if (foundTimeline !== this.hoveredTimeline) {
      // Clear previous timeline highlight
      if (this.hoveredTimeline) {
        this.hoveredTimeline.highlighted = false;
      }

      this.hoveredTimeline = foundTimeline;

      if (foundTimeline) {
        foundTimeline.highlighted = true;
        this.canvas.style.cursor = 'pointer';
      } else if (!foundPoint) {
        this.canvas.style.cursor = 'default';
      }

      this.draw();
    }

    // Handle point hover (existing logic)
    if (foundPoint && foundPoint !== this.hoveredPoint) {
      this.hoveredPoint = foundPoint;
      this.showTooltip(foundPoint);
      this.canvas.style.cursor = 'pointer';
      this.draw();
    } else if (!foundPoint && this.hoveredPoint) {
      this.hoveredPoint = null;
      this.hideTooltip();
      if (!foundTimeline) {
        this.canvas.style.cursor = 'default';
      }
      this.draw();
    } else if (foundPoint) {
      // Update tooltip position
      this.tooltip.style.left = foundPoint.screenX + 15 + 'px';
      this.tooltip.style.top = foundPoint.screenY - 10 + 'px';
    }
  }

  handleMouseLeave() {
    if (this.hoveredPoint) {
      this.hoveredPoint = null;
      this.hideTooltip();
      this.canvas.style.cursor = 'default';
      this.draw();
    }

    if (this.hoveredTimeline) {
      this.hoveredTimeline.highlighted = false;
      this.hoveredTimeline = null;
      this.canvas.style.cursor = 'default';
      this.draw();
    }
  }

  showTooltip(point) {
    this.tooltip.innerHTML = `
      <strong>${point.dataset.label}</strong><br>
      Year: ${point.year}<br>
      Value: ${point.value}
    `;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = point.screenX + 15 + 'px';
    this.tooltip.style.top = point.screenY - 10 + 'px';
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  resize() {
    const container = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    // Count visible datasets to calculate needed timeline height
    const visibleCount = this.datasets.filter(d => !d.hidden).length;
    const rowHeight = 18;
    const timelineHeight = visibleCount * rowHeight + 70; // 70px for spacing and labels

    // Calculate minimum height needed
    const chartAreaHeight = Math.max(400, container.clientWidth * 0.5);
    const totalHeight = chartAreaHeight + timelineHeight;

    this.canvas.width = container.clientWidth * dpr;
    this.canvas.height = totalHeight * dpr;
    this.canvas.style.width = container.clientWidth + 'px';
    this.canvas.style.height = totalHeight + 'px';

    this.ctx.scale(dpr, dpr);
    this.width = container.clientWidth;
    this.height = totalHeight;

    // Adjust bottom padding based on timeline needs
    this.padding.bottom = timelineHeight;

    this.chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.height - this.padding.top - this.padding.bottom;

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Find max value for scaling
    let maxValue = 0;
    this.datasets.forEach(dataset => {
      if (!dataset.hidden) {
        dataset.data.forEach(val => {
          if (val > maxValue) maxValue = val;
        });
      }
    });

    // Round up to nearest 10
    maxValue = Math.ceil(maxValue / 10) * 10;
    if (maxValue === 0) maxValue = 100;

    // Draw grid and axes
    this.drawGrid(maxValue);
    this.drawAxes();
    this.drawLabels(maxValue);

    // Check if any dataset is highlighted
    const hasHighlighted = this.datasets.some(d => d.highlighted && !d.hidden);

    // Draw lines (non-highlighted first, then highlighted)
    this.datasets.forEach(dataset => {
      if (!dataset.hidden && !dataset.highlighted) {
        this.drawLine(dataset, maxValue, hasHighlighted ? 0.2 : 1);
      }
    });

    // Draw highlighted lines on top
    this.datasets.forEach(dataset => {
      if (!dataset.hidden && dataset.highlighted) {
        this.drawLine(dataset, maxValue, 1);
      }
    });

    // Draw timeline labels below the chart
    this.drawTimelineLabels(maxValue);
  }

  drawTimelineLabels(maxValue) {
    // Get all visible datasets with their first and last usage years
    const visibleDatasets = this.datasets
      .filter(dataset => !dataset.hidden)
      .map(dataset => {
        // Find first and last non-zero value years
        let firstYear = null;
        let lastYear = null;

        dataset.data.forEach((value, index) => {
          if (value > 0) {
            if (firstYear === null) firstYear = index;
            lastYear = index;
          }
        });

        if (firstYear === null) return null;

        // Include the first year with 0 after the last non-zero value
        let endYear = lastYear;
        for (let i = lastYear + 1; i < dataset.data.length; i++) {
          if (dataset.data[i] === 0) {
            endYear = i;
            break;
          }
        }

        const firstX = this.padding.left + (this.chartWidth / (this.data.length - 1)) * firstYear;
        const lastX = this.padding.left + (this.chartWidth / (this.data.length - 1)) * endYear;

        return {
          dataset,
          firstYear,
          lastYear: endYear,
          firstX,
          lastX,
          yearLabel: `${this.data[firstYear]}-${this.data[endYear]}`
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.firstYear - b.firstYear); // Sort by first year

    // Draw timeline area - each tech on its own line
    const timelineTop = this.padding.top + this.chartHeight + 50;
    const rowHeight = 18;

    // Draw each technology timeline on its own row
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.textBaseline = 'middle';

    visibleDatasets.forEach((item, index) => {
      const y = timelineTop + index * rowHeight;
      const labelWidth = item.lastX - item.firstX;
      const isHighlighted = item.dataset.highlighted;

      // Enhanced visual for highlighted timeline
      if (isHighlighted) {
        // Draw glow effect behind the bar
        this.ctx.shadowColor = item.dataset.borderColor;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
      }

      // Draw timeline bar with enhanced styling when highlighted
      this.ctx.fillStyle = isHighlighted
        ? item.dataset.borderColor
        : transparentize(item.dataset.borderColor, 0.7);
      this.ctx.fillRect(item.firstX, y - 6, labelWidth, 12);

      // Reset shadow
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;

      // Draw border with thicker line when highlighted
      this.ctx.strokeStyle = item.dataset.borderColor;
      this.ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
      this.ctx.strokeRect(item.firstX, y - 6, labelWidth, 12);

      // Draw label text
      const labelText = item.dataset.label;
      const textWidth = this.ctx.measureText(labelText).width;

      this.ctx.fillStyle = isHighlighted ? 'white' : item.dataset.borderColor;
      this.ctx.font = isHighlighted ? 'bold 11px sans-serif' : 'bold 10px sans-serif';

      // Position text based on available space
      if (textWidth + 10 < labelWidth) {
        // Text fits inside the bar
        this.ctx.textAlign = 'center';
        this.ctx.fillText(labelText, (item.firstX + item.lastX) / 2, y);
      } else if (labelWidth > 30) {
        // Bar is wide enough, show abbreviated text
        this.ctx.textAlign = 'center';
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(item.firstX, y - 6, labelWidth, 12);
        this.ctx.clip();
        this.ctx.fillText(labelText, (item.firstX + item.lastX) / 2, y);
        this.ctx.restore();
      } else {
        // Bar too narrow, show text to the right
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = item.dataset.borderColor;
        this.ctx.fillText(labelText, item.lastX + 5, y);
      }

      // Draw start and end markers with enhanced styling when highlighted
      const markerSize = isHighlighted ? 4 : 3;
      this.ctx.fillStyle = item.dataset.borderColor;
      this.ctx.beginPath();
      this.ctx.arc(item.firstX, y, markerSize, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(item.lastX, y, markerSize, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawGrid(maxValue) {
    // Draw subtle gradient background
    const bgGradient = this.ctx.createLinearGradient(
      0,
      this.padding.top,
      0,
      this.padding.top + this.chartHeight
    );
    bgGradient.addColorStop(0, '#fafafa');
    bgGradient.addColorStop(1, '#f5f5f5');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(this.padding.left, this.padding.top, this.chartWidth, this.chartHeight);

    // Draw horizontal grid lines with modern styling
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const y = this.padding.top + (this.chartHeight / steps) * i;

      // Different styles for major vs minor lines
      if (i === 0 || i === steps) {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.lineWidth = 1.5;
      } else {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        this.ctx.lineWidth = 1;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.padding.left + this.chartWidth, y);
      this.ctx.stroke();
    }

    // Vertical grid lines (every 5 years) with modern styling
    const yearStep = 5;
    for (let i = 0; i < this.data.length; i += yearStep) {
      const x = this.padding.left + (this.chartWidth / (this.data.length - 1)) * i;

      // Stronger lines every 10 years
      if (i % 10 === 0) {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        this.ctx.lineWidth = 1.5;
      } else {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        this.ctx.lineWidth = 1;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding.top);
      this.ctx.lineTo(x, this.padding.top + this.chartHeight);
      this.ctx.stroke();
    }
  }

  drawAxes() {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;

    // Y axis
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding.left, this.padding.top);
    this.ctx.lineTo(this.padding.left, this.padding.top + this.chartHeight);
    this.ctx.stroke();

    // X axis
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding.left, this.padding.top + this.chartHeight);
    this.ctx.lineTo(this.padding.left + this.chartWidth, this.padding.top + this.chartHeight);
    this.ctx.stroke();
  }

  drawLabels(maxValue) {
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    // Y axis labels
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const value = maxValue - (maxValue / steps) * i;
      const y = this.padding.top + (this.chartHeight / steps) * i;
      this.ctx.fillText(Math.round(value), this.padding.left - 10, y);
    }

    // Y axis label (rotated)
    this.ctx.save();
    this.ctx.translate(15, this.padding.top + this.chartHeight / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText('Experience Level (%)', 0, 0);
    this.ctx.restore();

    // X axis labels (every 2 years)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px sans-serif';
    const yearStep = 2;

    // Always show first year
    const firstX = this.padding.left;
    this.ctx.fillText(this.data[0], firstX, this.padding.top + this.chartHeight + 10);

    // Show years in between (every 2 years)
    for (let i = yearStep; i < this.data.length - 1; i += yearStep) {
      const x = this.padding.left + (this.chartWidth / (this.data.length - 1)) * i;
      this.ctx.fillText(this.data[i], x, this.padding.top + this.chartHeight + 10);
    }

    // Always show last year
    const lastX = this.padding.left + this.chartWidth;
    this.ctx.fillText(this.data[this.data.length - 1], lastX, this.padding.top + this.chartHeight + 10);

    // X axis label
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText('Year', this.padding.left + this.chartWidth / 2, this.padding.top + this.chartHeight + 35);
  }

  drawLine(dataset, maxValue, opacity = 1) {
    const points = dataset.data.map((value, index) => {
      const x = this.padding.left + (this.chartWidth / (this.data.length - 1)) * index;
      const y = this.padding.top + this.chartHeight - (value / maxValue * this.chartHeight);
      return { x, y, value };
    });

    const isHighlighted = dataset.highlighted;
    const isOld = dataset.isOld;

    // Apply additional fading for old technologies
    const finalOpacity = isOld ? opacity * 0.4 : opacity;
    const rgb = hexToRgb(dataset.borderColor);

    // Create gradient for modern look
    const gradient = this.ctx.createLinearGradient(
      points[0].x,
      points[0].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalOpacity})`);
    gradient.addColorStop(0.5, `rgba(${Math.min(rgb.r + 40, 255)}, ${Math.min(rgb.g + 40, 255)}, ${Math.min(rgb.b + 40, 255)}, ${finalOpacity})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalOpacity})`);

    // Draw glow effect for modern look
    if (isHighlighted) {
      this.ctx.shadowColor = dataset.borderColor;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    } else if (!isOld) {
      this.ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;
    }

    // Draw smooth curved line using bezier curves
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = isHighlighted ? 5 : (isOld ? 2 : 3);
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();

    // Filter out zero-value points for smoother curves
    const activePoints = points.filter(p => p.value > 0);

    if (activePoints.length > 0) {
      this.ctx.moveTo(activePoints[0].x, activePoints[0].y);

      if (activePoints.length > 2) {
        // Use quadratic curves for smooth transitions
        for (let i = 0; i < activePoints.length - 1; i++) {
          const current = activePoints[i];
          const next = activePoints[i + 1];

          // Calculate control point for smooth curve
          const cpX = (current.x + next.x) / 2;
          const cpY = (current.y + next.y) / 2;

          this.ctx.quadraticCurveTo(current.x, current.y, cpX, cpY);
        }
        // Complete the last segment
        const last = activePoints[activePoints.length - 1];
        const secondLast = activePoints[activePoints.length - 2];
        this.ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
      } else if (activePoints.length === 2) {
        this.ctx.lineTo(activePoints[1].x, activePoints[1].y);
      }

      this.ctx.stroke();
    }

    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Draw gradient fill under the line for modern depth effect
    if (dataset.fill || !isOld) {
      const fillGradient = this.ctx.createLinearGradient(
        0,
        this.padding.top,
        0,
        this.padding.top + this.chartHeight
      );
      fillGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalOpacity * 0.3})`);
      fillGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      this.ctx.fillStyle = fillGradient;
      this.ctx.globalAlpha = finalOpacity;

      if (activePoints.length > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(activePoints[0].x, activePoints[0].y);

        // Redraw the curve for fill
        if (activePoints.length > 2) {
          for (let i = 0; i < activePoints.length - 1; i++) {
            const current = activePoints[i];
            const next = activePoints[i + 1];
            const cpX = (current.x + next.x) / 2;
            const cpY = (current.y + next.y) / 2;
            this.ctx.quadraticCurveTo(current.x, current.y, cpX, cpY);
          }
          const last = activePoints[activePoints.length - 1];
          const secondLast = activePoints[activePoints.length - 2];
          this.ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
        } else if (activePoints.length === 2) {
          this.ctx.lineTo(activePoints[1].x, activePoints[1].y);
        }

        // Complete the fill
        this.ctx.lineTo(activePoints[activePoints.length - 1].x, this.padding.top + this.chartHeight);
        this.ctx.lineTo(activePoints[0].x, this.padding.top + this.chartHeight);
        this.ctx.closePath();
        this.ctx.fill();
      }

      this.ctx.globalAlpha = 1;
    }

    // Draw modern data points with gradient and glow
    activePoints.forEach(point => {
      const isHoveredPoint = this.hoveredPoint &&
                             this.hoveredPoint.dataset === dataset &&
                             Math.abs(point.x - this.hoveredPoint.x) < 1 &&
                             Math.abs(point.y - this.hoveredPoint.y) < 1;

      let pointSize = isHighlighted ? 6 : (isOld ? 3 : 5);

      if (isHoveredPoint) {
        // Enhanced glow for hovered point
        this.ctx.shadowColor = dataset.borderColor;
        this.ctx.shadowBlur = 20;
        pointSize = 8;
      }

      // Create radial gradient for point
      const pointGradient = this.ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, pointSize
      );
      pointGradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
      pointGradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalOpacity})`);
      pointGradient.addColorStop(1, `rgba(${Math.max(rgb.r - 40, 0)}, ${Math.max(rgb.g - 40, 0)}, ${Math.max(rgb.b - 40, 0)}, ${finalOpacity})`);

      // Draw point with gradient
      this.ctx.fillStyle = pointGradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Add subtle border to points
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity * 0.8})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      if (isHoveredPoint) {
        // Reset shadow after drawing hovered point
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      }
    });
  }
}

// Initialize the chart
(function () {
  const canvas = document.getElementById("experience");
  let chart = null;
  let isInitialized = false;

  function updateChart(redrawOnly = false) {
    if (!chart) {
      chart = new LineChart(canvas, data.labels, data.datasets);
    } else {
      chart.draw();
    }

    // Only recreate legend on toggle clicks, not on hover
    if (!isInitialized || !redrawOnly) {
      createLegend(data.datasets, updateChart);
      isInitialized = true;
    }
  }

  function redrawChart() {
    if (chart) {
      chart.draw();
    }
  }

  // Create legend with proper callbacks
  chart = new LineChart(canvas, data.labels, data.datasets);
  createLegend(data.datasets, updateChart, redrawChart);
  isInitialized = true;

  // Fix for initial rendering - ensure proper sizing after layout is complete
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (chart) {
        chart.resize();
      }
    });
  });
})();
