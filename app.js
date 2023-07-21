
const app = Vue.createApp({
    data() {
        return {
            searchStatus: "",
            searchAtIndex: false,
            parse_header: [],
            parse_csv: [],
            parse_csv_searched: [],
            sortOrders: {},
            sortKey: ''
        };
    },

    methods: {
        searchF: function () {
            var vm = this;
            let result = [];

            console.log(this.$refs.option_search.value);

            this.searchAtIndex = true;
            for (let i = 0; i < vm.parse_csv.length; i++) {
                switch (this.$refs.option_search.value.toLowerCase()) {
                    case "includes":
                        if (vm.parse_csv[i][this.$refs.key_search.value].toLowerCase().includes(this.$refs.search.value.toLowerCase())) {
                            result.push(vm.parse_csv[i]);
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
        }
    }
});


app.mount("#app");