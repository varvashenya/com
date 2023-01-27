import Chart from 'chart.js/auto'
import colorLib from '@kurkle/color';

function transparentize(value, opacity) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}

const getOrCreateLegendList = (chart, id) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = 0;
    listContainer.style.padding = 0;

    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.containerID);

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach(item => {
      const li = document.createElement('li');
      li.style.alignItems = 'center';
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.flexDirection = 'row';
      li.style.marginLeft = '10px';

      li.onclick = () => {
        const {type} = chart.config;
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility
          // is per item
          chart.toggleDataVisibility(item.index);
        }
        else {
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
        }
        chart.update();
      };

      // Color box
      const boxSpan = document.createElement('span');
      boxSpan.style.background = item.fillStyle;
      boxSpan.style.borderColor = item.strokeStyle;
      boxSpan.style.borderWidth = item.lineWidth + 'px';
      boxSpan.style.display = 'inline-block';
      boxSpan.style.height = '20px';
      boxSpan.style.marginRight = '10px';
      boxSpan.style.width = '20px';

      // Text
      const textContainer = document.createElement('p');
      textContainer.style.color = item.fontColor;
      textContainer.style.margin = 0;
      textContainer.style.padding = 0;
      textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

      const text = document.createTextNode(item.text);
      textContainer.appendChild(text);

      li.appendChild(boxSpan);
      li.appendChild(textContainer);
      ul.appendChild(li);
    });
  }
};

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
      2023: 40
    },
    borderColor: 'green',
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
      2023: 60
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
      2023: 2
    },
    borderColor: 'Teal',
    fill: false,
  },
  {
    'label': 'Javascript',
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
      2023: 3
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
      2023: 55
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
      2023: 5
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
      2023: 6
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

const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      htmlLegend: {
        // ID of the container to put the legend in
        containerID: 'legend-container',
      },
      legend: {
        display: false,
      }
    }
  },
  plugins: [htmlLegendPlugin],
};

(async function () {
  new Chart(document.getElementById("experience"), config);
})();
