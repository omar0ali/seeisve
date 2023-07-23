const app = Vue.createApp({
    data() {
        return {
            searchTool: false,
            settingTool: false,
            searchStatus: "",
            searchAtIndex: false,
            updateCSVTool: false,
            currentCell: {
                header: "", data: "", index: -1
            },
            parse_header: [],
            parse_csv: [],
            parse_csv_searched: [],
            sortOrders: {},
            sortKey: '',
            text: ""
        };
    },

    methods: {
        keyMonitor: function (event) {
            if (event.key == "Enter") {
                this.searchData();
                this.toggleOutEverything();
            }
        },
        searchData: function () {
            console.log(this.$refs.search.value)
            if (this.$refs.search.value === "") {
                this.searchAtIndex = false;
                return;
            }
            var vm = this;
            let result = [];
            //console.log(this.$refs.option_search.value);
            this.searchAtIndex = true;
            for (let i = 0; i < vm.parse_csv.length; i++) {
                switch (this.$refs.option_search.value.toLowerCase()) {
                    case "includes":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase().includes(this.$refs.search.value.toLowerCase())) {
                            result.push({index: i, data: vm.parse_csv[i]});
                        }
                        break;
                    case "equals":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase() === (this.$refs.search.value.toLowerCase())) {
                            result.push(vm.parse_csv[i]);
                        }
                        break;
                    case "not equals":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase() !== (this.$refs.search.value.toLowerCase())) {
                            result.push(vm.parse_csv[i]);
                        }
                        break;
                    case "larger than":
                        if (parseInt(vm.parse_csv[i][this.$refs.key_search.value].toLowerCase()) > parseInt((this.$refs.search.value.toLowerCase()))) {
                            result.push(vm.parse_csv[i]);
                        }
                        break;
                    case "less than":
                        if (parseInt(vm.parse_csv[i][this.$refs.key_search.value].toLowerCase()) < parseInt((this.$refs.search.value.toLowerCase()))) {
                            result.push(vm.parse_csv[i]);
                        }
                        break;
                }
            }
            vm.parse_csv_searched = result;
        },
        toggleSearch: function () {
            this.toggleOutEverything();
            this.searchTool = !this.searchTool;
        },
        toggleSetting: function () {
            this.toggleOutEverything();
            this.settingTool = !this.settingTool;
        },
        toggleUpdateCSVTool: function () {
            this.toggleOutEverything();
            this.updateCSVTool = !this.updateCSVTool;
        },
        toggleOutEverything: function () {
            this.searchTool = false;
            this.settingTool = false;
            this.updateCSVTool = false;
        },
        csvJSON(csv) {
            var vm = this;
            let lines = csv.split("\n");
            let result = [];
            vm.parse_header = lines[0].split(",");
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
            this.searchAtIndex = false;
            let vm = this
            if (window.FileReader) {
                let reader = new FileReader();
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
            console.log(index, data, key);
            vm.toggleUpdateCSVTool();
        }, pushEditDataToCSV(newData) {
            vm = this;
            vm.parse_csv[parseInt(vm.currentCell.index)][vm.currentCell.header] = newData;
            vm.currentCell.data = newData;
            this.toggleOutEverything();
        }
    }
});


app.mount("#app");