
let node_markers = [];
let sensor_markers = [];
let pin_markers = [];
let probabilistic_circles = [];
let sensor_coordinates = {};
let plots_visible = false;
let highlighted_pipes = [];
let controller;
window.onload = function () {
  hide_plots();
  map.on('load', function () {
    controller = new Controller();
  });

  map.on('zoom', function () {
    console.log("extra advanced zoom", map.getZoom());
  });

  map.on('zoom', updateMarkerSize);

}

document.addEventListener('click', function () { document.getElementById("ioleLogo").style.height = "5%"; }, { once: true });



function updateMarkerSize() {
  const zoom = map.getZoom();
  const scale = Math.pow(1.5, zoom - 15);

  sensor_markers.forEach(element => {


    element.style.height = (3 * scale) + "em";
    element.style.width = (3 * scale) + "em";
  })

  node_markers.forEach(element => {

    element.style.height = (scale) + "em";
    element.style.width = (scale) + "em";
  })

  pin_markers.forEach(element => {


    element.style.height = (3 * scale) + "em";
    element.style.width = (3 * scale) + "em";

  })

  probabilistic_circles.forEach(element => {

    element.style.height = (10 * scale) + "em";
    element.style.width = (10 * scale) + "em";

  })

};














class Controller {


  constructor() {


    this.button = document.getElementById('hidePipes');
    this.linesVisible = true;
    this.nodesVisible = true;
    this.sensorsVisible = true;
    this.pinsVisible = true;
    this.node_coordinates = {};

    this.button.addEventListener('click', () => {
      if (this.linesVisible) {
        this.removeLineLayer();
      } else {
        this.addLineLayer();
      }
    });

    this.node_button = document.getElementById('hideNodes');
    this.nodesVisible = true;
    this.node_button.addEventListener('click', () => {
      if (this.nodesVisible) {
        this.removeNodeLayer();
      } else {
        this.addNodeLayer();
      }
    });

    this.sensor_button = document.getElementById('hideSensors');
    this.sensorsVisible = true;
    this.sensor_button.addEventListener('click', () => {
      if (this.sensorsVisible) {
        this.removeSensorLayer();
      } else {
        this.addSensorLayer();
      }
    });

    this.pin_button = document.getElementById("hidePins");
    this.pin_button.addEventListener('click', () => {
      this.removePinLayer();
    })


    let nodes_json = JSON.parse(document.getElementById("nodesFromDB").textContent);
    console.log(nodes_json);
    for (let i = 0; i < nodes_json.length; i++) {
      this.node_coordinates[nodes_json[i][2]] = [nodes_json[i][0], nodes_json[i][1]];
    }


    this.addSensorLayer();
    this.addLineLayer();

  }


  togglePipeLayer() {
    if (this.linesVisible) {
      this.removeLineLayer();
    } else {
      this.addLineLayer();
    }
  }

  toggleNodeLayer() {
    if (this.nodesVisible) {
      this.removeNodeLayer();
    } else {
      this.addNodeLayer();
    }
  }


  removeNodeLayer() {
    node_markers.forEach(element => element.remove());
    node_markers = [];
    this.nodesVisible = false;
  }

  addNodeLayer() {

    let nodes = JSON.parse(document.getElementById("nodesFromDB").textContent);
    console.log("parsed nodes", nodes);
    let linePairs = JSON.parse(document.getElementById("pipeCoordinates").textContent);
    console.log("parsed pipes", linePairs);
    for (let i = 0; i < nodes.length; i++) {
      let element = document.createElement('div');

      element.id = nodes[i][2];
      node_markers.push(element);

      element.className = "marker-node";
      element.style.width = (Math.pow(1.5, map.getZoom() - 15)) + "em";
      element.style.height = (Math.pow(1.5, map.getZoom() - 15)) + "em";



      new maplibregl.Marker({ element: element }).setLngLat([nodes[i][0], nodes[i][1]]).addTo(map);
    }
    this.nodesVisible = true;

  }


  removeLineLayer() {
    if (map.getLayer('pair-lines-layer')) {
      map.removeLayer('pair-lines-layer');
    }
    if (map.getSource('pair-lines')) {
      map.removeSource('pair-lines');
    }
    this.linesVisible = false;
  }

  removeExtraLineLayer() {
    if (map.getLayer('pair-lines-layer-extra')) {
      map.removeLayer('pair-lines-layer-extra');
    }
    if (map.getSource('pair-lines-layer-extra')) {
      map.removeSource('pair-lines-layer-extra');
    }
    this.linesVisible = false;
  }


