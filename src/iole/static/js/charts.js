

function fetchVirtualFlow(sensor_name) {
  return fetch("/virtual-flow?sensor_name=" + sensor_name).then(response => response.json())
}

function fetchVirtualPressure(sensor_name) {
  return fetch("/virtual-pressure?sensor_name=" + sensor_name).then(response => response.json())
}

function fetchVirtualFlowRange(sensor_name, range_from, range_to) {
  return fetch("/virtual-flow?sensor_name=" + sensor_name + "&from=" + range_from + "&to=" + range_to).then(response => response.json())
}

function fetchVirtualPressureRange(sensor_name, range_from, range_to) {
  return fetch("/virtual-pressure?sensor_name=" + sensor_name + "&from=" + range_from + "&to=" + range_to).then(response => response.json())
}


function show_sensor_on_plot(sensor_name) {
  data = null
  fetchVirtualFlow(sensor_name).then(data => {

    Highcharts.chart('highChartsTestLeft', {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Virtual Pressures, LILA ' + sensor_name
      },
      xAxis: {
        type: "datetime",
      },
      yAxis: {
        title: {
          text: 'Virtual Pressure, LILA'
        }
      },
      series: [{
        name: 'Datetime',
        data: data.time_stamp.map((timestamp, index) => [new Date(timestamp).getTime(), data.value[index]])

      }],

    })
  })

  data = null


  fetchVirtualPressure(sensor_name).then(data => {

    Highcharts.chart('highChartsTest', {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Virtual Flows, DM ' + sensor_name
      },
      xAxis: {
        type: "datetime",
      },
      yAxis: {
        title: {
          text: 'Virtual Flows, DM'
        }
      },
      series: [{
        name: 'Datetime',
        data: data.time_stamp.map((timestamp, index) => [new Date(timestamp).getTime(), data.value[index]])

      }],

    })
  })



}


function show_sensor_on_plot_range(sensor_name, range_start, range_end, detection_time_lila = null, detection_time_dm = null) {

  data = null
  fetchVirtualPressureRange(sensor_name, range_start, range_end).then(data => {
    Highcharts.chart('highChartsTest', {
      chart: {
        type: 'line',
        animation: false
      },
      title: {
        text: 'Virtual Flows, DM'
      },
      xAxis: {
        type: "datetime",
        plotLines: [{
          color: 'red',
          width: 2,
          dashStyle: 'Dash',
          value: detection_time_dm,
          label: {
            text: 'DM detection time',
            align: 'left',
            x: 5,
            y: 15,
            style: { color: 'red', fontSize: '1em', textOutline: '1px contrast' }
          }, zIndex: 5000,
        }]
      },
      yAxis: {
        title: {
          text: 'Virtual Flows (Liters per second)'
        }
      },

      plotOptions: {
        series: {
          animation: false
        }
      },

      series: [{
        name: sensor_name,
        data: data.time_stamp.map((timestamp, index) => [new Date(timestamp).getTime(), data.value[index]]),

      }

      ],

    });

  })




  data = null
  fetchVirtualFlowRange(sensor_name, range_start, range_end).then(data => {
    console.log(data);
    Highcharts.chart('highChartsTestLeft', {
      chart: {
        type: 'line',
        animation: false
      },
      title: {
        text: 'Virtual Pressures, LILA'
      },
      xAxis: {
        type: "datetime",
        plotLines: [{
          color: 'red',
          width: 2,
          dashStyle: 'Dash',
          value: detection_time_lila,
          label: {
            text: 'LILA detection time',
            align: 'left',
            x: 5,
            y: 15,
            style: { color: 'red', fontSize: '1em', textOutline: '1px contrast' }
          },

          zIndex: 5000,


        }],



      },
      yAxis: {
        title: {
          text: 'Virtual Pressure (Meters)'
        }
      },

      plotOptions: {
        series: {
          animation: false
        }
      },


      series: [{
        name: sensor_name,
        data: data.time_stamp.map((timestamp, index) => [new Date(timestamp).getTime(), data.value[index]]),
      }],

    });

  })



}