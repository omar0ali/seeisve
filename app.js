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
            this.searchAtIndex = true;
            for (let i = 0; i < vm.parse_csv.length; i++) {
                // console.log(this.$refs.key_search.value);
                // console.log(vm.parse_csv[i][this.$refs.key_search.value]);
                if(vm.parse_csv[i][this.$refs.key_search.value].toLowerCase().includes(this.$refs.search.value.toLowerCase())) {
                    result.push(vm.parse_csv[i]);
                }
            }
            vm.parse_csv_searched = result;
        },
        csvJSON(csv) {
            var vm = this
            let lines = csv.split("\n")
            let result = [];
            vm.parse_header = lines[0].split(",")
            //remove the last empy header, and make sure its not printing it out.
            if (vm.parse_header[vm.parse_header.length - 1] === "\r") {
                vm.parse_header.pop();
            }
            for (let i = 1; i < lines.length; i++) {
                let obj = {}
                let currentline = lines[i].split(",")
                for (let j = 0; j < vm.parse_header.length; j++) {
                    obj[vm.parse_header[j]] = currentline[j];
                }
                result.push(obj);
            }

            result.pop() // remove the last item because undefined values

            return result // JavaScript object
        },
        loadCSV(e) {
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