  addSensorLayer() {

    let nodes = JSON.parse(document.getElementById("nodesFromDB").textContent);
    console.log("parsed nodes", nodes);
    let linePairs = JSON.parse(document.getElementById("pipeCoordinates").textContent);
    console.log("parsed pipes", linePairs);

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i][3]) {
        let element = document.createElement('img');

        element.id = nodes[i][2];
        element.dataset.x = nodes[i][0];
        element.dataset.y = nodes[i][1];
        sensor_coordinates[nodes[i][2]] = [nodes[i][0], nodes[i][1]];
        sensor_markers.push(element);
        element.style.cursor = 'pointer';

        element.addEventListener('click', () => { visiblify_plots(); show_sensor_on_plot_range(nodes[i][2], 1548921600000, 1551235200000); });
        element.className = "marker-sensor";
        element.style.width = (3 * Math.pow(1.5, map.getZoom() - 15)) + "em";
        element.style.height = (3 * Math.pow(1.5, map.getZoom() - 15)) + "em";

        element.src = "/static/assets/iole_o.png";

        new maplibregl.Marker({ element: element }).setLngLat([nodes[i][0], nodes[i][1]]).addTo(map);
      }
      this.sensorsVisible = true;

    }
  }

  removeSensorLayer() {
    sensor_markers.forEach(element => element.remove());
    sensor_markers = [];
    this.sensorsVisible = false;
  }

  addExtraLineLayer() {


    let linePairs = JSON.parse(document.getElementById("pipeCoordinates").textContent);

    console.log("line pairs", linePairs);



    let geojson = {
      type: "FeatureCollection",
      features: linePairs.map(pair => {
        const [from, to, name] = pair;
        let isHighlighted = highlighted_pipes.includes(name);
        let color = isHighlighted ? "#FF5733" : "#23AEBA";

        return {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [from, to]
          },
          properties: {
            color,
            name
          }
        };
      })
    };


    if (map.getSource('pair-lines-extra')) {
      map.getSource('pair-lines-extra').setData(geojson);
    } else {
      map.addSource('pair-lines-extra', {
        type: 'geojson',
        data: geojson
      });
    }

    map.addLayer({
      id: 'pair-lines-layer-extra',
      type: 'line',
      source: 'pair-lines-extra',
      paint: {
        'line-color': ["get", "color"],
        'line-width': 5
      }
    });
    this.linesVisible = true;
  }

  addLineLayer() {

    let linePairs = JSON.parse(document.getElementById("pipeCoordinates").textContent);

    console.log("line pairs", linePairs);


    let geojson = {
      type: "FeatureCollection",
      features: linePairs.map(pair => {
        const [from, to, name] = pair;
        let isHighlighted = highlighted_pipes.includes(name);
        let color = isHighlighted ? "#FF5733" : "#23AEBA";

        return {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [from, to]
          },
          properties: {
            color,
            name
          }
        };
      })
    };


    map.addSource('pair-lines', {
      type: 'geojson',
      data: geojson
    });
    map.addLayer({
      id: 'pair-lines-layer',
      type: 'line',
      source: 'pair-lines',
      paint: {
        'line-color': ["get", "color"],//'#23AEBA',
        'line-width': 5
      }
    });
    this.linesVisible = true;
  }

  addPinLayer(sensor_name) {


    let element = document.createElement('img');

    element.id = sensor_name + "_pin";

    pin_markers.push(element);
    element.style.cursor = 'pointer';

    element.style.width = (3 * Math.pow(1.5, map.getZoom() - 15)) + "em";
    element.style.height = (3 * Math.pow(1.5, map.getZoom() - 15)) + "em";

    element.src = "/static/assets/pin.svg";


    new maplibregl.Marker({ element: element, anchor: 'bottom' }).setLngLat(this.node_coordinates[sensor_name]).addTo(map);

    let element2 = document.createElement('img');
    element2.src = "/static/assets/probabilistic.svg";

    probabilistic_circles.push(element2)

    element2.style.width = (10 * Math.pow(1.5, map.getZoom() - 15)) + "em";
    element2.style.height = (10 * Math.pow(1.5, map.getZoom() - 15)) + "em";
    new maplibregl.Marker({ element: element2 }).setLngLat(this.node_coordinates[sensor_name]).addTo(map);



  }



  removePinLayer() {
    if (this.pinsVisible) {
      pin_markers.forEach(element => element.classList.remove("visible_pin"))
      pin_markers.forEach(element => element.classList.add("invisible_pin"))
      this.pinsVisible = false
    } else {
      pin_markers.forEach(element => element.classList.add("visible_pin"))
      pin_markers.forEach(element => element.classList.remove("invisible_pin"))
      this.pinsVisible = true
    }

  }

  delete_pins() {
    pin_markers.forEach(element => element.remove());
    probabilistic_circles.forEach(element => element.remove());
  }


}

function visiblify_plots() {
  document.getElementById("highChartsTest").classList.remove("hidden");
  document.getElementById("highChartsTestLeft").classList.remove("hidden");
  plots_visible = true;
}

function hide_plots() {
  if (!document.getElementById("highChartsTest").classList.contains("hidden")) {
    document.getElementById("highChartsTest").classList.add("hidden");
  }
  if (!document.getElementById("highChartsTestLeft").classList.contains("hidden")) {
    document.getElementById("highChartsTestLeft").classList.add("hidden");
  }
  plots_visible = false;
}

//
// End of CONTROLLER in the context of MVC
//