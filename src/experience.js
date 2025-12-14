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

function createLegend(datasets, toggleCallback) {
  const legendContainer = document.getElementById('legend-container');
  legendContainer.innerHTML = '';

  const ul = document.createElement('ul');
  ul.style.display = 'flex';
  ul.style.flexDirection = 'row';
  ul.style.flexWrap = 'wrap';
  ul.style.margin = '0';
  ul.style.padding = '0';
  ul.style.listStyle = 'none';

  datasets.forEach((dataset, index) => {
    const li = document.createElement('li');
    li.style.alignItems = 'center';
    li.style.cursor = 'pointer';
    li.style.display = 'flex';
    li.style.flexDirection = 'row';
    li.style.marginLeft = '10px';
    li.style.marginBottom = '5px';

    li.onclick = () => {
      dataset.hidden = !dataset.hidden;
      toggleCallback();
    };

    // Color box
    const boxSpan = document.createElement('span');
    boxSpan.style.background = dataset.borderColor;
    boxSpan.style.borderColor = dataset.borderColor;
    boxSpan.style.borderWidth = '2px';
    boxSpan.style.borderStyle = 'solid';
    boxSpan.style.display = 'inline-block';
    boxSpan.style.height = '20px';
    boxSpan.style.marginRight = '10px';
    boxSpan.style.width = '20px';

    // Text
    const textContainer = document.createElement('p');
    textContainer.style.color = '#333';
    textContainer.style.margin = '0';
    textContainer.style.padding = '0';
    textContainer.style.fontSize = 'inherit';
    textContainer.style.textDecoration = dataset.hidden ? 'line-through' : '';
    textContainer.textContent = dataset.label;

    li.appendChild(boxSpan);
    li.appendChild(textContainer);
    ul.appendChild(li);
  });

  legendContainer.appendChild(ul);
}


const currentTime = new Date();
const start_year = 1994;
const years_of_experience = currentTime.getFullYear() - start_year + 1;
const years = [...Array(years_of_experience)].map((x, index) => start_year + index);
console.log(years);

const stack = [
  {
    'label': 'Python',
    'years': {
      2022: 2,
      2023: 5
    },
    borderColor: 'red',
    fill: false,
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
  },
  {
    'label': 'Laravel',
    'years': {
      2022: 20,
      2023: 10,
      2024: 15,
      2025: 0
    },
    borderColor: 'darkgreen',
    fill: false,
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
      2025: 15
    },
    borderColor: 'RebeccaPurple',
    fill: false,
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
      2025: 0
    },
    borderColor: 'Teal',
    fill: false,
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
      2025: 25
    },
    borderColor: 'lightblue',
    fill: false,
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
      2025: 75
    },
    borderColor: 'blue',
    fill: false,
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
      2025: 5
    },
    borderColor: 'orange',
    fill: false,
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
      2025: 5
    },
    borderColor: 'Crimson',
    fill: false,
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
      fill: stack[index].fill
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
    this.padding = { top: 40, right: 40, bottom: 60, left: 60 };

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.draw();
  }

  resize() {
    const container = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = container.clientWidth * dpr;
    this.canvas.height = Math.max(400, container.clientWidth * 0.5) * dpr;
    this.canvas.style.width = container.clientWidth + 'px';
    this.canvas.style.height = Math.max(400, container.clientWidth * 0.5) + 'px';

    this.ctx.scale(dpr, dpr);
    this.width = container.clientWidth;
    this.height = Math.max(400, container.clientWidth * 0.5);

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

    // Draw lines
    this.datasets.forEach(dataset => {
      if (!dataset.hidden) {
        this.drawLine(dataset, maxValue);
      }
    });
  }

  drawGrid(maxValue) {
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;

    // Horizontal grid lines
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const y = this.padding.top + (this.chartHeight / steps) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.padding.left + this.chartWidth, y);
      this.ctx.stroke();
    }

    // Vertical grid lines (every 5 years)
    const yearStep = 5;
    for (let i = 0; i < this.data.length; i += yearStep) {
      const x = this.padding.left + (this.chartWidth / (this.data.length - 1)) * i;
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

    // X axis labels (every 2 years)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    const yearStep = 2;
    for (let i = 0; i < this.data.length; i += yearStep) {
      const x = this.padding.left + (this.chartWidth / (this.data.length - 1)) * i;
      this.ctx.fillText(this.data[i], x, this.padding.top + this.chartHeight + 10);
    }
  }

  drawLine(dataset, maxValue) {
    const points = dataset.data.map((value, index) => {
      const x = this.padding.left + (this.chartWidth / (this.data.length - 1)) * index;
      const y = this.padding.top + this.chartHeight - (value / maxValue * this.chartHeight);
      return { x, y, value };
    });

    // Draw line
    this.ctx.strokeStyle = dataset.borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });

    this.ctx.stroke();

    // Draw fill if enabled
    if (dataset.fill) {
      this.ctx.fillStyle = transparentize(dataset.borderColor, 0.8);
      this.ctx.lineTo(points[points.length - 1].x, this.padding.top + this.chartHeight);
      this.ctx.lineTo(points[0].x, this.padding.top + this.chartHeight);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Draw points
    this.ctx.fillStyle = dataset.borderColor;
    points.forEach(point => {
      if (point.value > 0) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
}

// Initialize the chart
(function () {
  const canvas = document.getElementById("experience");
  const chart = new LineChart(canvas, data.labels, data.datasets);

  // Create legend with toggle callback
  createLegend(data.datasets, () => {
    chart.draw();
    // Update legend styles
    createLegend(data.datasets, () => chart.draw());
  });
})();
