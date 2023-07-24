const app = Vue.createApp({
    data() {
        return {
            searchWindow: false,
            settingWindow: false,
            aboutWindow: false,
            searchStatus: "",
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
            sortKey: '',
            EditRowOf: ""
        };
    },

    methods: {
        cleanUp: function() {
            this.searchStatus = "";
            this.currentCell = {
                header: "", data: "", index: -1
            }
            this.parse_header = [];
            this.parse_csv = [];
            this.parse_csv_searched= [];
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
        toggleUpdateCSVWindow: function () {
            this.toggleOutEverything();
            this.updateCSVWindow = !this.updateCSVWindow;
        },
        toggleOutEverything: function () {
            this.searchWindow = false;
            this.settingWindow = false;
            this.updateCSVWindow = false;
            this.aboutWindow = false;
            this.EditRowsOfColumnWindow = false;
        },
        toggleAbout: function () {
            this.toggleOutEverything();
            this.aboutWindow = !this.aboutWindow;
        },
        toggleEditRow: function (key) {
            this.EditRowOf = key;
            this.toggleOutEverything();
            this.EditRowsOfColumnWindow = !this.EditRowsOfColumnWindow;
        },
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
        }, csvJSON(csv) {
            this.cleanUp();
            var vm = this;
            let lines = csv.split("\n");
            let result = [];
            vm.parse_header = lines[0].split(",").map(function (value) {
                return value.trim();
            });
            //remove the last empty header, and make sure it's not printing it out.
            if (vm.parse_header[vm.parse_header.length - 1] === "\r") {
                vm.parse_header.pop();
            }

            for (let i = 1; i < lines.length; i++) {
                let obj = {};
                let currentline = lines[i].trim();
                let cells = [];
                let inQuotes = false;
                let cell = "";

                for (let j = 0; j < currentline.length; j++) {
                    let char = currentline[j];
                    if (char === "," && !inQuotes) {
                        cells.push(cell);
                        cell = "";
                    } else if (char === '"') {
                        inQuotes = !inQuotes;
                    } else {
                        cell += char;
                    }
                }

                // Add the last cell after the loop ends
                cells.push(cell);

                for (let j = 0; j < vm.parse_header.length; j++) {
                    obj[vm.parse_header[j]] = cells[j] || ""; // Use empty string for missing cells
                }
                result.push(obj);
            }

            return result; // JavaScript object
        }, loadCSV(e) {
            let vm = this
            if (window.FileReader) {
                let reader = new FileReader();
                if(e.target.files[0] === undefined) {return;}
                reader.readAsText(e.target.files[0]);
                // Handle errors load
                reader.onload = function (event) {
                    let csv = event.target.result;
                    vm.parse_csv = vm.csvJSON(csv)
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
            var vm = this;
            //Check if there is a file to export.
            if (this.parse_header.length <= 0) {
                alert("There is nothing to export.");
                return;
            }

            let text = ""; //data to be downloaded.
            //getting data 
            for (let i = 0; i < vm.parse_header.length; i++) {
                text = text + vm.parse_header[i] + ","
            }
            text = text.substring(0, text.length - 1); //removing last charactor.
            text = text + "\n";
            //The rest of the array, parse_csv
            for (let i = 0; i < vm.parse_csv.length; i++) {
                for (let j = 0; j < vm.parse_header.length; j++) {
                    text = text + vm.parse_csv[i][vm.parse_header[j]] + ",";
                }
                text = text.substring(0, text.length - 1); //removing last charactor.
                text = text + "\n";
            }

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', 'dataCSV.csv');
            element.style.display = 'none';
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
        }, isMobile() {
            if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true
            } else {
                return false
            }
        }
    }
});


app.mount("#app");