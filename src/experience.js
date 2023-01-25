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
    'label': 'Basic',
    'years': {
      1994: 50,
      1995: 15
    },
    borderColor: 'red',
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
    'label': 'Assembler 86',
    'years': {
      1995: 10,
      1996: 10
    },
    borderColor: 'blue',
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
    'label': 'GNU/Linux',
    'years': {
      2005: 25,
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
    'label': 'PHP',
    'years': {
      2005: 25,
      2006: 40,
      2007: 50,
      2008: 65,
      2009: 75,
      2010: 75,
      2011: 75,
      2012: 75,
      2013: 90,
      2014: 90,
      2015: 90,
      2016: 90,
      2017: 90,
      2018: 90,
      2019: 90,
      2020: 80,
      2021: 75,
      2022: 60,
      2023: 55
    },
    borderColor: 'blue',
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
    'label': 'Drupal',
    'years': {
      2013: 10,
      2014: 15,
      2015: 30,
      2016: 60,
      2017: 80,
      2018: 80,
      2019: 80,
      2020: 70,
      2021: 65,
      2022: 60,
      2023: 60
    },
    borderColor: 'lightblue',
    fill: false,
  },
  {
    'label': 'GoLang',
    'years': {
      2021: 15,
      2022: 40,
      2023: 25
    },
    borderColor: 'orange',
    fill: false,
  },
  {
    'label': 'Python',
    'years': {
      2022: 3,
      2023: 3
    },
    borderColor: 'pink',
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
