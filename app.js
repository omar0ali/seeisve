const app = Vue.createApp({
    data() {
        return {
            consoleWindow: false,
            searchWindow: false,
            settingWindow: false,
            aboutWindow: false,
            searchEnabled: false,
            updateCSVWindow: false,
            EditRowsOfColumnWindow: false,
            currentCell: {
                header: "", data: "", index: -1
            },
            parse_header: [],
            parse_csv: [],
            parse_csv_searched: [],
            sortOrders: {},
            searchStatus: "",
            sortKey: '',
            EditRowOf: "",
            badData: ""
        };
    },

    methods: {
        cleanUp: function () {
            this.searchStatus = "";
            this.currentCell = {
                header: "", data: "", index: -1
            }
            this.parse_header = [];
            this.parse_csv = [];
            this.parse_csv_searched = [];
            this.EditRowOf = "";
            this.searchEnabled = false;
            this.$refs.search.value = "";
            this.$refs.editColumn.value = "";

        },
        keyMonitor: function (event) {
            if (event.key == "Enter") {
                this.searchData();
                this.toggleOutEverything();
            }
        }, toggleSearch: function () {
            this.toggleOutEverything();
            this.searchWindow = !this.searchWindow;
        },
        toggleSetting: function () {
            this.toggleOutEverything();
            this.settingWindow = !this.settingWindow;
        },
        toggleConsoleWindow: function () {
            this.toggleOutEverything();
            this.consoleWindow = !this.consoleWindow;
        }
        , toggleUpdateCSVWindow: function () {
            this.toggleOutEverything();
            this.updateCSVWindow = !this.updateCSVWindow;
        },
        toggleOutEverything: function () {
            this.searchWindow = false;
            this.settingWindow = false;
            this.updateCSVWindow = false;
            this.aboutWindow = false;
            this.EditRowsOfColumnWindow = false;
            this.consoleWindow = false;
        },
        toggleAbout: function () {
            this.toggleOutEverything();
            this.aboutWindow = !this.aboutWindow;
        },
        toggleEditRow: function (key) {
            this.EditRowOf = key;
            this.toggleOutEverything();
            this.EditRowsOfColumnWindow = !this.EditRowsOfColumnWindow;
        }, tryAddingData: function () {
            vm = this;
            let newData = this.csvJSON(vm.badData, true);
            vm.parse_csv = vm.parse_csv.concat(newData);
            this.toggleOutEverything();
            setTimeout(() => {
                document.getElementById("right").scrollTo({ top: document.getElementById("right").scrollHeight });
            }, 100); // Adjust the delay (in milliseconds) as needed, e.g., 100ms
        }
        ,
        updateRows: function () {
            var vm = this;
            if (this.EditRowOf === "" || this.$refs.editColumn.value === "") {
                alert("Please fill in empty fields.");
                return;
            }
            if (this.searchEnabled) {
                for (let i = 0; i < vm.parse_csv_searched.length; i++) {
                    vm.parse_csv_searched[i].data[this.EditRowOf] = this.$refs.editColumn.value;
                }
            } else {
                for (let i = 0; i < vm.parse_csv.length; i++) {
                    vm.parse_csv[i][this.EditRowOf] = this.$refs.editColumn.value;
                }
            }
            this.toggleOutEverything();
        },
        searchData: function () {
            if (this.$refs.search.value === "") {
                this.searchEnabled = false;
                return;
            }
            var vm = this;
            let result = [];
            //console.log(this.$refs.option_search.value);
            this.searchEnabled = true;
            for (let i = 0; i < vm.parse_csv.length; i++) {
                switch (this.$refs.option_search.value.toLowerCase()) {
                    case "includes":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase().includes(this.$refs.search.value.toLowerCase())) {
                            result.push({ index: i, data: vm.parse_csv[i] });
                        }
                        break;
                    case "equals":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase() === (this.$refs.search.value.toLowerCase())) {
                            result.push({ index: i, data: vm.parse_csv[i] });
                        }
                        break;
                    case "not equals":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase() !== (this.$refs.search.value.toLowerCase())) {
                            result.push({ index: i, data: vm.parse_csv[i] });
                        }
                        break;
                    case "larger than":
                        if (parseInt(vm.parse_csv[i][this.$refs.key_search.value]) > parseInt((this.$refs.search.value))) {
                            result.push({ index: i, data: vm.parse_csv[i] });
                        }
                        break;
                    case "less than":
                        if (parseInt(vm.parse_csv[i][this.$refs.key_search.value]) < parseInt((this.$refs.search.value))) {
                            result.push({ index: i, data: vm.parse_csv[i] });
                        }
                        break;
                }
            }
            vm.parse_csv_searched = result;
        }, csvJSON(csv, add = false) {
            let isCurrupt = false;
            var vm = this;
            let lines = csv.split("\n");
            vm.badData = "";
            let result = [];
            //Loading csv file, preparing headers ...etc. Don't need to do that if we just adding corrected lines.
            if (!add) {
                vm.parse_header = lines[0].split(",").map(function (value) {
                    return value.trim();
                });
                //remove the last empty header, and make sure it's not printing it out.
                if (vm.parse_header[vm.parse_header.length - 1] === "\r") {
                    vm.parse_header.pop();
                }
            }

            let startAt = 1;
            if(add) {
                startAt = 0;
            }
            for (let i = startAt; i < lines.length; i++) {
                let obj = {};
                let currentline = lines[i].trim();
                let cells = [];
                let inQuotes = false;
                let cell = "";

                //Skip for empty line.
                if (currentline === "") {
                    continue;
                }

                let totalCells = 1;
                for (let j = 0; j < currentline.length; j++) {
                    let char = currentline[j];
                    if (char === "," && !inQuotes) {
                        totalCells++;
                        cells.push(cell);
                        cell = "";
                    } else if (char === '"') {
                        inQuotes = !inQuotes;
                    } else {
                        cell += char;
                    }
                }

                //Check length.
                if (totalCells !== vm.parse_header.length) {
                    //console.log("They don't equal", vm.parse_header.length, totalCells);
                    isCurrupt = true;
                    vm.badData += currentline + "\n";
                    continue;
                }

                // Add the last cell after the loop ends
                cells.push(cell);

                for (let j = 0; j < vm.parse_header.length; j++) {
                    obj[vm.parse_header[j]] = cells[j] || ""; // Use empty string for missing cells
                }
                result.push(obj);
            }
            if (isCurrupt) {
                setTimeout(function () {
                    vm.consoleWindow = true;
                },
                    1);
            }

            return result;
        }, loadCSV(e) {
            let vm = this
            vm.data = "";
            if (window.FileReader) {
                let reader = new FileReader();
                if (e.target.files[0] === undefined) { return; }
                reader.readAsText(e.target.files[0]);
                // Handle errors load
                reader.onload = function (event) {
                    vm.cleanUp();
                    vm.parse_csv = vm.csvJSON(event.target.result);
                };
                reader.onerror = function (evt) {
                    if (evt.target.error.name == "NotReadableError") {
                        alert("Canno't read file !");
                    }
                };
            } else {
                alert('FileReader are not supported in this browser.');
            }
        }, exportCSV() {
            if (this.parse_header.length <= 0 || this.parse_csv.length <= 0) {
                alert("There is nothing to export.");
                return;
            }

            let text = "";

            // Append headers to the CSV
            text += this.parse_header.join(",") + "\n";

            // Append data rows to the CSV
            for (let i = 0; i < this.parse_csv.length; i++) {
                let row = this.parse_header.map((header) => {
                    // Make sure to handle cases where data might be empty or contain special characters
                    return JSON.stringify(this.parse_csv[i][header]);
                });
                text += row.join(",") + "\n";
            }
            text = text.substring(0, text.length - 2);

            // Create and download the CSV file
            const element = document.createElement("a");
            element.setAttribute(
                "href",
                "data:text/csv;charset=utf-8," + encodeURIComponent(text)
            );
            element.setAttribute("download", "dataCSV.csv");
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            this.toggleOutEverything();
        }, getCSVby: function (index, data, key) {
            vm = this;
            vm.currentCell.header = key;
            vm.currentCell.data = data;
            vm.currentCell.index = index;
            //console.log(index, data, key);
            vm.toggleUpdateCSVWindow();
        }, pushEditDataToCSV(newData) {
            vm = this;
            vm.parse_csv[parseInt(vm.currentCell.index)][vm.currentCell.header] = newData;
            vm.currentCell.data = newData;
            this.toggleOutEverything();
        }, deleteRow(index) {
            let vm = this;
            let text = "Are you sure? Selected row will be deleted.\n\n" + JSON.stringify(vm.parse_csv[index]);
            if (confirm(text) == true) {
                vm.parse_csv.splice(index, 1);
                this.searchEnabled = false;
            }
        }, addRow(show = true) {
            let vm = this;
            let data = {};
            for (let i = 0; i < vm.parse_header.length; i++) {
                data[vm.parse_header[i]] = "empty";
            }
            vm.searchEnabled = false;
            vm.parse_csv.push(data);

            // Use setTimeout to introduce a delay before scrolling
            if (show) {
                setTimeout(() => {
                    document.getElementById("right").scrollTo({ top: document.getElementById("right").scrollHeight });
                }, 100); // Adjust the delay (in milliseconds) as needed, e.g., 100ms
            }


        }
        , isMobile() {
            if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true
            } else {
                return false
            }
        }
    }
});


app.mount("#app");