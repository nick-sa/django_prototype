

//Vriables for simulation
let selectedTime = 1759273261000;
let timeDifference = 360000000;
let selectedTimeMinus = selectedTime - timeDifference;
let plot_simulation;


//
//Simulation control part
//



//function to update time range for the simulation
function updateTimeRange(newStart, newEnd) {
    if (plot_simulation) {
        plot_simulation.destroy();
    }
    plot_simulation = show_sensor_on_plot_range("n54", newStart, newEnd, 1548288000000, 1548288000000);

}

//this function increases slider value by a certain amount of milliseconds
function increaseSliderValue() {
    console.log("about to increase time:", selectedTime)
    toggleGraph('http://141.23.69.55:3000/d-solo/deg8cevuocq9se/pipe-p96?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&var-query02=2019-01-24T00:00:00.000Z&var-querysensor01=vp_n613&var-query03=2019-01-24T01:00:00.000Z' + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo', 'http://141.23.69.55:3000/d-solo/ceg8dcgtoo2rkd/p96-virtual-flows?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo');
    selectedTime = Number(7200000) + Number(selectedTime);
    selectedTimeMinus = selectedTime - timeDifference;
    toggleGraph('http://141.23.69.55:3000/d-solo/deg8cevuocq9se/pipe-p96?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&var-query02=2019-01-24T00:00:00.000Z&var-querysensor01=vp_n613&var-query03=2019-01-24T01:00:00.000Z' + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo', 'http://141.23.69.55:3000/d-solo/ceg8dcgtoo2rkd/p96-virtual-flows?orgId=1&from=' + selectedTimeMinus + '&to=' + selectedTime + '&timezone=browser&panelId=1&__feature.dashboardSceneSolo');
}

// this function calls the function increasing the slider value by a certain amount 
function increaseSliderValueEveryNSeconds() {
    slider.value = 1358917200000;
    console.log("increasing slider pos " + slider.value);
    interval1 = setInterval(function () {
        if (slider.value < 1549148400000) {
            slider.value = Number(slider.value) + Number(18000000);
            slider.dispatchEvent(new Event('input'));
        } else {
            console.log("clearing interval");
            clearInterval(interval1);
        }
    }, 1000);

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



document.addEventListener("DOMContentLoaded", () => {



    //Simulation slider
    slider = document.getElementById("simulationTimeSlider");

    //this event listener adjusts time range and the leak status based on 
    slider.addEventListener("input", function () {
        if (!plots_visible) {
            visiblify_plots();
        }
        console.log("input is being done", slider.value);

        selectedTime = slider.value * 1;



        selectedTimeMinus = selectedTime - timeDifference;
        updateTimeRange(selectedTimeMinus * 1, selectedTime * 1);

        date = new Date(selectedTime * 1);
        datetime2 = date.toISOString().slice(0, 19).replace("T", " ");;
        document.getElementById("simulationTime").innerHTML = datetime2;
        if (selectedTime < 1358917200000) {
            document.getElementById("simulationStatus").innerHTML = "Leak has not started yet";
        }
        else if (selectedTime < 1548288000000) {
            document.getElementById("simulationStatus").innerHTML = "Leak has started";
        }
        else if (selectedTime < 1549027800000) {
            document.getElementById("simulationStatus").innerHTML = "Leak has been detected";
        }
        else {
            document.getElementById("simulationStatus").innerHTML = "Leak has been fixed";
        }
        showSimulationStatus();

    });

    document.getElementById("simulationPlay").addEventListener("click", function () { increaseSliderValueEveryNSeconds(); showSimulationStatus(); });
    document.getElementById("simulationPause").addEventListener("click", function () { clearInterval(interval1); hideSimulationStatus(); });

})
