{% load static %}
function init() {



    ///
    /// Declaration of Variables
    ///

    //Variables for map interactions
    let scale = 1;
    let panning = false;
    let zooming = false;
    let xoff = 0;
    let yoff = 0;
    let start = { x: 0, y: 0 };
    let doc = document.getElementById("document");

    //Vriables for simulation
    let selectedTime = 1550862600000;
    let timeDifference = 345600000;
    let selectedTimeMinus = selectedTime - timeDifference;

    //List of pipe junctions (nodes and their coordinates)
    let junctionList = {{ nodesFromDB | safe }};
    // Title was unclear,
    //List of pipes (and the junctions it connects)
    let pipeList = {{ pipesFromDB | safe }};
    //List of sensors (sensors and coordinates)
    let sensorList = {{ sensorsFromDB | safe }};

    //List of leaks
    leaks = [];
    //Struct of leaks
    leaksStruct = {};
    //List of leak IDs
    leakIDs = [];
    //List of leak detection times for LILA
    leakDetetcitonTimesLILA = [];
    //List of leak detection times for DM
    leakDetectionTimesDM = [];
    //Struct with notes
    notesStruct = {};
    //Simulation slider
    slider = document.getElementById("simulationTimeSlider");

    //URL Prefix for the LILA model ()
    const url_prefix_LILA = "http://141.23.69.55:3000/d-solo/deg8cevuocq9se/pipe-p96?orgId=1&";
    const url_prefix_DM_each_sensor = "http://141.23.69.55:3000/d-solo/dejokqq3u1340c/b23fc88?orgId=1&";
    const url_prefix_DM = "http://141.23.69.55:3000/d-solo/dejo3z68kibr4a/pipe-p96-same-as-p98-but-different?orgId=1&";

    //Definition of the map, needs to be defined in this variable and in the corresponding CSS style background property
    let map = {
        left: degreesToRadians(33.00748),
        right: degreesToRadians(33.08576),
        top: degreesToRadians(34.70916),
        bottom: degreesToRadians(34.65001),
        url: "{% static 'assets/top_34_70916_right_33_08576_bot_34.65001_left_33.00748_low2.png' %}",
    }



    // variable for feedback:
    feedback = "";
    company = "";
    email = "";

    ///
    /// Definitions of functions
    ///



    //
    // Manipulation of" items on the map
    //



    // function to change degrees to radians
    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // function to get the dimensions of the background map
    function getBackgroundDimensions() {

        backgroundElement = document.getElementById("full_background");
        styles = window.getComputedStyle(backgroundElement).backgroundImage;
        backgroundFile = String(styles).split("/").slice(-1)[0].split('"')[0];
        backgroundFile = "{% static 'assets/top_34_70916_right_33_08576_bot_34.65001_left_33.00748_low2.png' %}";

        backgroundImg = new Image();
        backgroundImg.src = backgroundFile;
        //console.log(backgroundFile);

        return { width: backgroundImg.width, height: backgroundImg.height };

    }

    // this function has to be called in the beginning in order for the background to be properly positioned
    function placeBackgroundImage() {

        backgroundDimensions = getBackgroundDimensions();

        console.log(backgroundDimensions.width, backgroundDimensions.height);
        backgroundElement.style.width = backgroundDimensions.width + "px";
        backgroundElement.style.height = backgroundDimensions.height + "px";

    }

    // this functions returns the coordinates relative to the original size of the background image in pixels based on geographical coordinates
    function getRelativePositionForCoordinates(lat, lon) {

        latRad = degreesToRadians(lat);
        lonRad = degreesToRadians(lon);
        backgroundDimensions = getBackgroundDimensions();

        lonRelativePosition = backgroundDimensions.width * (lonRad - map.left) / (map.right - map.left);
        latRelativePosition = backgroundDimensions.height * (1 - (latRad - map.bottom) / (map.top - map.bottom)); // for northeastern hemisphere only

        return { x: lonRelativePosition, y: latRelativePosition };

    }

    // this function places a new sensor on the map based on geographical coordinates, with a given ID
    function placeNewSensorOnMap(lat, lon, itemID) {

        position = getRelativePositionForCoordinates(lat, lon);

        var newElement = document.createElement('div');
        newElement.classList.add("item");
        newElement.classList.add("zeroheight");
        newElement.id = itemID;

        newElement.dataset.x = position.x;
        newElement.dataset.y = position.y;

        newWarningElement = document.createElement('img');
        newWarningElement.src = "{% static 'assets/iOLE_o.png' %}";
        newWarningElement.classList.add("map-sensor");

        newWarningElement.addEventListener("click", function () {
            return toggleGraphShowSensorData(url_prefix_LILA + "from=1546340999000&to=1577784968000&timezone=browser&panelId=1&__feature.dashboardSceneSolo", url_prefix_DM_each_sensor + "from=1546340999000&to=1577784968000&timezone=browser&panelId=1&__feature.dashboardSceneSolo", "vp_" + itemID.replace("_sensor", ""))
        });

        newElement.appendChild(newWarningElement);


        document.getElementById("listOfSensors").appendChild(newElement);

        backgroundDimensions = getBackgroundDimensions();

        position = getRelativePositionForCoordinates(lat, lon);

        lonRelativePosition = backgroundDimensions.width * (lonRad - map.left) / (map.right - map.left);
        latRelativePosition = backgroundDimensions.height * (1 - (latRad - map.bottom) / (map.top - map.bottom));
        document.getElementById(itemID).style.transform = 'translate(' + (position.x) + 'px, ' + (position.y) + 'px)';

        addHoverPopup(itemID);
    }

    // function to place a new pipe junction on the map
    function placeNewJunctionOnMap(lat, lon, junctionID) {

        position = getRelativePositionForCoordinates(lat, lon);

        var newElement = document.createElement('div');
        newElement.classList.add("list_of_junctions");
        newElement.classList.add("zeroheight");
        newElement.id = junctionID;

        newElement.dataset.x = position.x;
        newElement.dataset.y = position.y;

        newWarningElement = document.createElement('div');

        newWarningElement.classList.add("map-junction");

        newElement.appendChild(newWarningElement);



        document.getElementById("listOfJunctions").appendChild(newElement);

        backgroundDimensions = getBackgroundDimensions();


        position = getRelativePositionForCoordinates(lat, lon);

        lonRelativePosition = backgroundDimensions.width * (lonRad - map.left) / (map.right - map.left);
        latRelativePosition = backgroundDimensions.height * (1 - (latRad - map.bottom) / (map.top - map.bottom));
        document.getElementById(junctionID).style.transform = 'translate(' + (position.x) + 'px, ' + (position.y) + 'px)';

    }



    //
    // Manipultation of items on the map end
    //



    //
    // Plot management
    //



    //legacy, no plan for future use
    // function to toggle graph, used in previous version,s still used by buttons in L-town, but not really important or relevant for
    function toggleGraph(url_left, url_right) {

        // document.getElementById("layer-selector-id").classList.toggle("layer-selector-top");
        // document.getElementById("layer-selector-id").classList.toggle("layer-selector");
        // document.getElementById("feedbackInputField").classList.toggle("feedback-input-field");
        // document.getElementById("feedbackInputField").classList.toggle("feedback-input-field-top");
        //document.getElementById("layer-selector-id").classList.toggle("layer-selector-top");
        if (document.getElementById("graphDivLeft").querySelector("iframe") == null) {
            document.getElementById("graphDivLeft").style.height = "40%";
            document.getElementById("graphDivLeft").innerHTML = '<iframe class="graph_iframe_left" src="' + url_left + '"></iframe>';

            document.getElementById("layer-selector-id").classList.remove("layer-selector");
            document.getElementById("feedbackInputField").classList.remove("feedback-input-field");
            document.getElementById("emailInputField").classList.remove("email-input-field");
            document.getElementById("companyInputField").classList.remove("company-input-field");

            document.getElementById("layer-selector-id").classList.add("layer-selector-top");
            document.getElementById("feedbackInputField").classList.add("feedback-input-field-top");
            document.getElementById("emailInputField").classList.add("email-input-field-top");
            document.getElementById("companyInputField").classList.add("company-input-field-top");
            addPlotTextBox();

        } else {
            if (document.getElementById("graphDivLeft").querySelector("iframe").src == url_left) {
                document.getElementById("graphDivLeft").innerHTML = null;
                document.getElementById("graphDivLeft").style.height = "0px";
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector-top");
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector");

                document.getElementById("layer-selector-id").classList.add("layer-selector");
                document.getElementById("feedbackInputField").classList.add("feedback-input-field");
                document.getElementById("emailInputField").classList.add("email-input-field");
                document.getElementById("companyInputField").classList.add("company-input-field");

                document.getElementById("layer-selector-id").classList.remove("layer-selector-top");
                document.getElementById("feedbackInputField").classList.remove("feedback-input-field-top");
                document.getElementById("emailInputField").classList.remove("email-input-field-top");
                document.getElementById("companyInputField").classList.remove("company-input-field-top");
                removePlotTextBox();

            } else {
                document.getElementById("graphDivLeft").style.height = "40%";
                document.getElementById("graphDivLeft").innerHTML = '<iframe class="graph_iframe_left" src="' + url_left + '"></iframe>';
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector");
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector-top");

                document.getElementById("layer-selector-id").classList.remove("layer-selector");
                document.getElementById("feedbackInputField").classList.remove("feedback-input-field");
                document.getElementById("emailInputField").classList.remove("email-input-field");
                document.getElementById("companyInputField").classList.remove("company-input-field");

                document.getElementById("layer-selector-id").classList.add("layer-selector-top");
                document.getElementById("feedbackInputField").classList.add("feedback-input-field-top");
                document.getElementById("emailInputField").classList.add("email-input-field-top");
                document.getElementById("companyInputField").classList.add("company-input-field-top");
                addPlotTextBox();
            }
        }





        if (document.getElementById("graphDivRight").querySelector("iframe") == null) {
            document.getElementById("graphDivRight").style.height = "40%";
            document.getElementById("graphDivRight").innerHTML = '<iframe class="graph_iframe_right" src="' + url_right + '"></iframe>';
            //document.getElementById("layer-selector-id").classList.toggle("layer-selector");
            //document.getElementById("layer-selector-id").classList.toggle("layer-selector-top")


        } else {
            if (document.getElementById("graphDivRight").querySelector("iframe").src == url_right) {
                document.getElementById("graphDivRight").innerHTML = null;
                document.getElementById("graphDivRight").style.height = "0px";
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector-top");
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector");
            } else {
                document.getElementById("graphDivRight").style.height = "40%";
                document.getElementById("graphDivRight").innerHTML = '<iframe class="graph_iframe_right" src="' + url_right + '"></iframe>';
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector");
                //document.getElementById("layer-selector-id").classList.toggle("layer-selector-top");

            }
        }

    }

    //toggles the visualization of the graph to either show or hide sensor data
    function toggleGraphShowSensorData(url_left, url_right, sensorName) {
        url_left = url_left.replace("&to=", "&var-querysensor01=" + sensorName + "&to=");
        url_right = url_right.replace("&to=", "&var-querysensor01=" + sensorName + "&to=");

        console.log(url_left);

        if (document.getElementById("graphDivLeft").querySelector("iframe") == null) {
            document.getElementById("graphDivLeft").style.height = "40%";
            document.getElementById("graphDivLeft").innerHTML = '<iframe class="graph_iframe_left" src="' + url_left + '"></iframe>'

        } else {

            if (document.getElementById("graphDivLeft").querySelector("iframe").src == url_left) {
                document.getElementById("graphDivLeft").innerHTML = null;
                document.getElementById("graphDivLeft").style.height = "0px";
            } else {
                document.getElementById("graphDivLeft").style.height = "40%";
                document.getElementById("graphDivLeft").innerHTML = '<iframe class="graph_iframe_left" src="' + url_left + '"></iframe>'
            }

        }

        if (document.getElementById("graphDivRight").querySelector("iframe") == null) {
            document.getElementById("graphDivRight").style.height = "40%";
            document.getElementById("graphDivRight").innerHTML = '<iframe class="graph_iframe_right" src="' + url_right + '"></iframe>'

        } else {
            if (document.getElementById("graphDivRight").querySelector("iframe").src == url_right) {
                document.getElementById("graphDivRight").innerHTML = null;
                document.getElementById("graphDivRight").style.height = "0px";
            } else {
                document.getElementById("graphDivRight").style.height = "40%";
                document.getElementById("graphDivRight").innerHTML = '<iframe class="graph_iframe_right" src="' + url_right + '"></iframe>'

            }
        }
    }



    //
    // Plot management end
    //



    //
    // Leakage list manipulation
    //



    //function to add a new leak
    function addNewLeak(leakName, ...args) {
        newLeakStruct = {};
        newLeakStruct["Name"] = leakName;
        newLeakStruct["ID"] = "leak" + Math.max(leakIDs.length);
        leakIDs.push(newLeakStruct["ID"]);
        inputTupleList = []

        for (let i = 0; i < args.length; i = i + 2) {
            //tupleList.push(args.slice(i,i+2));
            inputTuple = args.slice(i, i + 2);
            if (typeof inputTuple[0] == "string") {
                if (inputTuple[1].includes(":")) {
                    lilaDetectionDate = new Date(inputTuple[1]);
                    lilaDetectionDate = lilaDetectionDate.getTime();
                } else {
                    inputTuple[1] = lilaDetectionDate;
                }

                newLeakStruct["AffectedSensorLILA"] = inputTuple[0];
                newLeakStruct["DetectionTimeLILA"] = lilaDetectionDate;
                leakDetetcitonTimesLILA.push(newLeakStruct["DetectionTimeLILA"]);


            } else {
                if (inputTuple[1].includes(":")) {
                    dmDetectionDate = new Date(inputTuple[1]);
                    dmDetectionDate = dmDetectionDate.getTime();
                } else {
                    inputTuple[1] = dmDetectionDate;
                }

                newLeakStruct["AffectedPipesDM"] = inputTuple[0];
                newLeakStruct["DetectionTimeDM"] = dmDetectionDate;
                leakDetectionTimesDM.push(newLeakStruct["DetectionTimeDM"]);
            }
        }

        centerTime = 0;
        centerTimePadding = 0;
        centerTimeMargin = 172800000;// 2 days;

        if (newLeakStruct["DetectionTimeLILA"] > 0 && newLeakStruct["DetectionTimeDM"] > 0) {
            centerTime = (newLeakStruct["DetectionTimeDM"] + newLeakStruct["DetectionTimeLILA"]) / 2;
            centerTimePadding = Math.abs(newLeakStruct["DetectionTimeDM"] - newLeakStruct["DetectionTimeLILA"]) / (2);
            console.log("combined time", (newLeakStruct["DetectionTimeDM"] + newLeakStruct["DetectionTimeLILA"]));
            console.log("center time", centerTime);
        } else if ("DetectionTimeDM" in newLeakStruct) {
            centerTime = newLeakStruct["DetectionTimeLILA"];
        } else if ("DetectionTimeDM" in newLeakStruct) {
            centerTime = newLeakStruct["DetectionTimeDM"];
        }

        newLeakStruct["fromTime"] = (centerTime - centerTimePadding - centerTimeMargin);
        newLeakStruct["toTime"] = centerTime + centerTimePadding + centerTimeMargin;

        leaks.push(newLeakStruct);
        leaksStruct[newLeakStruct["ID"]] = newLeakStruct;

        addNewLeakElement(newLeakStruct);
        return (newLeakStruct["ID"]);

    }

    // add the leakage element on the page using the leak struct
    function addNewLeakElement(leakStruct) {
        newLeak = document.createElement("div");
        newLeak.classList.add("leakages-item");
        newLeak.id = "todoID";
        newLeak.addEventListener("click", function () { showLeakOnMap(leakStruct["ID"]); showLeakOnGraphs(leakStruct["ID"]); centerMapOnElementID(leakStruct.AffectedPipesDM[0]); });

        leakImage = document.createElement("img");
        leakImage.classList.add("list-item-warning_image");
        leakImage.src = "{% static 'assets/leakages-list-item-red_warning.png' %}";

        newLeak.appendChild(leakImage);

        leakText = document.createElement("div");
        leakText.classList.add("list-item-warning_text");
        leakText.innerHTML = leakStruct.Name;
        newLeak.appendChild(leakText);
        document.getElementById("leakagesList").insertBefore(newLeak, document.getElementById("leakagesList").childNodes[0]);
    }

    //function to round given date up to next hour
    function roundUpToNextHour(date) {
        const rounded = new Date(date);
        if (rounded.getMinutes() > 0 || rounded.getSeconds() > 0 || rounded.getMilliseconds() > 0) {
            rounded.setHours(rounded.getHours() + 1);
            rounded.setMinutes(0, 0, 0);
        }
        return rounded;
    }

    //function to show leak on map (both LILA and DM, if present in struct)
    function showLeakOnMap(leakID) {
        if (typeof leakID == "string") {
            leakStruct = leaksStruct[leakID];
        } else {
            leakStruct = leakID
        }
        console.log("showleakonmap leak struct ", leakStruct);
        //if LiLA is present
        console.log(leakStruct);
        if ("AffectedSensorLILA" in leakStruct) {
            setAffectedSensorToggle(leakStruct["AffectedSensorLILA"]);
        }
        //if DM present
        if ("AffectedPipesDM" in leakStruct) {
            setAffectedPipesToggle(leakStruct["AffectedPipesDM"]);
        }

    }

    //function to show the graphs on map
    function showLeakOnGraphs(leakID) {

        if (typeof leakID == "string") {
            newLeakStruct = leaksStruct[leakID];
        } else {
            newLeakStruct = leakID
        }

        url_postfix_LILA = "";
        url_postfix_DM = "";
        if ("DetectionTimeLILA" in newLeakStruct) {
            lILA_detection_time_datetime = new Date(newLeakStruct.DetectionTimeLILA);
            lILA_detection_time_end = new Date(lILA_detection_time_datetime.getTime() + 3600000);
            lILA_detection_time_end = roundUpToNextHour(lILA_detection_time_end);
            lILA_detection_time_end = lILA_detection_time_end.toISOString();
            lILA_detection_time_datetime = roundUpToNextHour(lILA_detection_time_datetime);
            lILA_detection_time_ISO = lILA_detection_time_datetime.toISOString();
            from_time_datetime = new Date(newLeakStruct.fromTime);
            from_time_ISO = from_time_datetime.toISOString();
            to_time_datetime = new Date(newLeakStruct.toTime);
            to_time_ISO = to_time_datetime.toISOString();
            url_postfix_LILA = "from=" + newLeakStruct.fromTime + "&to=" + newLeakStruct.toTime + "&timezone=browser" + "&var-query02=" + lILA_detection_time_ISO + "&var-querysensor01=vp_" + leakStruct["AffectedSensorLILA"].replace("_sensor", "") + "&var-query03=" + lILA_detection_time_end + "&panelId=1&__feature.dashboardSceneSolo";

        } else {
            url_postfix_LILA = "from=" + newLeakStruct.fromTime + "&to=" + newLeakStruct.toTime + "&timezone=browser&panelId=1&__feature.dashboardSceneSolo";
        }
        newLeakStruct["url_postfix_LILA"] = url_postfix_LILA;

        if ("DetectionTimeDM" in newLeakStruct) {
            dM_detection_time_datetime = new Date(newLeakStruct.DetectionTimeDM); 16
            dM_detection_time_end = new Date(dM_detection_time_datetime.getTime() + 3600000);
            dM_detection_time_end = roundUpToNextHour(dM_detection_time_end);
            dM_detection_time_end = dM_detection_time_end.toISOString();
            dM_detection_time_datetime = roundUpToNextHour(dM_detection_time_datetime);
            dM_detection_time_ISO = dM_detection_time_datetime.toISOString();
            from_time_datetime = new Date(newLeakStruct.fromTime);
            from_time_ISO = from_time_datetime.toISOString();
            to_time_datetime = new Date(newLeakStruct.toTime);
            to_time_ISO = to_time_datetime.toISOString();
            url_postfix_DM = "from=" + newLeakStruct.fromTime + "&to=" + newLeakStruct.toTime + "&timezone=browser" + "&var-query02=" + dM_detection_time_ISO + "&var-query03=" + dM_detection_time_end + "&panelId=1&__feature.dashboardSceneSolo";
        } else {
            url_postfix_DM = "from=" + newLeakStruct.fromTime + "&to=" + newLeakStruct.toTime + "&timezone=browser&panelId=1&__feature.dashboardSceneSolo";
        }
        newLeakStruct["url_postfix_DM"] = url_postfix_DM;
        url_left = url_prefix_LILA + newLeakStruct.url_postfix_LILA;
        url_right = url_prefix_DM + newLeakStruct.url_postfix_DM;
        toggleGraph(url_left, url_right);

    }



    //
    // Leakage list manipulation end
    //



    //
    // Left side leakage list part
    //



    //function to toggle historical data
    function toggleHistoricalData() {
        element = document.getElementById("leakagesList");
        element.classList.toggle("leakages-list");
        element.classList.toggle("leakages-list-historical");
        if (element.classList.contains("leakages-list")) {
            document.getElementById("showHistoricalData").innerHTML = "Show past leaks"
        } else {
            document.getElementById("showHistoricalData").innerHTML = "Show new leaks"
        }
    }



    //
    // Left side leakage list part end
    //



    //
    // Map interaction part
    //



    // function to adjust the scale for items, used for scrolling purposes
    function adjustScaleForItems(scale) {
        for (var i = 0; i < document.getElementById("listOfSensors").getElementsByClassName("item").length; i++) {
            document.getElementById("listOfSensors").getElementsByClassName("item")[i].getElementsByClassName("map-sensor")[0].style.zoom = scale;
        }
        for (var i = 0; i < document.getElementById("listOfPins").getElementsByClassName("item").length; i++) {
            document.getElementById("listOfPins").getElementsByClassName("item")[i].getElementsByClassName("map-leakage_pin")[0].style.zoom = scale;
        }
        for (var i = 0; i < document.getElementById("listOfHoverBoxes").getElementsByClassName("item").length; i++) {
            document.getElementById("listOfHoverBoxes").getElementsByClassName("item")[i].getElementsByClassName("map-hover_box")[0].style.zoom = scale;
        }
        for (var i = 0; i < document.getElementById("listOfJunctions").getElementsByClassName("list_of_junctions").length; i++) {
            document.getElementById("listOfJunctions").getElementsByClassName("list_of_junctions")[i].getElementsByClassName("map-junction")[0].style.zoom = scale;
        }
        for (var i = 0; i < document.getElementById("listOfPipes").getElementsByClassName("list_of_pipes").length; i++) {
            let line = document.getElementById("listOfPipes").getElementsByClassName("list_of_pipes")[i].getElementsByClassName("pipes")[0];
            let xPos1 = line.dataset.originalX;
            let yPos1 = line.dataset.originalY;
            let horizontalShift = line.dataset.horizontalShift;
            let verticalShift = line.dataset.verticalShift;
            let pipeHeight = line.dataset.pipeHeigh;
            let rotation = line.dataset.originalRotation;

            pipeHeight = pipeHeight * scale;
            newxPos1 = xPos1 - (-pipeHeight * 0.5 * horizontalShift);
            newyPos1 = yPos1 - (pipeHeight * 0.5 * verticalShift);
            line.style.transform = 'translate(' + (newxPos1) + 'px, ' + (newyPos1) + 'px) rotate(' + (rotation) + "rad)";
            line.style.height = pipeHeight + "px";
            line.style.borderRadius = pipeHeight / 2 + "px";
        }

    }

    // function to center map on element ID
    function centerMapOnElementID(elementID) {
        if (scale > 1) {
            oldScale = scale;
            scale = 1;
            setTransform();
            right = window.innerWidth - document.getElementById(elementID).getBoundingClientRect().left;
            left = 1 / scale * document.getElementById(elementID).getBoundingClientRect().left;
            bottom_off = window.innerHeight - document.getElementById(elementID).getBoundingClientRect().top;
            top_off = 1 / scale * document.getElementById(elementID).getBoundingClientRect().top;

        } else {
            right = window.innerWidth - 1 / scale * document.getElementById(elementID).getBoundingClientRect().left;
            left = 1 / scale * document.getElementById(elementID).getBoundingClientRect().left;

            bottom_off = window.innerHeight - 1 / scale * document.getElementById(elementID).getBoundingClientRect().top;
            top_off = 1 / scale * document.getElementById(elementID).getBoundingClientRect().top;
        }

        xoff = Math.min(0, Math.max(xoff + (0.5 * (right - left)), window.innerWidth - document.getElementById("full_background").getBoundingClientRect().width));
        yoff = Math.min(0, Math.max(yoff + (0.5 * (bottom_off - top_off)) - window.innerHeight / 5, window.innerHeight - document.getElementById("full_background").getBoundingClientRect().height));


        setTransform();
    }

    // set of functions enabling panning and zooming using the mouse
    function setTransform() {
        adjustScaleForItems(Math.max(0.5, 1 / scale));
        doc.style.transform = "translate(" + xoff + "px, " + yoff + "px) scale(" + scale + ")";

    }
    doc.onmousedown = function (e) {
        e.preventDefault();
        start = { x: e.clientX - xoff, y: e.clientY - yoff };
        panning = true;
    }
    doc.onmouseup = function (e) {
        panning = false;
    }
    doc.onmousemove = function (e) {
        e.preventDefault();
        if ((!panning)) {
            return;
        }
        rect = document.getElementById("full_background").getBoundingClientRect();
        if (rect.width < (window.innerWidth - rect.x)) {
            console.log("hello");
            return;
        }




        //padding = parseFloat(window.getComputed)
        //     xoff = Math.min(0,Math.max((e.clientX - start.x),window.innerWidth - document.getElementById("full_background").getBoundingClientRect().width + 150));
        //     yoff = Math.min(0,Math.max((e.clientY - start.y),window.innerHeight - document.getElementById("full_background").getBoundingClientRect().height + 150));

        //     console.log("off", xoff);
        // console.log("math min and max", (e.clientX - start.x), " how ", window.innerWidth - document.getElementById("full_background").getBoundingClientRect().width);


        xoff = Math.min(0, Math.max((e.clientX - start.x), window.innerWidth - document.getElementById("full_background").getBoundingClientRect().width));
        yoff = Math.min(0, Math.max((e.clientY - start.y), window.innerHeight - document.getElementById("full_background").getBoundingClientRect().height));
        //console.log("off", xoff);
        //console.log("xoff = ", Math.min(0,Math.max((e.clientX - start.x),window.innerWidth - getBoundingRectAlternativeWidth)));

        //console.log("offset: ", xoff ,"values", e.clientX , " ", start.x, " ", window.innerWidth, " ", "math min and max ", e.clientX - start.x, " ", window.innerWidth);

        //console.log("math min and max ", e.clientX - start.x, " ", window.innerWidth - getBoundingRectAlternativeWidth);

        //console.log("math min and max", (e.clientX - start.x), " how ", window.innerWidth - getBoundingRectAlternativeWidth);




        setTransform();
    }
    doc.onwheel = function (e) {

        e.preventDefault();

        // take the scale into account with the offset
        var xs = (e.clientX - xoff) / scale,
            ys = (e.clientY - yoff) / scale,
            delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

        let newScale = scale;

        (delta > 0) ? (newScale *= 1.05) : (newScale /= 1.05);
        let newXoff = e.clientX - xs * scale;
        let newYoff = e.clientY - ys * scale;

        scale = Math.max(newScale, window.innerWidth / getBackgroundDimensions().width, window.innerHeight / getBackgroundDimensions().height);

        xoff = Math.min(0, Math.max((e.clientX - xs * scale), window.innerWidth - document.getElementById("full_background").getBoundingClientRect().width + 100));
        yoff = Math.min(0, Math.max((e.clientY - ys * scale), window.innerHeight - document.getElementById("full_background").getBoundingClientRect().height + 100));

        setTransform(xoff, yoff);

        sendClickData(e.clientX, e.clientY, scale, telemetryId);
    }



    //
    // Map interaction part end
    //



    //
    // Highlighting leak elements (pipes, sensors, placing pins) part
    //



    function setAffectedPipes(arrayOfPipeIDs) {

        dropPinOnLeakagePipe(arrayOfPipeIDs[0]);

        lightness_range_start = 30;
        lightness_range_end = 90;
        lightness_range = lightness_range_end - lightness_range_start;

        colourIncrement = (lightness_range_end - lightness_range_start) / arrayOfPipeIDs.length;

        for (let i = 0, arrayCounter = 0; ((i < lightness_range) && (arrayCounter < arrayOfPipeIDs.length)); i = i + colourIncrement, arrayCounter = arrayCounter + 1) {
            currentIncrement = lightness_range_start + i;
            document.getElementById(arrayOfPipeIDs[arrayCounter]).style.backgroundColor = "hsl(0, 100%, " + currentIncrement + "%)";
            document.getElementById(arrayOfPipeIDs[arrayCounter]).dataset.colour = currentIncrement;
            document.getElementById(arrayOfPipeIDs[arrayCounter]).dataset.colourToggle = true;



        }
    }

    //add probabilistic circle around sensor
    function makeProbabilityCircle(ID) {
        element = document.getElementById(ID).childNodes[0];
        element.classList.add("probabilistic");
    }

    //drop pin on leakage pipe
    function dropPinOnLeakagePipe(id) {
        if (document.getElementById(id).dataset.x) {
            position = {
                x: document.getElementById(id).dataset.x,
                y: document.getElementById(id).dataset.y
            };
        } else {

            position = { x: document.getElementById(id).dataset.originalX, y: document.getElementById(id).dataset.originalY };
            console.log('DATASET POSITION orig', position.x, position.y);
        }
        itemID = "leakagePin" + id;
        var newElement = document.createElement('div');
        newElement.classList.add("item");
        newElement.classList.add("zeroheight");
        newElement.id = itemID;

        newElement.dataset.x = position.x;
        newElement.dataset.y = position.y;

        newWarningElement = document.createElement('img');
        newWarningElement.src = "{% static 'assets/pin.svg' %}";
        newWarningElement.classList.add("map-leakage_pin");

        newElement.appendChild(newWarningElement);

        document.getElementById("listOfPins").appendChild(newElement);

        backgroundDimensions = getBackgroundDimensions();

        document.getElementById(itemID).style.transform = 'translate(' + (position.x) + 'px, ' + (position.y) + 'px)';
    }

    //toggle sensor being affected
    function setAffectedSensorToggle(sensorID) {
        if (sensorID.includes("_sensor")) {
            sensorID = sensorID.replace("_sensor", "");
        }

        if (document.getElementById(sensorID + "_sensor").hasChildNodes() && document.getElementById(sensorID + "_sensor").childNodes[0].classList.contains("probabilistic")) {

            document.getElementById(sensorID + "_sensor").childNodes[0].classList.remove("probabilistic");
            document.getElementById(sensorID).childNodes[0].classList.remove("probabilistic");
            document.getElementById(sensorID + "_sensor").childNodes[0].src = "{% static 'assets/iOLE_o.png' %}";
            document.getElementById("leakagePin" + sensorID).remove();


        } else {

            console.log("setting affected sensor with id,", sensorID);
            if (document.getElementById(sensorID + "_sensor").dataset.x) {
                dropPinOnLeakagePipe(sensorID);
                makeProbabilityCircle(sensorID);
                makeProbabilityCircle(sensorID + "_sensor");

                document.getElementById(sensorID + "_sensor").childNodes[0].src = "{% static 'assets/iOLE_o_red.png' %}";
            }
        }
    }



    //
    // Highlighting leak elements (pipes, sensors, placing pins) part end
    //



    //
    // Layer showing/hiding part
    //



    //toggle pipe highlights
    function setAffectedPipesToggle(arrayOfPipeIDs) {

        if (document.getElementById("leakagePin" + arrayOfPipeIDs[0])) {
            document.getElementById("leakagePin" + arrayOfPipeIDs[0]).remove();
        } else {
            dropPinOnLeakagePipe(arrayOfPipeIDs[0]);
        }

        lightness_range_start = 30;
        lightness_range_end = 90;
        lightness_range = lightness_range_end - lightness_range_start;

        colourIncrement = (lightness_range_end - lightness_range_start) / arrayOfPipeIDs.length;

        for (let i = 0, arrayCounter = 0; ((i < lightness_range) && (arrayCounter < arrayOfPipeIDs.length)); i = i + colourIncrement, arrayCounter = arrayCounter + 1) {

            currentIncrement = lightness_range_start + i;

            if (document.getElementById(arrayOfPipeIDs[arrayCounter]).dataset.colourToggle == "true") {
                document.getElementById(arrayOfPipeIDs[arrayCounter]).style.backgroundColor = "";
                document.getElementById(arrayOfPipeIDs[arrayCounter]).dataset.colourToggle = false;

            } else {

                document.getElementById(arrayOfPipeIDs[arrayCounter]).style.backgroundColor = "hsl(0, 100%, " + currentIncrement + "%)";
                document.getElementById(arrayOfPipeIDs[arrayCounter]).dataset.colour = currentIncrement;
                document.getElementById(arrayOfPipeIDs[arrayCounter]).dataset.colourToggle = true;
            }
        }
    }

    //toggle pins
    function togglePins() {
        pipeElements = document.querySelectorAll(".map-leakage_pin");
        pipeElements.forEach((element, index) => { element.classList.toggle("hidden") });

        hiddenProbabilitsitcElements = document.querySelectorAll(".probabilistic_hidden");
        probabilitsitcElements = document.querySelectorAll(".probabilistic");

        hiddenProbabilitsitcElements.forEach((element, index) => { element.classList.toggle("probabilistic_hidden") });
        hiddenProbabilitsitcElements.forEach((element, index) => { element.classList.toggle("probabilistic") });
        hiddenProbabilitsitcElements.forEach((element, index) => { element.src = "{% static 'assets/iOLE_o_red.png' %}" });
        probabilitsitcElements.forEach((element, index) => { element.classList.toggle("probabilistic") });
        probabilitsitcElements.forEach((element, index) => { element.classList.toggle("probabilistic_hidden") });
        probabilitsitcElements.forEach((element, index) => { element.src = "{% static 'assets/iOLE_o.png' %}" });
    }

    //toggle pipe visualization
    function togglePipes() {
        pipeElements = document.querySelectorAll(".pipes");
        pipeElements.forEach((element, index) => { element.classList.toggle("hidden") });
    }

    // toggle sensor visualization
    function toggleSensors() {
        //console.log("toggleing sensors");
        pipeElements = document.querySelectorAll(".map-sensor");
        pipeElements.forEach((element, index) => { element.classList.toggle("hidden") });
    }

    //toggle pipe junction visualization
    function toggleNodes() {
        //console.log("toggleing nodes");
        pipeElements = document.querySelectorAll(".map-junction");
        pipeElements.forEach((element, index) => { element.classList.toggle("hidden") });
    }

    //toggle pipe colour highlighting for the DM model
    function togglePipeColours() {

        pipeElements = document.querySelectorAll(".pipes");
        pipeElements.forEach((element, index) => {
            if (element.dataset.colourToggle == "true") {
                element.style.removeProperty('background-color');
                element.dataset.colourToggle = false;
            } else if (element.dataset.colourToggle == "false") {
                element.style.backgroundColor = "hsl(0, 100%, " + element.dataset.colour + "%)";
                element.dataset.colourToggle = true;
            }



        })

    }



    //
    // Layer showing/hiding part end
    //



    //
    // Adding elements (pipes, sensors, junctions, pins) to the map part
    //



    //function to add a pipe between two junctions, by id
    //connects two junction element ids with a pipe
    function addConnectionBetweenElements(id1, id2, newID) {


        xPos1 = document.getElementById(id1).dataset.x;
        yPos1 = document.getElementById(id1).dataset.y;

        xPos2 = document.getElementById(id2).dataset.x;
        yPos2 = document.getElementById(id2).dataset.y;

        pipeHeight = 5;


        line = document.createElement("div");
        line.id = newID;
        location_div = document.getElementById("pipes");

        wrapperDiv = document.createElement("div");
        wrapperDiv.classList.add("list_of_pipes");


        dx = xPos2 - xPos1;
        dy = yPos2 - yPos1;

        dxCenter = 1 * xPos1 + dx * 0.5;
        dyCenter = 1 * yPos1 + dy * 0.5;

        line.dataset.x = dxCenter;
        line.dataset.y = dyCenter;

        distance = Math.sqrt(dx * dx + dy * dy);
        rotation = Math.atan2(dy, dx);

        line.dataset.originalRotation = rotation;

        horizontalShift = Math.sin(rotation);
        verticalShift = Math.cos(rotation);

        line.dataset.horizontalShift = horizontalShift;
        line.dataset.verticalShift = verticalShift;

        line.dataset.originalX = xPos1;
        line.dataset.originalY = yPos1;


        line.dataset.pipeHeigh = pipeHeight;


        newxPos1 = xPos1 - (-pipeHeight * 0.5 * horizontalShift);
        newyPos1 = yPos1 - (pipeHeight * 0.5 * verticalShift);
        line.style.width = distance + "px";
        line.classList.add("pipes");

        yPos1 = parseFloat(yPos1) + 2;

        line.style.transform = 'translate(' + (newxPos1) + 'px, ' + (newyPos1) + 'px) rotate(' + (rotation) + "rad)";
        line.style.height = pipeHeight + "px";
        line.style.borderRadius = pipeHeight / 2 + "px";

        document.getElementById("listOfPipes").appendChild(wrapperDiv).appendChild(line);

        addHoverPopup(newID);
    }



    //
    // Adding elements (Sensors, pipes, junctions, pins) to the map part end
    //



    //
    //Simulation control part
    //



    //function to update time range for the simulation
    function updateTimeRange(newStart, newEnd) {

        if (document.getElementById('graphDivLeft').childNodes[0]) {
            grafanaIframeLeft = document.getElementById('graphDivLeft').childNodes[0];
            grafanaIframeRight = document.getElementById('graphDivRight').childNodes[0];

            url_left = grafanaIframeLeft.src;
            url_right = grafanaIframeRight.src;

            console.log(url_left, url_right);

            url_left_start = url_left.split('from')[0];
            url_left_end = url_left.split('&timezone')[1];

            url_right_start = url_right.split('from')[0];
            url_right_end = url_right.split('&timezone')[1];

            url_left = url_left_start + "from=" + newStart + "&to=" + newEnd + "&timezone" + url_left_end;
            url_right = url_right_start + "from=" + newStart + "&to=" + newEnd + "&timezone" + url_right_end;

            console.log(url_left, url_right);
            grafanaIframeLeft.src = url_left;
            grafanaIframeRight.src = url_right;
        }
    }

    //this function increases slider value by a certain amount of milliseconds
    function increaseSliderValue() {
        console.log("about to increase time:", selectedTime)
        toggleGraph('http://141.23.69.55:3000/d-solo/deg8cevuocq9se/pipe-p96?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo', 'http://141.23.69.55:3000/d-solo/ceg8dcgtoo2rkd/p96-virtual-flows?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo');
        selectedTime = Number(7200000) + Number(selectedTime);
        selectedTimeMinus = selectedTime - timeDifference;
        toggleGraph('http://141.23.69.55:3000/d-solo/deg8cevuocq9se/pipe-p96?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo', 'http://141.23.69.55:3000/d-solo/ceg8dcgtoo2rkd/p96-virtual-flows?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo');
    }

    // this function calls the function increasing the slider value by a certain amount
    function increaseSliderValueEveryNSeconds() {
        slider.value = 1550517000000;
        console.log("increasing slider pos");
        interval1 = setInterval(function () {
            slider.value = Number(slider.value) + Number(7200000);
            slider.dispatchEvent(new Event('input'));
        }, 2000);

    }

    //function to show simulation status text field
    function showSimulationStatus() {
        if (document.getElementById("simulation-status-id").classList.contains("hidden")) {
            //console.log("removing hidden stuff from simulation status id ");
            document.getElementById("simulation-status-id").classList.remove("hidden");
            document.getElementById("simulation-status-id").classList.add("simulation-status");
        }
    }

    //function to hide simulation status text field.
    function hideSimulationStatus() {
        if (document.getElementById("simulation-status-id").classList.contains("simulation-status")) {
            document.getElementById("simulation-status-id").classList.remove("simulation-status");
            document.getElementById("simulation-status-id").classList.add("hidden");
        }
    }

    //
    // Simulation control part end
    //


    //
    // Note taking part
    //


    //add a hover popup functionality to an element ID
    function addHoverPopup(elementID) {
        element = document.getElementById(elementID)
        element.addEventListener("mouseout", hideData(elementID));
        element.addEventListener("mouseover", showData(elementID));
    }

    //function to hide hover box
    function hideData(id) {
        return function () {
            document.getElementById("hoverBox" + id).innerHTML = "";
            document.getElementById("hoverBox" + id).remove();
        }
    }

    //function to show hover box
    function showData(id) {
        return function () {


            if (document.getElementById(id).dataset.x) {
                position = {
                    x: document.getElementById(id).dataset.x,
                    y: document.getElementById(id).dataset.y
                };
            } else {

                position = { x: document.getElementById(id).dataset.originalX, y: document.getElementById(id).dataset.originalY };
            }

            itemID = "hoverBox" + id;
            var newElement = document.createElement('div');
            newElement.classList.add("item");
            newElement.classList.add("zeroheight");
            newElement.id = itemID;

            newElement.dataset.x = position.x;
            newElement.dataset.y = position.y;


            originalElementID = id;

            notesArray = notesStruct;
            newWarningElement = document.createElement('div');
            if (notesStruct[originalElementID] != null) {
                console.log("original element id" + originalElementID + "notes array" + notesStruct[originalElementID]);

                newWarningElement.innerHTML = originalElementID + " notes: " + notesStruct[originalElementID];
            } else {
                newWarningElement.innerHTML = originalElementID;
            }
            newWarningElement.classList.add("map-hover_box");


            newElement.appendChild(newWarningElement);

            document.getElementById("listOfHoverBoxes").appendChild(newElement);

            backgroundDimensions = getBackgroundDimensions();


            document.getElementById(itemID).style.transform = 'translate(' + (position.x) + 'px, ' + (position.y) + 'px)';
        };
    }

    // function to open feedback input field

    // function openFeedbackEditor() {

    //     container = document.getElementById("feedbackInputField");
    //     if (!document.getElementById("feedbackInputField").classList.contains("feedback-input-field-hidden")) {
    //         closeNoteEditor();
    //     }
    //     container.classList.remove("feedback-input-field-hidden");


    //     textArea = document.createElement("textarea");
    //     textArea.classList.add("feedback-input");
    //     textArea.placeholder = "Feedback can be typed here, saved automatically";
    //     textArea.id = "feedbackAreaInputField";
    //     container.appendChild(textArea);


    //     document.getElementById("feedbackAreaInputField").value = "text placeholder test";

    //     document.getElementById("feedbackAreaInputField").addEventListener('input',function() {

    //         //notesStruct[elementID] = document.getElementById("textAreaInputField").value;
    //         console.log("FEEDBACK INPUT FIELD ADDITION TRIGGERED???")

    //     });

    //     // document.getElementById("feedbackAreaInputField").addEventListener('input',function() {

    //     //     notesStruct[elementID] = document.getElementById("feedbackAreaInputField").value;

    //     // });

    //     //document.getElementById("full_background").addEventListener("click", closeNoteEditorIfBackgroundClicked );
    // }

    function openFeedbackEditor() {

        container = document.getElementById("feedbackInputField");

        if (!document.getElementById("feedbackInputField").classList.contains("feedback-input-field-hidden")) {
            closeNoteEditor();
        }
        container.classList.remove("feedback-input-field-hidden");


        textArea = document.createElement("textarea");
        textArea.classList.add("feedback-input");
        textArea.placeholder = "Feedback can be typed here, saved automatically";
        textArea.id = "feedbackAreaInputField";
        container.appendChild(textArea);




        document.getElementById("feedbackAreaInputField").value = feedback;
        //document.getElementById("feedbackAreaInputField").value = "";
        hideFeedbackButton();
        document.getElementById("feedbackAreaInputField").addEventListener('input', function () {

            //     notesStruct[elementID] = document.getElementById("feedbackAreaInputField").value;
            feedback = document.getElementById("feedbackAreaInputField").value;
            addFeedbackToDB(telemetryId, document.getElementById("feedbackAreaInputField").value, email, company);
        });





        textArea = document.createElement("textarea");
        textArea.classList.add("feedback-input");
        textArea.placeholder = "Please enter your email";
        textArea.id = "emailAreaInputField";
        container = document.getElementById("emailInputField");
        container.classList.remove("email-input-field-hidden");
        container.appendChild(textArea);






        document.getElementById("emailAreaInputField").value = email;
        //document.getElementById("feedbackAreaInputField").value = "";
        hideFeedbackButton();
        document.getElementById("emailAreaInputField").addEventListener('input', function () {

            //     notesStruct[elementID] = document.getElementById("feedbackAreaInputField").value;
            email = document.getElementById("emailAreaInputField").value;
            addFeedbackToDB(telemetryId, document.getElementById("emailAreaInputField").value, email, company);
        });










        textArea = document.createElement("textarea");
        textArea.classList.add("feedback-input");
        textArea.placeholder = "Please enter your company name";
        textArea.id = "companyAreaInputField";
        container = document.getElementById("companyInputField");
        container.classList.remove("company-input-field-hidden");
        container.appendChild(textArea);





        document.getElementById("companyAreaInputField").value = company;
        //document.getElementById("feedbackAreaInputField").value = "";
        hideFeedbackButton();
        document.getElementById("companyAreaInputField").addEventListener('input', function () {

            //     notesStruct[elementID] = document.getElementById("feedbackAreaInputField").value;
            company = document.getElementById("companyAreaInputField").value;
            addFeedbackToDB(telemetryId, document.getElementById("companyAreaInputField").value, email, company);
        });










        document.getElementById("full_background").addEventListener("click", closeFeedbackEditorIfBackgroundClicked);
    }




    function closeFeedbackEditor() {
        container = document.getElementById("feedbackInputField");
        textArea = container.childNodes[0];
        textArea.remove();
        container.classList.add("feedback-input-field-hidden");
        document.getElementById("full_background").removeEventListener("click", closeFeedbackEditorIfBackgroundClicked);



        container = document.getElementById("emailInputField");
        container.classList.add("email-input-field-hidden");
        textArea = container.childNodes[0];
        textArea.remove();



        container = document.getElementById("companyInputField");
        container.classList.add("company-input-field-hidden");
        textArea = container.childNodes[0];
        textArea.remove();


    }



    function showFeedbackButton() {

        container = document.getElementById("feedbackButton");


        container.classList.remove("feedback-button-hidden");


        // textArea = document.createElement("textarea");
        // textArea.classList.add("feedback-input");
        // textArea.placeholder = "Feedback can be typed here, saved automatically";
        // textArea.id = "feedbackAreaInputField";
        // container.appendChild(textArea);


        //document.getElementById("feedbackAreaInputField").value = "";

        // document.getElementById("feedbackAreaInputField").addEventListener('input',function() {

        //     notesStruct[elementID] = document.getElementById("feedbackAreaInputField").value;

        // });

        //document.getElementById("full_background").addEventListener("click", closeNoteEditorIfBackgroundClicked );
    }

    function hideFeedbackButton() {
        container = document.getElementById("feedbackButton");
        container.classList.add("feedback-button-hidden");
    }


    document.getElementById("full_background").addEventListener("click", closeNoteEditorIfBackgroundClicked);
    document.getElementById("feedbackButton").addEventListener("click", openFeedbackEditor);
    showFeedbackButton();

    //openFeedbackEditor();
    //function to open note editor
    function openNoteEditor(elementID) {

        container = document.getElementById("noteInputField");
        if (!document.getElementById("noteInputField").classList.contains("note-input-field-hidden")) {
            closeNoteEditor();
        }
        container.classList.remove("note-input-field-hidden");


        textArea = document.createElement("textarea");
        textArea.classList.add("text-input");
        textArea.placeholder = "Notes can be typed here, saved automatically";
        textArea.id = "textAreaInputField";
        container.appendChild(textArea);

        if (notesStruct[elementID] == undefined) {
            notesStruct[elementID] = "";
        }
        document.getElementById("textAreaInputField").value = notesStruct[elementID];

        document.getElementById("textAreaInputField").addEventListener('input', function () {

            notesStruct[elementID] = document.getElementById("textAreaInputField").value;

        });

        document.getElementById("full_background").addEventListener("click", closeNoteEditorIfBackgroundClicked);
    }

    //function to close note editor if background is clicked
    function closeNoteEditorIfBackgroundClicked(event) {

        if (event.target.id == "full_background") {
            closeNoteEditor();
        }
    }



    function closeFeedbackEditorIfBackgroundClicked(event) {

        if (event.target.id == "full_background") {
            closeFeedbackEditor();
            showFeedbackButton();
        }
    }

    //close note editor
    function closeNoteEditor() {
        container = document.getElementById("noteInputField");
        textArea = container.childNodes[0];
        textArea.remove();
        container.classList.add("note-input-field-hidden");
        document.getElementById("full_background").removeEventListener("click", closeNoteEditorIfBackgroundClicked);
        console.log(notesStruct);

    }


    //
    // End of note taking part
    //



    ////
    //// Initialization calls
    ////



    ///
    /// Event listeners
    ///



    //Event listener to open note editor
    //open note editor after clicking on something that needs to have notes taken for
    document.getElementById("full_background").addEventListener("dblclick", function (event) {

        if (event.target.id == "full_background") {
            return;
        } else if (event.target.id == "") {

            openNoteEditor(event.target.parentNode.id);

        } else {
            openNoteEditor(event.target.id);
        }

    });





    function addHoverTextForId(text, id) {

        hoverTarget = document.getElementById(id);

        hoverBox = document.getElementById('mouseHoverBox');

        hoverTarget.addEventListener('mousemove', (e) => {
            console.log(e.pageX);
            hoverBox.style.left = e.pageX - hoverBox.offsetWidth / 2 + 'px';
            hoverBox.style.top = e.pageY - hoverBox.offsetHeight - 10 + 'px';
            hoverBox.style.display = 'block';
            hoverBox.innerHTML = text;
        });

        hoverTarget.addEventListener('mouseleave', () => {
            hoverBox.style.display = 'none';
        });

    }

    addHoverTextForId("Toggle pipe layer", "hidePipes");
    addHoverTextForId("Toggle node layer", "hideNodes");
    addHoverTextForId("Toggle sensor layer", "hideSensors");
    addHoverTextForId("Toggle pins", "hidePins");
    addHoverTextForId("Toggle highlighted pipes", "hidePipeColours");


    addHoverTextForId("Pause simulation", "simulationPause");
    addHoverTextForId("Play simulation", "simulationPlay");
    addHoverTextForId("Simulation time slider", "simulationTimeSlider");

    //addHoverTextForId("Show leakage on map and on the plots", "todoID");
    //addHoverTextForId("Show leakage on map and on the plots", "leakagesItem1");
    addHoverTextForId("Show the list of past leaks", "historicalDataSelector");
    addHoverTextForId("Open a text field for feedback", "feedbackButton");







    //     function showData(id) {
    //     return function() {


    //         if (document.getElementById(id).dataset.x) {
    //         position = {x: document.getElementById(id).dataset.x,
    //             y: document.getElementById(id).dataset.y};
    //         } else {

    //             position = {x: document.getElementById(id).dataset.originalX, y: document.getElementById(id).dataset.originalY};
    //         }

    //         itemID = "hoverBox" + id;
    //         var newElement = document.createElement('div');
    //         newElement.classList.add("item");
    //         newElement.classList.add("zeroheight");
    //         newElement.id = itemID;

    //         newElement.dataset.x = position.x;
    //         newElement.dataset.y = position.y;


    //         originalElementID = id;

    //         notesArray = notesStruct;
    //         newWarningElement = document.createElement('div');
    //         if (notesStruct[originalElementID] != null ){
    //             console.log("original element id" + originalElementID + "notes array" + notesStruct[originalElementID]);

    //             newWarningElement.innerHTML = originalElementID + " notes: " + notesStruct[originalElementID];
    //         } else {
    //             newWarningElement.innerHTML = originalElementID;
    //         }
    //         newWarningElement.classList.add("map-hover_box");


    //         newElement.appendChild(newWarningElement);

    //         document.getElementById("listOfHoverBoxes").appendChild(newElement);

    //         backgroundDimensions = getBackgroundDimensions();


    //         document.getElementById(itemID).style.transform = 'translate(' + (position.x ) + 'px, ' + (position.y ) + 'px)';
    //     };
    // }













    //Event listener to close not editor
    //close note editor when the Escape key is pressed (Click "Esc" to close note editor)
    document.addEventListener('keydown', function (event) {

        if (event.key === 'Escape') {
            closeNoteEditor();
        }
    });

    document.addEventListener('click', function () { document.getElementById("ioleLogo").style.height = "5%"; }, { once: true });
    document.getElementById("historicalDataSelector").onclick = toggleHistoricalData;
    // document.getElementById("leakagesItem2").onclick = function() { centerMapOnElementID("n2")  ; toggleGraph('http://141.23.69.55:3000/d-solo/ceefx6nnq1mv4e/2019-series?orgId=1&from=1546300800000&to=1577832900000&timezone=browser&panelId=1&__feature.dashboardSceneSolo'); }
    // document.getElementById("leakagesItem3").onclick = function() { centerMapOnElementID("n3"); toggleGraph('http://141.23.69.55:3000/d-solo/fee8yx8ebilfkd/all-sensors-2018?orgId=1&from=1514210945793&to=1547341077910&timezone=browser&refresh=5s&panelId=1&__feature.dashboardSceneSolo'); }
    // document.getElementById("leakagesItem4").onclick = function() { toggleGraph('http://141.23.69.55:3000/d-solo/feefy8knv0zr4d/new-dashboard?orgId=1&from=1514761200000&to=1546297199000&timezone=browser&panelId=1&__feature.dashboardSceneSolo'); }
    // document.getElementById("leakagesItem5").onclick = function() { toggleGraph('http://141.23.69.55:3000/d-solo/beeg1kwm38pvkd/some-sensors-2018?orgId=1&from=1514761200000&to=1546297199000&timezone=browser&panelId=1&__feature.dashboardSceneSolo'); }
    // document.getElementById("leakagesItem6").onclick = function() { toggleGraph('http://141.23.69.55:3000/d-solo/feegapxpsv94wa/real-time-demonstration?orgId=1&from=now-5m&to=now&timezone=browser&refresh=5s&panelId=1&__feature.dashboardSceneSolo'); }

    //this event listener adjusts time range and the leak status based on
    slider.addEventListener("input", function () {
        selectedTime = slider.value;

        selectedTimeMinus = selectedTime - timeDifference;
        updateTimeRange(selectedTimeMinus, selectedTime);

        date = new Date(selectedTime * 1);
        datetime2 = date.toISOString().slice(0, 19).replace("T", " ");;
        document.getElementById("simulationTime").innerHTML = datetime2;

        if (selectedTime < 1550607000000) {
            document.getElementById("simulationStatus").innerHTML = "Leak has not started yet";
        }
        else if (selectedTime < 1550697000000) {
            document.getElementById("simulationStatus").innerHTML = "Leak has started";
        }
        else if (selectedTime < 1550779800000) {
            document.getElementById("simulationStatus").innerHTML = "Leak has been detected";
        }
        else {
            document.getElementById("simulationStatus").innerHTML = "Leak has been fixed";
        }

        showSimulationStatus();

    });

    document.getElementById("simulationPlay").addEventListener("click", function () { increaseSliderValueEveryNSeconds(); showSimulationStatus(); });
    document.getElementById("simulationPause").addEventListener("click", function () { clearInterval(interval1); hideSimulationStatus(); });

    document.getElementById("hidePipes").addEventListener('click', togglePipes);

    document.getElementById("hideSensors").addEventListener('click', toggleSensors);

    document.getElementById("hideNodes").addEventListener('click', toggleNodes);

    document.getElementById("hidePipeColours").addEventListener('click', togglePipeColours);

    document.getElementById("hidePins").addEventListener('click', togglePins);

    document.getElementById("GDPRButton").addEventListener('click', () => {
        document.getElementById("GDPRContainer").remove();
    })


    ///
    ///Functions required on initialization for proper functioning of the intterface
    ///


    placeBackgroundImage();
    setTransform();

    //reduce width and height to make map interactive.
    document.getElementById("graphDivLeft").style.height = "0px";
    document.getElementById("graphDivRight").style.height = "0px";


    junctionList.forEach(function (pipeJunction) {
        placeNewJunctionOnMap(pipeJunction[0], pipeJunction[1], pipeJunction[2]);
    });

    pipeList.forEach(function (junction) {
        addConnectionBetweenElements(junction[0], junction[1], junction[2]);
    });

    sensorList.forEach(function (sensor) {
        placeNewSensorOnMap(sensor[0], sensor[1], (sensor[2] + "_sensor"));
    });






    //Add new leak after 2 seconds;
    // setTimeout( ()=>{
    //     newLeakId = addNewLeak("New most recent leak","n613","2019-01-27T14:36:25.000Z",["p96","p97","p98","p99","p100","p101","p192"],"2019-01-20T11:36:25.000Z");
    // }, 2000);

    // //Add new leak after 4 seconds
    // setTimeout( ()=>{
    //     newLeakId_2 = addNewLeak("Another example of a leakage","n613","2019-01-27T14:36:25.000Z",["p96","p97","p98"],"2019-02-02T11:36:25.000Z");
    // }, 4000);
    newLeakId_2 = addNewLeak("Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z");

    newLeakId_2 = addNewLeak("Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z");

    newLeakId_2 = addNewLeak("Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z");
    newLeakId_2 = addNewLeak("Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z");

    newLeakId_2 = addNewLeak("Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z");

    newLeakId_2 = addNewLeak("Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z");
    newLeakId = addNewLeak("New most recent leak", "n613", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98", "p99", "p100", "p101", "p192"], "2019-01-20T11:36:25.000Z");





    /// fix datasets, fix pipes that are not shown, fix orders of magnitude, fix time range, make detection things more close together (lila and DM more close together)

















    // const target = document.getElementById('hideNodes');
    // const rect = target.getBoundingClientRect();

    // // Create four squares
    // const squares = {
    //   top: document.createElement('div'),
    //   bottom: document.createElement('div'),
    //   left: document.createElement('div'),
    //   right: document.createElement('div'),
    // };

    // // Initial positions: all squares start off screen at edges
    // Object.entries(squares).forEach(([pos, el]) => {
    //   el.classList.add('square');
    //   document.body.appendChild(el);

    //   switch(pos) {
    //     case 'top':
    //       Object.assign(el.style, {
    //         top: '-100px',
    //         left: '0',
    //         width: '100%',
    //         height: '100px',
    //       });
    //       break;
    //     case 'bottom':
    //       Object.assign(el.style, {
    //         bottom: '-100px',
    //         left: '0',
    //         width: '100%',
    //         height: '100px',
    //       });
    //       break;
    //     case 'left':
    //       Object.assign(el.style, {
    //         top: '0',
    //         left: '-100px',
    //         width: '100px',
    //         height: '100%',
    //       });
    //       break;
    //     case 'right':
    //       Object.assign(el.style, {
    //         top: '0',
    //         right: '-100px',
    //         width: '100px',
    //         height: '100%',
    //       });
    //       break;
    //   }
    // });

    // // Animate squares to close in around the target element
    // setTimeout(() => {
    //   squares.top.style.top = '0';
    //   squares.top.style.height = rect.top + 'px';

    //   squares.bottom.style.bottom = '0';
    //   squares.bottom.style.height = (window.innerHeight - rect.bottom) + 'px';

    //   squares.left.style.left = '0';
    //   squares.left.style.width = rect.left + 'px';
    //   squares.left.style.top = rect.top + 'px';
    //   squares.left.style.height = rect.height + 'px';

    //   squares.right.style.right = '0';
    //   squares.right.style.width = (window.innerWidth - rect.right) + 'px';
    //   squares.right.style.top = rect.top + 'px';
    //   squares.right.style.height = rect.height + 'px';
    // }, 50);








    const squares = {
        top: document.createElement('div'),
        bottom: document.createElement('div'),
        left: document.createElement('div'),
        right: document.createElement('div'),
    };

    Object.entries(squares).forEach(([pos, el]) => {
        el.classList.add('square');
        document.body.appendChild(el);

        switch (pos) {
            case 'top':
                Object.assign(el.style, {
                    top: '-100px',
                    left: '0',
                    width: '100%',
                    height: '100px',
                });
                break;
            case 'bottom':
                Object.assign(el.style, {
                    bottom: '-100px',
                    left: '0',
                    width: '100%',
                    height: '100px',
                });
                break;
            case 'left':
                Object.assign(el.style, {
                    top: '0',
                    left: '-100px',
                    width: '100px',
                    height: '100%',
                });
                break;
            case 'right':
                Object.assign(el.style, {
                    top: '0',
                    right: '-100px',
                    width: '100px',
                    height: '100%',
                });
                break;
        }
    });

    function animateSpotlight(targetElement) {
        const rect = targetElement.getBoundingClientRect();

        setTimeout(() => {
            squares.top.style.top = '0';
            squares.top.style.height = rect.top + 'px';

            squares.bottom.style.bottom = '0';
            squares.bottom.style.height = (window.innerHeight - rect.bottom) + 'px';

            squares.left.style.left = '0';
            squares.left.style.width = rect.left + 'px';
            squares.left.style.top = rect.top + 'px';
            squares.left.style.height = rect.height + 'px';

            squares.right.style.right = '0';
            squares.right.style.width = (window.innerWidth - rect.right) + 'px';
            squares.right.style.top = rect.top + 'px';
            squares.right.style.height = rect.height + 'px';
        }, 50);
    }

    function removeSpotlight() {
        Object.values(squares).forEach(el => {
            el.remove(); // removes the DOM node
        });
    }


    function fadeOutSpotlight(duration = 500) {
        Object.values(squares).forEach(el => {
            el.style.transition = `opacity ${duration}ms ease`;
            el.style.opacity = '0';
        });

        // Then remove them after fade
        setTimeout(removeSpotlight, duration);
    }

    function spotlightNone() {
        // Animate squares outward to show the full page
        squares.top.style.top = '0';
        squares.top.style.height = '0';

        squares.bottom.style.bottom = '0';
        squares.bottom.style.height = '0';

        squares.left.style.left = '0';
        squares.left.style.width = '0';
        squares.left.style.top = '0';
        squares.left.style.height = '100%';

        squares.right.style.right = '0';
        squares.right.style.width = '0';
        squares.right.style.top = '0';
        squares.right.style.height = '100%';
    }

    // // Start spotlight on hideNodes
    //animateSpotlight(document.getElementById('hideNodes'));

    // // Later switch spotlight to leakagesList after 2 seconds (example)
    // setTimeout(() => {
    //   animateSpotlight(document.getElementById('leakagesList'));
    // }, 2000);



    // setTimeout(() => {
    //   animateSpotlight(document.getElementById('leakagesList'));
    // }, 10000);


    let textArray = []


    let xTime = 0
    tutorial = true;
    tutorialTimeouts = []

    document.getElementById("skipTutorial").addEventListener('click', function () {
        document.getElementById("tutorial").remove();
        tutorial = false;

        for (let id of tutorialTimeouts) {
            clearTimeout(id);  // Clears each timeout
        }

        //disableBlockingOverlay();
        removeSpotlight();
    });
    document.getElementById("startTutorial").addEventListener('click', function () {
        document.getElementById("skipTutorial").classList.add('skip-tutorial-upper-left');
        document.getElementById("skipTutorial").classList.remove('skip-tutorial');
        //enableBlockingOverlay();
        document.getElementById("startTutorial").remove();
        document.getElementById("tutorialText").innerHTML = 'The interface consists of the hydraulic model of the water distribution network on the map and control elements on both sides.';
        textArray.push(document.getElementById("tutorialText").innerHTML);


        tutorialTimeouts[0] = setTimeout(() => {
            animateSpotlight(document.getElementById('leakagesList'));
            document.getElementById("tutorialText").innerHTML = 'The most recent detected leak is shown on the left side.';
            textArray.push(document.getElementById("tutorialText").innerHTML);


            tutorialTimeouts[1] = setTimeout(() => {
                if (tutorial) {
                    animateSpotlight(document.getElementById('historicalDataSelector'));
                    document.getElementById("tutorialText").innerHTML = 'The "Show past leaks" button toggles the list of past leaks.';
                    textArray.push(document.getElementById("tutorialText").innerHTML);
                }

                tutorialTimeouts[2] = setTimeout(() => {
                    toggleHistoricalData()
                    animateSpotlight(document.getElementById('leakagesList'));
                    document.getElementById("tutorialText").innerHTML = "The list of past leaks shows older leaks.";
                    textArray.push(document.getElementById("tutorialText").innerHTML);


                    tutorialTimeouts[3] = setTimeout(() => {
                        toggleHistoricalData()
                        animateSpotlight(document.getElementById('leakagesList').firstElementChild);
                        document.getElementById("tutorialText").innerHTML = "Clicking the leak in the list of leaks visualizes it.";
                        textArray.push(document.getElementById("tutorialText").innerHTML);




                        tutorialTimeouts[4] = setTimeout(() => {
                            spotlightNone();
                            document.getElementById('leakagesList').firstElementChild.click();
                            document.getElementById("tutorialText").innerHTML = "Once clicked, the leak is visualized on the water distribution network. Relative time series are displayed in the plots below the map.";
                            textArray.push(document.getElementById("tutorialText").innerHTML);

                            tutorialTimeouts[5] = setTimeout(() => {
                                centerMapOnElementID("leakagePinn613");
                                //animateSpotlight(document.getElementById("leakagePinn613"));
                                document.getElementById("tutorialText").innerHTML = "The most affected sensor (MAS, i.e., the sensor most likely close to the occurring leak) for the LILA data-driven leak detection method is highlighted with a pin and a probabilistic leakage circle.";
                                textArray.push(document.getElementById("tutorialText").innerHTML);




                                tutorialTimeouts[6] = setTimeout(() => {
                                    centerMapOnElementID("p96");
                                    //animateSpotlight(document.getElementById("p96"));
                                    document.getElementById("tutorialText").innerHTML = "Likely affected pipes for the Dual Model leak detection method are highlighted on the map. The most likely affected pipe where the leak occurs is also highlighted with a pin.";
                                    textArray.push(document.getElementById("tutorialText").innerHTML);


                                    // tutorialTimeouts[7] = setTimeout(() => {
                                    // //centerMapOnElementID("graphDivLeft");
                                    // animateSpotlight(document.getElementById("graphDivLeft"));
                                    // ////document.getElementById("tutorialText").innerHTML = "The plot on the left side shows the virtual pressure measured at the most affected sensor (MAS) for the LILA model. The leakage detection time is marked on the plot with a vertical line.";
                                    // textArray.push(document.getElementById("tutorialText").innerHTML);
                                    // //console.log("we are here, after the left side plot");


                                    //     tutorialTimeouts[8] = setTimeout(() => {
                                    //         //console.log("we seem to be reaching the plot on the other side");
                                    //     //centerMapOnElementID("graphDivRight");
                                    //     animateSpotlight(document.getElementById("graphDivRight"));
                                    //     document.getElementById("tutorialText").innerHTML = "The plot on the right side shows virtual flows measured for all sensors for the Dual Model.";
                                    //     textArray.push(document.getElementById("tutorialText").innerHTML);




                                    tutorialTimeouts[9] = setTimeout(() => {
                                        spotlightNone();
                                        document.getElementById("tutorialText").innerHTML = "Both plots show the same timeframe, allowing for the detection times for each model to be compared side by side.";
                                        textArray.push(document.getElementById("tutorialText").innerHTML);



                                        tutorialTimeouts[10] = setTimeout(() => {
                                            animateSpotlight(document.getElementById("layer-selector-id"));
                                            document.getElementById("tutorialText").innerHTML = "Different map layers can be hidden or shown using buttons on the right side.";
                                            textArray.push(document.getElementById("tutorialText").innerHTML);



                                            tutorialTimeouts[11] = setTimeout(() => {
                                                animateSpotlight(document.getElementById("hidePipes"));
                                                document.getElementById("tutorialText").innerHTML = 'Pipes can be toggled using the "Toggle Pipes" button with a pipe symbol.';
                                                textArray.push(document.getElementById("tutorialText").innerHTML);
                                                setTimeout(() => { togglePipes(); }, 1000);
                                                setTimeout(() => { togglePipes(); }, 3000);

                                                tutorialTimeouts[12] = setTimeout(() => {
                                                    animateSpotlight(document.getElementById("hideSensors"));
                                                    document.getElementById("tutorialText").innerHTML = 'Pressure sensors can be toggled using the "Toggle Sensors" button with a sensor symbol.';
                                                    textArray.push(document.getElementById("tutorialText").innerHTML);



                                                    tutorialTimeouts[13] = setTimeout(() => {
                                                        animateSpotlight(document.getElementById("hideNodes"));
                                                        document.getElementById("tutorialText").innerHTML = 'Nodes can be toggled using the "Toggle Nodes" button.';
                                                        textArray.push(document.getElementById("tutorialText").innerHTML);





                                                        tutorialTimeouts[14] = setTimeout(() => {
                                                            animateSpotlight(document.getElementById("hidePins"));
                                                            document.getElementById("tutorialText").innerHTML = 'Pins (i.e., leak positions) can be hidden using the "Toggle Pins" button with a pin symbol.';
                                                            textArray.push(document.getElementById("tutorialText").innerHTML);



                                                            tutorialTimeouts[15] = setTimeout(() => {
                                                                animateSpotlight(document.getElementById("hidePipeColours"));
                                                                document.getElementById("tutorialText").innerHTML = 'Pipe highlights can be toggled using the "Toggle Pipe Highlights" button with a highlighted pipe symbol.';
                                                                textArray.push(document.getElementById("tutorialText").innerHTML);

                                                                tutorialTimeouts[16] = setTimeout(() => {
                                                                    spotlightNone();
                                                                    document.getElementById("tutorialText").innerHTML = "In addition to the buttons for selecting leaks and toggling layers, the control interface also offers a simulation, that shows how a leak occurs.";
                                                                    textArray.push(document.getElementById("tutorialText").innerHTML);

                                                                    tutorialTimeouts[17] = setTimeout(() => {
                                                                        animateSpotlight(document.getElementById("simulation-control-id"));
                                                                        document.getElementById("tutorialText").innerHTML = 'The leakage simulation can be started and stopped using the highlighted "Start" and "Stop" buttons.';
                                                                        textArray.push(document.getElementById("tutorialText").innerHTML);



                                                                        tutorialTimeouts[18] = setTimeout(() => {
                                                                            animateSpotlight(document.getElementById("simulationTimeSlider"));
                                                                            document.getElementById("tutorialText").innerHTML = "The simulation can also be manually scrolled through using the time slider.";
                                                                            textArray.push(document.getElementById("tutorialText").innerHTML);

                                                                            tutorialTimeouts[19] = setTimeout(() => {
                                                                                animateSpotlight(document.getElementById("feedbackButton"));
                                                                                document.getElementById("tutorialText").innerHTML = 'Explore the interface and tell us which functions are useful and which are missing using the "Submit Feedback" button!';
                                                                                textArray.push(document.getElementById("tutorialText").innerHTML);


                                                                                tutorialTimeouts[20] = setTimeout(() => {
                                                                                    document.getElementById('leakagesList').firstElementChild.click();
                                                                                    spotlightNone();
                                                                                    tutorialTimeouts[21] = setTimeout(() => {
                                                                                        document.getElementById("tutorial").remove();
                                                                                        removeSpotlight();
                                                                                    }, 5000);


                                                                                }, 5000);


                                                                            }, 5000);


                                                                        }, 5000);

                                                                    }, 5000);


                                                                }, 5000);

                                                            }, 5000);

                                                        }, 5000);

                                                    }, 5000);




                                                }, 5000);


                                            }, 5000);


                                        }, 5000);


                                    }, 5000);



                                    //}, 5000);



                                    //}, 5000);


                                }, 5000);


                            }, 5000);


                        }, 5000);


                    }, 5000);


                }, 5000);


            }, 5000);

        }, 5000);



















































    });








    console.log(textArray);






    setTimeout(() => {
        addHoverTextForId("Show leakage on map and on the plots", "todoID");
    }, 2500);


    centerMapOnElementID("n50");

    //function to hide nodes on load
    toggleNodes();



    function addPlotTextBox() {
        document.getElementById("plotLabelLeft").classList.remove("hidden");
        document.getElementById("plotLabelRight").classList.remove("hidden");

    }


    function removePlotTextBox() {
        document.getElementById("plotLabelLeft").classList.add("hidden");
        document.getElementById("plotLabelRight").classList.add("hidden");

    }
                    //togglePlotTextBox();
                }
