

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

current_leak_shown = null;
leaks_visible_map = false;

function fetchLeakages(inp_file) {
    return fetch("leakages?inp_file=" + inp_file).then(response => response.json())
}

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
    leakImage.src = leakImageUrl;

    newLeak.appendChild(leakImage);

    leakText = document.createElement("div");
    leakText.classList.add("list-item-warning_text");
    leakText.innerHTML = leakStruct.Name;
    newLeak.appendChild(leakText);

    //document.getElementById("leakagesList").appendChild(newLeak);
    document.getElementById("leakagesList").insertBefore(newLeak, document.getElementById("leakagesList").childNodes[0]);
}

document.addEventListener("DOMContentLoaded", function () {

    let leakages_dict = {}
    console.log("fetching leakages");
    fetchLeakages("nw_01_primal_model.inp").then(leakages => {
        leakIds = []
        console.log("leakages", leakages);
        for (let i = 0; i < leakages["leakage_name"].length; i++) {
            console.log(leakages["dt_lila"][i]);
            newLeak = addNewLeak(leakages["leakage_name"][i], leakages["mas_lila"][i], leakages["dt_lila"][i], [leakages["pipes_dm"][i]], leakages["dt_dm"][i]);
            leaksStruct[newLeak["ID"]] = newLeak;
            leakIds.push(newLeak);
        }

    });




    document.getElementById("historicalDataSelector").onclick = toggleHistoricalData;

});

function showLeakOnGraphs(struct_id) {
    if ((plots_visible) && (current_leak_shown == struct_id)) {
        hide_plots();
    } else if (plots_visible && current_leak_shown != struct_id) {
        visiblify_plots();
    } else if (!plots_visible) {
        visiblify_plots();
    }

    console.log("the_struct", leaksStruct[struct_id]);
    sensor_name = leaksStruct[struct_id]["AffectedSensorLILA"];
    from_time = leaksStruct[struct_id]["fromTime"];
    to_time = leaksStruct[struct_id]["toTime"];
    detection_time_lila = leaksStruct[struct_id]["DetectionTimeLILA"];
    detection_time_dm = leaksStruct[struct_id]["DetectionTimeDM"];
    console.log(sensor_name, detection_time_dm, detection_time_lila);
    show_sensor_on_plot_range(sensor_name, from_time, to_time, detection_time_lila, detection_time_dm);
    current_leak_shown = struct_id;
}
function showLeakOnMap(struct_id) {
    if ((leaks_visible_map) && current_leak_shown == struct_id) {
        controller.delete_pins();
        controller.removeExtraLineLayer();
        leaks_visible_map = false;
    } else {
        console.log("showing leak on map");
        sensor_name = leaksStruct[struct_id]["AffectedSensorLILA"];

        controller.delete_pins();

        controller.addPinLayer(sensor_name);

        highlighted_pipes = [];
        controller.removeExtraLineLayer();

        let affected_pipes_dm = JSON.parse(leaksStruct[struct_id]["AffectedPipesDM"][0].replace(/'/g, '"'));

        highlighted_pipes = highlighted_pipes + affected_pipes_dm;
        console.log("highlighted, pipes", highlighted_pipes);

        controller.addExtraLineLayer();


        leaks_visible_map = true;
    }

}

function centerMapOnElementID(sensor_name) {
    console.log("centering map on element id");
}